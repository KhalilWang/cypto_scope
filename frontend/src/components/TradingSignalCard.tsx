import { useState } from 'react';
import type { TradingSignal, IndicatorAnalysis } from '../types';

interface TradingSignalCardProps {
  signal: TradingSignal;
}

export function TradingSignalCard({ signal }: TradingSignalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const overallConfig = {
    bullish: {
      label: '看涨',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500',
      textColor: 'text-green-400',
      icon: '📈',
    },
    bearish: {
      label: '看跌',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500',
      textColor: 'text-red-400',
      icon: '📉',
    },
    neutral: {
      label: '中性',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-400',
      icon: '📊',
    },
  };

  const config = overallConfig[signal.overall];

  const getSignalLabel = (type: string): string => {
    const labels: Record<string, string> = {
      overbought: '超买',
      oversold: '超卖',
      neutral: '中性',
      bullish_crossover: '金叉',
      bearish_crossover: '死叉',
      bullish: '看涨',
      bearish: '看跌',
      golden_cross: '黄金交叉',
      death_cross: '死亡交叉',
      squeeze: '收缩',
      expanding: '扩张',
      upper_touch: '触及上轨',
      lower_touch: '触及下轨',
      high_volatility: '高波动',
      low_volatility: '低波动',
      bullish_divergence: '看涨背离',
      bearish_divergence: '看跌背离',
      confirmation: '趋势确认',
    };
    return labels[type] || type;
  };

  const getSignalColor = (signal: string): string => {
    const bullishSignals = ['oversold', 'bullish_crossover', 'golden_cross', 'bullish', 'lower_touch', 'high_volatility', 'bullish_divergence'];
    const bearishSignals = ['overbought', 'bearish_crossover', 'death_cross', 'bearish', 'upper_touch', 'squeeze', 'low_volatility', 'bearish_divergence', 'expanding'];
    if (bullishSignals.includes(signal)) return 'text-green-400';
    if (bearishSignals.includes(signal)) return 'text-red-400';
    return 'text-slate-300';
  };

  const IndicatorCard = ({ 
    title, 
    icon, 
    analysis 
  }: { 
    title: string; 
    icon: string; 
    analysis: IndicatorAnalysis 
  }) => (
    <div className="bg-slate-800 rounded-lg p-4">
      <h4 className="text-white font-medium mb-2 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h4>
      <div className="space-y-1 text-sm">
        {analysis.value !== undefined && (
          <p className="text-slate-400">
            当前值：<span className="text-white">{analysis.value.toFixed(2)}</span>
          </p>
        )}
        <p className="text-slate-400">
          信号：<span className={getSignalColor(analysis.signal)}>
            {getSignalLabel(analysis.signal)}
          </span>
        </p>
        <p className="text-slate-500 text-xs mt-2">
          {analysis.interpretation}
        </p>
        <p className="text-slate-500 text-xs">
          权重：{analysis.weight}
        </p>
      </div>
    </div>
  );

  return (
    <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-xl overflow-hidden`}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{config.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                综合操作建议
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                  {config.label}
                </span>
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                置信度：{signal.confidence}%
                {signal.isMock && (
                  <span className="ml-2 text-amber-400 text-xs">(模拟数据)</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  signal.overall === 'bullish'
                    ? 'bg-green-500'
                    : signal.overall === 'bearish'
                    ? 'bg-red-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${signal.confidence}%` }}
              />
            </div>
          </div>
        </div>

        <div className={`bg-slate-800/50 rounded-lg p-4 border-l-4 ${
          signal.overall === 'bullish'
            ? 'border-green-500'
            : signal.overall === 'bearish'
            ? 'border-red-500'
            : 'border-amber-500'
        }`}>
          <p className="text-white text-lg leading-relaxed">
            {signal.recommendation}
          </p>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <span>{isExpanded ? '收起详细分析' : '展开详细分析'}</span>
          <span
            className="transition-transform duration-200"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▼
          </span>
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="border-t border-slate-600 pt-4">
              <h3 className="text-white font-semibold mb-3">📋 判断依据</h3>
              <ul className="space-y-2">
                {signal.reasons.map((reason, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-slate-300 text-sm"
                  >
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-600 pt-4">
              <h3 className="text-white font-semibold mb-3">📊 12 个技术指标详细分析</h3>
              
              <div className="mb-4">
                <h4 className="text-slate-300 text-sm font-medium mb-2">动量指标 (Momentum Indicators)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IndicatorCard title="RSI (相对强弱指数)" icon="📈" analysis={signal.indicatorsAnalysis.rsi} />
                  <IndicatorCard title="CCI (顺势指标)" icon="🔄" analysis={signal.indicatorsAnalysis.cci} />
                  <IndicatorCard title="威廉指标 (%R)" icon="📉" analysis={signal.indicatorsAnalysis.williamsR} />
                  <IndicatorCard title="慢速随机指标" icon="⚡" analysis={signal.indicatorsAnalysis.stoch} />
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-slate-300 text-sm font-medium mb-2">趋势指标 (Trend Indicators)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IndicatorCard title="MACD" icon="📊" analysis={signal.indicatorsAnalysis.macd} />
                  <IndicatorCard title="SMA (简单移动平均线)" icon="〰️" analysis={signal.indicatorsAnalysis.sma} />
                  <IndicatorCard title="EMA (指数移动平均线)" icon="📈" analysis={signal.indicatorsAnalysis.ema} />
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-slate-300 text-sm font-medium mb-2">波动率指标 (Volatility Indicators)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IndicatorCard title="布林带" icon="📊" analysis={signal.indicatorsAnalysis.bollinger} />
                  <IndicatorCard title="ATR (平均真实波幅)" icon="📏" analysis={signal.indicatorsAnalysis.atr} />
                </div>
              </div>

              <div>
                <h4 className="text-slate-300 text-sm font-medium mb-2">综合指标 (Hybrid Indicators)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IndicatorCard title="KDJ (随机指标)" icon="⚡" analysis={signal.indicatorsAnalysis.kdj} />
                  <IndicatorCard title="OBV (能量潮)" icon="💧" analysis={signal.indicatorsAnalysis.obv} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradingSignalCard;
