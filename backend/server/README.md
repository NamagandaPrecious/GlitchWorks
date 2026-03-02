# Server (notification service)

This folder contains the **standalone** notification server (`notify.js`), originally used for email sending.

**Same functionality is now in the main API:** the Express app exposes `POST /api/v1/notifications` (see `src/services/notificationService.ts` and `src/routes/notificationRoutes.ts`). Use the main server so you don’t run two processes.

## When to use this folder

- You want to run **only** the notification service on a different port (e.g. `NOTIFY_PORT=5174`).
- You need the original script for reference or a separate deployment.

## Run standalone

From the backend root:

```bash
node server/notify.js
```

Requires `.env` or `.env.local` in the **backend root** with `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`. Optional: `NOTIFY_PORT` (default 5174), `SMTP_PORT`, `SMTP_SECURE`.
