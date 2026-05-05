"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoritesService = void 0;
const database_1 = require("../database");
const crypto_1 = __importDefault(require("crypto"));
class FavoritesService {
    generateSessionId() {
        return crypto_1.default.randomUUID();
    }
    getFavorites(sessionId) {
        const rows = database_1.db.prepare(`
      SELECT id, session_id, coin_id, created_at
      FROM favorites
      WHERE session_id = ?
      ORDER BY created_at DESC
    `).all(sessionId);
        return rows.map(row => ({
            id: row.id,
            session_id: row.session_id,
            coin_id: row.coin_id,
            created_at: row.created_at,
        }));
    }
    getFavoritesWithCoins(sessionId) {
        const rows = database_1.db.prepare(`
      SELECT 
        c.id, c.symbol, c.name, c.current_price, c.price_change_percentage_24h,
        c.market_cap, c.market_cap_rank, c.total_volume, c.circulating_supply, c.image,
        f.created_at as favorited_at
      FROM favorites f
      JOIN coins c ON f.coin_id = c.id
      WHERE f.session_id = ?
      ORDER BY f.created_at DESC
    `).all(sessionId);
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
    getFavoriteCoinIds(sessionId) {
        const rows = database_1.db.prepare(`
      SELECT coin_id FROM favorites WHERE session_id = ?
    `).all(sessionId);
        return rows.map(row => row.coin_id);
    }
    isFavorite(sessionId, coinId) {
        const row = database_1.db.prepare(`
      SELECT id FROM favorites WHERE session_id = ? AND coin_id = ?
    `).get(sessionId, coinId);
        return row !== undefined;
    }
    addFavorite(sessionId, coinId) {
        try {
            const result = database_1.db.prepare(`
        INSERT OR IGNORE INTO favorites (session_id, coin_id, created_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `).run(sessionId, coinId);
            return result.changes > 0;
        }
        catch (error) {
            console.error('Error adding favorite:', error);
            return false;
        }
    }
    removeFavorite(sessionId, coinId) {
        try {
            const result = database_1.db.prepare(`
        DELETE FROM favorites WHERE session_id = ? AND coin_id = ?
      `).run(sessionId, coinId);
            return result.changes > 0;
        }
        catch (error) {
            console.error('Error removing favorite:', error);
            return false;
        }
    }
    toggleFavorite(sessionId, coinId) {
        const currentlyFavorite = this.isFavorite(sessionId, coinId);
        if (currentlyFavorite) {
            const removed = this.removeFavorite(sessionId, coinId);
            return { isFavorite: false, changed: removed };
        }
        else {
            const added = this.addFavorite(sessionId, coinId);
            return { isFavorite: true, changed: added };
        }
    }
}
exports.FavoritesService = FavoritesService;
exports.default = FavoritesService;
//# sourceMappingURL=favoritesService.js.map