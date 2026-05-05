import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Coin } from '../types';
import { formatPrice, formatMarketCap, formatPercentage } from '../utils/formatters';

interface CoinListProps {
  coins: Coin[];
  loading: boolean;
  error: string | null;
}

type SortField = 'market_cap' | 'price_change_percentage_24h';
type SortDirection = 'asc' | 'desc';

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
      className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && (
          <span className="text-blue-400">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-slate-400">加载币种列表中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-red-400 text-5xl mb-4">⚠️</div>
        <p className="text-red-400 text-lg mb-2">加载失败</p>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  if (coins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-slate-500 text-5xl mb-4">📊</div>
        <p className="text-slate-400">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400 w-16">
                排名
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">
                币种
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-400">
                当前价格
              </th>
              <SortHeader field="price_change_percentage_24h" label="24h 涨跌幅" />
              <SortHeader field="market_cap" label="市值" />
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-400">
                24h 成交量
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {sortedCoins.map((coin) => {
              const isPositive = coin.price_change_percentage_24h >= 0;
              
              return (
                <tr
                  key={coin.id}
                  className="hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(coin.id)}
                >
                  <td className="px-4 py-4 text-sm text-slate-400">
                    {coin.market_cap_rank}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/32/334155/e2e8f0?text=' + coin.symbol.charAt(0).toUpperCase();
                        }}
                      />
                      <div>
                        <div className="font-medium text-white">{coin.name}</div>
                        <div className="text-sm text-slate-400 uppercase">{coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-white font-medium">
                    {formatPrice(coin.current_price)}
                  </td>
                  <td className={`px-4 py-4 text-right font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(coin.price_change_percentage_24h)}
                  </td>
                  <td className="px-4 py-4 text-right text-slate-300">
                    {formatMarketCap(coin.market_cap)}
                  </td>
                  <td className="px-4 py-4 text-right text-slate-300">
                    {formatMarketCap(coin.total_volume)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CoinList;
