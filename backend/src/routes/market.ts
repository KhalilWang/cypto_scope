import { Router, Request, Response } from 'express';
import { MarketService } from '../services/marketService';
import { ApiResponse, MarketOverview } from '../types';

const router = Router();
const marketService = new MarketService();

router.get('/overview', async (req: Request, res: Response<ApiResponse<MarketOverview>>) => {
  try {
    const overview = await marketService.getMarketOverview();
    
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.status(500).json({
      success: false,
      error: '获取市场概览失败'
    });
  }
});

export default router;
