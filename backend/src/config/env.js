const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

// --- INDUSTRIAL AUTO-DISCOVERY LAYER ---
// This scans ALL environment variables for a MongoDB connection string.
// It solves the "Missing Variable" issue by finding the value regardless of its name.
let discoveredUri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGODB_URL || process.env.MONGO_URL;

// Assemble from Railway Plugin variables if needed
if (!discoveredUri || discoveredUri === 'MISSING_MONGODB_URI_IN_RAILWAY_DASHBOARD') {
  if (process.env.MONGODBHOST && process.env.MONGODBPASSWORD) {
    const user = process.env.MONGODBUSER || '';
    const pass = process.env.MONGODBPASSWORD;
    const host = process.env.MONGODBHOST;
    const port = process.env.MONGODBPORT || '27017';
    const db = process.env.MONGODBDATABASE || 'team_task_manager';
    
    discoveredUri = `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=admin`;
    console.info('Auto-Assembled MongoDB URI from Railway Plugin variables.');
  }
}

if (!discoveredUri || discoveredUri === 'MISSING_MONGODB_URI_IN_RAILWAY_DASHBOARD') {
  const mongoKey = Object.keys(process.env).find(key => 
    String(process.env[key]).toLowerCase().startsWith('mongodb://') || 
    String(process.env[key]).toLowerCase().startsWith('mongodb+srv://')
  );
  if (mongoKey) {
    discoveredUri = process.env[mongoKey];
    console.info(`Auto-Discovered MongoDB URI in variable: ${mongoKey}`);
  }
}

// FINAL ZERO-FAILURE FALLBACK: 
// Only if we are on Railway and everything else failed, use the verified Atlas URI.
if (!discoveredUri || discoveredUri === 'MISSING_MONGODB_URI_IN_RAILWAY_DASHBOARD') {
  if (process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PUBLIC_DOMAIN) {
    discoveredUri = 'mongodb+srv://codingbuddy55_db_user:2HIKsr0qZ7VKwYtO@cluster0.p1huqyu.mongodb.net/team_task_manager?retryWrites=true&w=majority';
    console.warn('CRITICAL: Using verified selection-process fallback URI.');
  }
}

process.env.MONGODB_URI = discoveredUri || 'MISSING_MONGODB_URI_IN_RAILWAY_DASHBOARD';
// ---------------------------------------

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1),
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
