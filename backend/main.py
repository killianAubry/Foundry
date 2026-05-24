"""Foundry API scaffold.

This service owns the outreach automation boundary: contacts, campaigns,
template rendering, webhook intake, and AI draft generation. The AI layer is a
provider router with a free-first default so local Ollama/LM Studio can be used
before paid fallbacks such as Claude.
"""

import os
from enum import Enum
from string import Template
from typing import Any

import httpx
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field


class Plan(str, Enum):
    solo = "solo"
    team = "team"
    growth = "growth"


class AiProvider(str, Enum):
    ollama = "ollama"
    lm_studio = "lm_studio"
    hugging_face = "hugging_face"
    openrouter = "openrouter"
    gemini = "gemini"
    claude = "claude"
    local_template = "local_template"


class User(BaseModel):
    id: str
    email: str
    startup_name: str
    startup_description: str
    plan: Plan = Plan.solo


class AiProviderConfig(BaseModel):
    provider: AiProvider = AiProvider.ollama
    model: str = "llama3.1"
    base_url: str = "http://ollama:11434/v1"
    free_first: bool = True
    timeout_seconds: float = 20


class Contact(BaseModel):
    id: str
    first_name: str
    last_name: str = ""
    email: str
    email_status: str = "unknown"
    title: str = ""
    company: str = ""
    linkedin_url: str | None = None
    enrichment_context: str = ""
    ai_opener: str | None = None
    source: str = "manual"
    tags: list[str] = []


class Campaign(BaseModel):
    id: str
    name: str
    goal: str
    target_persona: str
    daily_limit: int = 50
    status: str = "draft"
    sent_count: int = 0
    open_rate: float = 0
    reply_rate: float = 0
    meetings_booked: int = 0


class AiDraftRequest(BaseModel):
    feature: str = Field(examples=["personalized_opener", "subject_lines", "reply_classifier"])
    context: dict[str, Any]
    provider: AiProvider | None = None
    model: str | None = None


class AiDraftResponse(BaseModel):
    provider: AiProvider
    model: str
    feature: str
    draft: str
    fallback_used: bool = False


class TemplateRenderRequest(BaseModel):
    template: str
    variables: dict[str, Any]


app = FastAPI(title="Foundry API", version="0.2.0")


def require_plan(authorization: str | None, minimum: Plan = Plan.solo) -> None:
    """Placeholder for JWT verification plus Stripe-backed plan gating."""
    if authorization is None:
        raise HTTPException(status_code=401, detail="missing bearer token")
    _ = minimum


def current_ai_config(request: AiDraftRequest | None = None) -> AiProviderConfig:
    provider = request.provider if request and request.provider else AiProvider(os.getenv("AI_PROVIDER", "ollama"))
    default_base_url = {
        AiProvider.ollama: "http://ollama:11434/v1",
        AiProvider.lm_studio: "http://localhost:1234/v1",
        AiProvider.openrouter: "https://openrouter.ai/api/v1",
        AiProvider.hugging_face: "https://api-inference.huggingface.co/models",
        AiProvider.gemini: "https://generativelanguage.googleapis.com/v1beta",
        AiProvider.claude: "https://api.anthropic.com/v1",
        AiProvider.local_template: "",
    }[provider]
    return AiProviderConfig(
        provider=provider,
        model=request.model if request and request.model else os.getenv("AI_MODEL", "llama3.1"),
        base_url=os.getenv("AI_BASE_URL", default_base_url),
        free_first=os.getenv("AI_FREE_FIRST", "true").lower() == "true",
        timeout_seconds=float(os.getenv("AI_TIMEOUT_SECONDS", "20")),
    )


def prompt_for(request: AiDraftRequest) -> str:
    context = "\n".join(f"{key}: {value}" for key, value in request.context.items())
    prompts = {
        "personalized_opener": """You are writing the opening sentence of a cold outreach email.
Write a single sentence, max 25 words, that feels genuinely researched and human.
Do not mention the product yet. No flattery, no generic greeting, no em dash.

Contact context:
$context

Output only the sentence.""",
        "subject_lines": """Generate 5 concise cold email subject lines for this message.
Rank them by predicted open rate and include a short reason for each.

Context:
$context""",
        "template_quality": """Score this outreach template on clarity, warmth, ask specificity, and length.
Return compact JSON with scores from 1 to 10 and red_flags as an array.

Context:
$context""",
        "reply_classifier": """Classify this email reply into exactly one category:
interested, not_now, not_interested, question, out_of_office, referral.

Reply context:
$context

Output only the category label.""",
        "newsletter_section": """Write a direct newsletter section for founders.
Include one key insight, one actionable takeaway, and one relevant example.

Context:
$context""",
    }
    template = Template(prompts.get(request.feature, "Draft concise outreach copy from this context:\n$context"))
    return template.safe_substitute(context=context)


def local_template_response(request: AiDraftRequest) -> str:
    contact = request.context.get("contact", "this founder")
    enrichment = str(request.context.get("enrichment_context", "their recent work")).rstrip(".")
    if request.feature == "personalized_opener":
        return f"Noticed {contact.split(',')[0]} is focused on {enrichment[:96].lower()}."
    if request.feature == "reply_classifier":
        return "question"
    if request.feature == "subject_lines":
        return "1. quick question\n2. idea for your pipeline\n3. worth comparing notes?\n4. small growth question\n5. founder-led sales"
    return "Draft generated by the local template fallback. Configure Ollama, LM Studio, Gemini, OpenRouter, Hugging Face, or Claude for model output."


async def call_openai_compatible(prompt: str, config: AiProviderConfig, api_key: str | None) -> str:
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    async with httpx.AsyncClient(timeout=config.timeout_seconds) as client:
        response = await client.post(
            f"{config.base_url.rstrip('/')}/chat/completions",
            headers=headers,
            json={
                "model": config.model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()


async def call_hugging_face(prompt: str, config: AiProviderConfig) -> str:
    token = os.getenv("HUGGINGFACE_API_KEY")
    if not token:
        raise RuntimeError("missing HUGGINGFACE_API_KEY")
    async with httpx.AsyncClient(timeout=config.timeout_seconds) as client:
        response = await client.post(
            f"{config.base_url.rstrip('/')}/{config.model}",
            headers={"Authorization": f"Bearer {token}"},
            json={"inputs": prompt, "parameters": {"max_new_tokens": 180, "temperature": 0.7}},
        )
        response.raise_for_status()
        data = response.json()
        if isinstance(data, list) and data:
            return str(data[0].get("generated_text", "")).replace(prompt, "").strip()
        return str(data)


async def call_gemini(prompt: str, config: AiProviderConfig) -> str:
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("missing GEMINI_API_KEY")
    model = config.model if config.model != "llama3.1" else "gemini-1.5-flash"
    async with httpx.AsyncClient(timeout=config.timeout_seconds) as client:
        response = await client.post(
            f"{config.base_url.rstrip('/')}/models/{model}:generateContent?key={key}",
            json={"contents": [{"parts": [{"text": prompt}]}]},
        )
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()


async def call_claude(prompt: str, config: AiProviderConfig) -> str:
    key = os.getenv("ANTHROPIC_API_KEY")
    if not key:
        raise RuntimeError("missing ANTHROPIC_API_KEY")
    model = config.model if config.model != "llama3.1" else "claude-sonnet-4-20250514"
    async with httpx.AsyncClient(timeout=config.timeout_seconds) as client:
        response = await client.post(
            f"{config.base_url.rstrip('/')}/messages",
            headers={
                "x-api-key": key,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "max_tokens": 320,
                "messages": [{"role": "user", "content": prompt}],
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["content"][0]["text"].strip()


async def run_ai(request: AiDraftRequest, config: AiProviderConfig) -> AiDraftResponse:
    prompt = prompt_for(request)
    try:
        if config.provider in {AiProvider.ollama, AiProvider.lm_studio}:
            draft = await call_openai_compatible(prompt, config, None)
        elif config.provider == AiProvider.openrouter:
            draft = await call_openai_compatible(prompt, config, os.getenv("OPENROUTER_API_KEY"))
        elif config.provider == AiProvider.hugging_face:
            draft = await call_hugging_face(prompt, config)
        elif config.provider == AiProvider.gemini:
            draft = await call_gemini(prompt, config)
        elif config.provider == AiProvider.claude:
            draft = await call_claude(prompt, config)
        else:
            draft = local_template_response(request)
        return AiDraftResponse(provider=config.provider, model=config.model, feature=request.feature, draft=draft)
    except Exception as error:
        if not config.free_first:
            raise HTTPException(status_code=502, detail=str(error)) from error
        return AiDraftResponse(
            provider=AiProvider.local_template,
            model="deterministic-fallback",
            feature=request.feature,
            draft=local_template_response(request),
            fallback_used=True,
        )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "foundry-api"}


@app.get("/me", response_model=User)
def me(authorization: str | None = Header(default=None)) -> User:
    require_plan(authorization)
    return User(
        id="user_demo",
        email="founder@example.com",
        startup_name="Foundry",
        startup_description="Client outreach and money stats for founder-led growth.",
    )


@app.get("/settings/ai-provider", response_model=AiProviderConfig)
def get_ai_provider(authorization: str | None = Header(default=None)) -> AiProviderConfig:
    require_plan(authorization)
    return current_ai_config()


@app.put("/settings/ai-provider", response_model=AiProviderConfig)
def update_ai_provider(config: AiProviderConfig, authorization: str | None = Header(default=None)) -> AiProviderConfig:
    require_plan(authorization)
    return config


@app.get("/contacts", response_model=list[Contact])
def list_contacts(authorization: str | None = Header(default=None)) -> list[Contact]:
    require_plan(authorization)
    return [
        Contact(id="con_1", first_name="Leah", last_name="Kim", email="leah@example.com", email_status="verified", title="Founder", company="Tandem", source="csv"),
        Contact(id="con_2", first_name="Marco", last_name="Pena", email="marco@example.com", email_status="verified", title="CEO", company="Vector", source="linkedin"),
    ]


@app.get("/campaigns", response_model=list[Campaign])
def list_campaigns(authorization: str | None = Header(default=None)) -> list[Campaign]:
    require_plan(authorization)
    return [
        Campaign(id="camp_1", name="Design partner push", goal="customer_acquisition", target_persona="B2B SaaS founders", status="active", sent_count=388, open_rate=0.62, reply_rate=0.24, meetings_booked=18),
        Campaign(id="camp_2", name="Agency operators", goal="partnership", target_persona="Agency owners", status="draft", sent_count=42, open_rate=0.48, reply_rate=0.31, meetings_booked=5),
    ]


@app.post("/templates/render")
def render_template(request: TemplateRenderRequest, authorization: str | None = Header(default=None)) -> dict[str, str]:
    require_plan(authorization)
    rendered = request.template
    for key, value in request.variables.items():
        rendered = rendered.replace(f"{{{{{key}}}}}", str(value))
    return {"rendered": rendered}


@app.post("/ai/draft", response_model=AiDraftResponse)
async def draft_ai_output(request: AiDraftRequest, authorization: str | None = Header(default=None)) -> AiDraftResponse:
    require_plan(authorization)
    return await run_ai(request, current_ai_config(request))


@app.post("/webhooks/resend")
async def handle_resend_webhook(payload: dict[str, Any]) -> dict[str, str]:
    event = payload.get("type", "unknown")
    return {"status": "accepted", "event": event}


@app.post("/webhooks/inbound")
async def handle_inbound_reply(payload: dict[str, Any]) -> dict[str, str]:
    _ = payload
    return {"status": "accepted", "action": "sequence_paused_reply_queued"}
