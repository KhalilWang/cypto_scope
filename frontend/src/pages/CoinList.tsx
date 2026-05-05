import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Coin } from '../types';
import { formatPrice, formatMarketCap, formatPercentage } from '../utils/formatters';
import { FavoriteButton } from '../components/FavoriteButton';

interface CoinListProps {
  coins: Coin[];
  loading: boolean;
  error: string | null;
}

type SortField = 'market_cap' | 'price_change_percentage_24h';
type SortDirection = 'asc' | 'desc';

function LoadingSkeleton() {
  return (
    <div className="bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden">
      <div className="hidden md:block">
        {/* Desktop Skeleton */}
        <div className="px-6 py-4 bg-dark-950/50 border-b border-dark-800">
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="skeleton h-4 rounded" style={{ width: `${80 + i * 20}px` }}></div>
            ))}
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-6 py-4 border-b border-dark-800/50 flex items-center gap-4">
            <div className="skeleton h-5 w-8 rounded"></div>
            <div className="flex items-center gap-3 flex-1">
              <div className="skeleton h-10 w-10 rounded-full"></div>
              <div className="space-y-2">
                <div className="skeleton h-4 w-24 rounded"></div>
                <div className="skeleton h-3 w-12 rounded"></div>
              </div>
            </div>
            <div className="skeleton h-5 w-28 rounded ml-auto"></div>
            <div className="skeleton h-5 w-20 rounded"></div>
            <div className="skeleton h-5 w-32 rounded"></div>
            <div className="skeleton h-5 w-32 rounded"></div>
            <div className="skeleton h-8 w-8 rounded"></div>
          </div>
        ))}
      </div>
      {/* Mobile Skeleton */}
      <div className="md:hidden p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-dark-800/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="skeleton h-10 w-10 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32 rounded"></div>
                <div className="skeleton h-3 w-16 rounded"></div>
              </div>
              <div className="skeleton h-6 w-16 rounded"></div>
            </div>
            <div className="flex justify-between pt-2 border-t border-dark-700">
              <div className="skeleton h-4 w-24 rounded"></div>
              <div className="skeleton h-4 w-20 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CoinList({ coins, loading, error }: CoinListProps) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('market_cap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedCoins = useMemo(() => {
    return [...coins].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue - bValue;
      }
      return bValue - aValue;
    });
  }, [coins, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'market_cap' ? 'desc' : 'asc');
    }
  };

  const handleRowClick = (coinId: string) => {
    navigate(`/coin/${coinId}`);
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="px-4 py-3.5 text-left text-xs font-semibold text-dark-600 uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <span
          className={`inline-flex items-center justify-center w-4 h-4 rounded text-xs transition-all ${
            sortField === field
              ? 'bg-primary/20 text-primary'
              : 'text-dark-700 opacity-0 group-hover:opacity-100'
          }`}
        >
          {sortField === field ? (
            sortDirection === 'asc' ? (
              '↑'
            ) : (
              '↓'
            )
          ) : (
            '↕'
          )}
        </span>
      </div>
    </th>
  );

  if (loading && coins.length === 0) {
    return <LoadingSkeleton />;
  }

  if (error && coins.length === 0) {
    return (
      <div className="bg-dark-900 rounded-2xl border border-danger/20 p-8 text-center">
        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">加载失败</h3>
        <p className="text-dark-600">{error}</p>
      </div>
    );
  }

  if (coins.length === 0) {
    return (
      <div className="bg-dark-900 rounded-2xl border border-dark-800 p-12 text-center">
        <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl opacity-50">📊</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">暂无数据</h3>
        <p className="text-dark-600">请稍后刷新查看市场数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls - Mobile */}
      <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <span className="text-xs text-dark-600 whitespace-nowrap">排序：</span>
        <button
          onClick={() => handleSort('market_cap')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            sortField === 'market_cap'
              ? 'bg-primary/15 text-primary'
              : 'bg-dark-800 text-dark-600 hover:text-white'
          }`}
        >
          市值 {sortField === 'market_cap' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('price_change_percentage_24h')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            sortField === 'price_change_percentage_24h'
              ? 'bg-primary/15 text-primary'
              : 'bg-dark-800 text-dark-600 hover:text-white'
          }`}
        >
          24h 涨跌 {sortField === 'price_change_percentage_24h' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-950/50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-dark-600 uppercase tracking-wider w-20">
                  排名
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-dark-600 uppercase tracking-wider min-w-48">
                  币种
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-dark-600 uppercase tracking-wider">
                  当前价格
                </th>
                <SortHeader field="price_change_percentage_24h" label="24h 涨跌幅" />
                <SortHeader field="market_cap" label="市值" />
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-dark-600 uppercase tracking-wider">
                  24h 成交量
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-dark-600 uppercase tracking-wider w-20">
                  收藏
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/50">
              {sortedCoins.map((coin) => {
                const isPositive = coin.price_change_percentage_24h >= 0;
                
                return (
                  <tr
                    key={coin.id}
                    className="group hover:bg-dark-800/30 transition-all duration-200 cursor-pointer"
                    onClick={() => handleRowClick(coin.id)}
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                          coin.market_cap_rank <= 3
                            ? 'bg-primary/15 text-primary'
                            : coin.market_cap_rank <= 10
                            ? 'bg-dark-800 text-dark-600'
                            : 'text-dark-600'
                        }`}
                      >
                        {coin.market_cap_rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-10 h-10 rounded-full ring-2 ring-dark-800 group-hover:ring-primary/30 transition-all"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 
                                `https://placehold.co/40/1e293b/94a3b8?text=${coin.symbol.charAt(0).toUpperCase()}`;
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-primary transition-colors">
                            {coin.name}
                          </div>
                          <div className="text-sm text-dark-600 uppercase font-medium">
                            {coin.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-white">
                        {formatPrice(coin.current_price)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold transition-all ${
                          isPositive
                            ? 'bg-success/10 text-success'
                            : 'bg-danger/10 text-danger'
                        }`}
                      >
                        <span className="text-xs">{isPositive ? '↑' : '↓'}</span>
                        {formatPercentage(coin.price_change_percentage_24h)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-dark-600 font-medium">
                        {formatMarketCap(coin.market_cap)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-dark-600">
                        {formatMarketCap(coin.total_volume)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <FavoriteButton coinId={coin.id} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {sortedCoins.map((coin) => {
          const isPositive = coin.price_change_percentage_24h >= 0;

          return (
            <div
              key={coin.id}
              onClick={() => handleRowClick(coin.id)}
              className="bg-dark-900 rounded-xl border border-dark-800 p-4 card-hover cursor-pointer"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute -top-1 -left-1 w-5 h-5 bg-dark-800 rounded-full flex items-center justify-center text-[10px] text-dark-600 font-bold z-10">
                      {coin.market_cap_rank}
                    </span>
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-12 h-12 rounded-full ring-2 ring-dark-800"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 
                          `https://placehold.co/48/1e293b/94a3b8?text=${coin.symbol.charAt(0).toUpperCase()}`;
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{coin.name}</div>
                    <div className="text-sm text-dark-600 uppercase font-medium">
                      {coin.symbol}
                    </div>
                  </div>
                </div>
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold ${
                    isPositive
                      ? 'bg-success/10 text-success'
                      : 'bg-danger/10 text-danger'
                  }`}
                >
                  <span className="text-xs">{isPositive ? '↑' : '↓'}</span>
                  {formatPercentage(coin.price_change_percentage_24h)}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex items-center justify-between pt-3 border-t border-dark-800/50">
                <div>
                  <div className="text-xs text-dark-600 mb-1">当前价格</div>
                  <div className="font-semibold text-white text-lg">
                    {formatPrice(coin.current_price)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-dark-600 mb-1">市值</div>
                  <div className="text-dark-600 font-medium">
                    {formatMarketCap(coin.market_cap)}
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <FavoriteButton coinId={coin.id} size="md" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CoinList;
