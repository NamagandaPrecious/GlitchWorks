# Backend Framework Architecture

A **layered backend** built with **Node.js**, **TypeScript**, and **Express**. The structure keeps HTTP, business logic, and data access separate so you can scale and test easily.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  HTTP Layer (Routes / Controllers)                           │
│  - Parse request, call service, send response                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Service Layer (Business Logic)                              │
│  - Validation, orchestration, domain rules                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Repository Layer (Data Access)                              │
│  - DB, external APIs, file storage                           │
└─────────────────────────────────────────────────────────────┘
```

### Folder Structure

| Layer / Area | Path | Responsibility |
|--------------|------|-----------------|
| **Config** | `src/config/` | Env, ports, feature flags |
| **Routes** | `src/routes/` | HTTP endpoints, request/response |
| **Services** | `src/services/` | Business logic, validation |
| **Repositories** | `src/repositories/` | Data access (DB, APIs) |
| **Models** | `src/models/` | Entities, DTOs, types |
| **Middleware** | `src/middleware/` | Auth, errors, logging |
| **Entry** | `src/app.ts`, `src/index.ts` | Wire app and start server |

### Flow for a Request

1. **Route** receives the request and reads params/body.
2. **Service** runs business logic and uses **repositories** for data.
3. **Repository** talks to DB or other backends.
4. **Route** returns the response (JSON, status, etc.).

Errors are thrown from services (e.g. `AppError`), and **middleware** turns them into HTTP status and JSON.

## Quick Start

```bash
npm install
npm run dev
```

- **API base:** `http://localhost:3000`
- **API prefix:** `http://localhost:3000/api/v1`
- **Health:** `GET /health`
- **Example resource:** `GET/POST /api/v1/examples`, `GET/DELETE /api/v1/examples/:id`
- **Notifications (email):** `POST /api/v1/notifications` body: `{ "to", "subject", "text" }`

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run with hot reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled app (`dist/index.js`) |

### Environment

- `PORT` – server port (default: 3000)
- `NODE_ENV` – e.g. `development`, `production`
- `API_PREFIX` – URL prefix for API (default: `/api/v1`)
- **SMTP (for notifications):** `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`; optional: `SMTP_SECURE` (default `true`), `SMTP_PORT` (default `465`). Use `.env` or `.env.local` in the backend root.

## Adding a New Feature

1. **Models** – Add types in `src/models/` (entity, create/update DTOs).
2. **Repository** – Add `src/repositories/<name>Repository.ts` for DB/API calls.
3. **Service** – Add `src/services/<name>Service.ts` with business logic.
4. **Routes** – Add `src/routes/<name>Routes.ts` and register in `src/routes/index.ts`.

Keep routes thin: parse input → call service → send response. Put all logic in services and all data access in repositories.

## Error Handling

- Use `AppError(statusCode, message, code)` in services for known HTTP errors.
- `errorHandler` middleware maps `AppError` to JSON and status; other errors become 500.

## Embedded Content (UniGuard / legacy backend)

This repo embeds the following inside the same framework:

| Path | Description |
|------|-------------|
| **supabase/** | Database migrations (e.g. `profiles`, onboarding). Run via Supabase CLI or dashboard. |
| **training/** | Python ML training (budget allocator, transaction categorizer, spending forecaster, anomaly detector, goal predictor). Data, models, and reports live here. |
| **API: notifications** | The former standalone notification server is integrated as `POST /api/v1/notifications` (see **Notifications** below). |

### Supabase migrations

Migrations are in `supabase/migrations/`. Apply them with the Supabase CLI or in the Supabase Dashboard → SQL Editor.

### Training (Python)

From the backend root:

```bash
cd training
python train_models.py --model all
```

Or train a specific model, e.g. `--model transaction_categorizer`. See `training/README` and docs in `training/` for details.

### Notifications

Email sending is part of the main API. `POST /api/v1/notifications` with body `{ "to", "subject", "text" }` uses the notification service (nodemailer). Configure SMTP via `.env` or `.env.local` (see **Environment** above). If SMTP is not set, the endpoint returns 503.

---

## Next Steps

- Add a real database (e.g. PostgreSQL + Prisma/Drizzle) in repositories; point Supabase client at your project.
- Add auth middleware and attach user to `req` (e.g. Supabase Auth JWT).
- Add validation (e.g. Zod) in routes or services.
- Add tests per layer (routes, services, repositories).
