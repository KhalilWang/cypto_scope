import { db } from '../database';
import { PriceHistoryPoint, CoinComparison } from '../types';

export class ComparisonService {
  getPriceHistory(coinId: string): PriceHistoryPoint[] {
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

  getCoinInfo(coinId: string): { name: string; symbol: string } | null {
    const row = db.prepare(`
      SELECT name, symbol
      FROM coins
      WHERE id = ?
    `).get(coinId) as { name: string; symbol: string } | undefined;

    return row || null;
  }

  normalizePrices(prices: number[]): number[] {
    if (prices.length === 0) return [];
    
    const firstPrice = prices[0];
    if (firstPrice === 0) return prices;
    
    return prices.map(p => (p / firstPrice) * 100);
  }

  calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;
    
    const n = x.length;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumX2 += x[i] * x[i];
      sumY2 += y[i] * y[i];
    }
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
  }

  interpretCorrelation(correlation: number): string {
    const absCorr = Math.abs(correlation);
    
    if (absCorr >= 0.9) {
      return correlation > 0 ? '走势高度正相关' : '走势高度负相关';
    } else if (absCorr >= 0.7) {
      return correlation > 0 ? '走势强正相关' : '走势强负相关';
    } else if (absCorr >= 0.5) {
      return correlation > 0 ? '走势中度正相关' : '走势中度负相关';
    } else if (absCorr >= 0.3) {
      return correlation > 0 ? '走势弱正相关' : '走势弱负相关';
    } else {
      return '走势几乎不相关';
    }
  }

  alignPriceHistories(histories: PriceHistoryPoint[][]): {
    alignedTimestamps: number[];
    alignedPrices: number[][];
  } {
    if (histories.length === 0) {
      return { alignedTimestamps: [], alignedPrices: [] };
    }
    
    const allTimestamps = new Set<number>();
    histories.forEach(history => {
      history.forEach(point => allTimestamps.add(point.timestamp));
    });
    
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
    
    const alignedPrices: number[][] = histories.map(() => []);
    
    for (let i = 0; i < histories.length; i++) {
      const priceMap = new Map(histories[i].map(p => [p.timestamp, p.price]));
      
      for (const ts of sortedTimestamps) {
        alignedPrices[i].push(priceMap.get(ts) || 0);
      }
    }
    
    return { alignedTimestamps: sortedTimestamps, alignedPrices };
  }

  getComparison(coinIds: string[]): CoinComparison | null {
    if (coinIds.length < 2) {
      return null;
    }
    
    const priceHistories: CoinComparison['priceHistories'] = [];
    const allPrices: number[][] = [];
    
    for (const coinId of coinIds) {
      const coinInfo = this.getCoinInfo(coinId);
      if (!coinInfo) continue;
      
      const priceHistory = this.getPriceHistory(coinId);
      if (priceHistory.length === 0) continue;
      
      priceHistories.push({
        coinId,
        coinName: coinInfo.name,
        coinSymbol: coinInfo.symbol,
        priceHistory,
      });
      
      allPrices.push(priceHistory.map(p => p.price));
    }
    
    if (priceHistories.length < 2) {
      return null;
    }
    
    const { alignedTimestamps, alignedPrices } = this.alignPriceHistories(
      priceHistories.map(h => h.priceHistory)
    );
    
    const normalizedPrices = alignedPrices.map(prices => this.normalizePrices(prices));
    
    const n = normalizedPrices.length;
    const correlationMatrix: number[][] = [];
    
    for (let i = 0; i < n; i++) {
      correlationMatrix[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          correlationMatrix[i][j] = 1;
        } else {
          correlationMatrix[i][j] = this.calculateCorrelation(
            normalizedPrices[i],
            normalizedPrices[j]
          );
        }
      }
    }
    
    const similarities: CoinComparison['similarities'] = [];
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const correlation = correlationMatrix[i][j];
        similarities.push({
          coinPair: [priceHistories[i].coinId, priceHistories[j].coinId],
          correlation,
          interpretation: this.interpretCorrelation(correlation),
        });
      }
    }
    
    return {
      coins: priceHistories.map(h => h.coinId),
      priceHistories,
      correlationMatrix,
      similarities,
    };
  }
}

export default ComparisonService;
