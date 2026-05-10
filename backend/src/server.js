require('dotenv').config();
const http = require('http');

const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const app = require('./app');
const { connectToDatabase } = require('./config/database');
const env = require('./config/env');
const { setSocketServer } = require('./config/socket');
const { startOverdueTaskJob } = require('./jobs/overdueTasks.job');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true
  }
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next();
    }

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    socket.user = payload;
    return next();
  } catch {
    return next(new Error('Socket authentication failed'));
  }
});

io.on('connection', (socket) => {
  if (socket.user?.sub) {
    socket.join(`user:${socket.user.sub}`);
    socket.join(`role:${socket.user.role}`);
  }
});

setSocketServer(io);

async function startServer() {
  try {
    await connectToDatabase();
    console.info('Database connection established successfully.');
  } catch (dbError) {
    console.error('DATABASE CONNECTION FAILED:', dbError.message);
    console.info('Server will continue to start to allow for diagnostics and health checks.');
  }

  startOverdueTaskJob();

  server.listen(env.PORT, () => {
    console.info(`API server listening on port ${env.PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start API server', error);
  process.exit(1);
});
