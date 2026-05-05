import { MarketOverview, Coin } from '../types';
interface CoinGeckoGlobalData {
    data: {
        active_cryptocurrencies: number;
        total_market_cap: {
            usd: number;
        };
        total_volume: {
            usd: number;
        };
        market_cap_percentage: {
            btc: number;
            eth: number;
        };
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
export declare class MarketService {
    private readonly apiUrl;
    private readonly cacheDurationMinutes;
    constructor();
    fetchGlobalData(): Promise<CoinGeckoGlobalData['data']>;
    updateMarketCache(globalData: CoinGeckoGlobalData['data']): Promise<void>;
    getMarketCache(): CachedMarketData | null;
    getCoinsFromCache(): Coin[];
    getMarketOverview(): Promise<MarketOverview>;
    refreshMarketData(): Promise<void>;
}
export default MarketService;
//# sourceMappingURL=marketService.d.ts.map