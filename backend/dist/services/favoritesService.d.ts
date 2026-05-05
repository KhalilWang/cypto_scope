import { Favorite, FavoriteWithCoin } from '../types';
export declare class FavoritesService {
    generateSessionId(): string;
    getFavorites(sessionId: string): Favorite[];
    getFavoritesWithCoins(sessionId: string): FavoriteWithCoin[];
    getFavoriteCoinIds(sessionId: string): string[];
    isFavorite(sessionId: string, coinId: string): boolean;
    addFavorite(sessionId: string, coinId: string): boolean;
    removeFavorite(sessionId: string, coinId: string): boolean;
    toggleFavorite(sessionId: string, coinId: string): {
        isFavorite: boolean;
        changed: boolean;
    };
}
export default FavoritesService;
//# sourceMappingURL=favoritesService.d.ts.map