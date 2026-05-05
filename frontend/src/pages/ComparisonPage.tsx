import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Coin, CoinComparison, PriceHistoryPoint } from '../types';
import { coinApi, comparisonApi } from '../services/api';
import { formatPrice, formatPercentage } from '../utils/formatters';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';

const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

interface ComparisonChartDataPoint {
  timestamp: number;
  date: string;
  [key: string]: number | string;
}

interface NormalizedChartDataPoint {
  timestamp: number;
  date: string;
  [key: string]: number | string;
}

export function ComparisonPage() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [selectedCoins, setSelectedCoins] = useState<string[]>([]);
  const [comparison, setComparison] = useState<CoinComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNormalized, setShowNormalized] = useState(true);
  const [showCoinSelector, setShowCoinSelector] = useState(true);

  const fetchCoins = useCallback(async () => {
    try {
      const data = await coinApi.getAll();
      setCoins(data);
    } catch (err) {
      console.error('Failed to fetch coins:', err);
    }
  }, []);

  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

  const toggleCoinSelection = (coinId: string) => {
    setSelectedCoins(prev => {
      if (prev.includes(coinId)) {
        return prev.filter(id => id !== coinId);
      } else {
        return [...prev, coinId];
      }
    });
  };

  const handleCompare = async () => {
    if (selectedCoins.length < 2) {
      setError('请选择至少 2 个币种进行对比');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await comparisonApi.getComparison(selectedCoins);
      setComparison(data);
      setShowCoinSelector(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取对比数据失败');
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo<ComparisonChartDataPoint[]>(() => {
    if (!comparison || comparison.priceHistories.length === 0) {
      return [];
    }

    const allTimestamps = new Set<number>();
    comparison.priceHistories.forEach(history => {
      history.priceHistory.forEach(point => allTimestamps.add(point.timestamp));
    });

    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    const priceMaps = comparison.priceHistories.map(history => {
      return new Map(history.priceHistory.map(p => [p.timestamp, p.price]));
    });

    return sortedTimestamps.map(ts => {
      const point: ComparisonChartDataPoint = {
        timestamp: ts,
        date: formatTimestamp(ts),
      };

      comparison.priceHistories.forEach((history, index) => {
        const key = `${history.coinSymbol.toUpperCase()}_price`;
        const price = priceMaps[index].get(ts);
        point[key] = price !== undefined ? price : 0;
      });

      return point;
    });
  }, [comparison]);

  const normalizedChartData = useMemo<NormalizedChartDataPoint[]>(() => {
    if (!chartData || chartData.length === 0 || !comparison) {
      return [];
    }

    const firstPoint = chartData[0];

    return chartData.map(point => {
      const normalizedPoint: NormalizedChartDataPoint = {
        timestamp: point.timestamp,
        date: point.date,
      };

      comparison.priceHistories.forEach(history => {
        const key = `${history.coinSymbol.toUpperCase()}_price`;
        const firstPrice = firstPoint[key] as number;
        const currentPrice = point[key] as number;

        if (firstPrice && firstPrice > 0) {
          normalizedPoint[`${history.coinSymbol.toUpperCase()}_norm`] = 
            (currentPrice / firstPrice) * 100;
        }
      });

      return normalizedPoint;
    });
  }, [chartData, comparison]);

  const getCorrelationColor = (correlation: number): string => {
    const absCorr = Math.abs(correlation);
    if (absCorr >= 0.7) return correlation > 0 ? 'text-green-400' : 'text-red-400';
    if (absCorr >= 0.4) return correlation > 0 ? 'text-green-300' : 'text-red-300';
    return 'text-slate-400';
  };

  const getCorrelationStrength = (correlation: number): string => {
    const absCorr = Math.abs(correlation);
    if (absCorr >= 0.9) return '极强';
    if (absCorr >= 0.7) return '强';
    if (absCorr >= 0.5) return '中等';
    if (absCorr >= 0.3) return '弱';
    return '极弱';
  };

  const CustomPriceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-400 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-300">{entry.name}:</span>
              <span className="text-white font-medium">
                {formatPrice(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomNormalizedTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-400 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-300">{entry.name}:</span>
              <span className="text-white font-medium">
                {entry.value.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (coins.length === 0) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-400">加载币种列表中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">币种对比</h2>
            <p className="text-slate-400">选择多个币种，对比它们的价格走势和相关性</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              已选择 {selectedCoins.length} 个币种
            </span>
            <button
              onClick={handleCompare}
              disabled={selectedCoins.length < 2 || loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>分析中...</span>
                </>
              ) : (
                <span>开始对比</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {comparison && selectedCoins.length > 0 && (
        <div className="mb-6 bg-slate-800 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">已选择币种:</span>
              <div className="flex flex-wrap items-center gap-2">
                {selectedCoins.map((coinId) => {
                  const coin = coins.find(c => c.id === coinId);
                  return coin ? (
                    <span
                      key={coinId}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm"
                    >
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-4 h-4 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 
                            'https://placehold.co/16/1e293b/94a3b8?text=' + coin.symbol.charAt(0).toUpperCase();
                        }}
                      />
                      {coin.symbol.toUpperCase()}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            <button
              onClick={() => setShowCoinSelector(!showCoinSelector)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              {showCoinSelector ? (
                <>
                  <span>收起</span>
                  <span>↑</span>
                </>
              ) : (
                <>
                  <span>重新选币</span>
                  <span>↓</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {(!comparison || showCoinSelector) && (
        <div className={`mb-8 transition-all duration-300 ${comparison && showCoinSelector ? 'bg-slate-800/50 rounded-xl p-4' : ''}`}>
          <h3 className="text-lg font-semibold text-white mb-4">选择币种（点击选择/取消）</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {coins.map((coin) => {
              const isSelected = selectedCoins.includes(coin.id);
              const isPositive = coin.price_change_percentage_24h >= 0;

              return (
                <div
                  key={coin.id}
                  onClick={() => toggleCoinSelection(coin.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-slate-800 border-transparent hover:bg-slate-750 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 
                          'https://placehold.co/32/1e293b/94a3b8?text=' + coin.symbol.charAt(0).toUpperCase();
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {coin.name}
                      </div>
                      <div className="text-xs text-slate-400 uppercase">
                        {coin.symbol}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-blue-400 text-lg">✓</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {formatPrice(coin.current_price)}
                    </span>
                    <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? '↑' : '↓'} {formatPercentage(coin.price_change_percentage_24h)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {comparison && (
        <div className="space-y-8">
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold text-white">
                {showNormalized ? '归一化价格走势（起点=100%）' : '实际价格走势'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNormalized(true)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    showNormalized
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  归一化视图
                </button>
                <button
                  onClick={() => setShowNormalized(false)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    !showNormalized
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  实际价格
                </button>
              </div>
            </div>

            <div className="h-80 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={showNormalized ? normalizedChartData : chartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => {
                      if (showNormalized) {
                        return `${value.toFixed(0)}%`;
                      }
                      if (value >= 1000) {
                        return `$${(value / 1000).toFixed(1)}K`;
                      }
                      return `$${value.toFixed(0)}`;
                    }}
                  />
                  <Tooltip
                    content={showNormalized ? <CustomNormalizedTooltip /> : <CustomPriceTooltip />}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => (
                      <span className="text-slate-300 text-sm">{value}</span>
                    )}
                  />
                  {comparison.priceHistories.map((history, index) => {
                    const color = CHART_COLORS[index % CHART_COLORS.length];
                    const dataKey = showNormalized
                      ? `${history.coinSymbol.toUpperCase()}_norm`
                      : `${history.coinSymbol.toUpperCase()}_price`;
                    const name = `${history.coinName} (${history.coinSymbol.toUpperCase()})`;

                    return (
                      <Line
                        key={history.coinId}
                        type="monotone"
                        dataKey={dataKey}
                        name={name}
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: color }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">走势相似度分析</h3>
            <p className="text-slate-400 text-sm mb-6">
              基于皮尔逊相关系数分析各币种价格走势的相关性。相关系数范围为 -1 到 1。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparison.similarities.map((similarity, index) => {
                const coin1 = comparison.priceHistories.find(h => h.coinId === similarity.coinPair[0]);
                const coin2 = comparison.priceHistories.find(h => h.coinId === similarity.coinPair[1]);

                return (
                  <div
                    key={index}
                    className="bg-slate-750 rounded-lg p-4 border border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {coin1 && (
                          <div className="flex items-center gap-2">
                            <img
                              src={coin1.priceHistory.length > 0 ? 
                                coins.find(c => c.id === coin1.coinId)?.image : 
                                `https://placehold.co/24/1e293b/94a3b8?text=${coin1.coinSymbol.charAt(0).toUpperCase()}`
                              }
                              alt={coin1.coinName}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-white font-medium text-sm">
                              {coin1.coinSymbol.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-slate-500 text-lg">↔</span>
                        {coin2 && (
                          <div className="flex items-center gap-2">
                            <img
                              src={coin2.priceHistory.length > 0 ? 
                                coins.find(c => c.id === coin2.coinId)?.image : 
                                `https://placehold.co/24/1e293b/94a3b8?text=${coin2.coinSymbol.charAt(0).toUpperCase()}`
                              }
                              alt={coin2.coinName}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-white font-medium text-sm">
                              {coin2.coinSymbol.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-2xl font-bold ${getCorrelationColor(similarity.correlation)}`}>
                          {(similarity.correlation * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-slate-400">
                          相关强度: {getCorrelationStrength(similarity.correlation)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white">
                          {similarity.interpretation}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {similarity.correlation > 0 
                            ? '正相关意味着价格走势方向一致' 
                            : similarity.correlation < 0 
                              ? '负相关意味着价格走势方向相反'
                              : '无明显相关性'
                          }
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            similarity.correlation > 0 
                              ? 'bg-gradient-to-r from-green-600 to-green-400' 
                              : similarity.correlation < 0
                                ? 'bg-gradient-to-r from-red-600 to-red-400'
                                : 'bg-slate-500'
                          }`}
                          style={{ 
                            width: `${Math.abs(similarity.correlation) * 100}%`,
                            marginLeft: similarity.correlation < 0 ? 'auto' : '0'
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>-1.0</span>
                        <span>0.0</span>
                        <span>+1.0</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">对比币种信息</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {comparison.priceHistories.map((history, index) => {
                const coin = coins.find(c => c.id === history.coinId);
                const isPositive = coin ? coin.price_change_percentage_24h >= 0 : true;
                const color = CHART_COLORS[index % CHART_COLORS.length];

                return (
                  <div
                    key={history.coinId}
                    className="bg-slate-750 rounded-lg p-4 border-l-4"
                    style={{ borderLeftColor: color }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={coin?.image || `https://placehold.co/32/1e293b/94a3b8?text=${history.coinSymbol.charAt(0).toUpperCase()}`}
                        alt={history.coinName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {history.coinName}
                        </div>
                        <div className="text-xs text-slate-400 uppercase">
                          {history.coinSymbol}
                        </div>
                      </div>
                    </div>

                    {coin && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">当前价格</span>
                          <span className="text-white font-medium">
                            {formatPrice(coin.current_price)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">24h 涨跌</span>
                          <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '↑' : '↓'} {formatPercentage(coin.price_change_percentage_24h)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">市值排名</span>
                          <span className="text-white font-medium">
                            #{coin.market_cap_rank}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComparisonPage;
