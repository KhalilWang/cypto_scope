import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FavoriteWithCoin } from '../types';
import { favoritesApi } from '../services/api';
import { formatPrice, formatPercentage } from '../utils/formatters';
import { FavoriteButton } from '../components/FavoriteButton';

export function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteWithCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await favoritesApi.getAll();
      setFavorites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取收藏列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleFavorite = (coinId: string, isFavorite: boolean) => {
    if (!isFavorite) {
      setFavorites(prev => prev.filter(f => f.id !== coinId));
    }
  };

  const handleCardClick = (coinId: string) => {
    navigate(`/coin/${coinId}`);
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">我的收藏</h2>
          <p className="text-slate-400">查看您收藏的币种</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-400">加载收藏列表中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">我的收藏</h2>
          <p className="text-slate-400">查看您收藏的币种</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <p className="text-red-400 text-lg mb-2">加载失败</p>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchFavorites}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">我的收藏</h2>
          <p className="text-slate-400">查看您收藏的币种</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 bg-slate-800 rounded-xl">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold text-white mb-2">暂无收藏</h3>
          <p className="text-slate-400 mb-6 text-center max-w-md">
            您还没有收藏任何币种。在币种列表或详情页点击星形图标即可添加收藏。
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            浏览市场
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">我的收藏</h2>
        <p className="text-slate-400">
          共收藏 {favorites.length} 个币种
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favorites.map((coin) => {
          const isPositive = coin.price_change_percentage_24h >= 0;

          return (
            <div
              key={coin.id}
              className="bg-slate-800 rounded-xl p-4 hover:bg-slate-750 transition-colors cursor-pointer group"
              onClick={() => handleCardClick(coin.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/40/334155/e2e8f0?text=' + coin.symbol.charAt(0).toUpperCase();
                    }}
                  />
                  <div>
                    <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                      {coin.name}
                    </div>
                    <div className="text-sm text-slate-400 uppercase">
                      {coin.symbol}
                    </div>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <FavoriteButton
                    coinId={coin.id}
                    size="md"
                    onToggle={(isFav) => handleToggleFavorite(coin.id, isFav)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <div className="text-xl font-bold text-white">
                    {formatPrice(coin.current_price)}
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  <span>{isPositive ? '↑' : '↓'}</span>
                  <span>{formatPercentage(coin.price_change_percentage_24h)}</span>
                  <span className="text-slate-500 text-xs ml-1">24h</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>排名 #{coin.market_cap_rank}</span>
                  <span>
                    {new Date(coin.favorited_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FavoritesPage;
