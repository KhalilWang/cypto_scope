import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Coin } from './types';
import { coinApi } from './services/api';
import { CoinList } from './pages/CoinList';
import { CoinDetail } from './pages/CoinDetail';

function Header() {
  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-3xl">📈</span>
            <div>
              <h1 className="text-xl font-bold text-white">CryptoScope</h1>
              <p className="text-xs text-slate-400">加密货币市场分析平台</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-slate-300 hover:text-white transition-colors text-sm"
            >
              市场行情
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-800 border-t border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <span className="text-slate-400 text-sm">
              CryptoScope - 加密货币市场分析平台
            </span>
          </div>
          <div className="text-slate-500 text-xs">
            数据来源：CoinGecko API | 仅供参考，不构成投资建议
          </div>
        </div>
      </div>
    </footer>
  );
}

function HomePage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoins = async () => {
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
    };

    fetchCoins();
  }, []);

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">市值排名前 50 币种</h2>
        <p className="text-slate-400">
          实时查看全球加密货币市场数据，点击任意币种查看详细技术分析和相关新闻
        </p>
      </div>
      <CoinList coins={coins} loading={loading} error={error} />
    </main>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/coin/:coinId" element={<CoinDetail />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
