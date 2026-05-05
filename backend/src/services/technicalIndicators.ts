import { 
  PriceHistoryPoint, 
  TechnicalIndicators, 
  RSIIndicator, 
  MACDIndicator, 
  SMAIndicator 
} from '../types';

export class TechnicalIndicatorsService {
  private readonly RSI_PERIOD = 14;
  private readonly MACD_FAST_PERIOD = 12;
  private readonly MACD_SLOW_PERIOD = 26;
  private readonly MACD_SIGNAL_PERIOD = 9;
  private readonly SMA_SHORT_PERIOD = 10;
  private readonly SMA_LONG_PERIOD = 30;

  calculateAll(prices: PriceHistoryPoint[]): TechnicalIndicators {
    const priceValues = prices.map(p => p.price);
    
    return {
      rsi: this.calculateRSI(priceValues),
      macd: this.calculateMACD(priceValues),
      sma: this.calculateSMA(priceValues),
    };
  }

  private calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        sma.push(NaN);
      } else {
        const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        sma.push(sum / period);
      }
    }
    
    return sma;
  }

  private calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    const sma = this.calculateSMA(prices, period);
    ema[period - 1] = sma[period - 1];
    
    for (let i = period; i < prices.length; i++) {
      ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
    }
    
    for (let i = 0; i < period - 1; i++) {
      ema[i] = NaN;
    }
    
    return ema;
  }

  private calculateRSI(prices: number[]): RSIIndicator {
    const period = this.RSI_PERIOD;
    const rsiValues: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
      const delta = prices[i] - prices[i - 1];
      
      if (i < period) {
        rsiValues.push(NaN);
        continue;
      }
      
      const gains: number[] = [];
      const losses: number[] = [];
      
      for (let j = i - period + 1; j <= i; j++) {
        const change = prices[j] - prices[j - 1];
        if (change > 0) {
          gains.push(change);
          losses.push(0);
        } else if (change < 0) {
          gains.push(0);
          losses.push(Math.abs(change));
        } else {
          gains.push(0);
          losses.push(0);
        }
      }
      
      const avgGain = gains.reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
      
      let rsi: number;
      if (avgLoss === 0) {
        rsi = 100;
      } else if (avgGain === 0) {
        rsi = 0;
      } else {
        const rs = avgGain / avgLoss;
        rsi = 100 - (100 / (1 + rs));
      }
      
      rsiValues.push(rsi);
    }
    
    const validRsi = rsiValues.filter(v => !isNaN(v));
    const currentRsi = validRsi.length > 0 ? validRsi[validRsi.length - 1] : 50;
    
    let signal: 'overbought' | 'oversold' | 'neutral';
    let interpretation: string;
    
    if (currentRsi >= 70) {
      signal = 'overbought';
      interpretation = `当前 RSI 为 ${currentRsi.toFixed(2)}，处于超买区域（>=70），市场可能面临回调压力。建议警惕价格回落风险。`;
    } else if (currentRsi <= 30) {
      signal = 'oversold';
      interpretation = `当前 RSI 为 ${currentRsi.toFixed(2)}，处于超卖区域（<=30），市场可能存在反弹机会。超卖后价格往往会出现技术性反弹。`;
    } else if (currentRsi >= 60) {
      signal = 'neutral';
      interpretation = `当前 RSI 为 ${currentRsi.toFixed(2)}，接近超买区域，市场偏强但尚未进入明显超买状态。需关注是否会进一步进入超买区域。`;
    } else if (currentRsi <= 40) {
      signal = 'neutral';
      interpretation = `当前 RSI 为 ${currentRsi.toFixed(2)}，接近超卖区域，市场偏弱但尚未进入明显超卖状态。需关注是否会进一步进入超卖区域。`;
    } else {
      signal = 'neutral';
      interpretation = `当前 RSI 为 ${currentRsi.toFixed(2)}，处于中性区域（40-60），市场情绪相对平衡，没有明显的超买或超卖信号。`;
    }
    
    return {
      value: currentRsi,
      period,
      signal,
      interpretation,
      historicalValues: rsiValues,
    };
  }

  private calculateMACD(prices: number[]): MACDIndicator {
    const fastPeriod = this.MACD_FAST_PERIOD;
    const slowPeriod = this.MACD_SLOW_PERIOD;
    const signalPeriod = this.MACD_SIGNAL_PERIOD;
    
    const emaFast = this.calculateEMA(prices, fastPeriod);
    const emaSlow = this.calculateEMA(prices, slowPeriod);
    
    const macdLine: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      if (isNaN(emaFast[i]) || isNaN(emaSlow[i])) {
        macdLine.push(NaN);
      } else {
        macdLine.push(emaFast[i] - emaSlow[i]);
      }
    }
    
    const validMacd = macdLine.filter(v => !isNaN(v));
    const signalLine: number[] = [];
    
    if (validMacd.length > 0) {
      const emaSignal = this.calculateEMA(validMacd, signalPeriod);
      let signalIndex = 0;
      
      for (let i = 0; i < prices.length; i++) {
        if (isNaN(macdLine[i])) {
          signalLine.push(NaN);
        } else {
          signalLine.push(emaSignal[signalIndex] ?? NaN);
          signalIndex++;
        }
      }
    } else {
      for (let i = 0; i < prices.length; i++) {
        signalLine.push(NaN);
      }
    }
    
    const histogram: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      if (isNaN(macdLine[i]) || isNaN(signalLine[i])) {
        histogram.push(NaN);
      } else {
        histogram.push(macdLine[i] - signalLine[i]);
      }
    }
    
    const validMacdValues = macdLine.filter(v => !isNaN(v));
    const validSignalValues = signalLine.filter(v => !isNaN(v));
    const validHistogramValues = histogram.filter(v => !isNaN(v));
    
    const currentMacd = validMacdValues.length > 0 ? validMacdValues[validMacdValues.length - 1] : 0;
    const currentSignal = validSignalValues.length > 0 ? validSignalValues[validSignalValues.length - 1] : 0;
    const currentHistogram = validHistogramValues.length > 0 ? validHistogramValues[validHistogramValues.length - 1] : 0;
    
    let signal: 'bullish_crossover' | 'bearish_crossover' | 'bullish' | 'bearish' | 'neutral';
    let interpretation: string;
    
    if (validHistogramValues.length >= 2) {
      const prevHistogram = validHistogramValues[validHistogramValues.length - 2];
      
      if (prevHistogram <= 0 && currentHistogram > 0) {
        signal = 'bullish_crossover';
        interpretation = `当前发生金叉：MACD 线上穿信号线，柱状图由负转正。这是典型的看涨信号，预示短期趋势可能向上转变。建议关注后续确认信号。`;
      } else if (prevHistogram >= 0 && currentHistogram < 0) {
        signal = 'bearish_crossover';
        interpretation = `当前发生死叉：MACD 线下穿信号线，柱状图由正转负。这是典型的看跌信号，预示短期趋势可能向下转变。建议注意风险控制。`;
      } else if (currentHistogram > 0) {
        const isIncreasing = currentHistogram > prevHistogram;
        signal = 'bullish';
        if (isIncreasing) {
          interpretation = `当前柱状图为正且扩大（${currentHistogram.toFixed(4)}），表明多头力量在增强。MACD 线位于信号线上方，整体趋势偏多。`;
        } else {
          interpretation = `当前柱状图为正但收窄（${currentHistogram.toFixed(4)}），表明多头力量有所减弱。虽然仍处于看涨区间，但需警惕可能的回调。`;
        }
      } else if (currentHistogram < 0) {
        const isDecreasing = currentHistogram < prevHistogram;
        signal = 'bearish';
        if (isDecreasing) {
          interpretation = `当前柱状图为负且扩大（${currentHistogram.toFixed(4)}），表明空头力量在增强。MACD 线位于信号线下方，整体趋势偏空。`;
        } else {
          interpretation = `当前柱状图为负但收窄（${currentHistogram.toFixed(4)}），表明空头力量有所减弱。虽然仍处于看跌区间，但可能存在反弹机会。`;
        }
      } else {
        signal = 'neutral';
        interpretation = `当前柱状图接近零轴，MACD 线与信号线基本重合，市场处于震荡整理阶段，方向不明确。`;
      }
    } else {
      signal = 'neutral';
      interpretation = `数据不足，无法生成明确的 MACD 信号。`;
    }
    
    return {
      macdLine,
      signalLine,
      histogram,
      fastPeriod,
      slowPeriod,
      signalPeriod,
      currentMacd,
      currentSignal,
      currentHistogram,
      signal,
      interpretation,
    };
  }

  private calculateSMA(prices: number[]): SMAIndicator {
    const shortPeriod = this.SMA_SHORT_PERIOD;
    const longPeriod = this.SMA_LONG_PERIOD;
    
    const sma10 = this.calculateSMA(prices, shortPeriod);
    const sma30 = this.calculateSMA(prices, longPeriod);
    
    const validSma10 = sma10.filter(v => !isNaN(v));
    const validSma30 = sma30.filter(v => !isNaN(v));
    
    const currentSma10 = validSma10.length > 0 ? validSma10[validSma10.length - 1] : 0;
    const currentSma30 = validSma30.length > 0 ? validSma30[validSma30.length - 1] : 0;
    
    let signal: 'golden_cross' | 'death_cross' | 'bullish' | 'bearish' | 'neutral';
    let trend: 'bullish' | 'bearish' | 'sideways';
    let interpretation: string;
    
    if (validSma10.length >= 2 && validSma30.length >= 2) {
      const prevSma10 = validSma10[validSma10.length - 2];
      const prevSma30 = validSma30[validSma30.length - 2];
      
      const wasAbove = prevSma10 > prevSma30;
      const isAbove = currentSma10 > currentSma30;
      
      if (!wasAbove && isAbove) {
        signal = 'golden_cross';
        trend = 'bullish';
        interpretation = `当前发生黄金交叉：SMA10（${currentSma10.toFixed(2)}）上穿 SMA30（${currentSma30.toFixed(2)}）。这是强烈的看涨信号，通常预示中长期上涨趋势的开始。建议关注成交量配合情况。`;
      } else if (wasAbove && !isAbove) {
        signal = 'death_cross';
        trend = 'bearish';
        interpretation = `当前发生死亡交叉：SMA10（${currentSma10.toFixed(2)}）下穿 SMA30（${currentSma30.toFixed(2)}）。这是强烈的看跌信号，通常预示中长期下跌趋势的开始。建议注意风险控制。`;
      } else if (isAbove) {
        signal = 'bullish';
        trend = 'bullish';
        interpretation = `SMA10（${currentSma10.toFixed(2)}）位于 SMA30（${currentSma30.toFixed(2)}）上方，处于多头排列。短期均线上穿长期均线后持续保持在上方，表明上涨趋势仍在延续。`;
      } else if (!isAbove) {
        signal = 'bearish';
        trend = 'bearish';
        interpretation = `SMA10（${currentSma10.toFixed(2)}）位于 SMA30（${currentSma30.toFixed(2)}）下方，处于空头排列。短期均线下穿长期均线后持续保持在下方，表明下跌趋势仍在延续。`;
      } else {
        signal = 'neutral';
        trend = 'sideways';
        interpretation = `SMA10 与 SMA30 基本持平，市场处于震荡整理阶段，趋势方向不明确。`;
      }
    } else {
      signal = 'neutral';
      trend = 'sideways';
      interpretation = `数据不足，无法生成明确的 SMA 交叉信号。`;
    }
    
    return {
      sma10,
      sma30,
      currentSma10,
      currentSma30,
      signal,
      trend,
      interpretation,
    };
  }
}

export default TechnicalIndicatorsService;
