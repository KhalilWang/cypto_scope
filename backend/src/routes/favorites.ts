import { Router, Request, Response } from 'express';
import { FavoritesService } from '../services/favoritesService';
import { ApiResponse, FavoriteWithCoin } from '../types';

const router = Router();
const favoritesService = new FavoritesService();

const getSessionId = (req: Request): string => {
  let sessionId = req.headers['x-session-id'] as string;
  
  if (!sessionId) {
    sessionId = favoritesService.generateSessionId();
  }
  
  return sessionId;
};

router.get('/session', (req: Request, res: Response<ApiResponse<{ sessionId: string }>>) => {
  const sessionId = getSessionId(req);
  res.json({
    success: true,
    data: { sessionId }
  });
});

router.get('/', (req: Request, res: Response<ApiResponse<FavoriteWithCoin[]>>) => {
  try {
    const sessionId = getSessionId(req);
    const favorites = favoritesService.getFavoritesWithCoins(sessionId);
    
    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      error: '获取收藏列表失败'
    });
  }
});

router.get('/ids', (req: Request, res: Response<ApiResponse<string[]>>) => {
  try {
    const sessionId = getSessionId(req);
    const coinIds = favoritesService.getFavoriteCoinIds(sessionId);
    
    res.json({
      success: true,
      data: coinIds
    });
  } catch (error) {
    console.error('Error fetching favorite ids:', error);
    res.status(500).json({
      success: false,
      error: '获取收藏ID列表失败'
    });
  }
});

router.get('/:coinId', (req: Request<{ coinId: string }>, res: Response<ApiResponse<{ isFavorite: boolean }>>) => {
  try {
    const sessionId = getSessionId(req);
    const isFavorite = favoritesService.isFavorite(sessionId, req.params.coinId);
    
    res.json({
      success: true,
      data: { isFavorite }
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({
      success: false,
      error: '检查收藏状态失败'
    });
  }
});

router.post('/:coinId', (req: Request<{ coinId: string }>, res: Response<ApiResponse<{ isFavorite: boolean; changed: boolean }>>) => {
  try {
    const sessionId = getSessionId(req);
    const result = favoritesService.toggleFavorite(sessionId, req.params.coinId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      error: '切换收藏状态失败'
    });
  }
});

export default router;
