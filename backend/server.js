import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import questionsRoutes from './routes/questions.js';
import { migrateLatest, destroyDb } from './config/db.js';

const app = express();

// Security middlewares
app.use(helmet());
app.use(express.json({ limit: '10kb' })); // limit JSON body size

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// CORS
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000'];
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions)); // Express handles OPTIONS automatically with cors

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/questions', questionsRoutes);

// Centralized error handler (last middleware)
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const safeMessage = process.env.NODE_ENV === 'production' ? 'Server error' : err.message || 'Server error';
  res.status(status).json({ error: safeMessage });
});

// Start server and optionally run migrations
async function start() {
  try {
    await migrateLatest(); // runs only if RUN_MIGRATIONS_ON_START=1 in env

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down...');
      server.close(async () => {
        await destroyDb();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

export default start;

start();