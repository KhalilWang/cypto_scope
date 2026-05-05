import axios from 'axios';
import { config } from '../config';
import { db } from '../database';
import { MarketOverview, Coin } from '../types';

interface CoinGeckoGlobalData {
  data: {
    active_cryptocurrencies: number;
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    market_cap_change_percentage_24h_usd: number;
    markets: number;
  };
}

interface CachedMarketData {
  id: number;
  total_market_cap: number;
  total_volume: number;
  btc_dominance: number;
  eth_dominance: number;
  active_cryptocurrencies: number;
  markets: number;
  market_cap_change_percentage_24h_usd: number;
  cached_at: string;
}

export class MarketService {
  private readonly apiUrl: string;
  private readonly cacheDurationMinutes: number;

  constructor() {
    this.apiUrl = config.coingeckoApiUrl;
    this.cacheDurationMinutes = config.cacheDurationMinutes;
  }

  async fetchGlobalData(): Promise<CoinGeckoGlobalData['data']> {
    try {
      const response = await axios.get<CoinGeckoGlobalData>(
        `${this.apiUrl}/global`,
        { timeout: 15000 }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch global market data from CoinGecko:', error);
      throw error;
    }
  }

  async updateMarketCache(globalData: CoinGeckoGlobalData['data']): Promise<void> {
    db.exec(`
      CREATE TABLE IF NOT EXISTS market_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_market_cap REAL,
        total_volume REAL,
        btc_dominance REAL,
        eth_dominance REAL,
        active_cryptocurrencies INTEGER,
        markets INTEGER,
        market_cap_change_percentage_24h_usd REAL,
        cached_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec('DELETE FROM market_cache');

    db.prepare(`
      INSERT INTO market_cache (
        total_market_cap, total_volume, btc_dominance, eth_dominance,
        active_cryptocurrencies, markets, market_cap_change_percentage_24h_usd, cached_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      globalData.total_market_cap.usd,
      globalData.total_volume.usd,
      globalData.market_cap_percentage.btc,
      globalData.market_cap_percentage.eth,
      globalData.active_cryptocurrencies,
      globalData.markets,
      globalData.market_cap_change_percentage_24h_usd
    );

    console.log('Market cache updated');
  }

  getMarketCache(): CachedMarketData | null {
    try {
      const row = db.prepare(`
        SELECT * FROM market_cache ORDER BY id DESC LIMIT 1
      `).get() as CachedMarketData | undefined;

      return row || null;
    } catch (error) {
      console.error('Failed to get market cache:', error);
      return null;
    }
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

  async getMarketOverview(): Promise<MarketOverview> {
    let cachedData = this.getMarketCache();
    
    if (!cachedData) {
      try {
        const globalData = await this.fetchGlobalData();
        await this.updateMarketCache(globalData);
        cachedData = this.getMarketCache();
      } catch (error) {
        console.error('Failed to refresh market data:', error);
      }
    }

    const coins = this.getCoinsFromCache();
    const upCoinsCount = coins.filter(c => c.price_change_percentage_24h >= 0).length;
    const downCoinsCount = coins.filter(c => c.price_change_percentage_24h < 0).length;

    const isMock = !cachedData || cachedData.total_market_cap === 0;
    
    return {
      total_market_cap: cachedData?.total_market_cap || 0,
      total_volume: cachedData?.total_volume || 0,
      btc_dominance: cachedData?.btc_dominance || 0,
      eth_dominance: cachedData?.eth_dominance || 0,
      active_cryptocurrencies: cachedData?.active_cryptocurrencies || 0,
      markets: cachedData?.markets || 0,
      market_cap_change_percentage_24h_usd: cachedData?.market_cap_change_percentage_24h_usd || 0,
      up_coins_count: upCoinsCount,
      down_coins_count: downCoinsCount,
      isMock,
    };
  }

  async refreshMarketData(): Promise<void> {
    try {
      const globalData = await this.fetchGlobalData();
      await this.updateMarketCache(globalData);
      console.log('Market data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh market data:', error);
      throw error;
    }
  }
}

export default MarketService;
