import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { TechnicalIndicators, RSIIndicator, MACDIndicator, SMAIndicator } from '../types';

interface TechnicalIndicatorsPanelProps {
  indicators: TechnicalIndicators;
}

interface CollapsibleSectionProps {
  title: string;
  signal: string;
  signalType: 'bullish' | 'bearish' | 'neutral';
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ 
  title, 
  signal, 
  signalType, 
  children, 
  defaultOpen = true 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const signalColors = {
    bullish: 'text-green-400 bg-green-400/10 border-green-400/30',
    bearish: 'text-red-400 bg-red-400/10 border-red-400/30',
    neutral: 'text-slate-400 bg-slate-700 border-slate-600',
  };

  const signalLabel = {
    bullish: '看涨',
    bearish: '看跌',
    neutral: '中性',
  };

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${signalColors[signalType]}`}>
            {signalLabel[signalType]} · {signal}
          </span>
        </div>
        <span className="text-slate-400 text-xl transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-700">
          {children}
        </div>
      )}
    </div>
  );
}

function RSISection({ rsi }: { rsi: RSIIndicator }) {
  const chartData = useMemo(() => {
    const validValues = rsi.historicalValues.filter(v => !isNaN(v)).slice(-30);
    return validValues.map((value, index) => ({
      index,
      value: Math.round(value * 100) / 100,
    }));
  }, [rsi.historicalValues]);

  const getSignalType = (signal: string): 'bullish' | 'bearish' | 'neutral' => {
    if (signal === 'oversold') return 'bullish';
    if (signal === 'overbought') return 'bearish';
    return 'neutral';
  };

  const getSignalDisplay = (signal: string): string => {
    const signalMap: Record<string, string> = {
      overbought: '超买',
      oversold: '超卖',
      neutral: '中性',
    };
    return signalMap[signal] || signal;
  };

  return (
    <CollapsibleSection
      title={`RSI (相对强弱指数) - 当前值: ${rsi.value.toFixed(2)}`}
      signal={getSignalDisplay(rsi.signal)}
      signalType={getSignalType(rsi.signal)}
    >
      <div className="space-y-6">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis hide />
              <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" />
              <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="5 5" />
              <ReferenceLine y={50} stroke="#64748b" strokeDasharray="3 3" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-500"></div>
            <span className="text-slate-400">超买线 (70)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500"></div>
            <span className="text-slate-400">超卖线 (30)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-slate-500"></div>
            <span className="text-slate-400">中轴线 (50)</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">📊 指标说明</h4>
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              <strong className="text-white">RSI (相对强弱指数)</strong> 是一种动量振荡器，通过计算一定周期内（默认 {rsi.period} 日）的平均上涨幅度和平均下跌幅度来衡量价格变动的速度和幅度。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400">●</span>
                  <span className="font-medium text-white">超卖区域 (≤ 30)</span>
                </div>
                <p className="text-xs text-slate-400">
                  通常被视为买入信号，表明价格可能被过度抛售，存在反弹机会。
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-400">●</span>
                  <span className="font-medium text-white">超买区域 (≥ 70)</span>
                </div>
                <p className="text-xs text-slate-400">
                  通常被视为卖出信号，表明价格可能被过度买入，存在回调风险。
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-400">●</span>
                  <span className="font-medium text-white">中性区域 (30-70)</span>
                </div>
                <p className="text-xs text-slate-400">
                  市场情绪相对平衡，没有明显的超买或超卖信号。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-slate-200">{rsi.interpretation}</p>
        </div>
      </div>
    </CollapsibleSection>
  );
}

function MACDSection({ macd }: { macd: MACDIndicator }) {
  const chartData = useMemo(() => {
    const dataPoints: Array<{
      index: number;
      macd: number | null;
      signal: number | null;
      histogram: number | null;
    }> = [];

    const length = Math.max(
      macd.macdLine.length,
      macd.signalLine.length,
      macd.histogram.length
    );

    for (let i = 0; i < Math.min(length, 40); i++) {
      dataPoints.push({
        index: i,
        macd: !isNaN(macd.macdLine[i]) ? macd.macdLine[i] : null,
        signal: !isNaN(macd.signalLine[i]) ? macd.signalLine[i] : null,
        histogram: !isNaN(macd.histogram[i]) ? macd.histogram[i] : null,
      });
    }

    return dataPoints;
  }, [macd]);

  const getSignalType = (signal: string): 'bullish' | 'bearish' | 'neutral' => {
    if (signal === 'bullish_crossover' || signal === 'bullish') return 'bullish';
    if (signal === 'bearish_crossover' || signal === 'bearish') return 'bearish';
    return 'neutral';
  };

  const getSignalDisplay = (signal: string): string => {
    const signalMap: Record<string, string> = {
      bullish_crossover: '金叉',
      bearish_crossover: '死叉',
      bullish: '看涨',
      bearish: '看跌',
      neutral: '中性',
    };
    return signalMap[signal] || signal;
  };

  return (
    <CollapsibleSection
      title={`MACD (指数平滑异同移动平均线)`}
      signal={getSignalDisplay(macd.signal)}
      signalType={getSignalType(macd.signal)}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">MACD 线</p>
            <p className="text-white font-semibold">{macd.currentMacd.toFixed(4)}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">信号线</p>
            <p className="text-white font-semibold">{macd.currentSignal.toFixed(4)}</p>
          </div>
          <div className={`bg-slate-900 rounded-lg p-3 text-center ${macd.currentHistogram >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <p className="text-slate-400 text-xs mb-1">柱状图</p>
            <p className="font-semibold">{macd.currentHistogram >= 0 ? '+' : ''}{macd.currentHistogram.toFixed(4)}</p>
          </div>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis hide />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <ReferenceLine y={0} stroke="#64748b" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                formatter={(value: number, name: string) => {
                  const nameMap: Record<string, string> = {
                    macd: 'MACD线',
                    signal: '信号线',
                  };
                  return [value?.toFixed(4) || '-', nameMap[name] || name];
                }}
              />
              <Line
                type="monotone"
                dataKey="macd"
                name="MACD线"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="signal"
                name="信号线"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis hide />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <ReferenceLine y={0} stroke="#64748b" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                formatter={(value: number) => [value?.toFixed(4) || '-', '柱状图']}
              />
              <Bar dataKey="histogram" name="柱状图">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={(entry.histogram ?? 0) >= 0 ? '#22c55e' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500"></div>
            <span className="text-slate-400">MACD 线 ({macd.fastPeriod}EMA - {macd.slowPeriod}EMA)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-amber-500"></div>
            <span className="text-slate-400">信号线 ({macd.signalPeriod}EMA of MACD)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span className="text-slate-400">柱状图 {'>'} 0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            <span className="text-slate-400">柱状图 {'<'} 0</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">📊 指标说明</h4>
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              <strong className="text-white">MACD (指数平滑异同移动平均线)</strong> 由三条线组成：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-blue-400">MACD 线</strong>：{macd.fastPeriod} 日 EMA 与 {macd.slowPeriod} 日 EMA 的差值</li>
              <li><strong className="text-amber-400">信号线</strong>：MACD 线的 {macd.signalPeriod} 日 EMA</li>
              <li><strong className="text-white">柱状图</strong>：MACD 线与信号线的差值</li>
            </ul>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400">●</span>
                  <span className="font-medium text-white">金叉 (看涨信号)</span>
                </div>
                <p className="text-xs text-slate-400">
                  当 MACD 线上穿信号线时，柱状图由负转正。这通常预示着短期上涨趋势的开始。
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-400">●</span>
                  <span className="font-medium text-white">死叉 (看跌信号)</span>
                </div>
                <p className="text-xs text-slate-400">
                  当 MACD 线下穿信号线时，柱状图由正转负。这通常预示着短期下跌趋势的开始。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-slate-200">{macd.interpretation}</p>
        </div>
      </div>
    </CollapsibleSection>
  );
}

function SMASection({ sma }: { sma: SMAIndicator }) {
  const chartData = useMemo(() => {
    const dataPoints: Array<{
      index: number;
      sma10: number | null;
      sma30: number | null;
    }> = [];

    const length = Math.max(sma.sma10.length, sma.sma30.length);

    for (let i = 0; i < Math.min(length, 60); i++) {
      dataPoints.push({
        index: i,
        sma10: !isNaN(sma.sma10[i]) ? sma.sma10[i] : null,
        sma30: !isNaN(sma.sma30[i]) ? sma.sma30[i] : null,
      });
    }

    return dataPoints;
  }, [sma]);

  const getSignalType = (signal: string): 'bullish' | 'bearish' | 'neutral' => {
    if (signal === 'golden_cross' || signal === 'bullish') return 'bullish';
    if (signal === 'death_cross' || signal === 'bearish') return 'bearish';
    return 'neutral';
  };

  const getSignalDisplay = (signal: string): string => {
    const signalMap: Record<string, string> = {
      golden_cross: '黄金交叉',
      death_cross: '死亡交叉',
      bullish: '看涨',
      bearish: '看跌',
      neutral: '中性',
    };
    return signalMap[signal] || signal;
  };

  const getTrendDisplay = (trend: string): string => {
    const trendMap: Record<string, string> = {
      bullish: '上涨趋势',
      bearish: '下跌趋势',
      sideways: '震荡整理',
    };
    return trendMap[trend] || trend;
  };

  const getTrendColor = (trend: string): string => {
    const colorMap: Record<string, string> = {
      bullish: 'text-green-400',
      bearish: 'text-red-400',
      sideways: 'text-slate-400',
    };
    return colorMap[trend] || 'text-slate-400';
  };

  return (
    <CollapsibleSection
      title={`SMA (简单移动平均线)`}
      signal={getSignalDisplay(sma.signal)}
      signalType={getSignalType(sma.signal)}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">SMA10 (10日均线)</p>
            <p className="text-green-400 font-semibold">{sma.currentSma10 ? `$${sma.currentSma10.toFixed(2)}` : '-'}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">SMA30 (30日均线)</p>
            <p className="text-amber-400 font-semibold">{sma.currentSma30 ? `$${sma.currentSma30.toFixed(2)}` : '-'}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">当前趋势</p>
            <p className={`font-semibold ${getTrendColor(sma.trend)}`}>{getTrendDisplay(sma.trend)}</p>
          </div>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis hide />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                formatter={(value: number, name: string) => {
                  const nameMap: Record<string, string> = {
                    sma10: 'SMA10 (10日)',
                    sma30: 'SMA30 (30日)',
                  };
                  return [value ? `$${value.toFixed(2)}` : '-', nameMap[name] || name];
                }}
              />
              <Line
                type="monotone"
                dataKey="sma10"
                name="SMA10"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                connectNulls
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="sma30"
                name="SMA30"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                connectNulls
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500" style={{ borderStyle: 'dashed' }}></div>
            <span className="text-slate-400">SMA10 (10日移动平均线)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-amber-500" style={{ borderStyle: 'dotted' }}></div>
            <span className="text-slate-400">SMA30 (30日移动平均线)</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">📊 指标说明</h4>
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              <strong className="text-white">移动平均线 (SMA)</strong> 是最常用的技术分析工具之一。它通过计算一定周期内价格的平均值来平滑价格波动，帮助识别趋势方向。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-green-400">SMA10</strong>：10 日简单移动平均线，反映短期趋势</li>
              <li><strong className="text-amber-400">SMA30</strong>：30 日简单移动平均线，反映中长期趋势</li>
            </ul>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400">●</span>
                  <span className="font-medium text-white">黄金交叉 (看涨)</span>
                </div>
                <p className="text-xs text-slate-400">
                  当短期均线 (SMA10) 从下方向上穿越长期均线 (SMA30) 时，称为"黄金交叉"。这通常是强烈的看涨信号，预示上涨趋势可能开始。
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-400">●</span>
                  <span className="font-medium text-white">死亡交叉 (看跌)</span>
                </div>
                <p className="text-xs text-slate-400">
                  当短期均线 (SMA10) 从上方向下穿越长期均线 (SMA30) 时，称为"死亡交叉"。这通常是强烈的看跌信号，预示下跌趋势可能开始。
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400">●</span>
                  <span className="font-medium text-white">多头排列</span>
                </div>
                <p className="text-xs text-slate-400">
                  当 SMA10 持续位于 SMA30 上方时，称为"多头排列"。这表明市场处于上涨趋势中，短期买盘力量强于长期。
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-400">●</span>
                  <span className="font-medium text-white">空头排列</span>
                </div>
                <p className="text-xs text-slate-400">
                  当 SMA10 持续位于 SMA30 下方时，称为"空头排列"。这表明市场处于下跌趋势中，短期卖盘力量强于长期。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-slate-200">{sma.interpretation}</p>
        </div>
      </div>
    </CollapsibleSection>
  );
}

export function TechnicalIndicatorsPanel({ indicators }: TechnicalIndicatorsPanelProps) {
  return (
    <div className="space-y-4">
      <RSISection rsi={indicators.rsi} />
      <MACDSection macd={indicators.macd} />
      <SMASection sma={indicators.sma} />
    </div>
  );
}

export default TechnicalIndicatorsPanel;
