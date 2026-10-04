import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/error.middleware';
import apiRouter from './routes';
import { runDatabaseSeed } from './jobs/seed';

const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EthioTransit Transportation Platform API',
  });
});

// API Routes
app.use('/api', apiRouter);

// Centralized Error Handling Middleware
app.use(errorHandler);

async function startServer() {
  try {
    console.log('[EthioTransit] Initializing platform backend...');
    await connectDatabase();

    // Auto-seed development database if empty
    await runDatabaseSeed();

    const server = app.listen(ENV.PORT, () => {
      console.log(`====================================================`);
      console.log(` EthioTransit API Server running on port ${ENV.PORT}`);
      console.log(` Health Check: http://localhost:${ENV.PORT}/health`);
      console.log(` API Endpoint: http://localhost:${ENV.PORT}/api`);
      console.log(`====================================================`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Error: Port ${ENV.PORT} is already in use by another process.`);
        console.error(`👉 Solution: Terminate the process using port ${ENV.PORT} or configure PORT in your .env file.\n`);
        process.exit(1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Fatal error starting EthioTransit server:', error);
    process.exit(1);
  }
}

startServer();
