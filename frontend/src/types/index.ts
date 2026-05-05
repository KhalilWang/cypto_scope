export interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  circulating_supply: number;
  image: string;
}

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface PriceHistoryPoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: RSIIndicator;
  macd: MACDIndicator;
  sma: SMAIndicator;
}

export interface RSIIndicator {
  value: number;
  period: number;
  signal: 'overbought' | 'oversold' | 'neutral';
  interpretation: string;
  historicalValues: number[];
}

export interface MACDIndicator {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
  currentMacd: number;
  currentSignal: number;
  currentHistogram: number;
  signal: 'bullish_crossover' | 'bearish_crossover' | 'bullish' | 'bearish' | 'neutral';
  interpretation: string;
}

export interface SMAIndicator {
  sma10: number[];
  sma30: number[];
  currentSma10: number;
  currentSma30: number;
  signal: 'golden_cross' | 'death_cross' | 'bullish' | 'bearish' | 'neutral';
  trend: 'bullish' | 'bearish' | 'sideways';
  interpretation: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CoinDetail extends CoinMarketData {
  priceHistory: PriceHistoryPoint[];
  technicalIndicators: TechnicalIndicators;
}
