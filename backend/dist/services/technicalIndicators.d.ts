import { PriceHistoryPoint, TechnicalIndicators, TradingSignal } from '../types';
export declare class TechnicalIndicatorsService {
    private readonly RSI_PERIOD;
    private readonly MACD_FAST_PERIOD;
    private readonly MACD_SLOW_PERIOD;
    private readonly MACD_SIGNAL_PERIOD;
    private readonly SMA_SHORT_PERIOD;
    private readonly SMA_LONG_PERIOD;
    private readonly BOLLINGER_PERIOD;
    private readonly BOLLINGER_STD_DEV;
    private readonly KDJ_PERIOD;
    private readonly KDJ_SMOOTH_K;
    private readonly KDJ_SMOOTH_D;
    private readonly CCI_PERIOD;
    private readonly ATR_PERIOD;
    private readonly WILLIAMS_R_PERIOD;
    private readonly STOCH_FAST_K_PERIOD;
    private readonly STOCH_SLOW_K_PERIOD;
    private readonly STOCH_SLOW_D_PERIOD;
    calculateAll(prices: PriceHistoryPoint[]): TechnicalIndicators;
    generateTradingSignal(indicators: TechnicalIndicators): TradingSignal;
    private calculateSMASimple;
    private calculateEMAMethod;
    private calculateEMA;
    private calculateBollingerBands;
    private calculateKDJ;
    private calculateCCI;
    private calculateATR;
    private calculateOBV;
    private calculateWilliamsR;
    private calculateStochastic;
    private calculateRSI;
    private calculateMACD;
    private calculateSMA;
}
export default TechnicalIndicatorsService;
//# sourceMappingURL=technicalIndicators.d.ts.map