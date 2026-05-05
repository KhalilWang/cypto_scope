import express from 'express';
import cors from 'cors';
import coinsRouter from './routes/coins';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/coins', coinsRouter);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API 端点不存在'
  });
});

export default app;
