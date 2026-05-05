import app from './app';
import { config } from './config';
import { CoinGeckoService } from './services/coingeckoService';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const coinGeckoService = new CoinGeckoService();

const initializeData = async () => {
  console.log('Initializing data on startup...');
  try {
    await coinGeckoService.refreshAllData();
    console.log('Initial data refresh completed');
  } catch (error) {
    console.error('Initial data refresh failed:', error);
    console.log('Application will start with cached or fallback data');
  }
};

const startServer = () => {
  app.listen(config.port, () => {
    console.log(`CryptoScope Backend Server running on port ${config.port}`);
    console.log(`API Endpoint: http://localhost:${config.port}/api`);
    console.log(`Health Check: http://localhost:${config.port}/health`);
  });
};

const setupCronJobs = () => {
  const cronExpression = `*/${config.cacheDurationMinutes} * * * *`;
  
  cron.schedule(cronExpression, async () => {
    console.log(`Scheduled data refresh started at ${new Date().toISOString()}`);
    try {
      await coinGeckoService.refreshAllData();
      console.log('Scheduled data refresh completed');
    } catch (error) {
      console.error('Scheduled data refresh failed:', error);
    }
  });
  
  console.log(`Scheduled data refresh configured to run every ${config.cacheDurationMinutes} minutes`);
};

const main = async () => {
  console.log('='.repeat(50));
  console.log('Starting CryptoScope Backend Server');
  console.log('='.repeat(50));
  
  if (!config.newsApiKey) {
    console.log('Warning: NEWS_API_KEY not configured. News will be served from mock data.');
  }
  
  await initializeData();
  
  setupCronJobs();
  
  startServer();
};

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
