import axios from 'axios';
import type { ApiResponse, Coin, CoinDetail, NewsArticle, FavoriteWithCoin, MarketOverview } from '../types';

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

export { getSessionId };
export default coinApi;
