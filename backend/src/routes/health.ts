import { Router, Request, Response } from 'express';
import { CoinGeckoService } from '../services/coingeckoService';
import { ApiHealthStatus, ApiResponse } from '../types';

const router = Router();
const coinGeckoService = new CoinGeckoService();

router.get('/status', async (req: Request, res: Response<ApiResponse<ApiHealthStatus>>) => {
  try {
    const status = coinGeckoService.getApiHealthStatus();
    
    res.json({
      success: true,
      data: {
        apiAvailable: status.apiAvailable,
        usingMockData: status.usingMockData,
        lastSuccessfulApiCall: status.lastSuccessfulApiCall?.toISOString() || null,
        dataSource: status.dataSource,
        lastDataRefresh: status.lastDataRefresh.toISOString(),
      }
    });
  } catch (error) {
    console.error('Error fetching health status:', error);
    res.status(500).json({
      success: false,
      error: '获取健康状态失败'
    });
  }
});

export default router;
