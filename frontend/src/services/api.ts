import axios from 'axios';
import type { ApiResponse, Coin, CoinDetail, NewsArticle } from '../types';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
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

export default coinApi;
