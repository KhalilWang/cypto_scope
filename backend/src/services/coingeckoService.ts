import axios from 'axios';
import { config } from '../config';
import { db } from '../database';
import { 
  Coin, 
  CoinMarketData, 
  PriceHistoryPoint 
} from '../types';
import { TechnicalIndicatorsService } from './technicalIndicators';

export interface CoinGeckoCoin {
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

export interface CoinGeckoMarketChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

const MOCK_COINS: CoinGeckoCoin[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    current_price: 67543.21,
    market_cap: 1325432123456,
    market_cap_rank: 1,
    total_volume: 28765432123,
    high_24h: 68000,
    low_24h: 66000,
    price_change_24h: 1543.21,
    price_change_percentage_24h: 2.34,
    market_cap_change_24h: 32123456789,
    market_cap_change_percentage_24h: 2.49,
    circulating_supply: 19600000,
    total_supply: 21000000,
    ath: 73750.07,
    ath_change_percentage: -8.42,
    ath_date: '2024-03-14T07:10:36.790Z',
    atl: 67.81,
    atl_change_percentage: 99500.21,
    atl_date: '2013-07-06T00:00:00.000Z',
    last_updated: new Date().toISOString(),
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    current_price: 3456.78,
    market_cap: 415678901234,
    market_cap_rank: 2,
    total_volume: 15678901234,
    high_24h: 3500,
    low_24h: 3380,
    price_change_24h: 76.54,
    price_change_percentage_24h: 2.27,
    market_cap_change_24h: 9876543210,
    market_cap_change_percentage_24h: 2.44,
    circulating_supply: 120000000,
    total_supply: null,
    ath: 4878.26,
    ath_change_percentage: -29.14,
    ath_date: '2021-11-10T14:24:19.604Z',
    atl: 0.420897,
    atl_change_percentage: 820000,
    atl_date: '2015-10-20T00:00:00.000Z',
    last_updated: new Date().toISOString(),
  },
  {
    id: 'tether',
    symbol: 'usdt',
    name: 'Tether',
    image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    current_price: 1.00,
    market_cap: 95000000000,
    market_cap_rank: 3,
    total_volume: 45000000000,
    high_24h: 1.001,
    low_24h: 0.999,
    price_change_24h: 0.0001,
    price_change_percentage_24h: 0.01,
    market_cap_change_24h: 50000000,
    market_cap_change_percentage_24h: 0.05,
    circulating_supply: 95000000000,
    total_supply: 95000000000,
    ath: 1.05,
    ath_change_percentage: -4.76,
    ath_date: '2018-04-25T00:00:00.000Z',
    atl: 0.57,
    atl_change_percentage: 75.44,
    atl_date: '2015-03-02T00:00:00.000Z',
    last_updated: new Date().toISOString(),
  },
  {
    id: 'binancecoin',
    symbol: 'bnb',
    name: 'BNB',
    image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    current_price: 598.45,
    market_cap: 89765432109,
    market_cap_rank: 4,
    total_volume: 1234567890,
    high_24h: 610,
    low_24h: 585,
    price_change_24h: 13.45,
    price_change_percentage_24h: 2.30,
    market_cap_change_24h: 2012345678,
    market_cap_change_percentage_24h: 2.30,
    circulating_supply: 150000000,
    total_supply: 200000000,
    ath: 686.31,
    ath_change_percentage: -12.80,
    ath_date: '2024-05-01T00:00:00.000Z',
    atl: 0.0398177,
    atl_change_percentage: 1500000,
    atl_date: '2017-10-19T00:00:00.000Z',
    last_updated: new Date().toISOString(),
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    current_price: 178.90,
    market_cap: 78543210987,
    market_cap_rank: 5,
    total_volume: 3456789012,
    high_24h: 182,
    low_24h: 172,
    price_change_24h: 6.90,
    price_change_percentage_24h: 4.01,
    market_cap_change_24h: 3023456789,
    market_cap_change_percentage_24h: 4.00,
    circulating_supply: 439000000,
    total_supply: 550000000,
    ath: 260.06,
    ath_change_percentage: -31.21,
    ath_date: '2021-11-06T21:54:35.825Z',
    atl: 0.500801,
    atl_change_percentage: 35600,
    atl_date: '2020-05-11T19:35:53.925Z',
    last_updated: new Date().toISOString(),
  },
];

function generateMockCoins(count: number): CoinGeckoCoin[] {
  const baseCoins = [...MOCK_COINS];
  const mockCoins: CoinGeckoCoin[] = [];
  
  const coinNames = [
    ['XRP', 'Ripple'],
    ['USDC', 'USD Coin'],
    ['ADA', 'Cardano'],
    ['AVAX', 'Avalanche'],
    ['DOGE', 'Dogecoin'],
    ['DOT', 'Polkadot'],
    ['TRX', 'TRON'],
    ['MATIC', 'Polygon'],
    ['DAI', 'Dai'],
    ['SHIB', 'Shiba Inu'],
    ['LTC', 'Litecoin'],
    ['BCH', 'Bitcoin Cash'],
    ['LINK', 'Chainlink'],
    ['UNI', 'Uniswap'],
    ['ATOM', 'Cosmos'],
    ['XLM', 'Stellar'],
    ['OKB', 'OKB'],
    ['FIL', 'Filecoin'],
    ['APT', 'Aptos'],
    ['STX', 'Stacks'],
    ['HBAR', 'Hedera'],
    ['AR', 'Arweave'],
    ['EGLD', 'MultiversX'],
    ['OP', 'Optimism'],
    ['NEAR', 'NEAR Protocol'],
    ['AAVE', 'Aave'],
    ['QNT', 'Quant'],
    ['GRT', 'The Graph'],
    ['ALGO', 'Algorand'],
    ['SAND', 'The Sandbox'],
    ['MANA', 'Decentraland'],
    ['LDO', 'Lido DAO'],
    ['FTM', 'Fantom'],
    ['AXS', 'Axie Infinity'],
    ['THETA', 'Theta Network'],
    ['EOS', 'EOS'],
    ['XTZ', 'Tezos'],
    ['SNX', 'Synthetix'],
    ['KCS', 'KuCoin Token'],
    ['MIOTA', 'IOTA'],
    ['CFX', 'Conflux'],
    ['CHZ', 'Chiliz'],
    ['NEO', 'NEO'],
    ['ZEC', 'Zcash'],
  ];

  for (let i = 0; i < count; i++) {
    if (i < baseCoins.length) {
      mockCoins.push(baseCoins[i]);
    } else {
      const coinIndex = i - baseCoins.length;
      if (coinIndex < coinNames.length) {
        const [symbol, name] = coinNames[coinIndex];
        const randomPrice = 0.01 + Math.random() * 500;
        const randomChange = (Math.random() - 0.5) * 10;
        const rank = i + 1;
        
        mockCoins.push({
          id: symbol.toLowerCase(),
          symbol: symbol.toLowerCase(),
          name: name,
          image: `https://placehold.co/40/1e293b/94a3b8?text=${symbol.charAt(0)}`,
          current_price: randomPrice,
          market_cap: (100000000000 / Math.sqrt(rank)) * (0.8 + Math.random() * 0.4),
          market_cap_rank: rank,
          total_volume: randomPrice * 10000000 * (0.5 + Math.random()),
          high_24h: randomPrice * (1 + Math.random() * 0.05),
          low_24h: randomPrice * (1 - Math.random() * 0.05),
          price_change_24h: randomPrice * randomChange / 100,
          price_change_percentage_24h: randomChange,
          market_cap_change_24h: (1000000000 / Math.sqrt(rank)) * randomChange / 100,
          market_cap_change_percentage_24h: randomChange,
          circulating_supply: 100000000 + Math.random() * 1000000000,
          total_supply: null,
          ath: randomPrice * (1.5 + Math.random()),
          ath_change_percentage: -20 - Math.random() * 60,
          ath_date: '2024-01-01T00:00:00.000Z',
          atl: randomPrice * (0.01 + Math.random() * 0.1),
          atl_change_percentage: 1000 + Math.random() * 10000,
          atl_date: '2020-01-01T00:00:00.000Z',
          last_updated: new Date().toISOString(),
        });
      }
    }
  }
  
  return mockCoins;
}

function generateMockMarketChart(coinId: string, days: number = 30): CoinGeckoMarketChart {
  const basePrice = coinId === 'bitcoin' ? 65000 : coinId === 'ethereum' ? 3400 : 100;
  const now = Date.now();
  const prices: [number, number][] = [];
  const market_caps: [number, number][] = [];
  const total_volumes: [number, number][] = [];
  
  const intervals = days <= 1 ? 96 : days <= 7 ? 168 : 30 * 24;
  const intervalMs = (days * 24 * 60 * 60 * 1000) / intervals;
  
  let currentPrice = basePrice;
  
  for (let i = 0; i < intervals; i++) {
    const timestamp = now - (intervals - i) * intervalMs;
    const change = (Math.random() - 0.48) * (basePrice * 0.01);
    currentPrice = Math.max(currentPrice * 0.9, currentPrice + change);
    
    prices.push([timestamp, currentPrice]);
    market_caps.push([timestamp, currentPrice * 1000000]);
    total_volumes.push([timestamp, currentPrice * 100000]);
  }
  
  return { prices, market_caps, total_volumes };
}

export class CoinGeckoService {
  private readonly apiUrl: string;
  private readonly technicalIndicatorsService: TechnicalIndicatorsService;
  private useMockData: boolean = false;
  private mockDataInitialized: boolean = false;
  private lastSuccessfulApiCall: Date | null = null;
  private lastDataRefresh: Date = new Date();
  private apiAvailable: boolean = true;

  constructor() {
    this.apiUrl = config.coingeckoApiUrl;
    this.technicalIndicatorsService = new TechnicalIndicatorsService();
  }

  private async testApiConnection(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/ping`,
        {
          timeout: 5000,
          validateStatus: () => true,
        }
      );
      return response.status < 400;
    } catch {
      return false;
    }
  }

  private async fetchWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    retryDelay: number = 1000
  ): Promise<T> {
    let lastError: unknown;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.warn(`API request attempt ${i + 1} failed:`, 
          error instanceof Error ? error.message : String(error));
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    throw lastError;
  }

  async fetchTopCoins(limit: number = 50): Promise<CoinGeckoCoin[]> {
    if (this.useMockData) {
      console.log('Using mock data for coins (API unavailable)');
      return generateMockCoins(limit);
    }

    console.log(`[DEBUG] Fetching top ${limit} coins from CoinGecko API...`);
    console.log(`[DEBUG] API URL: ${this.apiUrl}/coins/markets`);

    try {
      const response = await this.fetchWithRetry(() => 
        axios.get<CoinGeckoCoin[]>(
          `${this.apiUrl}/coins/markets`,
          {
            params: {
              vs_currency: 'usd',
              order: 'market_cap_desc',
              per_page: limit,
              page: 1,
              sparkline: false,
            },
            timeout: 15000,
          }
        )
      );
      
      console.log(`[DEBUG] CoinGecko API response status: ${response.status}`);
      console.log(`[DEBUG] Response headers:`, JSON.stringify(response.headers, null, 2));
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log(`[DEBUG] Successfully fetched ${response.data.length} coins from API`);
        
        this.lastSuccessfulApiCall = new Date();
        this.apiAvailable = true;
        
        const first5Coins = response.data.slice(0, 5);
        console.log(`[DEBUG] Sample coin data (first 5):`);
        first5Coins.forEach((coin, index) => {
          console.log(`[DEBUG]   [${index + 1}] ${coin.name} (${coin.symbol.toUpperCase()})`);
          console.log(`[DEBUG]     ID: ${coin.id}`);
          console.log(`[DEBUG]     Current Price: $${coin.current_price}`);
          console.log(`[DEBUG]     24h Change: ${coin.price_change_percentage_24h}%`);
          console.log(`[DEBUG]     Market Cap: $${coin.market_cap}`);
          console.log(`[DEBUG]     24h High: $${coin.high_24h}`);
          console.log(`[DEBUG]     24h Low: $${coin.low_24h}`);
          console.log(`[DEBUG]     Last Updated: ${coin.last_updated}`);
          console.log(`[DEBUG]     ---`);
        });
        
        return response.data;
      }
      
      console.error(`[DEBUG] Empty or invalid response from CoinGecko`);
      console.error(`[DEBUG] Response data:`, JSON.stringify(response.data, null, 2));
      throw new Error('Empty or invalid response from CoinGecko');
    } catch (error) {
      console.error('[DEBUG] CoinGecko API failed:');
      console.error(`[DEBUG]   Error type: ${error instanceof Error ? error.name : typeof error}`);
      console.error(`[DEBUG]   Error message: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`[DEBUG]   Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
      console.warn('[DEBUG] Switching to mock data...');
      this.useMockData = true;
      this.apiAvailable = false;
      return generateMockCoins(limit);
    }
  }

  async fetchMarketChart(coinId: string, days: number = 30): Promise<CoinGeckoMarketChart> {
    if (this.useMockData) {
      console.log(`[DEBUG] Using mock data for ${coinId} market chart`);
      return generateMockMarketChart(coinId, days);
    }

    console.log(`[DEBUG] Fetching market chart for ${coinId} (${days} days)...`);
    console.log(`[DEBUG] API URL: ${this.apiUrl}/coins/${coinId}/market_chart`);

    try {
      const response = await this.fetchWithRetry(() => 
        axios.get<CoinGeckoMarketChart>(
          `${this.apiUrl}/coins/${coinId}/market_chart`,
          {
            params: {
              vs_currency: 'usd',
              days,
            },
            timeout: 15000,
          }
        ),
        2,
        500
      );
      
      console.log(`[DEBUG] Market chart API response status: ${response.status}`);
      
      if (response.data && response.data.prices && Array.isArray(response.data.prices)) {
        console.log(`[DEBUG] Successfully fetched market chart for ${coinId}`);
        console.log(`[DEBUG]   Price data points: ${response.data.prices.length}`);
        console.log(`[DEBUG]   Market cap data points: ${response.data.market_caps?.length || 0}`);
        console.log(`[DEBUG]   Volume data points: ${response.data.total_volumes?.length || 0}`);
        
        this.lastSuccessfulApiCall = new Date();
        this.apiAvailable = true;
        
        if (response.data.prices.length > 0) {
          const firstPrice = response.data.prices[0];
          const lastPrice = response.data.prices[response.data.prices.length - 1];
          console.log(`[DEBUG]   First price: ${new Date(firstPrice[0]).toLocaleString()} - $${firstPrice[1]}`);
          console.log(`[DEBUG]   Last price: ${new Date(lastPrice[0]).toLocaleString()} - $${lastPrice[1]}`);
          console.log(`[DEBUG]   Price change: ${((lastPrice[1] - firstPrice[1]) / firstPrice[1] * 100).toFixed(2)}%`);
        }
        
        return response.data;
      }
      
      console.error(`[DEBUG] Invalid market chart response for ${coinId}`);
      console.error(`[DEBUG] Response data:`, JSON.stringify(response.data, null, 2));
      throw new Error('Invalid market chart response');
    } catch (error) {
      console.error(`[DEBUG] Failed to fetch market chart for ${coinId}:`);
      console.error(`[DEBUG]   Error: ${error instanceof Error ? error.message : String(error)}`);
      console.warn(`[DEBUG] Using mock data for ${coinId} market chart...`);
      this.apiAvailable = false;
      return generateMockMarketChart(coinId, days);
    }
  }

  async updateCoinsCache(coins: CoinGeckoCoin[]): Promise<void> {
    if (coins.length === 0) {
      console.warn('No coins to update in cache');
      return;
    }

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO coins (
        id, symbol, name, image, current_price, market_cap, market_cap_rank,
        total_volume, high_24h, low_24h, price_change_24h, price_change_percentage_24h,
        market_cap_change_24h, market_cap_change_percentage_24h, circulating_supply,
        total_supply, ath, ath_change_percentage, ath_date, atl, atl_change_percentage,
        atl_date, last_updated, cached_at
      ) VALUES (
        @id, @symbol, @name, @image, @current_price, @market_cap, @market_cap_rank,
        @total_volume, @high_24h, @low_24h, @price_change_24h, @price_change_percentage_24h,
        @market_cap_change_24h, @market_cap_change_percentage_24h, @circulating_supply,
        @total_supply, @ath, @ath_change_percentage, @ath_date, @atl, @atl_change_percentage,
        @atl_date, @last_updated, CURRENT_TIMESTAMP
      )
    `);

    const transaction = db.transaction((coinsList: CoinGeckoCoin[]) => {
      for (const coin of coinsList) {
        insertStmt.run({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          image: coin.image,
          current_price: coin.current_price,
          market_cap: coin.market_cap,
          market_cap_rank: coin.market_cap_rank,
          total_volume: coin.total_volume,
          high_24h: coin.high_24h,
          low_24h: coin.low_24h,
          price_change_24h: coin.price_change_24h,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          market_cap_change_24h: coin.market_cap_change_24h,
          market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h,
          circulating_supply: coin.circulating_supply,
          total_supply: coin.total_supply,
          ath: coin.ath,
          ath_change_percentage: coin.ath_change_percentage,
          ath_date: coin.ath_date,
          atl: coin.atl,
          atl_change_percentage: coin.atl_change_percentage,
          atl_date: coin.atl_date,
          last_updated: coin.last_updated,
        });
      }
    });

    transaction(coins);
  }

  async updatePriceHistoryCache(
    coinId: string, 
    marketChart: CoinGeckoMarketChart
  ): Promise<void> {
    const deleteStmt = db.prepare('DELETE FROM price_history WHERE coin_id = ?');
    deleteStmt.run(coinId);

    const insertStmt = db.prepare(`
      INSERT INTO price_history (coin_id, timestamp, price, volume, cached_at)
      VALUES (@coin_id, @timestamp, @price, @volume, CURRENT_TIMESTAMP)
    `);

    const priceMap = new Map(marketChart.prices);
    const volumeMap = new Map(marketChart.total_volumes);

    const transaction = db.transaction(() => {
      for (const [timestamp, price] of marketChart.prices) {
        const volume = volumeMap.get(timestamp) || 0;
        insertStmt.run({
          coin_id: coinId,
          timestamp,
          price,
          volume,
        });
      }
    });

    transaction();
  }

  getCoinsFromCache(): Coin[] {
    const rows = db.prepare(`
      SELECT id, symbol, name, current_price, price_change_percentage_24h,
             market_cap, market_cap_rank, total_volume, circulating_supply, image
      FROM coins
      ORDER BY market_cap_rank ASC
    `).all() as Array<{
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
    }>;

    return rows.map(row => ({
      id: row.id,
      symbol: row.symbol,
      name: row.name,
      current_price: row.current_price,
      price_change_percentage_24h: row.price_change_percentage_24h,
      market_cap: row.market_cap,
      market_cap_rank: row.market_cap_rank,
      total_volume: row.total_volume,
      circulating_supply: row.circulating_supply,
      image: row.image,
    }));
  }

  getCoinMarketDataFromCache(coinId: string): CoinMarketData | null {
    const row = db.prepare(`
      SELECT * FROM coins WHERE id = ?
    `).get(coinId) as (CoinGeckoCoin & { cached_at: string }) | undefined;

    if (!row) return null;

    return {
      id: row.id,
      symbol: row.symbol,
      name: row.name,
      image: row.image,
      current_price: row.current_price,
      market_cap: row.market_cap,
      market_cap_rank: row.market_cap_rank,
      total_volume: row.total_volume,
      high_24h: row.high_24h,
      low_24h: row.low_24h,
      price_change_24h: row.price_change_24h,
      price_change_percentage_24h: row.price_change_percentage_24h,
      market_cap_change_24h: row.market_cap_change_24h,
      market_cap_change_percentage_24h: row.market_cap_change_percentage_24h,
      circulating_supply: row.circulating_supply,
      total_supply: row.total_supply,
      ath: row.ath,
      ath_change_percentage: row.ath_change_percentage,
      ath_date: row.ath_date,
      atl: row.atl,
      atl_change_percentage: row.atl_change_percentage,
      atl_date: row.atl_date,
      last_updated: row.last_updated,
    };
  }

  getPriceHistoryFromCache(coinId: string): PriceHistoryPoint[] {
    const rows = db.prepare(`
      SELECT timestamp, price, volume
      FROM price_history
      WHERE coin_id = ?
      ORDER BY timestamp ASC
    `).all(coinId) as Array<{
      timestamp: number;
      price: number;
      volume: number;
    }>;

    return rows.map(row => ({
      timestamp: row.timestamp,
      price: row.price,
      volume: row.volume,
    }));
  }

  private async initializeMockData(): Promise<void> {
    if (this.mockDataInitialized) return;
    
    console.log('Initializing mock data...');
    const mockCoins = generateMockCoins(50);
    await this.updateCoinsCache(mockCoins);
    
    for (const coin of mockCoins.slice(0, 10)) {
      try {
        const mockChart = generateMockMarketChart(coin.id, 30);
        await this.updatePriceHistoryCache(coin.id, mockChart);
      } catch (error) {
        console.warn(`Failed to init mock price history for ${coin.id}`);
      }
    }
    
    this.mockDataInitialized = true;
    console.log('Mock data initialization complete');
  }

  async refreshAllData(): Promise<void> {
    console.log('Refreshing data from CoinGecko...');
    
    try {
      const cachedCoins = this.getCoinsFromCache();
      
      if (cachedCoins.length > 0 && !this.useMockData) {
        console.log(`Found ${cachedCoins.length} cached coins, testing API...`);
        const apiAvailable = await this.testApiConnection();
        
        if (!apiAvailable) {
          console.log('CoinGecko API unavailable, using cached data + mock fallback');
          this.useMockData = true;
          return;
        }
      }
      
      const coins = await this.fetchTopCoins(50);
      await this.updateCoinsCache(coins);
      
      console.log(`Updated ${coins.length} coins in cache`);
      
      for (const coin of coins.slice(0, 10)) {
        try {
          const marketChart = await this.fetchMarketChart(coin.id, 30);
          await this.updatePriceHistoryCache(coin.id, marketChart);
          console.log(`Updated price history for ${coin.id}`);
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.warn(`Failed to update price history for ${coin.id}`, 
            error instanceof Error ? error.message : String(error));
        }
      }
      
      console.log('Data refresh completed');
    } catch (error) {
      console.error('Data refresh failed, checking for cached data...');
      
      const cachedCoins = this.getCoinsFromCache();
      if (cachedCoins.length > 0) {
        console.log(`Using cached data (${cachedCoins.length} coins)`);
        this.useMockData = true;
        return;
      }
      
      console.log('No cached data found, initializing mock data...');
      await this.initializeMockData();
      this.useMockData = true;
    }
  }

  async ensureCoinData(coinId: string): Promise<boolean> {
    const marketData = this.getCoinMarketDataFromCache(coinId);
    
    if (!marketData) {
      if (this.useMockData) {
        const mockCoins = generateMockCoins(250);
        const coin = mockCoins.find(c => c.id === coinId);
        
        if (coin) {
          await this.updateCoinsCache([coin]);
        } else {
          return false;
        }
      } else {
        try {
          const coins = await this.fetchTopCoins(250);
          const coin = coins.find(c => c.id === coinId);
          
          if (coin) {
            await this.updateCoinsCache([coin]);
          } else {
            return false;
          }
        } catch (error) {
          return false;
        }
      }
    }
    
    const priceHistory = this.getPriceHistoryFromCache(coinId);
    
    if (priceHistory.length === 0) {
      try {
        const marketChart = await this.fetchMarketChart(coinId, 30);
        await this.updatePriceHistoryCache(coinId, marketChart);
      } catch (error) {
        const mockChart = generateMockMarketChart(coinId, 30);
        await this.updatePriceHistoryCache(coinId, mockChart);
      }
    }
    
    return true;
  }

  getApiHealthStatus(): {
    apiAvailable: boolean;
    usingMockData: boolean;
    lastSuccessfulApiCall: Date | null;
    dataSource: 'realtime' | 'cached' | 'mock';
    lastDataRefresh: Date;
  } {
    let dataSource: 'realtime' | 'cached' | 'mock' = 'realtime';
    
    if (this.useMockData) {
      const cachedCoins = this.getCoinsFromCache();
      if (cachedCoins.length > 0) {
        dataSource = 'cached';
      } else {
        dataSource = 'mock';
      }
    }

    return {
      apiAvailable: this.apiAvailable,
      usingMockData: this.useMockData,
      lastSuccessfulApiCall: this.lastSuccessfulApiCall,
      dataSource,
      lastDataRefresh: this.lastDataRefresh,
    };
  }

  setLastDataRefresh(time: Date): void {
    this.lastDataRefresh = time;
  }
}

export default CoinGeckoService;
