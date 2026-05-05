import { Router, Request, Response } from 'express';
import { CoinGeckoService } from '../services/coingeckoService';
import { TechnicalIndicatorsService } from '../services/technicalIndicators';
import { NewsService } from '../services/newsService';
import { ApiResponse, Coin, CoinDetail, TechnicalIndicators, TradingSignal } from '../types';

const router = Router();
const coinGeckoService = new CoinGeckoService();
const technicalIndicatorsService = new TechnicalIndicatorsService();
const newsService = new NewsService();

router.get('/', async (req: Request, res: Response<ApiResponse<Coin[]>>) => {
  try {
    const coins = coinGeckoService.getCoinsFromCache();
    
    if (coins.length === 0) {
      try {
        await coinGeckoService.refreshAllData();
        const freshCoins = coinGeckoService.getCoinsFromCache();
        return res.json({ success: true, data: freshCoins });
      } catch (error) {
        return res.status(503).json({
          success: false,
          error: '数据暂时不可用，请稍后重试'
        });
      }
    }
    
    res.json({ success: true, data: coins });
  } catch (error) {
    console.error('Error fetching coins:', error);
    res.status(500).json({
      success: false,
      error: '获取币种列表失败'
    });
  }
});

router.get('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse<CoinDetail>>) => {
  try {
    const coinId = req.params.id;
    
    const dataExists = await coinGeckoService.ensureCoinData(coinId);
    
    if (!dataExists) {
      return res.status(404).json({
        success: false,
        error: '未找到该币种'
      });
    }
    
    const marketData = coinGeckoService.getCoinMarketDataFromCache(coinId);
    const priceHistory = coinGeckoService.getPriceHistoryFromCache(coinId);
    
    if (!marketData) {
      return res.status(404).json({
        success: false,
        error: '未找到该币种的市场数据'
      });
    }
    
    let technicalIndicators: TechnicalIndicators;
    
    if (priceHistory.length > 0) {
      technicalIndicators = technicalIndicatorsService.calculateAll(priceHistory);
    } else {
      technicalIndicators = {
        rsi: {
          value: 50,
          period: 14,
          signal: 'neutral',
          interpretation: '数据不足，无法计算 RSI 指标',
          historicalValues: [],
        },
        macd: {
          macdLine: [],
          signalLine: [],
          histogram: [],
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          currentMacd: 0,
          currentSignal: 0,
          currentHistogram: 0,
          signal: 'neutral',
          interpretation: '数据不足，无法计算 MACD 指标',
        },
        sma: {
          sma10: [],
          sma30: [],
          currentSma10: 0,
          currentSma30: 0,
          signal: 'neutral',
          trend: 'sideways',
          interpretation: '数据不足，无法计算 SMA 指标',
        },
      };
    }
    
    const tradingSignal = technicalIndicatorsService.generateTradingSignal(technicalIndicators);
    
    const coinDetail: CoinDetail = {
      ...marketData,
      priceHistory,
      technicalIndicators,
      tradingSignal,
    };
    
    res.json({ success: true, data: coinDetail });
  } catch (error) {
    console.error(`Error fetching coin detail for ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: '获取币种详情失败'
    });
  }
});

router.get('/:id/news', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const coinId = req.params.id;
    
    const news = await newsService.fetchNews(coinId);
    
    res.json({ success: true, data: news });
  } catch (error) {
    console.error(`Error fetching news for ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: '获取新闻失败'
    });
  }
});

export default router;
