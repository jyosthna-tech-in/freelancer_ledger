# Freelancer Ledger

A local-first, AWS-compatible ledger for independent contractors who need a single place to track clients, invoices, payments, outstanding balances, overdue invoices, and searchable invoice history.

## The problem

Freelancers often split client work across spreadsheets, email, and payment apps. It is easy to lose track of who owes what, which invoices are overdue, and what was billed last quarter. Freelancer Ledger is built to keep that record in one application without requiring a cloud account on day one.

## Local-first approach

Development and the first MVP run entirely on your machine:

- No AWS account, AWS deployment, or credit card
- No production Cognito login or real payment processing
- Configuration via environment variables (see [`.env.example`](.env.example))

The codebase is structured so the same TypeScript Lambda handlers and data model can later target AWS (Lambda, API Gateway, DynamoDB, S3, Cognito, OpenSearch, EventBridge, Amplify Hosting) without rewriting the product.

## Planned architecture

**Local path (intended):**

`React/Vite` → `SAM local API` → `Lambda` → `LocalStack DynamoDB/S3`

OpenSearch is a later local service. DynamoDB remains the source of truth; search is a derived index, not a second system of record.

Money is stored as integer `amountMinor` values. Every data access is scoped by `userId`. Local auth uses a demo identity behind an auth adapter; production auth is intended to stay Cognito-compatible.

Details: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Scope and non-goals: [`docs/PROJECT_SCOPE.md`](docs/PROJECT_SCOPE.md).

## Repository layout

| Path | Role |
| --- | --- |
| `frontend/` | React + Vite + TypeScript UI (Patch 2 shell; no API yet) |
| `backend/` | AWS SAM + TypeScript Lambda handlers, tests, events, env (not scaffolded yet) |
| `docs/` | Scope, architecture, local-dev commands, and patch order |
| `scripts/` | Local helper scripts (later) |
| `infra/` | Infrastructure templates (later) |

## Local frontend

The UI is local-only. It does not call a backend in this patch. Frontend tests begin later.

```text
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. To verify a production build:

```text
cd frontend
npm run build
```

More detail: [`docs/LOCAL_DEV.md`](docs/LOCAL_DEV.md).

## Current status

**Patch 2 — frontend scaffold and local developer tooling.** The React + Vite + TypeScript app in `frontend/` shows a zero-value dashboard shell and a Local development mode badge. Backend connection will be added in Patch 4. Follow [`docs/PATCH_PLAN.md`](docs/PATCH_PLAN.md) for the remaining order through local testing.

## License

MIT. See [`LICENSE`](LICENSE).
