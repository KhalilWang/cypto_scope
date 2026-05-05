import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  newsApiKey: process.env.NEWS_API_KEY || '',
  coingeckoApiUrl: process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
  newsApiUrl: process.env.NEWS_API_URL || 'https://newsapi.org/v2',
  cacheDurationMinutes: parseInt(process.env.CACHE_DURATION_MINUTES || '5', 10),
  isDevelopment: process.env.NODE_ENV !== 'production',
};

export default config;
