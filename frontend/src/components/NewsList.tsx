import type { NewsArticle } from '../types';
import { formatTimeAgo } from '../utils/formatters';

interface NewsListProps {
  news: NewsArticle[];
  loading: boolean;
}

function getSentimentEmoji(sentiment: string): string {
  const sentimentMap: Record<string, string> = {
    bullish: '📈',
    bearish: '📉',
    neutral: '📊',
  };
  return sentimentMap[sentiment] || '📊';
}

function getSentimentLabel(sentiment: string): string {
  const labelMap: Record<string, string> = {
    bullish: '看涨',
    bearish: '看跌',
    neutral: '中性',
  };
  return labelMap[sentiment] || '中性';
}

function getSentimentColor(sentiment: string): string {
  const colorMap: Record<string, string> = {
    bullish: 'bg-green-500/20 text-green-400 border-green-500/30',
    bearish: 'bg-red-500/20 text-red-400 border-red-500/30',
    neutral: 'bg-slate-600/50 text-slate-300 border-slate-500/30',
  };
  return colorMap[sentiment] || colorMap.neutral;
}

export function NewsList({ news, loading }: NewsListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
        <p className="text-slate-400 text-sm">加载新闻中...</p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-slate-500 text-4xl mb-3">📰</div>
        <p className="text-slate-400">暂无相关新闻</p>
      </div>
    );
  }

  const mockCount = news.filter(n => n.isMock).length;
  const realCount = news.filter(n => !n.isMock).length;

  return (
    <div className="space-y-4">
      {mockCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-amber-400 text-sm">
            <span>⚠️</span>
            <span>当前显示 {mockCount} 条模拟数据，{realCount > 0 ? `${realCount} 条真实数据` : '暂无真实数据'}。模拟数据仅供参考，不代表真实市场情况。</span>
          </div>
        </div>
      )}

      {news.map((article, index) => (
        <a
          key={index}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`block bg-slate-900 rounded-lg p-4 hover:bg-slate-750 transition-colors group ${
            article.isMock ? 'border border-amber-500/30' : ''
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {article.imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full md:w-32 h-24 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                  {article.title}
                </h3>
                {article.isMock && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded border border-amber-500/30">
                    📝 模拟数据
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                {article.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span>📌</span>
                  <span>{article.source}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span>🕐</span>
                  <span>{formatTimeAgo(article.publishedAt)}</span>
                </span>
                {article.keywords && article.keywords.length > 0 && (
                  <span className="flex items-center gap-1">
                    <span>🏷️</span>
                    <span className="text-slate-400">{article.keywords.slice(0, 3).join(', ')}</span>
                  </span>
                )}
                {article.confidence !== undefined && article.confidence > 0 && (
                  <span className="flex items-center gap-1">
                    <span>🎯</span>
                    <span>可信度: {article.confidence}%</span>
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded text-xs border ${getSentimentColor(article.sourceType === 'mock' ? 'neutral' : 'bullish')}`}>
                  {getSentimentEmoji(article.sourceType === 'mock' ? 'neutral' : 'bullish')}
                  {getSentimentLabel(article.sourceType === 'mock' ? 'neutral' : 'bullish')}
                </span>
                <span className="flex items-center gap-1 text-blue-400 ml-auto">
                  <span>🔗</span>
                  <span>阅读原文</span>
                </span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

export default NewsList;
