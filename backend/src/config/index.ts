/**
 * Load .env and .env.local so process.env is populated (e.g. SMTP, PORT).
 */
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local" });

/**
 * Application configuration.
 */
export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 3000,
  apiPrefix: process.env.API_PREFIX ?? "/api/v1",
  smtp: {
    host: process.env.SMTP_HOST,
    user: process.env.SMTP_USER,
    from: process.env.SMTP_FROM,
    secure: String(process.env.SMTP_SECURE ?? "true").toLowerCase() === "true",
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
  },
} as const;

export type Config = typeof config;
