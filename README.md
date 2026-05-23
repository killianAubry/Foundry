# Founder OS

**0 to 1 control surface for solo founders.**

A unified operating dashboard that consolidates investor CRM, outreach campaigns, competitor tracking, customer discovery, metrics, fundraising pipeline, and AI-assisted tooling into a single interface.

Built as a full-stack prototype — React frontend with mock data + FastAPI backend scaffold ready for production wiring.

---

## Features

| Module | Description |
|---|---|
| **Dashboard** | Weekly AI-generated brief, metric cards, action items, activity feed |
| **Investor CRM** | Kanban pipeline + table view, AI workspace for follow-ups and meeting prep |
| **Outreach** | Campaign management, email templates with variables, analytics |
| **Competitors** | Monitoring cards with signals, detail drawer, AI strategy tools |
| **Discovery** | Customer interview tracker, pain point clusters, synthesis documents |
| **Metrics** | MRR/growth charts, burn/runway, churn, DAU/WAU/MAU, cohort analysis |
| **Fundraising** | Seed round tracker, data room management, diligence requests |
| **Settings** | Integrations (Stripe, PostHog, GitHub, etc.), AI provider config |
| **Billing** | Pricing plans (Solo $19/mo, Team $49/mo, Accelerator $199/mo) |

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript 5.8** — UI framework
- **Vite 7** — Build tool and dev server
- **Tailwind CSS 3.4** — Utility-first styling (dark theme)
- **Recharts 2.15** — Charts and data visualization
- **Lucide React** — Icon set
- **IBM Plex Mono** — Monospace typography

### Backend
- **Python 3.12** — Runtime
- **FastAPI** — Async web framework
- **Uvicorn** — ASGI server
- **Pydantic** — Data validation
- **psycopg** — PostgreSQL driver
- **redis** — Cache / job queue
- **httpx** — HTTP client (AI provider calls)
- **playwright** — Browser automation (competitor signal detection)

### Infrastructure
- **Docker** — Multi-stage frontend build (node → nginx)
- **Docker Compose** — Orchestrates web, api, postgres, redis, ollama

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or run full stack with Docker
docker compose up
```

The dev server starts at `http://localhost:5173` (bound to all interfaces).

---

## Docker Compose Architecture

```
web (nginx) → api (FastAPI) → postgres + redis
                            ↘ ollama (optional, local-ai profile)
```

---

## Keyboard Navigation

- `J` / `K` — Switch between views
- `Cmd+K` / `Ctrl+K` — Open command palette
- `Esc` — Close overlays
- Sidebar collapse state persisted in `localStorage`

---

## License

This project is not yet licensed.
