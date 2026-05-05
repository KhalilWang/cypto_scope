import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 获取项目根目录下的 data 文件夹路径
// 当使用 tsx watch 运行时，__dirname 指向 src/database
// 所以需要向上两级：src/database -> src -> backend，然后进入 data
const dataDir = path.join(__dirname, '..', '..', 'data');

// 确保 data 目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created data directory: ${dataDir}`);
}

const dbPath = path.join(dataDir, 'cryptoscope.db');

console.log(`Database path: ${dbPath}`);

export const db: any = new Database(dbPath);

// 启用外键约束
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

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

db.exec(`
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    coin_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coin_id) REFERENCES coins(id),
    UNIQUE(session_id, coin_id)
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_favorites_session_id ON favorites(session_id)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_favorites_coin_id ON favorites(coin_id)
`);

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

db.exec(`
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    coin_id TEXT NOT NULL,
    coin_name TEXT,
    coin_symbol TEXT,
    alert_type TEXT NOT NULL,
    target_price REAL NOT NULL,
    current_price_at_creation REAL,
    is_active INTEGER DEFAULT 1,
    is_triggered INTEGER DEFAULT 0,
    triggered_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coin_id) REFERENCES coins(id)
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_alerts_session_id ON alerts(session_id)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_alerts_coin_id ON alerts(coin_id)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active)
`);

export default db;
