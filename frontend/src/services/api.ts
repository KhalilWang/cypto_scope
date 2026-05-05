import axios from 'axios';
import type { ApiResponse, Coin, CoinDetail, NewsArticle, FavoriteWithCoin, MarketOverview, Alert, AlertWithCoin, CoinComparison, ApiHealthStatus, TimeRange } from '../types';

const SESSION_ID_KEY = 'cryptoscope_session_id';

const getSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const sessionId = getSessionId();
  if (sessionId) {
    config.headers['X-Session-Id'] = sessionId;
  }
  return config;
});

export const coinApi = {
  getAll: async (): Promise<Coin[]> => {
    const response = await apiClient.get<ApiResponse<Coin[]>>('/coins');
    
    if (!response.data.success) {
      throw new Error(response.data.error || '获取币种列表失败');
    }
    
    return response.data.data || [];
  },

  getDetail: async (coinId: string): Promise<CoinDetail> => {
    const response = await apiClient.get<ApiResponse<CoinDetail>>(`/coins/${coinId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || '获取币种详情失败');
    }
    
    if (!response.data.data) {
      throw new Error('币种数据不存在');
    }
    
    return response.data.data;
  },

  getNews: async (coinId: string): Promise<NewsArticle[]> => {
    const response = await apiClient.get<ApiResponse<NewsArticle[]>>(`/coins/${coinId}/news`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || '获取新闻失败');
    }
    
    return response.data.data || [];
  },
};

export const favoritesApi = {
  getAll: async (): Promise<FavoriteWithCoin[]> => {
    const response = await apiClient.get<ApiResponse<FavoriteWithCoin[]>>('/favorites');
    
    if (!response.data.success) {
      throw new Error(response.data.error || '获取收藏列表失败');
    }
    
    return response.data.data || [];
  },

  getIds: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/favorites/ids');
    
    if (!response.data.success) {
      throw new Error(response.data.error || '获取收藏ID列表失败');
    }
    
    return response.data.data || [];
  },

  check: async (coinId: string): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<{ isFavorite: boolean }>>(`/favorites/${coinId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || '检查收藏状态失败');
    }
    
    return response.data.data?.isFavorite || false;
  },

  toggle: async (coinId: string): Promise<{ isFavorite: boolean; changed: boolean }> => {
    const response = await apiClient.post<ApiResponse<{ isFavorite: boolean; changed: boolean }>>(`/favorites/${coinId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || '切换收藏状态失败');
    }
    
    return response.data.data || { isFavorite: false, changed: false };
  },
};

export const marketApi = {
  getOverview: async (): Promise<MarketOverview> => {
    const response = await apiClient.get<ApiResponse<MarketOverview>>('/market/overview');
    
    if (!response.data.success) {
      throw new Error(response.data.error || '获取市场概览失败');
    }
    
    if (!response.data.data) {
      throw new Error('市场概览数据不存在');
    }
    
    return response.data.data;
  },
};

export const alertsApi = {
  getAll: async (): Promise<AlertWithCoin[]> => {
    const response = await apiClient.get<ApiResponse<AlertWithCoin[]>>('/alerts');
    
    if (!response.data.success) {
      throw new Error(response.data.error || '获取告警列表失败');
    }
    
    return response.data.data || [];
  },

  getActive: async (): Promise<Alert[]> => {
    const response = await apiClient.get<ApiResponse<Alert[]>>('/alerts/active');
    
    if (!response.data.success) {
      throw new Error(response.data.error || '获取活跃告警失败');
    }
    
    return response.data.data || [];
  },

  getTriggered: async (): Promise<AlertWithCoin[]> => {
    const response = await apiClient.get<ApiResponse<AlertWithCoin[]>>('/alerts/triggered');
    
    if (!response.data.success) {
      throw new Error(response.data.error || '获取已触发告警失败');
    }
    
    return response.data.data || [];
  },

  create: async (params: {
    coin_id: string;
    alert_type: 'price_above' | 'price_below';
    target_price: number;
  }): Promise<Alert> => {
    const response = await apiClient.post<ApiResponse<Alert>>('/alerts', params);
    
    if (!response.data.success) {
      throw new Error(response.data.error || '创建告警失败');
    }
    
    if (!response.data.data) {
      throw new Error('创建告警失败');
    }
    
    return response.data.data;
  },

  update: async (id: number, updates: {
    target_price?: number;
    is_active?: boolean;
  }): Promise<Alert> => {
    const response = await apiClient.put<ApiResponse<Alert>>(`/alerts/${id}`, updates);
    
    if (!response.data.success) {
      throw new Error(response.data.error || '更新告警失败');
    }
    
    if (!response.data.data) {
      throw new Error('更新告警失败');
    }
    
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/alerts/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || '删除告警失败');
    }
  },

  check: async (): Promise<{ triggered: Alert[] }> => {
    const response = await apiClient.post<ApiResponse<{ triggered: Alert[] }>>('/alerts/check');
    
    if (!response.data.success) {
      throw new Error(response.data.error || '检查告警失败');
    }
    
    return response.data.data || { triggered: [] };
  },
};

export const comparisonApi = {
  getComparison: async (coinIds: string[]): Promise<CoinComparison> => {
    const response = await apiClient.post<ApiResponse<CoinComparison>>('/comparison', {
      coins: coinIds
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || '获取币种对比数据失败');
    }
    
    if (!response.data.data) {
      throw new Error('币种对比数据不存在');
    }
    
    return response.data.data;
  },
};

export const healthApi = {
  getStatus: async (): Promise<ApiHealthStatus> => {
    const response = await apiClient.get<ApiResponse<ApiHealthStatus>>('/health/status');
    
    if (!response.data.success) {
      throw new Error(response.data.error || '获取健康状态失败');
    }
    
    if (!response.data.data) {
      throw new Error('健康状态数据不存在');
    }
    
    return response.data.data;
  },
};

export const TIME_RANGE_OPTIONS: { key: TimeRange; label: string; days: number; interval: string }[] = [
  { key: '15m', label: '15分钟', days: 1, interval: '15m' },
  { key: '1h', label: '1小时', days: 1, interval: '1h' },
  { key: '4h', label: '4小时', days: 7, interval: '4h' },
  { key: '1d', label: '1天', days: 7, interval: '1d' },
  { key: '7d', label: '7天', days: 7, interval: '1d' },
  { key: '30d', label: '30天', days: 30, interval: '1d' },
  { key: '90d', label: '90天', days: 90, interval: '1d' },
];

export { getSessionId };
export default coinApi;
