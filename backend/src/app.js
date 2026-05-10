const path = require('path');

const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');

const env = require('./config/env');
const errorMiddleware = require('./middleware/errorMiddleware');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const routes = require('./routes');
const { sanitizeBody } = require('./utils/sanitize');

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true
  })
);
app.use(helmet());
app.use(hpp());
app.use(compression());
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeBody);

app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));
app.use('/api/docs', express.static(path.resolve(process.cwd(), 'src/docs')));
app.use('/api', routes);

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Team Task Manager API is healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/diagnostics', (_req, res) => {
  const envKeys = Object.keys(process.env).filter(k => 
    !k.includes('PASSWORD') && 
    !k.includes('SECRET') && 
    !k.includes('KEY') && 
    !k.includes('PASS')
  );
  
  res.status(200).json({
    status: 'Operational',
    node_env: process.env.NODE_ENV,
    db_connected: env.MONGODB_URI !== 'MISSING_MONGODB_URI_IN_RAILWAY_DASHBOARD',
    detected_keys: envKeys
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
