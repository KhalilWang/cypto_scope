import { Coin, CoinMarketData, PriceHistoryPoint } from '../types';
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
export declare class CoinGeckoService {
    private readonly apiUrl;
    private readonly technicalIndicatorsService;
    private useMockData;
    private mockDataInitialized;
    constructor();
    private testApiConnection;
    private fetchWithRetry;
    fetchTopCoins(limit?: number): Promise<CoinGeckoCoin[]>;
    fetchMarketChart(coinId: string, days?: number): Promise<CoinGeckoMarketChart>;
    updateCoinsCache(coins: CoinGeckoCoin[]): Promise<void>;
    updatePriceHistoryCache(coinId: string, marketChart: CoinGeckoMarketChart): Promise<void>;
    getCoinsFromCache(): Coin[];
    getCoinMarketDataFromCache(coinId: string): CoinMarketData | null;
    getPriceHistoryFromCache(coinId: string): PriceHistoryPoint[];
    private initializeMockData;
    refreshAllData(): Promise<void>;
    ensureCoinData(coinId: string): Promise<boolean>;
}
export default CoinGeckoService;
//# sourceMappingURL=coingeckoService.d.ts.map