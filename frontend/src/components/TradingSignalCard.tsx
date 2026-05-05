import { useState } from 'react';
import type { TradingSignal } from '../types';

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
    };
    return labels[type] || type;
  };

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <span>📊</span> RSI 分析
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-400">
                    当前值：<span className="text-white">{signal.rsi_analysis.value.toFixed(2)}</span>
                  </p>
                  <p className="text-slate-400">
                    信号：<span className={`${
                      signal.rsi_analysis.signal === 'oversold'
                        ? 'text-green-400'
                        : signal.rsi_analysis.signal === 'overbought'
                        ? 'text-red-400'
                        : 'text-slate-300'
                    }`}>
                      {getSignalLabel(signal.rsi_analysis.signal)}
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    {signal.rsi_analysis.interpretation}
                  </p>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <span>📈</span> MACD 分析
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-400">
                    信号：<span className={`${
                      signal.macd_analysis.signal === 'bullish_crossover' || signal.macd_analysis.signal === 'bullish'
                        ? 'text-green-400'
                        : signal.macd_analysis.signal === 'bearish_crossover' || signal.macd_analysis.signal === 'bearish'
                        ? 'text-red-400'
                        : 'text-slate-300'
                    }`}>
                      {getSignalLabel(signal.macd_analysis.signal)}
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    {signal.macd_analysis.interpretation}
                  </p>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <span>📉</span> SMA 分析
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-400">
                    信号：<span className={`${
                      signal.sma_analysis.signal === 'golden_cross' || signal.sma_analysis.signal === 'bullish'
                        ? 'text-green-400'
                        : signal.sma_analysis.signal === 'death_cross' || signal.sma_analysis.signal === 'bearish'
                        ? 'text-red-400'
                        : 'text-slate-300'
                    }`}>
                      {getSignalLabel(signal.sma_analysis.signal)}
                    </span>
                  </p>
                  <p className="text-slate-400">
                    趋势：<span className={`${
                      signal.sma_analysis.trend === 'bullish'
                        ? 'text-green-400'
                        : signal.sma_analysis.trend === 'bearish'
                        ? 'text-red-400'
                        : 'text-slate-300'
                    }`}>
                      {signal.sma_analysis.trend === 'bullish'
                        ? '上涨'
                        : signal.sma_analysis.trend === 'bearish'
                        ? '下跌'
                        : '震荡'}
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    {signal.sma_analysis.interpretation}
                  </p>
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
