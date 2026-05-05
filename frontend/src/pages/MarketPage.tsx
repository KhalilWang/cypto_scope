import { useState, useEffect } from 'react';
import type { MarketOverview } from '../types';
import { marketApi } from '../services/api';

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function formatPercentage(num: number): string {
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: string;
  color: 'blue' | 'green' | 'amber' | 'purple' | 'cyan';
}

function MetricCard({ title, value, change, isPositive, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-dark-900',
      border: 'border-primary/20 hover:border-primary/40',
      text: 'text-primary',
      iconBg: 'bg-primary/15',
      shadow: 'hover:shadow-primary/10',
    },
    green: {
      bg: 'bg-dark-900',
      border: 'border-success/20 hover:border-success/40',
      text: 'text-success',
      iconBg: 'bg-success/15',
      shadow: 'hover:shadow-success/10',
    },
    amber: {
      bg: 'bg-dark-900',
      border: 'border-warning/20 hover:border-warning/40',
      text: 'text-warning',
      iconBg: 'bg-warning/15',
      shadow: 'hover:shadow-warning/10',
    },
    purple: {
      bg: 'bg-dark-900',
      border: 'border-secondary/20 hover:border-secondary/40',
      text: 'text-secondary',
      iconBg: 'bg-secondary/15',
      shadow: 'hover:shadow-secondary/10',
    },
    cyan: {
      bg: 'bg-dark-900',
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      text: 'text-cyan-400',
      iconBg: 'bg-cyan-500/15',
      shadow: 'hover:shadow-cyan-500/10',
    },
  };

  const classes = colorClasses[color];

  return (
    <div
      className={`${classes.bg} border ${classes.border} rounded-2xl p-5 lg:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${classes.shadow} group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`${classes.iconBg} rounded-xl p-3 transition-transform group-hover:scale-110`}
        >
          <span className="text-2xl lg:text-3xl">{icon}</span>
        </div>
        {change !== undefined && (
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold transition-all ${
              isPositive
                ? 'bg-success/10 text-success'
                : 'bg-danger/10 text-danger'
            }`}
          >
            <span className="text-xs">{isPositive ? '↑' : '↓'}</span>
            <span>{change}</span>
          </span>
        )}
      </div>
      <p className="text-dark-600 text-sm mb-1">{title}</p>
      <p className={`text-2xl lg:text-3xl font-bold ${classes.text}`}>{value}</p>
    </div>
  );
}

function MarketSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="skeleton h-8 w-40 rounded mb-2"></div>
        <div className="skeleton h-4 w-64 rounded"></div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="skeleton h-12 w-12 rounded-xl"></div>
              <div className="skeleton h-6 w-16 rounded-lg"></div>
            </div>
            <div className="skeleton h-4 w-24 rounded mb-2"></div>
            <div className="skeleton h-8 w-32 rounded"></div>
          </div>
        ))}
      </div>

      {/* Stats Panels Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <div className="skeleton h-6 w-32 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="skeleton h-5 w-24 rounded"></div>
                  <div className="skeleton h-5 w-28 rounded"></div>
                </div>
              ))}
              <div className="skeleton h-12 w-full rounded-full mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MarketPage() {
  const [marketData, setMarketData] = useState<MarketOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketApi.getOverview();
      setMarketData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取市场概览失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  if (loading) {
    return <MarketSkeleton />;
  }

  if (error || !marketData) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">市场概览</h2>
          <p className="text-dark-600">全球加密货币市场数据一览</p>
        </div>
        <div className="bg-dark-900 border border-danger/20 rounded-2xl p-8 lg:p-12 text-center">
          <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😕</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">加载失败</h3>
          <p className="text-dark-600 mb-6">{error || '市场数据暂时不可用'}</p>
          <button
            onClick={fetchMarketData}
            className="btn-primary inline-flex items-center gap-2"
          >
            <span>🔄</span>
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const totalCoins = marketData.up_coins_count + marketData.down_coins_count;
  const upPercentage = totalCoins > 0 ? (marketData.up_coins_count / totalCoins) * 100 : 0;
  const downPercentage = totalCoins > 0 ? (marketData.down_coins_count / totalCoins) * 100 : 0;
  const marketSentiment = upPercentage > 60 ? '贪婪' : downPercentage > 60 ? '恐惧' : '中性';
  const sentimentColor = upPercentage > 60 ? 'success' : downPercentage > 60 ? 'danger' : 'warning';

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-primary/15 text-primary text-xs font-medium rounded-full">
                🌐 全球市场
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              市场<span className="gradient-text">概览</span>
            </h2>
            <p className="text-dark-600 max-w-2xl">
              实时查看全球加密货币市场数据，包括总市值、交易量、市场占比和涨跌统计
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-dark-600">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
            <span>数据更新中</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
        <MetricCard
          title="总市值"
          value={formatLargeNumber(marketData.total_market_cap)}
          change={formatPercentage(marketData.market_cap_change_percentage_24h_usd)}
          isPositive={marketData.market_cap_change_percentage_24h_usd >= 0}
          icon="💰"
          color="blue"
        />

        <MetricCard
          title="24h 交易量"
          value={formatLargeNumber(marketData.total_volume)}
          icon="📊"
          color="green"
        />

        <MetricCard
          title="BTC 市场占比"
          value={`${marketData.btc_dominance.toFixed(1)}%`}
          icon="₿"
          color="amber"
        />

        <MetricCard
          title="ETH 市场占比"
          value={`${marketData.eth_dominance.toFixed(1)}%`}
          icon="Ξ"
          color="purple"
        />
      </div>

      {/* Stats Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Up/Down Stats */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 lg:p-8">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center">
              📈
            </span>
            涨跌统计
          </h3>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
                <span className="text-white font-medium">上涨币种</span>
              </div>
              <span className="text-success font-semibold">
                {marketData.up_coins_count} 个 ({upPercentage.toFixed(1)}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-danger"></div>
                <span className="text-white font-medium">下跌币种</span>
              </div>
              <span className="text-danger font-semibold">
                {marketData.down_coins_count} 个 ({downPercentage.toFixed(1)}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="pt-4">
              <div className="h-5 bg-dark-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-success transition-all duration-700 ease-out"
                  style={{ width: `${upPercentage}%` }}
                />
                <div
                  className="h-full bg-danger transition-all duration-700 ease-out"
                  style={{ width: `${downPercentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-3 text-xs text-dark-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  上涨 {upPercentage.toFixed(1)}%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-danger"></span>
                  下跌 {downPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Market Stats */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 lg:p-8">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-secondary/15 rounded-lg flex items-center justify-center">
              🌐
            </span>
            市场统计
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-800/50 rounded-xl p-4 lg:p-5 border border-dark-800 hover:border-primary/30 transition-colors">
              <p className="text-dark-600 text-xs mb-1.5">活跃币种</p>
              <p className="text-white text-2xl font-bold">
                {marketData.active_cryptocurrencies.toLocaleString()}
              </p>
            </div>

            <div className="bg-dark-800/50 rounded-xl p-4 lg:p-5 border border-dark-800 hover:border-primary/30 transition-colors">
              <p className="text-dark-600 text-xs mb-1.5">交易市场</p>
              <p className="text-white text-2xl font-bold">
                {marketData.markets.toLocaleString()}
              </p>
            </div>

            <div className="bg-dark-800/50 rounded-xl p-4 lg:p-5 border border-dark-800 hover:border-primary/30 transition-colors">
              <p className="text-dark-600 text-xs mb-1.5">统计范围</p>
              <p className="text-white text-2xl font-bold">
                市值前 {totalCoins}
              </p>
            </div>

            <div
              className={`bg-dark-800/50 rounded-xl p-4 lg:p-5 border transition-colors ${
                sentimentColor === 'success'
                  ? 'border-success/30'
                  : sentimentColor === 'danger'
                  ? 'border-danger/30'
                  : 'border-warning/30'
              }`}
            >
              <p className="text-dark-600 text-xs mb-1.5">市场情绪</p>
              <p
                className={`text-2xl font-bold ${
                  sentimentColor === 'success'
                    ? 'text-success'
                    : sentimentColor === 'danger'
                    ? 'text-danger'
                    : 'text-warning'
                }`}
              >
                {marketSentiment}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-900 rounded-full border border-dark-800">
          <span className="text-dark-600 text-sm">数据来源：CoinGecko API</span>
          <span className="w-px h-4 bg-dark-700"></span>
          <span className="text-dark-600 text-sm">
            更新时间：{new Date().toLocaleString('zh-CN')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MarketPage;
