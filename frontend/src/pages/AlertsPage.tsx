import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AlertWithCoin, Coin } from '../types';
import { alertsApi, coinApi } from '../services/api';
import { formatPrice, formatPercentage } from '../utils/formatters';

export function AlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertWithCoin[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<string>('');
  const [alertType, setAlertType] = useState<'price_above' | 'price_below'>('price_above');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await alertsApi.getAll();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取告警列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCoins = useCallback(async () => {
    try {
      const data = await coinApi.getAll();
      setCoins(data);
    } catch (err) {
      console.error('Failed to fetch coins:', err);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchCoins();
    
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [fetchAlerts, fetchCoins]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const handleCreateAlert = async () => {
    if (!selectedCoin || !targetPrice) return;
    
    try {
      setCreating(true);
      const price = parseFloat(targetPrice);
      if (isNaN(price) || price <= 0) {
        throw new Error('请输入有效的价格');
      }
      
      await alertsApi.create({
        coin_id: selectedCoin,
        alert_type: alertType,
        target_price: price
      });
      
      setShowCreateModal(false);
      setSelectedCoin('');
      setTargetPrice('');
      fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建告警失败');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (alert: AlertWithCoin) => {
    try {
      await alertsApi.update(alert.id, { is_active: !alert.is_active });
      fetchAlerts();
    } catch (err) {
      console.error('Failed to update alert:', err);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    if (!confirm('确定要删除这个告警吗？')) return;
    
    try {
      await alertsApi.delete(id);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  const getAlertTypeText = (type: string) => {
    return type === 'price_above' ? '价格上涨至' : '价格下跌至';
  };

  const getAlertTypeColor = (type: string) => {
    return type === 'price_above' ? 'text-green-400' : 'text-red-400';
  };

  const getProgressPercentage = (alert: AlertWithCoin) => {
    if (!alert.current_price_at_creation || alert.current_price_at_creation === 0) {
      return 50;
    }
    
    const currentPrice = alert.current_price;
    const targetPrice = alert.target_price;
    const creationPrice = alert.current_price_at_creation;
    
    if (alert.alert_type === 'price_above') {
      if (currentPrice >= targetPrice) return 100;
      if (currentPrice <= creationPrice) return 0;
      const progress = ((currentPrice - creationPrice) / (targetPrice - creationPrice)) * 100;
      return Math.max(0, Math.min(100, progress));
    } else {
      if (currentPrice <= targetPrice) return 100;
      if (currentPrice >= creationPrice) return 0;
      const progress = ((creationPrice - currentPrice) / (creationPrice - targetPrice)) * 100;
      return Math.max(0, Math.min(100, progress));
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">价格告警</h2>
          <p className="text-slate-400">设置价格告警，自动盯盘，不错过关键时刻</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-400">加载告警列表中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">价格告警</h2>
            <p className="text-slate-400">设置价格告警，自动盯盘，不错过关键时刻</p>
          </div>
          <div className="flex items-center gap-3">
            {notificationPermission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <span>🔔</span>
                <span>启用通知</span>
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>+</span>
              <span>新建告警</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-800 rounded-xl">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-white mb-2">暂无告警</h3>
          <p className="text-slate-400 mb-6 text-center max-w-md">
            您还没有设置任何价格告警。创建一个告警，让系统帮您自动盯盘。
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            创建第一个告警
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const progress = getProgressPercentage(alert);
            const isPositive = alert.price_change_percentage_24h >= 0;

            return (
              <div
                key={alert.id}
                className={`bg-slate-800 rounded-xl p-4 transition-all ${
                  alert.is_triggered ? 'opacity-60' : ''
                } ${!alert.is_active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={alert.image}
                      alt={alert.coin_name}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/40/334155/e2e8f0?text=' + (alert.coin_symbol?.charAt(0).toUpperCase() || '?');
                      }}
                    />
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                        {alert.coin_name}
                        {alert.is_triggered && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                            已触发
                          </span>
                        )}
                        {!alert.is_active && !alert.is_triggered && (
                          <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full">
                            已暂停
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400 uppercase">
                        {alert.coin_symbol}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(alert)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        alert.is_active
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      {alert.is_active ? '启用' : '暂停'}
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-750 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">当前价格</div>
                    <div className="text-lg font-bold text-white">
                      {formatPrice(alert.current_price)}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{isPositive ? '↑' : '↓'}</span>
                      <span>{formatPercentage(alert.price_change_percentage_24h)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-750 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">告警条件</div>
                    <div className={`text-lg font-bold ${getAlertTypeColor(alert.alert_type)}`}>
                      {getAlertTypeText(alert.alert_type)}
                    </div>
                    <div className="text-xl font-bold text-white">
                      {formatPrice(alert.target_price)}
                    </div>
                  </div>

                  <div className="bg-slate-750 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">创建时价格</div>
                    <div className="text-lg font-bold text-white">
                      {alert.current_price_at_creation ? formatPrice(alert.current_price_at_creation) : '-'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(alert.created_at).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>

                {!alert.is_triggered && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>目标进度</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          alert.alert_type === 'price_above'
                            ? 'bg-gradient-to-r from-green-500 to-green-400'
                            : 'bg-gradient-to-r from-red-500 to-red-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {alert.is_triggered && alert.triggered_at && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="text-sm text-green-400">
                      ✅ 告警于 {new Date(alert.triggered_at).toLocaleString('zh-CN')} 触发
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">新建价格告警</h3>
              <p className="text-slate-400 text-sm mt-1">设置价格条件，系统帮您自动盯盘</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">选择币种</label>
                <select
                  value={selectedCoin}
                  onChange={(e) => setSelectedCoin(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">请选择币种</option>
                  {coins.map((coin) => (
                    <option key={coin.id} value={coin.id}>
                      {coin.name} ({coin.symbol.toUpperCase()}) - {formatPrice(coin.current_price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">告警类型</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAlertType('price_above')}
                    className={`px-4 py-3 rounded-lg border transition-colors ${
                      alertType === 'price_above'
                        ? 'bg-green-600/20 border-green-500 text-green-400'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-lg mb-1">📈</div>
                    <div className="font-medium">价格上涨</div>
                    <div className="text-xs opacity-75">价格 ≥ 目标价时触发</div>
                  </button>
                  <button
                    onClick={() => setAlertType('price_below')}
                    className={`px-4 py-3 rounded-lg border transition-colors ${
                      alertType === 'price_below'
                        ? 'bg-red-600/20 border-red-500 text-red-400'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-lg mb-1">📉</div>
                    <div className="font-medium">价格下跌</div>
                    <div className="text-xs opacity-75">价格 ≤ 目标价时触发</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  目标价格 (USD)
                </label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="输入目标价格"
                  step="any"
                  min="0"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                {selectedCoin && (
                  <p className="text-xs text-slate-400 mt-1">
                    当前价格: {formatPrice(coins.find(c => c.id === selectedCoin)?.current_price || 0)}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateAlert}
                disabled={!selectedCoin || !targetPrice || creating}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>创建中...</span>
                  </>
                ) : (
                  <span>创建告警</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlertsPage;
