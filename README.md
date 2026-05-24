# Foundry

**Client outreach and money stats for founder-led growth.**

Foundry is a focused prototype for automated outbound marketing: contact import,
AI-personalized outreach, adaptive sequences, social follow-up, analytics, and
the money metrics that show whether the motion is working.

The frontend is a React/Tailwind app with mock operating data. The backend is a
FastAPI scaffold with real AI provider adapters and a local fallback.

---

## Modules

| Module | Description |
|---|---|
| **Dashboard** | Daily operating queue, outreach performance, MRR, cash runway |
| **Outreach** | Campaigns, contacts, sequences, templates, LinkedIn, social, analytics |
| **Money** | MRR, revenue vs burn, runway, conversion and funnel stats |
| **Settings** | Resend, Stripe, enrichment providers, social connectors, AI providers |
| **Billing** | Plan cards and API plan-gating scaffold |

Investment CRM and fundraising tracking were intentionally removed for now.

---

## AI Provider Routing

`POST /ai/draft` uses a provider abstraction:

- Ollama local
- LM Studio
- Hugging Face Inference
- OpenRouter
- Gemini
- Claude
- deterministic local fallback

Defaults are free-first. If the configured provider is unavailable or missing a
key, the API returns a deterministic draft instead of failing the workflow.

Useful env vars:

```bash
AI_PROVIDER=ollama
AI_MODEL=llama3.1
AI_BASE_URL=http://localhost:11434/v1
AI_FREE_FIRST=true
OPENROUTER_API_KEY=
HUGGINGFACE_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
```

---

## Quick Start

```bash
npm install
npm run dev
```

Frontend dev server: `http://localhost:5173`

Run the full stack:

```bash
docker compose up
```

Optional local AI service:

```bash
docker compose --profile local-ai up
```

---

## Keyboard Navigation

- `J` / `K` switches primary views
- `Cmd+K` / `Ctrl+K` opens command palette
- `Esc` closes overlays
- Sidebar collapse state persists in `localStorage`
