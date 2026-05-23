"""Founder OS API scaffold.

The React prototype uses local mock data today. This FastAPI surface defines the
production boundary for auth-gated modules, plan gating, and configurable AI
providers so the frontend can later swap mocks for real calls without changing
the product model.
"""

from enum import Enum
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field


class Plan(str, Enum):
    solo = "solo"
    team = "team"
    accelerator = "accelerator"


class AiProvider(str, Enum):
    ollama = "ollama"
    lm_studio = "lm_studio"
    hugging_face = "hugging_face"
    openrouter = "openrouter"
    gemini = "gemini"
    claude = "claude"


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
    api_key_ref: str | None = None
    free_first: bool = True


class Investor(BaseModel):
    id: str
    name: str
    firm: str
    stage: str
    amount: int | None = None
    source: str
    notes: str = ""


class Campaign(BaseModel):
    id: str
    name: str
    target_type: str
    status: str
    sent_count: int = 0
    reply_rate: float = 0


class AiDraftRequest(BaseModel):
    feature: str = Field(examples=["investor_follow_up", "weekly_brief"])
    context: dict[str, Any]


app = FastAPI(title="Founder OS API", version="0.1.0")


def require_plan(authorization: str | None, minimum: Plan = Plan.solo) -> None:
    """Placeholder for JWT auth plus Stripe-backed plan gating."""
    if authorization is None:
        raise HTTPException(status_code=401, detail="missing bearer token")
    _ = minimum


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/me", response_model=User)
def me(authorization: str | None = Header(default=None)) -> User:
    require_plan(authorization)
    return User(
        id="user_demo",
        email="founder@example.com",
        startup_name="Founder OS",
        startup_description="A unified operating surface for 0 to 1 founders.",
    )


@app.get("/settings/ai-provider", response_model=AiProviderConfig)
def get_ai_provider(authorization: str | None = Header(default=None)) -> AiProviderConfig:
    require_plan(authorization)
    return AiProviderConfig()


@app.put("/settings/ai-provider", response_model=AiProviderConfig)
def update_ai_provider(config: AiProviderConfig, authorization: str | None = Header(default=None)) -> AiProviderConfig:
    require_plan(authorization)
    return config


@app.get("/investors", response_model=list[Investor])
def list_investors(authorization: str | None = Header(default=None)) -> list[Investor]:
    require_plan(authorization)
    return [
        Investor(id="inv_1", name="Maya Chen", firm="Northstar", stage="Researching", source="warm"),
        Investor(id="inv_2", name="Andre Williams", firm="A16Z", stage="Outreach sent", amount=500000, source="cold"),
    ]


@app.get("/campaigns", response_model=list[Campaign])
def list_campaigns(authorization: str | None = Header(default=None)) -> list[Campaign]:
    require_plan(authorization)
    return [
        Campaign(id="camp_1", name="Seed investor wedge", target_type="investors", status="active", sent_count=188, reply_rate=0.24),
        Campaign(id="camp_2", name="Design partners", target_type="customers", status="draft", sent_count=42, reply_rate=0.31),
    ]


@app.post("/ai/draft")
def draft_ai_output(request: AiDraftRequest, authorization: str | None = Header(default=None)) -> dict[str, str]:
    require_plan(authorization)
    return {
        "provider": "ollama",
        "feature": request.feature,
        "draft": "Draft placeholder generated through the configured free-first provider route.",
    }
