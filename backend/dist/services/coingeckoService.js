"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinGeckoService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const database_1 = require("../database");
const technicalIndicators_1 = require("./technicalIndicators");
const MOCK_COINS = [
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
function generateMockCoins(count) {
    const baseCoins = [...MOCK_COINS];
    const mockCoins = [];
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
        }
        else {
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
function generateMockMarketChart(coinId, days = 30) {
    const basePrice = coinId === 'bitcoin' ? 65000 : coinId === 'ethereum' ? 3400 : 100;
    const now = Date.now();
    const prices = [];
    const market_caps = [];
    const total_volumes = [];
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
class CoinGeckoService {
    constructor() {
        this.useMockData = false;
        this.mockDataInitialized = false;
        this.apiUrl = config_1.config.coingeckoApiUrl;
        this.technicalIndicatorsService = new technicalIndicators_1.TechnicalIndicatorsService();
    }
    async testApiConnection() {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/ping`, {
                timeout: 5000,
                validateStatus: () => true,
            });
            return response.status < 400;
        }
        catch {
            return false;
        }
    }
    async fetchWithRetry(fn, maxRetries = 2, retryDelay = 1000) {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                console.warn(`API request attempt ${i + 1} failed:`, error instanceof Error ? error.message : String(error));
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
        }
        throw lastError;
    }
    async fetchTopCoins(limit = 50) {
        if (this.useMockData) {
            console.log('Using mock data for coins (API unavailable)');
            return generateMockCoins(limit);
        }
        try {
            const response = await this.fetchWithRetry(() => axios_1.default.get(`${this.apiUrl}/coins/markets`, {
                params: {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: limit,
                    page: 1,
                    sparkline: false,
                },
                timeout: 15000,
            }));
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                return response.data;
            }
            throw new Error('Empty or invalid response from CoinGecko');
        }
        catch (error) {
            console.warn('CoinGecko API failed, switching to mock data:', error instanceof Error ? error.message : String(error));
            this.useMockData = true;
            return generateMockCoins(limit);
        }
    }
    async fetchMarketChart(coinId, days = 30) {
        if (this.useMockData) {
            console.log(`Using mock data for ${coinId} market chart`);
            return generateMockMarketChart(coinId, days);
        }
        try {
            const response = await this.fetchWithRetry(() => axios_1.default.get(`${this.apiUrl}/coins/${coinId}/market_chart`, {
                params: {
                    vs_currency: 'usd',
                    days,
                },
                timeout: 15000,
            }), 2, 500);
            if (response.data && response.data.prices && Array.isArray(response.data.prices)) {
                return response.data;
            }
            throw new Error('Invalid market chart response');
        }
        catch (error) {
            console.warn(`Failed to fetch market chart for ${coinId}, using mock data:`, error instanceof Error ? error.message : String(error));
            return generateMockMarketChart(coinId, days);
        }
    }
    async updateCoinsCache(coins) {
        if (coins.length === 0) {
            console.warn('No coins to update in cache');
            return;
        }
        const insertStmt = database_1.db.prepare(`
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
        const transaction = database_1.db.transaction((coinsList) => {
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
    async updatePriceHistoryCache(coinId, marketChart) {
        const deleteStmt = database_1.db.prepare('DELETE FROM price_history WHERE coin_id = ?');
        deleteStmt.run(coinId);
        const insertStmt = database_1.db.prepare(`
      INSERT INTO price_history (coin_id, timestamp, price, volume, cached_at)
      VALUES (@coin_id, @timestamp, @price, @volume, CURRENT_TIMESTAMP)
    `);
        const priceMap = new Map(marketChart.prices);
        const volumeMap = new Map(marketChart.total_volumes);
        const transaction = database_1.db.transaction(() => {
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
    getCoinsFromCache() {
        const rows = database_1.db.prepare(`
      SELECT id, symbol, name, current_price, price_change_percentage_24h,
             market_cap, market_cap_rank, total_volume, circulating_supply, image
      FROM coins
      ORDER BY market_cap_rank ASC
    `).all();
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
    getCoinMarketDataFromCache(coinId) {
        const row = database_1.db.prepare(`
      SELECT * FROM coins WHERE id = ?
    `).get(coinId);
        if (!row)
            return null;
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
    getPriceHistoryFromCache(coinId) {
        const rows = database_1.db.prepare(`
      SELECT timestamp, price, volume
      FROM price_history
      WHERE coin_id = ?
      ORDER BY timestamp ASC
    `).all(coinId);
        return rows.map(row => ({
            timestamp: row.timestamp,
            price: row.price,
            volume: row.volume,
        }));
    }
    async initializeMockData() {
        if (this.mockDataInitialized)
            return;
        console.log('Initializing mock data...');
        const mockCoins = generateMockCoins(50);
        await this.updateCoinsCache(mockCoins);
        for (const coin of mockCoins.slice(0, 10)) {
            try {
                const mockChart = generateMockMarketChart(coin.id, 30);
                await this.updatePriceHistoryCache(coin.id, mockChart);
            }
            catch (error) {
                console.warn(`Failed to init mock price history for ${coin.id}`);
            }
        }
        this.mockDataInitialized = true;
        console.log('Mock data initialization complete');
    }
    async refreshAllData() {
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
                }
                catch (error) {
                    console.warn(`Failed to update price history for ${coin.id}`, error instanceof Error ? error.message : String(error));
                }
            }
            console.log('Data refresh completed');
        }
        catch (error) {
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
    async ensureCoinData(coinId) {
        const marketData = this.getCoinMarketDataFromCache(coinId);
        if (!marketData) {
            if (this.useMockData) {
                const mockCoins = generateMockCoins(250);
                const coin = mockCoins.find(c => c.id === coinId);
                if (coin) {
                    await this.updateCoinsCache([coin]);
                }
                else {
                    return false;
                }
            }
            else {
                try {
                    const coins = await this.fetchTopCoins(250);
                    const coin = coins.find(c => c.id === coinId);
                    if (coin) {
                        await this.updateCoinsCache([coin]);
                    }
                    else {
                        return false;
                    }
                }
                catch (error) {
                    return false;
                }
            }
        }
        const priceHistory = this.getPriceHistoryFromCache(coinId);
        if (priceHistory.length === 0) {
            try {
                const marketChart = await this.fetchMarketChart(coinId, 30);
                await this.updatePriceHistoryCache(coinId, marketChart);
            }
            catch (error) {
                const mockChart = generateMockMarketChart(coinId, 30);
                await this.updatePriceHistoryCache(coinId, mockChart);
            }
        }
        return true;
    }
}
exports.CoinGeckoService = CoinGeckoService;
exports.default = CoinGeckoService;
//# sourceMappingURL=coingeckoService.js.map