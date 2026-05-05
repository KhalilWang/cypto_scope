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
  ema: EMAIndicator;
  bollinger: BollingerIndicator;
  kdj: KDJIndicator;
  cci: CCIIndicator;
  atr: ATRIndicator;
  obv: OBVIndicator;
  williamsR: WilliamsRIndicator;
  stoch: StochasticIndicator;
}

export interface RSIIndicator {
  value: number;
  period: number;
  signal: 'overbought' | 'oversold' | 'neutral';
  interpretation: string;
  historicalValues: number[];
  reference: {
    overboughtThreshold: number;
    oversoldThreshold: number;
    description: string;
  };
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
  reference: {
    crossoverCondition: string;
    histogramInterpretation: string;
  };
}

export interface SMAIndicator {
  sma5: number[];
  sma10: number[];
  sma20: number[];
  sma50: number[];
  sma100: number[];
  sma200: number[];
  currentSma5: number;
  currentSma10: number;
  currentSma20: number;
  currentSma50: number;
  currentSma100: number;
  currentSma200: number;
  signal: 'golden_cross' | 'death_cross' | 'bullish' | 'bearish' | 'neutral';
  trend: 'bullish' | 'bearish' | 'sideways';
  interpretation: string;
  reference: {
    goldenCrossDescription: string;
    deathCrossDescription: string;
    sma200Role: string;
  };
}

export interface EMAIndicator {
  ema5: number[];
  ema12: number[];
  ema20: number[];
  ema26: number[];
  ema50: number[];
  currentEma5: number;
  currentEma12: number;
  currentEma20: number;
  currentEma26: number;
  currentEma50: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  interpretation: string;
  reference: {
    description: string;
    comparisonWithSMA: string;
  };
}

export interface BollingerIndicator {
  upperBand: number[];
  middleBand: number[];
  lowerBand: number[];
  bandWidth: number[];
  percentageB: number[];
  currentUpper: number;
  currentMiddle: number;
  currentLower: number;
  currentBandWidth: number;
  currentPercentageB: number;
  period: number;
  stdDeviations: number;
  signal: 'squeeze' | 'expanding' | 'upper_touch' | 'lower_touch' | 'neutral';
  interpretation: string;
  reference: {
    squeezeDescription: string;
    touchInterpretation: string;
    bandWidthMeaning: string;
  };
}

export interface KDJIndicator {
  k: number[];
  d: number[];
  j: number[];
  currentK: number;
  currentD: number;
  currentJ: number;
  period: number;
  smoothK: number;
  smoothD: number;
  signal: 'golden_cross' | 'death_cross' | 'overbought' | 'oversold' | 'bullish' | 'bearish' | 'neutral';
  interpretation: string;
  reference: {
    overboughtThreshold: number;
    oversoldThreshold: number;
    crossInterpretation: string;
    jValueMeaning: string;
  };
}

export interface CCIIndicator {
  values: number[];
  currentValue: number;
  period: number;
  signal: 'overbought' | 'oversold' | 'bullish' | 'bearish' | 'neutral';
  interpretation: string;
  reference: {
    overboughtThreshold: number;
    oversoldThreshold: number;
    zeroLineCross: string;
    periodMeaning: string;
  };
}

export interface ATRIndicator {
  values: number[];
  currentValue: number;
  period: number;
  atrPercentage: number;
  signal: 'high_volatility' | 'low_volatility' | 'normal';
  interpretation: string;
  reference: {
    description: string;
    usageInTrading: string;
    stopLossReference: string;
  };
}

export interface OBVIndicator {
  values: number[];
  currentValue: number;
  signal: 'bullish_divergence' | 'bearish_divergence' | 'confirmation' | 'neutral';
  interpretation: string;
  reference: {
    description: string;
    divergenceInterpretation: string;
    confirmationMeaning: string;
  };
}

export interface WilliamsRIndicator {
  values: number[];
  currentValue: number;
  period: number;
  signal: 'overbought' | 'oversold' | 'bullish' | 'bearish' | 'neutral';
  interpretation: string;
  reference: {
    overboughtThreshold: number;
    oversoldThreshold: number;
    comparisonWithStochastic: string;
  };
}

export interface StochasticIndicator {
  k: number[];
  d: number[];
  currentK: number;
  currentD: number;
  fastKPeriod: number;
  slowKPeriod: number;
  slowDPeriod: number;
  signal: 'golden_cross' | 'death_cross' | 'overbought' | 'oversold' | 'bullish' | 'bearish' | 'neutral';
  interpretation: string;
  reference: {
    overboughtThreshold: number;
    oversoldThreshold: number;
    crossInterpretation: string;
    vsFastStochastic: string;
  };
}

export interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
  isMock: boolean;
  sourceType: 'newsapi' | 'mock' | 'alternative';
  confidence: number;
  keywords: string[];
}

export interface NewsComparison {
  keyword: string;
  sources: NewsSourceComparison[];
  summary: {
    bullishCount: number;
    bearishCount: number;
    neutralCount: number;
    overallSentiment: 'bullish' | 'bearish' | 'neutral';
  };
}

export interface NewsSourceComparison {
  sourceName: string;
  articles: NewsArticle[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  isMock: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  isMock?: boolean;
}

export interface CoinDetail extends CoinMarketData {
  priceHistory: PriceHistoryPoint[];
  technicalIndicators: TechnicalIndicators;
  tradingSignal?: TradingSignal;
  news: NewsArticle[];
  isMock: boolean;
}

export interface FavoriteWithCoin extends Coin {
  favorited_at: string;
}

export interface MarketOverview {
  total_market_cap: number;
  total_volume: number;
  btc_dominance: number;
  eth_dominance: number;
  active_cryptocurrencies: number;
  markets: number;
  market_cap_change_percentage_24h_usd: number;
  up_coins_count: number;
  down_coins_count: number;
  isMock: boolean;
}

export interface TradingSignal {
  overall: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  recommendation: string;
  reasons: string[];
  indicatorsAnalysis: {
    rsi: IndicatorAnalysis;
    macd: IndicatorAnalysis;
    sma: IndicatorAnalysis;
    ema: IndicatorAnalysis;
    bollinger: IndicatorAnalysis;
    kdj: IndicatorAnalysis;
    cci: IndicatorAnalysis;
    atr: IndicatorAnalysis;
    obv: IndicatorAnalysis;
    williamsR: IndicatorAnalysis;
    stoch: IndicatorAnalysis;
  };
  isMock: boolean;
}

export interface IndicatorAnalysis {
  signal: string;
  value?: number;
  interpretation: string;
  weight: number;
}
