import express from 'express';
import cors from 'cors';
import coinsRouter from './routes/coins';
import favoritesRouter from './routes/favorites';
import marketRouter from './routes/market';
import alertsRouter from './routes/alerts';
import comparisonRouter from './routes/comparison';
import healthRouter from './routes/health';
import { db } from './database';

const app = express();
const startTime = Date.now();

app.use(cors({
  credentials: true,
  origin: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';
  
  try {
    db.prepare('SELECT 1').get();
    dbStatus = 'connected';
  } catch (error) {
    console.error('Health check database error:', error);
  }
  
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  
  res.json({
    status: dbStatus === 'connected' ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime
  });
});

app.use('/api/coins', coinsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/market', marketRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/comparison', comparisonRouter);
app.use('/api/health', healthRouter);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API 端点不存在'
  });
});

export default app;
