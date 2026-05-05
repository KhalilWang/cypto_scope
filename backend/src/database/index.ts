import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'data', 'cryptoscope.db');

export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS coins (
    id TEXT PRIMARY KEY,
    symbol TEXT,
    name TEXT,
    image TEXT,
    current_price REAL,
    market_cap REAL,
    market_cap_rank INTEGER,
    total_volume REAL,
    high_24h REAL,
    low_24h REAL,
    price_change_24h REAL,
    price_change_percentage_24h REAL,
    market_cap_change_24h REAL,
    market_cap_change_percentage_24h REAL,
    circulating_supply REAL,
    total_supply REAL,
    ath REAL,
    ath_change_percentage REAL,
    ath_date TEXT,
    atl REAL,
    atl_change_percentage REAL,
    atl_date TEXT,
    last_updated TEXT,
    cached_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coin_id TEXT,
    timestamp INTEGER,
    price REAL,
    volume REAL,
    cached_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coin_id) REFERENCES coins(id),
    UNIQUE(coin_id, timestamp)
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_price_history_coin_id ON price_history(coin_id)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_coins_market_cap_rank ON coins(market_cap_rank)
`);

export default db;
