# Cymulate Phishing Simulation – MVP (2.5h scope)

**Author:** Nadav Daniel  
**Goal:** Minimal end‑to‑end phishing simulation stack per assignment:
- Two NestJS services:
  - **mgmt-api** – Auth (JWT), create/list attempts, orchestrates sending
  - **sim-api** – Send phishing emails + click tracking
- **React (Next.js)** web – register/login + dashboard to send and list attempts
- **MongoDB** for users/attempts
- **MailHog** (dev) for catching emails

> Dockerizing the apps is **bonus**; this MVP uses Docker only for Mongo + MailHog.

---

## Monorepo layout
