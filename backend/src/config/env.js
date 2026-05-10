const path = require('path');

const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

console.info('--- Railway Environment Diagnostics ---');
console.info('Detected variable keys:', Object.keys(process.env).filter(k => !k.includes('PASSWORD') && !k.includes('SECRET')));
console.info('---------------------------------------');

// Fallback logic for Railway/Cloud providers
if (!process.env.MONGODB_URI && process.env.DATABASE_URL) {
  process.env.MONGODB_URI = process.env.DATABASE_URL;
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default('MISSING_MONGODB_URI_IN_RAILWAY_DASHBOARD'),
  MONGODB_DB_NAME: z.string().min(1).default('team_task_manager'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string().min(32).default('development-access-secret-should-be-overridden'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32).default('development-refresh-secret-should-be-overridden'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REFRESH_COOKIE_NAME: z.string().default('ttm_refresh'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('Team Task Manager <no-reply@example.com>'),
  RESET_PASSWORD_URL: z.string().default('http://localhost:5173/reset-password'),
  UPLOAD_DIR: z.string().default('src/uploads'),
  MAX_FILE_UPLOAD_SIZE: z.coerce.number().default(5 * 1024 * 1024),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(200)
});

const env = envSchema.parse(process.env);

module.exports = env;
