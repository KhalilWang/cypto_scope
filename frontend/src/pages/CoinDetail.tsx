import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CoinDetail, NewsArticle } from '../types';
import { coinApi } from '../services/api';
import { 
  formatPrice, formatMarketCap, formatVolume, formatPercentage, formatSupply } from '../utils/formatters';
import { PriceChart } from '../components/PriceChart';
import { TechnicalIndicatorsPanel } from '../components/TechnicalIndicatorsPanel';
import { NewsList } from '../components/NewsList';

export function CoinDetail() {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const [coinDetail, setCoinDetail] = useState<CoinDetail | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!coinId) return;

      setLoading(true);
      setError(null);

      try {
        const detail = await coinApi.getDetail(coinId);
        setCoinDetail(detail);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取币种详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coinId]);

  useEffect(() => {
    const fetchNews = async () => {
      if (!coinId) return;

      setNewsLoading(true);

      try {
        const newsData = await coinApi.getNews(coinId);
        setNews(newsData);
      } catch (err) {
        console.error('获取新闻失败:', err);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, [coinId]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-slate-400">加载币种详情中...</p>
      </div>
    );
  }

  if (error || !coinDetail) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-red-400 text-5xl mb-4">⚠️</div>
        <p className="text-red-400 text-lg mb-2">加载失败</p>
        <p className="text-slate-400 mb-4">{error || '币种数据不存在'}</p>
        <button
          onClick={handleBack}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          返回列表
        </button>
      </div>
    );
  }

  const isPositive24h = coinDetail.price_change_percentage_24h >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          <span>←</span>
          <span>返回列表</span>
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={coinDetail.image}
              alt={coinDetail.name}
              className="w-16 h-16 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/64/334155/e2e8f0?text=' + coinDetail.symbol.charAt(0).toUpperCase();
              }}
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{coinDetail.name}</h1>
                <span className="px-2 py-1 bg-slate-700 rounded text-sm text-slate-300 uppercase">
                  {coinDetail.symbol}
                </span>
              </div>
              <p className="text-slate-400 mt-1">市值排名 #{coinDetail.market_cap_rank}</p>
            </div>
          </div>

          <div className="text-left lg:text-right">
            <div className="text-3xl font-bold text-white">
              {formatPrice(coinDetail.current_price)}
            </div>
            <div className={`text-lg font-medium mt-1 ${isPositive24h ? 'text-green-400' : 'text-red-400'}`}>
              24h: {formatPercentage(coinDetail.price_change_percentage_24h)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-slate-700">
          <div>
            <p className="text-slate-400 text-sm mb-1">市值</p>
            <p className="text-white font-medium">{formatMarketCap(coinDetail.market_cap)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">24h 成交量</p>
            <p className="text-white font-medium">{formatVolume(coinDetail.total_volume)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">流通量</p>
            <p className="text-white font-medium">{formatSupply(coinDetail.circulating_supply, coinDetail.symbol)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">总供应量</p>
            <p className="text-white font-medium">
              {coinDetail.total_supply ? formatSupply(coinDetail.total_supply, coinDetail.symbol) : '无限'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-700">
          <div>
            <p className="text-slate-400 text-sm mb-1">24h 最高</p>
            <p className="text-green-400 font-medium">{formatPrice(coinDetail.high_24h)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">24h 最低</p>
            <p className="text-red-400 font-medium">{formatPrice(coinDetail.low_24h)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">历史最高 (ATH)</p>
            <p className="text-white font-medium">{formatPrice(coinDetail.ath)}</p>
            <p className="text-red-400 text-sm">{formatPercentage(coinDetail.ath_change_percentage)} 距 ATH</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">历史最低 (ATL)</p>
            <p className="text-white font-medium">{formatPrice(coinDetail.atl)}</p>
            <p className="text-green-400 text-sm">{formatPercentage(coinDetail.atl_change_percentage * -1)} 距 ATL</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">30 天价格趋势</h2>
        <PriceChart 
          priceHistory={coinDetail.priceHistory}
          sma10={coinDetail.technicalIndicators.sma.sma10}
          sma30={coinDetail.technicalIndicators.sma.sma30}
        />
      </div>

      <TechnicalIndicatorsPanel indicators={coinDetail.technicalIndicators} />

      <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">相关新闻</h2>
        <NewsList news={news} loading={newsLoading} />
      </div>
    </div>
  );
}

export default CoinDetail;
