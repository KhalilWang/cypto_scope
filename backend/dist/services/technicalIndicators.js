"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicalIndicatorsService = void 0;
class TechnicalIndicatorsService {
    constructor() {
        this.RSI_PERIOD = 14;
        this.MACD_FAST_PERIOD = 12;
        this.MACD_SLOW_PERIOD = 26;
        this.MACD_SIGNAL_PERIOD = 9;
        this.SMA_SHORT_PERIOD = 10;
        this.SMA_LONG_PERIOD = 30;
        this.BOLLINGER_PERIOD = 20;
        this.BOLLINGER_STD_DEV = 2;
        this.KDJ_PERIOD = 9;
        this.KDJ_SMOOTH_K = 3;
        this.KDJ_SMOOTH_D = 3;
        this.CCI_PERIOD = 20;
        this.ATR_PERIOD = 14;
        this.WILLIAMS_R_PERIOD = 14;
        this.STOCH_FAST_K_PERIOD = 14;
        this.STOCH_SLOW_K_PERIOD = 3;
        this.STOCH_SLOW_D_PERIOD = 3;
    }
    calculateAll(prices) {
        const priceValues = prices.map(p => p.price);
        return {
            rsi: this.calculateRSI(priceValues),
            macd: this.calculateMACD(priceValues),
            sma: this.calculateSMA(priceValues),
            ema: this.calculateEMA(priceValues),
            bollinger: this.calculateBollingerBands(priceValues),
            kdj: this.calculateKDJ(prices),
            cci: this.calculateCCI(prices),
            atr: this.calculateATR(prices),
            obv: this.calculateOBV(prices),
            williamsR: this.calculateWilliamsR(prices),
            stoch: this.calculateStochastic(prices),
        };
    }
    generateTradingSignal(indicators) {
        const { rsi, macd, sma, ema, bollinger, kdj, cci, atr, obv, williamsR, stoch } = indicators;
        let bullishScore = 0;
        let bearishScore = 0;
        const reasons = [];
        const indicatorsAnalysis = {
            rsi: { signal: rsi.signal, value: rsi.value, interpretation: rsi.interpretation, weight: 2 },
            macd: { signal: macd.signal, interpretation: macd.interpretation, weight: 3 },
            sma: { signal: sma.signal, interpretation: sma.interpretation, weight: 3 },
            ema: { signal: ema.signal, interpretation: ema.interpretation, weight: 2 },
            bollinger: { signal: bollinger.signal, value: bollinger.currentPercentageB, interpretation: bollinger.interpretation, weight: 2 },
            kdj: { signal: kdj.signal, value: kdj.currentK, interpretation: kdj.interpretation, weight: 2 },
            cci: { signal: cci.signal, value: cci.currentValue, interpretation: cci.interpretation, weight: 2 },
            atr: { signal: atr.signal, value: atr.currentValue, interpretation: atr.interpretation, weight: 1 },
            obv: { signal: obv.signal, interpretation: obv.interpretation, weight: 2 },
            williamsR: { signal: williamsR.signal, value: williamsR.currentValue, interpretation: williamsR.interpretation, weight: 2 },
            stoch: { signal: stoch.signal, value: stoch.currentK, interpretation: stoch.interpretation, weight: 2 },
        };
        if (rsi.signal === 'oversold') {
            bullishScore += 2;
            reasons.push(`RSI 超卖 (${rsi.value.toFixed(2)})，反弹机会增加`);
        }
        else if (rsi.signal === 'overbought') {
            bearishScore += 2;
            reasons.push(`RSI 超买 (${rsi.value.toFixed(2)})，回调风险增加`);
        }
        else if (rsi.value >= 60) {
            bullishScore += 1;
            reasons.push(`RSI 偏强 (${rsi.value.toFixed(2)})，市场情绪偏多`);
        }
        else if (rsi.value <= 40) {
            bearishScore += 1;
            reasons.push(`RSI 偏弱 (${rsi.value.toFixed(2)})，市场情绪偏空`);
        }
        if (macd.signal === 'bullish_crossover') {
            bullishScore += 3;
            reasons.push('MACD 金叉，强烈看涨');
        }
        else if (macd.signal === 'bearish_crossover') {
            bearishScore += 3;
            reasons.push('MACD 死叉，强烈看跌');
        }
        else if (macd.signal === 'bullish') {
            bullishScore += 1;
            reasons.push('MACD 多头区间');
        }
        else if (macd.signal === 'bearish') {
            bearishScore += 1;
            reasons.push('MACD 空头区间');
        }
        if (sma.signal === 'golden_cross') {
            bullishScore += 3;
            reasons.push('SMA 黄金交叉，强烈看涨');
        }
        else if (sma.signal === 'death_cross') {
            bearishScore += 3;
            reasons.push('SMA 死亡交叉，强烈看跌');
        }
        else if (sma.signal === 'bullish') {
            bullishScore += 2;
            reasons.push('SMA 多头排列');
        }
        else if (sma.signal === 'bearish') {
            bearishScore += 2;
            reasons.push('SMA 空头排列');
        }
        if (ema.signal === 'bullish') {
            bullishScore += 1;
            reasons.push('EMA 显示短期趋势偏多');
        }
        else if (ema.signal === 'bearish') {
            bearishScore += 1;
            reasons.push('EMA 显示短期趋势偏空');
        }
        if (bollinger.signal === 'squeeze') {
            if (bollinger.currentPercentageB > 0.7) {
                bullishScore += 1;
                reasons.push('布林带收缩 + 价格偏上，可能向上突破');
            }
            else if (bollinger.currentPercentageB < 0.3) {
                bearishScore += 1;
                reasons.push('布林带收缩 + 价格偏下，可能向下突破');
            }
        }
        else if (bollinger.signal === 'lower_touch') {
            bullishScore += 1;
            reasons.push('价格触及布林带下轨，可能反弹');
        }
        else if (bollinger.signal === 'upper_touch') {
            bearishScore += 1;
            reasons.push('价格触及布林带上轨，可能回调');
        }
        if (kdj.signal === 'oversold') {
            bullishScore += 1;
            reasons.push(`KDJ 超卖 (K:${kdj.currentK.toFixed(1)})`);
        }
        else if (kdj.signal === 'overbought') {
            bearishScore += 1;
            reasons.push(`KDJ 超买 (K:${kdj.currentK.toFixed(1)})`);
        }
        else if (kdj.signal === 'golden_cross') {
            bullishScore += 2;
            reasons.push('KDJ 金叉，短期看涨');
        }
        else if (kdj.signal === 'death_cross') {
            bearishScore += 2;
            reasons.push('KDJ 死叉，短期看跌');
        }
        if (cci.signal === 'oversold') {
            bullishScore += 1;
            reasons.push(`CCI 超卖区 (${cci.currentValue.toFixed(1)})`);
        }
        else if (cci.signal === 'overbought') {
            bearishScore += 1;
            reasons.push(`CCI 超买区 (${cci.currentValue.toFixed(1)})`);
        }
        else if (cci.signal === 'bullish') {
            bullishScore += 1;
            reasons.push('CCI 零轴上方，偏强');
        }
        else if (cci.signal === 'bearish') {
            bearishScore += 1;
            reasons.push('CCI 零轴下方，偏弱');
        }
        if (williamsR.signal === 'oversold') {
            bullishScore += 1;
            reasons.push(`威廉指标超卖 (${williamsR.currentValue.toFixed(1)})`);
        }
        else if (williamsR.signal === 'overbought') {
            bearishScore += 1;
            reasons.push(`威廉指标超买 (${williamsR.currentValue.toFixed(1)})`);
        }
        if (stoch.signal === 'oversold') {
            bullishScore += 1;
            reasons.push(`随机指标超卖 (K:${stoch.currentK.toFixed(1)})`);
        }
        else if (stoch.signal === 'overbought') {
            bearishScore += 1;
            reasons.push(`随机指标超买 (K:${stoch.currentK.toFixed(1)})`);
        }
        else if (stoch.signal === 'golden_cross') {
            bullishScore += 2;
            reasons.push('随机指标金叉');
        }
        else if (stoch.signal === 'death_cross') {
            bearishScore += 2;
            reasons.push('随机指标死叉');
        }
        if (obv.signal === 'bullish_divergence') {
            bullishScore += 2;
            reasons.push('OBV 看涨背离，成交量支持价格');
        }
        else if (obv.signal === 'bearish_divergence') {
            bearishScore += 2;
            reasons.push('OBV 看跌背离，成交量不支持价格');
        }
        let overall;
        let confidence;
        let recommendation;
        const totalScore = bullishScore + bearishScore;
        if (totalScore === 0) {
            overall = 'neutral';
            confidence = 50;
            recommendation = '当前各项技术指标信号不明确，市场处于震荡整理阶段。建议保持观望，等待明确的趋势信号出现后再进行操作。';
        }
        else if (bullishScore > bearishScore) {
            overall = 'bullish';
            confidence = Math.min(95, 50 + (bullishScore - bearishScore) * 5);
            const strongSignals = reasons.filter(r => r.includes('强烈')).length;
            if (strongSignals >= 2) {
                recommendation = `当前多项技术指标共振看涨。${reasons.slice(0, 4).join('；')}。建议考虑逢低建仓或持有现有仓位，同时设置合理的止损位。当前波动率：${atr.atrPercentage.toFixed(2)}%`;
            }
            else if (strongSignals >= 1) {
                recommendation = `当前技术指标显示看涨倾向。${reasons.slice(0, 3).join('；')}。建议谨慎做多，关注关键阻力位是否有效突破。`;
            }
            else {
                recommendation = `当前技术指标略微偏向看涨。${reasons.slice(0, 2).join('；')}。建议轻仓试探，等待更明确的信号确认。`;
            }
        }
        else if (bearishScore > bullishScore) {
            overall = 'bearish';
            confidence = Math.min(95, 50 + (bearishScore - bullishScore) * 5);
            const strongSignals = reasons.filter(r => r.includes('强烈')).length;
            if (strongSignals >= 2) {
                recommendation = `当前多项技术指标共振看空。${reasons.slice(0, 4).join('；')}。建议考虑减仓或观望，警惕进一步下跌风险。当前波动率：${atr.atrPercentage.toFixed(2)}%`;
            }
            else if (strongSignals >= 1) {
                recommendation = `当前技术指标显示看跌倾向。${reasons.slice(0, 3).join('；')}。建议注意风险控制，关注关键支撑位是否有效守住。`;
            }
            else {
                recommendation = `当前技术指标略微偏向看跌。${reasons.slice(0, 2).join('；')}。建议保持谨慎，等待更明确的信号确认。`;
            }
        }
        else {
            overall = 'neutral';
            confidence = 50;
            recommendation = `当前技术指标信号相互矛盾，多空力量相对平衡。${reasons.slice(0, 2).join('；')}。建议保持观望，等待明确的趋势方向。当前波动率：${atr.atrPercentage.toFixed(2)}%`;
        }
        return {
            overall,
            confidence,
            recommendation,
            reasons,
            indicatorsAnalysis,
            isMock: false,
        };
    }
    calculateSMASimple(prices, period) {
        const sma = [];
        for (let i = 0; i < prices.length; i++) {
            if (i < period - 1) {
                sma.push(NaN);
            }
            else {
                const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                sma.push(sum / period);
            }
        }
        return sma;
    }
    calculateEMAMethod(prices, period) {
        const ema = [];
        const multiplier = 2 / (period + 1);
        const sma = this.calculateSMASimple(prices, period);
        ema[period - 1] = sma[period - 1];
        for (let i = period; i < prices.length; i++) {
            ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
        }
        for (let i = 0; i < period - 1; i++) {
            ema[i] = NaN;
        }
        return ema;
    }
    calculateEMA(prices) {
        const ema5 = this.calculateEMAMethod(prices, 5);
        const ema12 = this.calculateEMAMethod(prices, 12);
        const ema20 = this.calculateEMAMethod(prices, 20);
        const ema26 = this.calculateEMAMethod(prices, 26);
        const ema50 = this.calculateEMAMethod(prices, 50);
        const validEma5 = ema5.filter(v => !isNaN(v));
        const validEma20 = ema20.filter(v => !isNaN(v));
        const validEma50 = ema50.filter(v => !isNaN(v));
        const currentEma5 = validEma5.length > 0 ? validEma5[validEma5.length - 1] : 0;
        const currentEma12 = ema12.filter(v => !isNaN(v)).pop() || 0;
        const currentEma20 = validEma20.length > 0 ? validEma20[validEma20.length - 1] : 0;
        const currentEma26 = ema26.filter(v => !isNaN(v)).pop() || 0;
        const currentEma50 = validEma50.length > 0 ? validEma50[validEma50.length - 1] : 0;
        let signal = 'neutral';
        let interpretation = '';
        if (validEma5.length > 0 && validEma20.length > 0 && validEma50.length > 0) {
            const isAbove20 = currentEma5 > currentEma20;
            const isAbove50 = currentEma20 > currentEma50;
            if (isAbove20 && isAbove50) {
                signal = 'bullish';
                interpretation = `EMA5（${currentEma5.toFixed(2)}）> EMA20（${currentEma20.toFixed(2)}）> EMA50（${currentEma50.toFixed(2)}），短期均线上穿长期均线，呈多头排列。EMA 对价格变化更敏感，短期趋势偏多。`;
            }
            else if (!isAbove20 && !isAbove50) {
                signal = 'bearish';
                interpretation = `EMA5（${currentEma5.toFixed(2)}）< EMA20（${currentEma20.toFixed(2)}）< EMA50（${currentEma50.toFixed(2)}），短期均线下穿长期均线，呈空头排列。EMA 对价格变化更敏感，短期趋势偏空。`;
            }
            else {
                signal = 'neutral';
                interpretation = `EMA 指标排列不一致，短期与中期趋势存在分歧。EMA5: ${currentEma5.toFixed(2)}, EMA20: ${currentEma20.toFixed(2)}, EMA50: ${currentEma50.toFixed(2)}`;
            }
        }
        else {
            interpretation = '数据不足，无法生成明确的 EMA 信号。';
        }
        return {
            ema5,
            ema12,
            ema20,
            ema26,
            ema50,
            currentEma5,
            currentEma12,
            currentEma20,
            currentEma26,
            currentEma50,
            signal,
            interpretation,
            reference: {
                description: 'EMA（指数移动平均线）给予近期价格更高权重，比 SMA 更能快速反映价格变化。常用于判断短期趋势和寻找入场时机。',
                comparisonWithSMA: '与 SMA 相比，EMA 对价格变化更敏感，能更快捕捉趋势反转，但也更容易产生虚假信号。',
            },
        };
    }
    calculateBollingerBands(prices) {
        const period = this.BOLLINGER_PERIOD;
        const stdDeviations = this.BOLLINGER_STD_DEV;
        const middleBand = this.calculateSMASimple(prices, period);
        const upperBand = [];
        const lowerBand = [];
        const bandWidth = [];
        const percentageB = [];
        for (let i = 0; i < prices.length; i++) {
            if (i < period - 1) {
                upperBand.push(NaN);
                lowerBand.push(NaN);
                bandWidth.push(NaN);
                percentageB.push(NaN);
                continue;
            }
            const slice = prices.slice(i - period + 1, i + 1);
            const mean = middleBand[i];
            const squaredDiffs = slice.map(p => Math.pow(p - mean, 2));
            const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
            const stdDev = Math.sqrt(variance);
            const upper = mean + stdDeviations * stdDev;
            const lower = mean - stdDeviations * stdDev;
            upperBand.push(upper);
            lowerBand.push(lower);
            bandWidth.push(((upper - lower) / mean) * 100);
            if (upper === lower) {
                percentageB.push(0.5);
            }
            else {
                percentageB.push((prices[i] - lower) / (upper - lower));
            }
        }
        const validUpper = upperBand.filter(v => !isNaN(v));
        const validMiddle = middleBand.filter(v => !isNaN(v));
        const validLower = lowerBand.filter(v => !isNaN(v));
        const validWidth = bandWidth.filter(v => !isNaN(v));
        const validPB = percentageB.filter(v => !isNaN(v));
        const currentUpper = validUpper.length > 0 ? validUpper[validUpper.length - 1] : 0;
        const currentMiddle = validMiddle.length > 0 ? validMiddle[validMiddle.length - 1] : 0;
        const currentLower = validLower.length > 0 ? validLower[validLower.length - 1] : 0;
        const currentBandWidth = validWidth.length > 0 ? validWidth[validWidth.length - 1] : 0;
        const currentPercentageB = validPB.length > 0 ? validPB[validPB.length - 1] : 0.5;
        const currentPrice = prices[prices.length - 1] || 0;
        let signal = 'neutral';
        let interpretation = '';
        if (validWidth.length >= 5) {
            const avgWidth = validWidth.slice(-5).reduce((a, b) => a + b, 0) / 5;
            const isSqueezing = currentBandWidth < avgWidth * 0.8;
            const isExpanding = currentBandWidth > avgWidth * 1.2;
            const isTouchingUpper = currentPrice >= currentUpper * 0.98;
            const isTouchingLower = currentPrice <= currentLower * 1.02;
            if (isSqueezing) {
                signal = 'squeeze';
                interpretation = `布林带正在收缩（带宽：${currentBandWidth.toFixed(2)}%），波动率降低。当前 %b 指标为 ${currentPercentageB.toFixed(2)}。收缩往往预示着即将到来的大行情，若价格偏上（%b > 0.7）可能向上突破，偏下（%b < 0.3）可能向下突破。`;
            }
            else if (isExpanding) {
                signal = 'expanding';
                interpretation = `布林带正在扩张（带宽：${currentBandWidth.toFixed(2)}%），波动率增加。当前 %b 指标为 ${currentPercentageB.toFixed(2)}。扩张通常表明趋势正在形成，但需结合其他指标判断方向。`;
            }
            else if (isTouchingUpper) {
                signal = 'upper_touch';
                interpretation = `价格（${currentPrice.toFixed(2)}）触及布林带上轨（${currentUpper.toFixed(2)}）。%b 指标为 ${currentPercentageB.toFixed(2)}。触及上轨可能预示回调，但在强势趋势中也可能是延续信号。建议结合成交量和其他指标判断。`;
            }
            else if (isTouchingLower) {
                signal = 'lower_touch';
                interpretation = `价格（${currentPrice.toFixed(2)}）触及布林带下轨（${currentLower.toFixed(2)}）。%b 指标为 ${currentPercentageB.toFixed(2)}。触及下轨可能预示反弹，但在弱势趋势中也可能是延续信号。建议结合成交量和其他指标判断。`;
            }
            else {
                signal = 'neutral';
                interpretation = `价格在布林带中轨附近运行。上轨：${currentUpper.toFixed(2)}，中轨：${currentMiddle.toFixed(2)}，下轨：${currentLower.toFixed(2)}，带宽：${currentBandWidth.toFixed(2)}%，%b：${currentPercentageB.toFixed(2)}。当前无明显突破信号。`;
            }
        }
        else {
            interpretation = '数据不足，无法生成明确的布林带信号。';
        }
        return {
            upperBand,
            middleBand,
            lowerBand,
            bandWidth,
            percentageB,
            currentUpper,
            currentMiddle,
            currentLower,
            currentBandWidth,
            currentPercentageB,
            period,
            stdDeviations,
            signal,
            interpretation,
            reference: {
                squeezeDescription: '布林带收缩（带宽下降）表明市场波动率降低，通常预示着即将到来的大行情。收缩越久，突破后的行情越大。',
                touchInterpretation: '价格触及上轨不一定是卖出信号，触及下轨也不一定是买入信号。需结合趋势判断：在上升趋势中，触及上轨可能是强势延续；在下降趋势中，触及下轨可能是弱势延续。',
                bandWidthMeaning: '带宽指标衡量布林带的宽度，常用于识别"挤压"模式。带宽降低 = 波动率降低；带宽增加 = 波动率增加。',
            },
        };
    }
    calculateKDJ(prices) {
        const period = this.KDJ_PERIOD;
        const smoothK = this.KDJ_SMOOTH_K;
        const smoothD = this.KDJ_SMOOTH_D;
        const priceValues = prices.map(p => p.price);
        const rawK = [];
        for (let i = 0; i < prices.length; i++) {
            if (i < period - 1) {
                rawK.push(NaN);
                continue;
            }
            const slice = priceValues.slice(i - period + 1, i + 1);
            const high = Math.max(...slice);
            const low = Math.min(...slice);
            const close = priceValues[i];
            if (high === low) {
                rawK.push(50);
            }
            else {
                rawK.push(((close - low) / (high - low)) * 100);
            }
        }
        const validRawK = rawK.filter(v => !isNaN(v));
        let k = [];
        if (validRawK.length > 0) {
            k = this.calculateSMASimple(validRawK, smoothK);
        }
        const validK = k.filter(v => !isNaN(v));
        let d = [];
        if (validK.length > 0) {
            d = this.calculateSMASimple(validK, smoothD);
        }
        const j = [];
        for (let i = 0; i < Math.max(k.length, d.length); i++) {
            const kVal = k[i];
            const dVal = d[i];
            if (isNaN(kVal) || isNaN(dVal)) {
                j.push(NaN);
            }
            else {
                j.push(3 * kVal - 2 * dVal);
            }
        }
        const currentK = validK.length > 0 ? validK[validK.length - 1] : 50;
        const validDFinal = d.filter(v => !isNaN(v));
        const currentD = validDFinal.length > 0 ? validDFinal[validDFinal.length - 1] : 50;
        const validJ = j.filter(v => !isNaN(v));
        const currentJ = validJ.length > 0 ? validJ[validJ.length - 1] : 50;
        let signal = 'neutral';
        let interpretation = '';
        if (validK.length >= 2 && validDFinal.length >= 2) {
            const prevK = validK[validK.length - 2];
            const prevD = validDFinal[validDFinal.length - 2];
            const wasAbove = prevK > prevD;
            const isAbove = currentK > currentD;
            if (!wasAbove && isAbove) {
                signal = 'golden_cross';
                interpretation = `KDJ 金叉：K（${currentK.toFixed(1)}）上穿 D（${currentD.toFixed(1)}），J（${currentJ.toFixed(1)}）。短期看涨信号，若发生在超卖区（K < 20），信号更强。`;
            }
            else if (wasAbove && !isAbove) {
                signal = 'death_cross';
                interpretation = `KDJ 死叉：K（${currentK.toFixed(1)}）下穿 D（${currentD.toFixed(1)}），J（${currentJ.toFixed(1)}）。短期看跌信号，若发生在超买区（K > 80），信号更强。`;
            }
            else if (currentK >= 80) {
                signal = 'overbought';
                interpretation = `KDJ 处于超买区：K=${currentK.toFixed(1)}, D=${currentD.toFixed(1)}, J=${currentJ.toFixed(1)}。K > 80 表明市场可能过热，存在回调风险。但在强势趋势中，超买可能持续。`;
            }
            else if (currentK <= 20) {
                signal = 'oversold';
                interpretation = `KDJ 处于超卖区：K=${currentK.toFixed(1)}, D=${currentD.toFixed(1)}, J=${currentJ.toFixed(1)}。K < 20 表明市场可能超卖，存在反弹机会。但在弱势趋势中，超卖可能持续。`;
            }
            else if (currentK > currentD) {
                signal = 'bullish';
                interpretation = `KDJ 多头排列：K（${currentK.toFixed(1)}）> D（${currentD.toFixed(1)}），J（${currentJ.toFixed(1)}）。短期趋势偏多。`;
            }
            else if (currentK < currentD) {
                signal = 'bearish';
                interpretation = `KDJ 空头排列：K（${currentK.toFixed(1)}）< D（${currentD.toFixed(1)}），J（${currentJ.toFixed(1)}）。短期趋势偏空。`;
            }
            else {
                signal = 'neutral';
                interpretation = `KDJ 指标中性：K=${currentK.toFixed(1)}, D=${currentD.toFixed(1)}, J=${currentJ.toFixed(1)}。无明显趋势信号。`;
            }
        }
        else {
            interpretation = '数据不足，无法生成明确的 KDJ 信号。';
        }
        return {
            k,
            d,
            j,
            currentK,
            currentD,
            currentJ,
            period,
            smoothK,
            smoothD,
            signal,
            interpretation,
            reference: {
                overboughtThreshold: 80,
                oversoldThreshold: 20,
                crossInterpretation: '金叉（K上穿D）= 短期看涨；死叉（K下穿D）= 短期看跌。在超卖区金叉信号更强，在超买区死叉信号更强。',
                jValueMeaning: 'J值是K和D的差值放大，反应更灵敏。J > 100 超买，J < 0 超卖。J值的背离往往是重要的转折信号。',
            },
        };
    }
    calculateCCI(prices) {
        const period = this.CCI_PERIOD;
        const priceValues = prices.map(p => p.price);
        const typicalPrices = [];
        for (const price of prices) {
            const high = price.price * 1.02;
            const low = price.price * 0.98;
            typicalPrices.push((high + low + price.price) / 3);
        }
        const sma = this.calculateSMASimple(typicalPrices, period);
        const values = [];
        for (let i = 0; i < prices.length; i++) {
            if (i < period - 1) {
                values.push(NaN);
                continue;
            }
            const slice = typicalPrices.slice(i - period + 1, i + 1);
            const mean = sma[i];
            const absDeviations = slice.map(p => Math.abs(p - mean));
            const meanDeviation = absDeviations.reduce((a, b) => a + b, 0) / period;
            if (meanDeviation === 0) {
                values.push(0);
            }
            else {
                values.push((typicalPrices[i] - mean) / (0.015 * meanDeviation));
            }
        }
        const validValues = values.filter(v => !isNaN(v));
        const currentValue = validValues.length > 0 ? validValues[validValues.length - 1] : 0;
        let signal = 'neutral';
        let interpretation = '';
        if (validValues.length >= 2) {
            const prevValue = validValues[validValues.length - 2];
            if (currentValue >= 100) {
                signal = 'overbought';
                interpretation = `CCI 处于超买区（${currentValue.toFixed(1)}）。CCI > +100 表明价格已偏离均线，进入超买区域，可能面临回调。但在强势趋势中，超买可能持续。`;
            }
            else if (currentValue <= -100) {
                signal = 'oversold';
                interpretation = `CCI 处于超卖区（${currentValue.toFixed(1)}）。CCI < -100 表明价格已偏离均线，进入超卖区域，可能存在反弹机会。但在弱势趋势中，超卖可能持续。`;
            }
            else if (currentValue > 0 && prevValue <= 0) {
                signal = 'bullish';
                interpretation = `CCI 上穿零轴（${currentValue.toFixed(1)}），短期可能走强。CCI 从零轴下方穿越到上方，表明短期趋势可能由弱转强。`;
            }
            else if (currentValue < 0 && prevValue >= 0) {
                signal = 'bearish';
                interpretation = `CCI 下穿零轴（${currentValue.toFixed(1)}），短期可能走弱。CCI 从零轴上方穿越到下方，表明短期趋势可能由强转弱。`;
            }
            else if (currentValue > 0) {
                signal = 'bullish';
                interpretation = `CCI 位于零轴上方（${currentValue.toFixed(1)}），短期趋势偏强。正值区域表明价格高于平均水平，处于强势阶段。`;
            }
            else if (currentValue < 0) {
                signal = 'bearish';
                interpretation = `CCI 位于零轴下方（${currentValue.toFixed(1)}），短期趋势偏弱。负值区域表明价格低于平均水平，处于弱势阶段。`;
            }
            else {
                signal = 'neutral';
                interpretation = `CCI 接近零轴（${currentValue.toFixed(1)}），价格偏离程度低，趋势不明确。`;
            }
        }
        else {
            interpretation = '数据不足，无法生成明确的 CCI 信号。';
        }
        return {
            values,
            currentValue,
            period,
            signal,
            interpretation,
            reference: {
                overboughtThreshold: 100,
                oversoldThreshold: -100,
                zeroLineCross: 'CCI 穿越零轴是重要的趋势信号：上穿零轴 = 可能走强；下穿零轴 = 可能走弱。但 CCI 是滞后指标，需结合其他指标确认。',
                periodMeaning: '默认周期为 20 天，衡量价格与平均价格的偏离程度。CCI 越大，偏离越远。',
            },
        };
    }
    calculateATR(prices) {
        const period = this.ATR_PERIOD;
        const priceValues = prices.map(p => p.price);
        const trueRanges = [];
        for (let i = 0; i < prices.length; i++) {
            if (i === 0) {
                const high = priceValues[i] * 1.02;
                const low = priceValues[i] * 0.98;
                trueRanges.push(high - low);
            }
            else {
                const high = priceValues[i] * 1.02;
                const low = priceValues[i] * 0.98;
                const closePrev = priceValues[i - 1];
                const tr1 = high - low;
                const tr2 = Math.abs(high - closePrev);
                const tr3 = Math.abs(low - closePrev);
                trueRanges.push(Math.max(tr1, tr2, tr3));
            }
        }
        const values = this.calculateEMAMethod(trueRanges, period);
        const validValues = values.filter(v => !isNaN(v));
        const currentValue = validValues.length > 0 ? validValues[validValues.length - 1] : 0;
        const currentPrice = priceValues[priceValues.length - 1] || 1;
        const atrPercentage = currentPrice > 0 ? (currentValue / currentPrice) * 100 : 0;
        let signal = 'normal';
        let interpretation = '';
        if (validValues.length >= 10) {
            const avgATR = validValues.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, validValues.length);
            if (currentValue > avgATR * 1.5) {
                signal = 'high_volatility';
                interpretation = `当前波动率较高：ATR = ${currentValue.toFixed(4)}（占价格 ${atrPercentage.toFixed(2)}%）。ATR 高于近期平均值 50%，表明市场波动加剧。高波动率时应适当扩大止损范围，同时警惕假突破。`;
            }
            else if (currentValue < avgATR * 0.7) {
                signal = 'low_volatility';
                interpretation = `当前波动率较低：ATR = ${currentValue.toFixed(4)}（占价格 ${atrPercentage.toFixed(2)}%）。ATR 低于近期平均值 30%，表明市场波动收窄。低波动率往往预示着即将到来的大行情，波动率可能随时扩大。`;
            }
            else {
                signal = 'normal';
                interpretation = `当前波动率正常：ATR = ${currentValue.toFixed(4)}（占价格 ${atrPercentage.toFixed(2)}%）。波动率处于正常范围，可按常规策略操作。`;
            }
        }
        else {
            interpretation = `ATR = ${currentValue.toFixed(4)}（占价格 ${atrPercentage.toFixed(2)}%）。数据不足，无法判断波动率趋势。`;
        }
        return {
            values,
            currentValue,
            period,
            atrPercentage,
            signal,
            interpretation,
            reference: {
                description: 'ATR（平均真实波幅）衡量市场波动率，不指示方向，只指示波动幅度。由 Welles Wilder 发明。',
                usageInTrading: 'ATR 常用于设置止损止盈位置。一般建议止损设置为 1-2 倍 ATR。在高波动率市场，应适当扩大止损；在低波动率市场，可缩小止损。',
                stopLossReference: '例如：若价格为 $65,000，ATR 为 $1,500（约 2.3%），则激进止损可设为 1x ATR（$1,500），保守止损可设为 2x ATR（$3,000）。',
            },
        };
    }
    calculateOBV(prices) {
        const values = [];
        let obv = 0;
        for (let i = 0; i < prices.length; i++) {
            if (i === 0) {
                values.push(prices[i].volume);
                obv = prices[i].volume;
            }
            else {
                const currentClose = prices[i].price;
                const prevClose = prices[i - 1].price;
                const volume = prices[i].volume;
                if (currentClose > prevClose) {
                    obv += volume;
                }
                else if (currentClose < prevClose) {
                    obv -= volume;
                }
                values.push(obv);
            }
        }
        const currentValue = values[values.length - 1] || 0;
        let signal = 'neutral';
        let interpretation = '';
        if (values.length >= 10) {
            const recentPrices = prices.slice(-5).map(p => p.price);
            const recentOBV = values.slice(-5);
            const priceRising = recentPrices[recentPrices.length - 1] > recentPrices[0];
            const obvRising = recentOBV[recentOBV.length - 1] > recentOBV[0];
            if (priceRising && !obvRising) {
                signal = 'bearish_divergence';
                interpretation = '看跌背离：价格上涨，但 OBV 未能同步上涨。这表明成交量未能支撑价格上涨，上涨趋势可能乏力，存在回调风险。成交量是价格的先行指标，背离时需警惕趋势反转。';
            }
            else if (!priceRising && obvRising) {
                signal = 'bullish_divergence';
                interpretation = '看涨背离：价格下跌，但 OBV 反而上升。这表明成交量在逢低吸纳，下跌趋势可能接近尾声，存在反弹机会。成交量是价格的先行指标，背离时可能预示趋势反转。';
            }
            else if (priceRising && obvRising) {
                signal = 'confirmation';
                interpretation = '量价配合：价格上涨，OBV 同步上升。成交量确认了价格趋势，上涨趋势健康。量价齐升是强势的表现，趋势可持续性较强。';
            }
            else if (!priceRising && !obvRising) {
                signal = 'confirmation';
                interpretation = '量价配合：价格下跌，OBV 同步下降。成交量确认了价格趋势，下跌趋势延续。量价齐跌是弱势的表现，需保持谨慎。';
            }
            else {
                signal = 'neutral';
                interpretation = 'OBV 信号不明确，量价关系较为复杂，建议结合其他指标判断。';
            }
        }
        else {
            interpretation = `OBV = ${currentValue.toFixed(0)}。数据不足，无法判断量价关系。`;
        }
        return {
            values,
            currentValue,
            signal,
            interpretation,
            reference: {
                description: 'OBV（能量潮）由 Joseph Granville 发明，通过成交量变化来预测价格趋势。核心思想是：成交量是价格的先行指标。',
                divergenceInterpretation: '背离是 OBV 最重要的信号：看涨背离（价格跌+OBV涨）= 可能反弹；看跌背离（价格涨+OBV跌）= 可能回调。',
                confirmationMeaning: '量价配合 = 趋势健康：价格涨+OBV涨 = 强势；价格跌+OBV跌 = 弱势。',
            },
        };
    }
    calculateWilliamsR(prices) {
        const period = this.WILLIAMS_R_PERIOD;
        const priceValues = prices.map(p => p.price);
        const values = [];
        for (let i = 0; i < prices.length; i++) {
            if (i < period - 1) {
                values.push(NaN);
                continue;
            }
            const slice = priceValues.slice(i - period + 1, i + 1);
            const high = Math.max(...slice);
            const low = Math.min(...slice);
            const close = priceValues[i];
            if (high === low) {
                values.push(-50);
            }
            else {
                values.push(((high - close) / (high - low)) * -100);
            }
        }
        const validValues = values.filter(v => !isNaN(v));
        const currentValue = validValues.length > 0 ? validValues[validValues.length - 1] : -50;
        let signal = 'neutral';
        let interpretation = '';
        if (validValues.length >= 2) {
            const prevValue = validValues[validValues.length - 2];
            if (currentValue >= -20) {
                signal = 'overbought';
                interpretation = `威廉指标超买区（${currentValue.toFixed(1)}）。Williams %R > -20 表明市场处于超买状态，价格接近近期高点，可能面临回调。但与 RSI 不同，超买不一定是卖出信号，需结合趋势判断。`;
            }
            else if (currentValue <= -80) {
                signal = 'oversold';
                interpretation = `威廉指标超卖区（${currentValue.toFixed(1)}）。Williams %R < -80 表明市场处于超卖状态，价格接近近期低点，可能存在反弹机会。但与 RSI 不同，超卖不一定是买入信号，需结合趋势判断。`;
            }
            else if (currentValue > prevValue && prevValue <= -80) {
                signal = 'bullish';
                interpretation = `威廉指标从超卖区回升（${currentValue.toFixed(1)}），短期可能走强。%R 从 -80 下方回升，可能预示反弹。`;
            }
            else if (currentValue < prevValue && prevValue >= -20) {
                signal = 'bearish';
                interpretation = `威廉指标从超买区回落（${currentValue.toFixed(1)}），短期可能走弱。%R 从 -20 上方回落，可能预示回调。`;
            }
            else {
                signal = 'neutral';
                interpretation = `威廉指标中性区域（${currentValue.toFixed(1)}），无明显超买超卖信号。`;
            }
        }
        else {
            interpretation = `Williams %R = ${currentValue.toFixed(1)}。数据不足，无法生成明确信号。`;
        }
        return {
            values,
            currentValue,
            period,
            signal,
            interpretation,
            reference: {
                overboughtThreshold: -20,
                oversoldThreshold: -80,
                comparisonWithStochastic: 'Williams %R 与随机指标类似，但计算公式不同：%R 反映价格在区间内的位置（负值），随机指标 K 值反映相对位置（正值）。两者可配合使用增加信号可靠性。',
            },
        };
    }
    calculateStochastic(prices) {
        const fastKPeriod = this.STOCH_FAST_K_PERIOD;
        const slowKPeriod = this.STOCH_SLOW_K_PERIOD;
        const slowDPeriod = this.STOCH_SLOW_D_PERIOD;
        const priceValues = prices.map(p => p.price);
        const fastK = [];
        for (let i = 0; i < prices.length; i++) {
            if (i < fastKPeriod - 1) {
                fastK.push(NaN);
                continue;
            }
            const slice = priceValues.slice(i - fastKPeriod + 1, i + 1);
            const high = Math.max(...slice);
            const low = Math.min(...slice);
            const close = priceValues[i];
            if (high === low) {
                fastK.push(50);
            }
            else {
                fastK.push(((close - low) / (high - low)) * 100);
            }
        }
        const validFastK = fastK.filter(v => !isNaN(v));
        let k = [];
        if (validFastK.length > 0) {
            k = this.calculateSMASimple(validFastK, slowKPeriod);
        }
        const validK = k.filter(v => !isNaN(v));
        let d = [];
        if (validK.length > 0) {
            d = this.calculateSMASimple(validK, slowDPeriod);
        }
        const currentK = validK.length > 0 ? validK[validK.length - 1] : 50;
        const validD = d.filter(v => !isNaN(v));
        const currentD = validD.length > 0 ? validD[validD.length - 1] : 50;
        let signal = 'neutral';
        let interpretation = '';
        if (validK.length >= 2 && validD.length >= 2) {
            const prevK = validK[validK.length - 2];
            const prevD = validD[validD.length - 2];
            const wasAbove = prevK > prevD;
            const isAbove = currentK > currentD;
            if (!wasAbove && isAbove) {
                signal = 'golden_cross';
                interpretation = `慢速随机指标金叉：K（${currentK.toFixed(1)}）上穿 D（${currentD.toFixed(1)}）。若发生在超卖区（K < 20），是较强的买入信号。`;
            }
            else if (wasAbove && !isAbove) {
                signal = 'death_cross';
                interpretation = `慢速随机指标死叉：K（${currentK.toFixed(1)}）下穿 D（${currentD.toFixed(1)}）。若发生在超买区（K > 80），是较强的卖出信号。`;
            }
            else if (currentK >= 80) {
                signal = 'overbought';
                interpretation = `慢速随机指标超买区：K=${currentK.toFixed(1)}, D=${currentD.toFixed(1)}。K > 80 表明市场可能超买，存在回调风险。但在强势趋势中，超买可能持续。`;
            }
            else if (currentK <= 20) {
                signal = 'oversold';
                interpretation = `慢速随机指标超卖区：K=${currentK.toFixed(1)}, D=${currentD.toFixed(1)}。K < 20 表明市场可能超卖，存在反弹机会。但在弱势趋势中，超卖可能持续。`;
            }
            else if (currentK > currentD) {
                signal = 'bullish';
                interpretation = `慢速随机指标多头排列：K（${currentK.toFixed(1)}）> D（${currentD.toFixed(1)}），短期趋势偏多。`;
            }
            else if (currentK < currentD) {
                signal = 'bearish';
                interpretation = `慢速随机指标空头排列：K（${currentK.toFixed(1)}）< D（${currentD.toFixed(1)}），短期趋势偏空。`;
            }
            else {
                signal = 'neutral';
                interpretation = `慢速随机指标中性：K=${currentK.toFixed(1)}, D=${currentD.toFixed(1)}。`;
            }
        }
        else {
            interpretation = `慢速随机指标：K=${currentK.toFixed(1)}, D=${currentD.toFixed(1)}。数据不足，无法生成明确信号。`;
        }
        return {
            k,
            d,
            currentK,
            currentD,
            fastKPeriod,
            slowKPeriod,
            slowDPeriod,
            signal,
            interpretation,
            reference: {
                overboughtThreshold: 80,
                oversoldThreshold: 20,
                crossInterpretation: '金叉（K上穿D）= 短期看涨；死叉（K下穿D）= 短期看跌。慢速随机指标经过平滑处理，虚假信号比快速随机指标少。',
                vsFastStochastic: '慢速随机指标（Slow Stochastic）= 快速随机指标（Fast Stochastic）经过两次平滑，更稳定但滞后性更强。适合中长线投资者，短线交易者可能更喜欢快速随机指标。',
            },
        };
    }
    calculateRSI(prices) {
        const period = this.RSI_PERIOD;
        const rsiValues = [];
        for (let i = 1; i < prices.length; i++) {
            const delta = prices[i] - prices[i - 1];
            if (i < period) {
                rsiValues.push(NaN);
                continue;
            }
            const gains = [];
            const losses = [];
            for (let j = i - period + 1; j <= i; j++) {
                const change = prices[j] - prices[j - 1];
                if (change > 0) {
                    gains.push(change);
                    losses.push(0);
                }
                else if (change < 0) {
                    gains.push(0);
                    losses.push(Math.abs(change));
                }
                else {
                    gains.push(0);
                    losses.push(0);
                }
            }
            const avgGain = gains.reduce((a, b) => a + b, 0) / period;
            const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
            let rsi;
            if (avgLoss === 0) {
                rsi = 100;
            }
            else if (avgGain === 0) {
                rsi = 0;
            }
            else {
                const rs = avgGain / avgLoss;
                rsi = 100 - (100 / (1 + rs));
            }
            rsiValues.push(rsi);
        }
        const validRsi = rsiValues.filter(v => !isNaN(v));
        const currentRsi = validRsi.length > 0 ? validRsi[validRsi.length - 1] : 50;
        let signal;
        let interpretation;
        if (currentRsi >= 70) {
            signal = 'overbought';
            interpretation = `当前 RSI 为 ${currentRsi.toFixed(2)}，处于超买区域（>=70），市场可能面临回调压力。RSI 越高，回调风险越大。但在强势上升趋势中，RSI 可能长期处于超买区域，需结合其他指标判断。建议关注是否出现背离信号。`;
        }
        else if (currentRsi <= 30) {
            signal = 'oversold';
            interpretation = `当前 RSI 为 ${currentRsi.toFixed(2)}，处于超卖区域（<=30），市场可能存在反弹机会。RSI 越低，反弹概率越大。但在强势下降趋势中，RSI 可能长期处于超卖区域，需结合其他指标判断。建议关注是否出现背离信号。`;
        }
        else if (currentRsi >= 60) {
            signal = 'neutral';
            interpretation = `当前 RSI 为 ${currentRsi.toFixed(2)}，接近超买区域（60-70），市场偏强但尚未进入明显超买状态。需关注是否会进一步进入超买区域（>=70），或回落至中性区域。若 RSI 持续上升，可能预示趋势延续。`;
        }
        else if (currentRsi <= 40) {
            signal = 'neutral';
            interpretation = `当前 RSI 为 ${currentRsi.toFixed(2)}，接近超卖区域（30-40），市场偏弱但尚未进入明显超卖状态。需关注是否会进一步进入超卖区域（<=30），或回升至中性区域。若 RSI 持续下降，可能预示趋势延续。`;
        }
        else {
            signal = 'neutral';
            interpretation = `当前 RSI 为 ${currentRsi.toFixed(2)}，处于中性区域（40-60），市场情绪相对平衡，没有明显的超买或超卖信号。RSI 在中性区域时，通常需要结合其他指标（如 MACD、均线系统）来判断趋势方向。`;
        }
        return {
            value: currentRsi,
            period,
            signal,
            interpretation,
            historicalValues: rsiValues,
            reference: {
                overboughtThreshold: 70,
                oversoldThreshold: 30,
                description: 'RSI（相对强弱指数）由 Welles Wilder 发明，衡量价格上涨和下跌动量的相对强度。取值范围 0-100。是最常用的动量指标之一。',
            },
        };
    }
    calculateMACD(prices) {
        const fastPeriod = this.MACD_FAST_PERIOD;
        const slowPeriod = this.MACD_SLOW_PERIOD;
        const signalPeriod = this.MACD_SIGNAL_PERIOD;
        const emaFast = this.calculateEMAMethod(prices, fastPeriod);
        const emaSlow = this.calculateEMAMethod(prices, slowPeriod);
        const macdLine = [];
        for (let i = 0; i < prices.length; i++) {
            if (isNaN(emaFast[i]) || isNaN(emaSlow[i])) {
                macdLine.push(NaN);
            }
            else {
                macdLine.push(emaFast[i] - emaSlow[i]);
            }
        }
        const validMacd = macdLine.filter(v => !isNaN(v));
        const signalLine = [];
        if (validMacd.length > 0) {
            const emaSignal = this.calculateEMAMethod(validMacd, signalPeriod);
            let signalIndex = 0;
            for (let i = 0; i < prices.length; i++) {
                if (isNaN(macdLine[i])) {
                    signalLine.push(NaN);
                }
                else {
                    signalLine.push(emaSignal[signalIndex] ?? NaN);
                    signalIndex++;
                }
            }
        }
        else {
            for (let i = 0; i < prices.length; i++) {
                signalLine.push(NaN);
            }
        }
        const histogram = [];
        for (let i = 0; i < prices.length; i++) {
            if (isNaN(macdLine[i]) || isNaN(signalLine[i])) {
                histogram.push(NaN);
            }
            else {
                histogram.push(macdLine[i] - signalLine[i]);
            }
        }
        const validMacdValues = macdLine.filter(v => !isNaN(v));
        const validSignalValues = signalLine.filter(v => !isNaN(v));
        const validHistogramValues = histogram.filter(v => !isNaN(v));
        const currentMacd = validMacdValues.length > 0 ? validMacdValues[validMacdValues.length - 1] : 0;
        const currentSignal = validSignalValues.length > 0 ? validSignalValues[validSignalValues.length - 1] : 0;
        const currentHistogram = validHistogramValues.length > 0 ? validHistogramValues[validHistogramValues.length - 1] : 0;
        let signal;
        let interpretation;
        if (validHistogramValues.length >= 2) {
            const prevHistogram = validHistogramValues[validHistogramValues.length - 2];
            if (prevHistogram <= 0 && currentHistogram > 0) {
                signal = 'bullish_crossover';
                interpretation = `当前发生金叉：MACD 线上穿信号线，柱状图由负转正。这是典型的看涨信号，预示短期趋势可能向上转变。建议关注后续确认信号：若成交量配合放大，信号可靠性更高；若同时 RSI 从超卖区域回升，信号更强。`;
            }
            else if (prevHistogram >= 0 && currentHistogram < 0) {
                signal = 'bearish_crossover';
                interpretation = `当前发生死叉：MACD 线下穿信号线，柱状图由正转负。这是典型的看跌信号，预示短期趋势可能向下转变。建议注意风险控制：若成交量配合放大，信号可靠性更高；若同时 RSI 从超买区域回落，信号更强。`;
            }
            else if (currentHistogram > 0) {
                const isIncreasing = currentHistogram > prevHistogram;
                signal = 'bullish';
                if (isIncreasing) {
                    interpretation = `当前柱状图为正且扩大（${currentHistogram.toFixed(4)}），表明多头力量在增强。MACD 线位于信号线上方，整体趋势偏多。柱状图扩大通常意味着趋势正在加速，若能持续，趋势延续性较强。`;
                }
                else {
                    interpretation = `当前柱状图为正但收窄（${currentHistogram.toFixed(4)}），表明多头力量有所减弱。虽然仍处于看涨区间，但需警惕可能的回调。柱状图收窄往往是趋势减弱的信号，若持续收窄，可能预示即将死叉。`;
                }
            }
            else if (currentHistogram < 0) {
                const isDecreasing = currentHistogram < prevHistogram;
                signal = 'bearish';
                if (isDecreasing) {
                    interpretation = `当前柱状图为负且扩大（${currentHistogram.toFixed(4)}），表明空头力量在增强。MACD 线位于信号线下方，整体趋势偏空。柱状图扩大通常意味着趋势正在加速，若能持续，趋势延续性较强。`;
                }
                else {
                    interpretation = `当前柱状图为负但收窄（${currentHistogram.toFixed(4)}），表明空头力量有所减弱。虽然仍处于看跌区间，但可能存在反弹机会。柱状图收窄往往是趋势减弱的信号，若持续收窄，可能预示即将金叉。`;
                }
            }
            else {
                signal = 'neutral';
                interpretation = `当前柱状图接近零轴，MACD 线与信号线基本重合，市场处于震荡整理阶段，方向不明确。MACD 在零轴附近时，通常需要等待明确的交叉信号才能判断趋势方向。`;
            }
        }
        else {
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
            reference: {
                crossoverCondition: '金叉 = MACD 线从下方穿越信号线（柱状图由负转正）；死叉 = MACD 线从上方穿越信号线（柱状图由正转负）。零轴上方的金叉信号通常比零轴下方更强。',
                histogramInterpretation: '柱状图 = MACD 线 - 信号线。正值 = 多头区间；负值 = 空头区间。柱状图扩大 = 趋势加速；柱状图收窄 = 趋势减弱。柱状图是判断趋势强度的重要指标。',
            },
        };
    }
    calculateSMA(prices) {
        const shortPeriod = this.SMA_SHORT_PERIOD;
        const longPeriod = this.SMA_LONG_PERIOD;
        const sma5 = this.calculateSMASimple(prices, 5);
        const sma10 = this.calculateSMASimple(prices, shortPeriod);
        const sma20 = this.calculateSMASimple(prices, 20);
        const sma50 = this.calculateSMASimple(prices, 50);
        const sma100 = this.calculateSMASimple(prices, 100);
        const sma200 = this.calculateSMASimple(prices, 200);
        const validSma5 = sma5.filter(v => !isNaN(v));
        const validSma10 = sma10.filter(v => !isNaN(v));
        const validSma20 = sma20.filter(v => !isNaN(v));
        const validSma50 = sma50.filter(v => !isNaN(v));
        const validSma100 = sma100.filter(v => !isNaN(v));
        const validSma200 = sma200.filter(v => !isNaN(v));
        const currentSma5 = validSma5.length > 0 ? validSma5[validSma5.length - 1] : 0;
        const currentSma10 = validSma10.length > 0 ? validSma10[validSma10.length - 1] : 0;
        const currentSma20 = validSma20.length > 0 ? validSma20[validSma20.length - 1] : 0;
        const currentSma50 = validSma50.length > 0 ? validSma50[validSma50.length - 1] : 0;
        const currentSma100 = validSma100.length > 0 ? validSma100[validSma100.length - 1] : 0;
        const currentSma200 = validSma200.length > 0 ? validSma200[validSma200.length - 1] : 0;
        let signal;
        let trend;
        let interpretation;
        if (validSma10.length >= 2 && validSma50.length >= 2) {
            const prevSma10 = validSma10[validSma10.length - 2];
            const prevSma50 = validSma50[validSma50.length - 2];
            const wasAbove = prevSma10 > prevSma50;
            const isAbove = currentSma10 > currentSma50;
            const isAbove200 = currentSma50 > currentSma200 && currentSma200 > 0;
            if (!wasAbove && isAbove) {
                signal = 'golden_cross';
                trend = 'bullish';
                const position = isAbove200 ? '价格在 200 日均线上方，这是中长期趋势看涨的确认，黄金交叉信号更强' : '价格在 200 日均线下方，黄金交叉可能是反弹而非反转，需谨慎确认';
                interpretation = `当前发生黄金交叉：SMA10（${currentSma10.toFixed(2)}）上穿 SMA50（${currentSma50.toFixed(2)}）。这是强烈的看涨信号，通常预示中长期上涨趋势的开始。${position}。建议关注成交量配合情况，若成交量放大，趋势确认性更高。`;
            }
            else if (wasAbove && !isAbove) {
                signal = 'death_cross';
                trend = 'bearish';
                const position = !isAbove200 ? '价格在 200 日均线下方，这是中长期趋势看跌的确认，死亡交叉信号更强' : '价格在 200 日均线上方，死亡交叉可能是回调而非反转，需谨慎确认';
                interpretation = `当前发生死亡交叉：SMA10（${currentSma10.toFixed(2)}）下穿 SMA50（${currentSma50.toFixed(2)}）。这是强烈的看跌信号，通常预示中长期下跌趋势的开始。${position}。建议关注成交量配合情况，若成交量放大，趋势确认性更高。`;
            }
            else if (isAbove) {
                signal = 'bullish';
                trend = 'bullish';
                interpretation = `SMA10（${currentSma10.toFixed(2)}）位于 SMA50（${currentSma50.toFixed(2)}）上方，处于多头排列。短期均线上穿长期均线后持续保持在上方，表明上涨趋势仍在延续。`;
            }
            else if (!isAbove) {
                signal = 'bearish';
                trend = 'bearish';
                interpretation = `SMA10（${currentSma10.toFixed(2)}）位于 SMA50（${currentSma50.toFixed(2)}）下方，处于空头排列。短期均线下穿长期均线后持续保持在下方，表明下跌趋势仍在延续。`;
            }
            else {
                signal = 'neutral';
                trend = 'sideways';
                interpretation = `SMA10 与 SMA50 基本持平，市场处于震荡整理阶段，趋势方向不明确。`;
            }
        }
        else {
            signal = 'neutral';
            trend = 'sideways';
            interpretation = `数据不足，无法生成明确的 SMA 信号。`;
        }
        return {
            sma5,
            sma10,
            sma20,
            sma50,
            sma100,
            sma200,
            currentSma5,
            currentSma10,
            currentSma20,
            currentSma50,
            currentSma100,
            currentSma200,
            signal,
            trend,
            interpretation,
            reference: {
                goldenCrossDescription: '黄金交叉 = 短期均线上穿长期均线，是经典的买入信号。在上升趋势中（价格>200日均线），黄金交叉的可靠性更高。',
                deathCrossDescription: '死亡交叉 = 短期均线下穿长期均线，是经典的卖出信号。在下降趋势中（价格<200日均线），死亡交叉的可靠性更高。',
                sma200Role: '200日均线是判断中长期趋势的重要基准：价格>200日均线 = 多头市场；价格<200日均线 = 空头市场。200日均线的方向也很重要：向上倾斜 = 趋势看涨；向下倾斜 = 趋势看跌。',
            },
        };
    }
}
exports.TechnicalIndicatorsService = TechnicalIndicatorsService;
exports.default = TechnicalIndicatorsService;
//# sourceMappingURL=technicalIndicators.js.map