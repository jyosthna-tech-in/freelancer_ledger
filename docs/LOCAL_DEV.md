# Local development

Frontend tests begin later. Patch 2 does not require Docker, LocalStack, SAM, or a backend.

## Frontend

From the repository root:

```text
cd frontend
npm install
npm run dev
```

The Vite dev server defaults to `http://localhost:5173`.

Production build check:

```text
cd frontend
npm run build
```

Optional preview of the production build:

```text
cd frontend
npm run preview
```

No frontend `.env` file is used yet. API base URL and other Vite `VITE_*` variables will be added in Patch 4, when the UI connects to the local API. Until then, do not copy root `.env.example` AWS placeholders into the frontend.
