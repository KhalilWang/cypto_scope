import type { NewsArticle } from '../types';
import { formatTimeAgo } from '../utils/formatters';

interface NewsListProps {
  news: NewsArticle[];
  loading: boolean;
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

  return (
    <div className="space-y-4">
      {news.map((article, index) => (
        <a
          key={index}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-slate-900 rounded-lg p-4 hover:bg-slate-750 transition-colors group"
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
              <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors mb-2">
                {article.title}
              </h3>
              <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                {article.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span>📌</span>
                  <span>{article.source}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span>🕐</span>
                  <span>{formatTimeAgo(article.publishedAt)}</span>
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
