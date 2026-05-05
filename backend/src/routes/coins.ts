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
    let isMockData = false;
    
    if (priceHistory.length > 0) {
      technicalIndicators = technicalIndicatorsService.calculateAll(priceHistory);
    } else {
      isMockData = true;
      technicalIndicators = {
        rsi: {
          value: 50,
          period: 14,
          signal: 'neutral',
          interpretation: '数据不足，无法计算 RSI 指标',
          historicalValues: [],
          reference: {
            overboughtThreshold: 70,
            oversoldThreshold: 30,
            description: 'RSI 是一种动量振荡器，用于衡量价格变动的速度和幅度。',
          },
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
          reference: {
            crossoverCondition: '金叉发生在 MACD 线上穿信号线时，死叉发生在 MACD 线下穿信号线时。',
            histogramInterpretation: '柱状图表示 MACD 线与信号线的差值，正值表示多头力量，负值表示空头力量。',
          },
        },
        sma: {
          sma5: [],
          sma10: [],
          sma20: [],
          sma50: [],
          sma100: [],
          sma200: [],
          currentSma5: 0,
          currentSma10: 0,
          currentSma20: 0,
          currentSma50: 0,
          currentSma100: 0,
          currentSma200: 0,
          signal: 'neutral',
          trend: 'sideways',
          interpretation: '数据不足，无法计算 SMA 指标',
          reference: {
            goldenCrossDescription: '黄金交叉 = 短期均线上穿长期均线，是经典的买入信号。',
            deathCrossDescription: '死亡交叉 = 短期均线下穿长期均线，是经典的卖出信号。',
            sma200Role: '200日均线是判断中长期趋势的重要基准。',
          },
        },
        ema: {
          ema5: [],
          ema12: [],
          ema20: [],
          ema26: [],
          ema50: [],
          currentEma5: 0,
          currentEma12: 0,
          currentEma20: 0,
          currentEma26: 0,
          currentEma50: 0,
          signal: 'neutral',
          interpretation: '数据不足，无法计算 EMA 指标',
          reference: {
            description: 'EMA 是指数移动平均线，对近期价格赋予更高权重，反应更灵敏。',
            comparisonWithSMA: '与 SMA 相比，EMA 对价格变化的反应更快，更适合短期交易。',
          },
        },
        bollinger: {
          upperBand: [],
          middleBand: [],
          lowerBand: [],
          bandWidth: [],
          percentageB: [],
          currentUpper: 0,
          currentMiddle: 0,
          currentLower: 0,
          currentBandWidth: 0,
          currentPercentageB: 0,
          period: 20,
          stdDeviations: 2,
          signal: 'neutral',
          interpretation: '数据不足，无法计算布林带指标',
          reference: {
            squeezeDescription: '带宽收缩（Squeeze）表示波动率降低，通常预示着即将到来的大行情。',
            touchInterpretation: '价格触及上轨可能表示超买，触及下轨可能表示超卖。',
            bandWidthMeaning: '带宽的变化反映市场波动率，带宽扩大表示波动率增加，收缩表示波动率降低。',
          },
        },
        kdj: {
          k: [],
          d: [],
          j: [],
          currentK: 50,
          currentD: 50,
          currentJ: 50,
          period: 9,
          smoothK: 3,
          smoothD: 3,
          signal: 'neutral',
          interpretation: '数据不足，无法计算 KDJ 指标',
          reference: {
            overboughtThreshold: 80,
            oversoldThreshold: 20,
            crossInterpretation: 'K 线上穿 D 线为金叉（看涨），K 线下穿 D 线为死叉（看跌）。',
            jValueMeaning: 'J 值反映 K 值与 D 值的差值，J > 100 或 J < 0 表示极端行情。',
          },
        },
        cci: {
          values: [],
          currentValue: 0,
          period: 20,
          signal: 'neutral',
          interpretation: '数据不足，无法计算 CCI 指标',
          reference: {
            overboughtThreshold: 100,
            oversoldThreshold: -100,
            zeroLineCross: 'CCI 从零线上穿表示看涨，从零线下穿表示看跌。',
            periodMeaning: '20 周期 CCI 是常用配置，用于捕捉短期到中期的趋势变化。',
          },
        },
        atr: {
          values: [],
          currentValue: 0,
          period: 14,
          atrPercentage: 0,
          signal: 'normal',
          interpretation: '数据不足，无法计算 ATR 指标',
          reference: {
            description: 'ATR 衡量市场波动率，不提供方向信号，只显示价格波动的幅度。',
            usageInTrading: 'ATR 常用于设置止损位、计算仓位大小、判断市场状态（平静/活跃）。',
            stopLossReference: '通常建议止损位设置在 1-2 倍 ATR 距离，避免被正常波动止损。',
          },
        },
        obv: {
          values: [],
          currentValue: 0,
          signal: 'neutral',
          interpretation: '数据不足，无法计算 OBV 指标',
          reference: {
            description: 'OBV 通过累计成交量来衡量资金流向，价格上涨时成交量加，下跌时减。',
            divergenceInterpretation: '价格创新高但 OBV 未创新高 = 看跌背离；价格创新低但 OBV 未创新低 = 看涨背离。',
            confirmationMeaning: '价格与 OBV 同向运动时，趋势更可靠。',
          },
        },
        williamsR: {
          values: [],
          currentValue: -50,
          period: 14,
          signal: 'neutral',
          interpretation: '数据不足，无法计算威廉指标',
          reference: {
            overboughtThreshold: -20,
            oversoldThreshold: -80,
            comparisonWithStochastic: '威廉指标 %R 与随机指标类似，但范围是 -100 到 0，且计算方式略有不同。',
          },
        },
        stoch: {
          k: [],
          d: [],
          currentK: 50,
          currentD: 50,
          fastKPeriod: 14,
          slowKPeriod: 3,
          slowDPeriod: 3,
          signal: 'neutral',
          interpretation: '数据不足，无法计算慢速随机指标',
          reference: {
            overboughtThreshold: 80,
            oversoldThreshold: 20,
            crossInterpretation: '%K 线上穿 %D 线为金叉（看涨），下穿为死叉（看跌）。',
            vsFastStochastic: '慢速随机指标对快速随机指标的 %K 进行了平滑处理，信号更可靠但略有滞后。',
          },
        },
      };
    }
    
    const tradingSignal = technicalIndicatorsService.generateTradingSignal(technicalIndicators);
    
    const coinDetail: CoinDetail = {
      ...marketData,
      priceHistory,
      technicalIndicators,
      tradingSignal,
      news: [],
      isMock: isMockData,
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
