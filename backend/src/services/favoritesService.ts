import { db } from '../database';
import { Favorite, FavoriteWithCoin, Coin } from '../types';
import crypto from 'crypto';

export class FavoritesService {
  generateSessionId(): string {
    return crypto.randomUUID();
  }

  getFavorites(sessionId: string): Favorite[] {
    const rows = db.prepare(`
      SELECT id, session_id, coin_id, created_at
      FROM favorites
      WHERE session_id = ?
      ORDER BY created_at DESC
    `).all(sessionId) as Array<{
      id: number;
      session_id: string;
      coin_id: string;
      created_at: string;
    }>;

    return rows.map(row => ({
      id: row.id,
      session_id: row.session_id,
      coin_id: row.coin_id,
      created_at: row.created_at,
    }));
  }

  getFavoritesWithCoins(sessionId: string): FavoriteWithCoin[] {
    const rows = db.prepare(`
      SELECT 
        c.id, c.symbol, c.name, c.current_price, c.price_change_percentage_24h,
        c.market_cap, c.market_cap_rank, c.total_volume, c.circulating_supply, c.image,
        f.created_at as favorited_at
      FROM favorites f
      JOIN coins c ON f.coin_id = c.id
      WHERE f.session_id = ?
      ORDER BY f.created_at DESC
    `).all(sessionId) as Array<{
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
      favorited_at: string;
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
      favorited_at: row.favorited_at,
    }));
  }

  getFavoriteCoinIds(sessionId: string): string[] {
    const rows = db.prepare(`
      SELECT coin_id FROM favorites WHERE session_id = ?
    `).all(sessionId) as Array<{ coin_id: string }>;

    return rows.map(row => row.coin_id);
  }

  isFavorite(sessionId: string, coinId: string): boolean {
    const row = db.prepare(`
      SELECT id FROM favorites WHERE session_id = ? AND coin_id = ?
    `).get(sessionId, coinId) as { id: number } | undefined;

    return row !== undefined;
  }

  addFavorite(sessionId: string, coinId: string): boolean {
    try {
      const result = db.prepare(`
        INSERT OR IGNORE INTO favorites (session_id, coin_id, created_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `).run(sessionId, coinId);

      return result.changes > 0;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  }

  removeFavorite(sessionId: string, coinId: string): boolean {
    try {
      const result = db.prepare(`
        DELETE FROM favorites WHERE session_id = ? AND coin_id = ?
      `).run(sessionId, coinId);

      return result.changes > 0;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }

  toggleFavorite(sessionId: string, coinId: string): { isFavorite: boolean; changed: boolean } {
    const currentlyFavorite = this.isFavorite(sessionId, coinId);

    if (currentlyFavorite) {
      const removed = this.removeFavorite(sessionId, coinId);
      return { isFavorite: false, changed: removed };
    } else {
      const added = this.addFavorite(sessionId, coinId);
      return { isFavorite: true, changed: added };
    }
  }
}

export default FavoritesService;
