# Cymulate Phishing Simulation – MVP (2.5h scope)

**Author:** Nadav Daniel  
**Goal:** Minimal end‑to‑end phishing simulation stack per assignment:
- Two NestJS services:
  - **mgmt-api** – Auth (JWT), create/list attempts, orchestrates sending
  - **sim-api** – Send phishing emails + click tracking
- **React (Next.js)** web – register/login + dashboard to send and list attempts
- **MongoDB** for users/attempts
- **MailHog** (dev) for catching emails



---

## Monorepo layout

```
root
├─ apps/
│  ├─ mgmt-api/          # NestJS – auth + attempts
│  ├─ sim-api/           # NestJS – sending + tracking
│  └─ web/               # Next.js (minimal UI)
├─ packages/             # (optional) shared types/config later
├─ docker-compose.yml    # Mongo + MailHog (dev)
├─ turbo.json
└─ tsconfig.base.json
```

---

## Prerequisites

- Node 20+, pnpm
- Docker (for Mongo + MailHog)
- Git

```bash
pnpm -v   # e.g. 9.x
```

Set the exact pnpm version in package.json:

```json
"packageManager": "pnpm@9.12.x"
```
