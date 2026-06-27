import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const host = process.env.DB_HOST || "127.0.0.1";
  const port = process.env.DB_PORT || "3306";
  const user = process.env.DB_USER || "root";
  const pass = process.env.DB_PASS || "";
  const name = process.env.DB_NAME || "laneofceramic";

  const encodedUser = encodeURIComponent(user);
  const encodedPass = encodeURIComponent(pass);
  return `mysql://${encodedUser}:${encodedPass}@${host}:${port}/${name}`;
}

const schema = z.object({
  // ── App ──────────────────────────────────────────────────────
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  APP_NAME: z.string().default("Ceramic Studio API"),
  API_PREFIX: z.string().default("/api/v1"),

  // ── Database ─────────────────────────────────────────────────
  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default("root"),
  DB_PASS: z.string().default(""),
  DB_NAME: z.string().default("laneofceramic"),
  DATABASE_URL: z.string().url().optional(),

  // ── Redis ────────────────────────────────────────────────────
  REDIS_ENABLED: z
    .enum(["true", "false", "1", "0"])
    .default("false")
    .transform((v) => v === "true" || v === "1"),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().default(6379),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ── JWT ──────────────────────────────────────────────────────
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  // ── CORS & Cookies ──────────────────────────────────────────
  CORS_ORIGIN: z.string().default("http://localhost:5173,http://localhost:5174"),
  COOKIE_DOMAIN: z.string().default("localhost"),
  COOKIE_SECURE: z.coerce.boolean().default(false),

  // ── Cloudinary ──────────────────────────────────────────────
  CLOUDINARY_CLOUD_NAME: z.string().default("change_me"),
  CLOUDINARY_API_KEY: z.string().default("change_me"),
  CLOUDINARY_API_SECRET: z.string().default("change_me"),

  // ── Cashfree ────────────────────────────────────────────────
  CASHFREE_APP_ID: z.string().default("change_me"),
  CASHFREE_SECRET_KEY: z.string().default("change_me"),
  CASHFREE_BASE_URL: z.string().url().default("https://sandbox.cashfree.com"),

  // ── Shiprocket ──────────────────────────────────────────────
  SHIPROCKET_EMAIL: z.string().default("change_me"),
  SHIPROCKET_PASSWORD: z.string().default("change_me"),
  SHIPROCKET_BASE_URL: z.string().url().default("https://apiv2.shiprocket.in"),

  // ── SMTP (Nodemailer) ───────────────────────────────────────
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default("change_me"),
  SMTP_PASS: z.string().default("change_me"),
  SMTP_FROM: z.string().default("no-reply@ceramicstudio.com"),

  // ── SMS (apitxt.com) ────────────────────────────────────────
  SMS_API_KEY: z.string().default("change_me"),
  SMS_SENDER_ID: z.string().default("CRMSTD"),
  SMS_BASE_URL: z.string().default("https://apitxt.com"),

  // ── Rate Limiting ───────────────────────────────────────────
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

const parsed = schema.parse(process.env);

export type EnvConfig = z.infer<typeof schema> & { DATABASE_URL: string };
export const env: EnvConfig = {
  ...parsed,
  DATABASE_URL: parsed.DATABASE_URL ?? buildDatabaseUrl(),
};

/** Parse comma-separated CORS origins */
export function getCorsOrigins(): string[] {
  return env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean);
}

/** Backend public base URL for webhooks etc. */
export function getApiBaseUrl(): string {
  return `http://localhost:${env.PORT}`;
}
