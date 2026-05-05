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

export class CoinGeckoService {
  private readonly apiUrl: string;
  private readonly technicalIndicatorsService: TechnicalIndicatorsService;

  constructor() {
    this.apiUrl = config.coingeckoApiUrl;
    this.technicalIndicatorsService = new TechnicalIndicatorsService();
  }

  async fetchTopCoins(limit: number = 50): Promise<CoinGeckoCoin[]> {
    try {
      const response = await axios.get<CoinGeckoCoin[]>(
        `${this.apiUrl}/coins/markets`,
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: limit,
            page: 1,
            sparkline: false,
          },
          timeout: 30000,
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch coins from CoinGecko:', error);
      throw error;
    }
  }

  async fetchMarketChart(coinId: string, days: number = 30): Promise<CoinGeckoMarketChart> {
    try {
      const response = await axios.get<CoinGeckoMarketChart>(
        `${this.apiUrl}/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days,
          },
          timeout: 30000,
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch market chart for ${coinId}:`, error);
      throw error;
    }
  }

  async updateCoinsCache(coins: CoinGeckoCoin[]): Promise<void> {
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

  async refreshAllData(): Promise<void> {
    console.log('Refreshing data from CoinGecko...');
    
    try {
      const coins = await this.fetchTopCoins(50);
      await this.updateCoinsCache(coins);
      
      console.log(`Updated ${coins.length} coins in cache`);
      
      for (const coin of coins.slice(0, 10)) {
        try {
          const marketChart = await this.fetchMarketChart(coin.id, 30);
          await this.updatePriceHistoryCache(coin.id, marketChart);
          console.log(`Updated price history for ${coin.id}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to update price history for ${coin.id}:`, error);
        }
      }
      
      console.log('Data refresh completed');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      throw error;
    }
  }

  async ensureCoinData(coinId: string): Promise<boolean> {
    const marketData = this.getCoinMarketDataFromCache(coinId);
    
    if (!marketData) {
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
    
    const priceHistory = this.getPriceHistoryFromCache(coinId);
    
    if (priceHistory.length === 0) {
      try {
        const marketChart = await this.fetchMarketChart(coinId, 30);
        await this.updatePriceHistoryCache(coinId, marketChart);
      } catch (error) {
        return false;
      }
    }
    
    return true;
  }
}

export default CoinGeckoService;
