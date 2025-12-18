import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import questionsRoutes from './routes/questions.js';
import { migrateLatest, destroyDb } from './config/db.js';

const app = express();

// Middleware
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const corsOptions = {
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions)); // Express 5 handles OPTIONS automatically with cors
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/questions', questionsRoutes);


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

start();