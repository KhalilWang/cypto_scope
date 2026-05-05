import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import type { Coin } from './types';
import { coinApi } from './services/api';
import { CoinList } from './pages/CoinList';
import { CoinDetail } from './pages/CoinDetail';
import { FavoritesPage } from './pages/FavoritesPage';
import { MarketPage } from './pages/MarketPage';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: '市场行情', icon: '📊' },
    { path: '/market', label: '市场概览', icon: '🌐' },
    { path: '/favorites', label: '我的收藏', icon: '⭐' },
  ];

  const isActive = useCallback(
    (path: string) => {
      if (path === '/') return location.pathname === '/';
      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

  return (
    <header className="bg-dark-900/95 border-b border-dark-800 sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <span className="text-3xl lg:text-4xl transition-transform group-hover:scale-110 inline-block">
                📈
              </span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse"></span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold gradient-text">CryptoScope</h1>
              <p className="text-xs text-dark-600 -mt-1">加密货币市场分析平台</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary/15 text-primary shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-dark-800 transition-colors"
          >
            <span
              className={`block w-5 h-0.5 bg-slate-300 rounded-full transition-all duration-300 ${
                mobileMenuOpen ? 'rotate-45 translate-y-1' : ''
              }`}
            ></span>
            <span
              className={`block w-5 h-0.5 bg-slate-300 rounded-full my-1 transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-0' : ''
              }`}
            ></span>
            <span
              className={`block w-5 h-0.5 bg-slate-300 rounded-full transition-all duration-300 ${
                mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            ></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-64 pb-4' : 'max-h-0'
          }`}
        >
          <nav className="flex flex-col gap-2 pt-2 border-t border-dark-800">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary/15 text-primary'
                    : 'text-slate-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {isActive(item.path) && (
                  <span className="ml-auto w-1.5 h-1.5 bg-primary rounded-full"></span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📈</span>
            <div>
              <span className="text-white font-semibold">CryptoScope</span>
              <p className="text-xs text-dark-600">加密货币市场分析平台</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 text-xs text-dark-600">
              <span className="w-2 h-2 bg-success rounded-full"></span>
              <span>数据来源：CoinGecko API</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-dark-800"></div>
            <span className="text-xs text-dark-600">⚠️ 仅供参考，不构成投资建议</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} border-primary/30 border-t-primary rounded-full animate-spin`}
      ></div>
    </div>
  );
}

function ErrorDisplay({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center">
          <span className="text-4xl">😕</span>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">加载失败</h3>
      <p className="text-dark-600 text-center max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary flex items-center gap-2"
        >
          <span>🔄</span>
          重新加载
        </button>
      )}
    </div>
  );
}

function HomePage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coinApi.getAll();
      setCoins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取币种列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-primary/15 text-primary text-xs font-medium rounded-full">
                🔥 实时数据
              </span>
              <span className="text-dark-600 text-xs">每 5 分钟刷新</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              市值排名 <span className="gradient-text">前 50</span> 币种
            </h2>
            <p className="text-dark-600 max-w-2xl">
              实时查看全球加密货币市场数据，点击任意币种查看详细技术分析、价格趋势和相关新闻
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-dark-600">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
            <span>共 {coins.length > 0 ? coins.length : '...'} 个币种</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading && !coins.length ? (
        <div className="py-20">
          <LoadingSpinner size="lg" />
          <p className="text-center text-dark-600 mt-4">正在加载市场数据...</p>
        </div>
      ) : error && !coins.length ? (
        <ErrorDisplay message={error} onRetry={fetchCoins} />
      ) : (
        <CoinList coins={coins} loading={loading} error={error} />
      )}
    </main>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col gradient-bg">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/coin/:coinId" element={<CoinDetail />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
export { LoadingSpinner, ErrorDisplay };
