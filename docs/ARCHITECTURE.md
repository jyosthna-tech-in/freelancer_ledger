# Architecture

## Local architecture (intended)

```
React/Vite -> SAM local API -> Lambda -> LocalStack DynamoDB/S3
```

- **Frontend:** React + Vite + TypeScript app in `frontend/` (scaffolded in Patch 2; no API calls yet).
- **API:** AWS SAM CLI local API in `backend/`.
- **Compute:** TypeScript Lambda handlers.
- **Persistence:** LocalStack DynamoDB (source of truth) and LocalStack S3 (objects such as generated artifacts).
- **Search (later):** OpenSearch as a later local Docker service. It is a derived search index only, never the source of truth.

## Identity and data rules

- Local auth may use a demo identity only behind an auth adapter. Production auth must remain Cognito-compatible.
- Every read and write is scoped by `userId`.
- Amounts are stored as integer `amountMinor` values, not JavaScript floating-point numbers.

## Future shipping target (not this patch)

Lambda, API Gateway, DynamoDB, S3, Cognito, OpenSearch, EventBridge, and Amplify Hosting. Do not provision a real AWS account or deploy to AWS unless explicitly requested.
