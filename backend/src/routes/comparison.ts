import { Router, Request, Response } from 'express';
import { ComparisonService } from '../services/comparisonService';
import { ApiResponse, CoinComparison } from '../types';

const router = Router();
const comparisonService = new ComparisonService();

router.post('/', (req: Request, res: Response<ApiResponse<CoinComparison>>) => {
  try {
    const { coins } = req.body;
    
    if (!coins || !Array.isArray(coins) || coins.length < 2) {
      return res.status(400).json({
        success: false,
        error: '请提供至少 2 个币种 ID 进行对比'
      });
    }
    
    const comparison = comparisonService.getComparison(coins);
    
    if (!comparison) {
      return res.status(404).json({
        success: false,
        error: '无法获取币种对比数据，请检查币种 ID 是否正确'
      });
    }
    
    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error getting coin comparison:', error);
    res.status(500).json({
      success: false,
      error: '获取币种对比数据失败'
    });
  }
});

export default router;
