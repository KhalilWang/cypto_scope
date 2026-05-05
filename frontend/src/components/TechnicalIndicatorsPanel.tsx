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
import type {
  TechnicalIndicators,
  RSIIndicator,
  MACDIndicator,
  SMAIndicator,
  EMAIndicator,
  BollingerIndicator,
  KDJIndicator,
  CCIIndicator,
  ATRIndicator,
  OBVIndicator,
  WilliamsRIndicator,
  StochasticIndicator,
} from '../types';

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
  defaultOpen = false,
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

function getSignalType(signal: string): 'bullish' | 'bearish' | 'neutral' {
  const bullishSignals = ['oversold', 'bullish_crossover', 'golden_cross', 'bullish', 'lower_touch', 'high_volatility', 'bullish_divergence'];
  const bearishSignals = ['overbought', 'bearish_crossover', 'death_cross', 'bearish', 'upper_touch', 'squeeze', 'low_volatility', 'bearish_divergence', 'expanding'];
  if (bullishSignals.includes(signal)) return 'bullish';
  if (bearishSignals.includes(signal)) return 'bearish';
  return 'neutral';
}

function getSignalDisplay(signal: string): string {
  const signalMap: Record<string, string> = {
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
  return signalMap[signal] || signal;
}

function RSISection({ rsi }: { rsi: RSIIndicator }) {
  const [selectedPeriod, setSelectedPeriod] = useState<'rsi7' | 'rsi14' | 'rsi24'>('rsi14');

  const chartData = useMemo(() => {
    const selectedData = rsi[selectedPeriod];
    const validValues = selectedData.historicalValues.filter(v => !isNaN(v)).slice(-30);
    return validValues.map((value, index) => ({
      index,
      value: Math.round(value * 100) / 100,
    }));
  }, [rsi, selectedPeriod]);

  const getStatusColor = (signal: string) => {
    if (signal === 'overbought') return 'text-red-400 bg-red-400/10';
    if (signal === 'oversold') return 'text-green-400 bg-green-400/10';
    return 'text-slate-400 bg-slate-700';
  };

  const getStatusText = (signal: string) => {
    if (signal === 'overbought') return '超买';
    if (signal === 'oversold') return '超卖';
    return '中性';
  };

  return (
    <CollapsibleSection
      title={`RSI (相对强弱指数) - RSI7: ${rsi.rsi7.value.toFixed(2)} | RSI14: ${rsi.rsi14.value.toFixed(2)} | RSI24: ${rsi.rsi24.value.toFixed(2)}`}
      signal={getSignalDisplay(rsi.signal)}
      signalType={getSignalType(rsi.signal)}
      defaultOpen={true}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedPeriod('rsi7')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPeriod === 'rsi7'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-900 hover:border-slate-600'
            }`}
          >
            <div className="text-xs text-slate-400 mb-1">RSI7 (短期敏感)</div>
            <div className="text-xl font-bold text-white">{rsi.rsi7.value.toFixed(2)}</div>
            <div className={`mt-2 px-2 py-0.5 rounded-full text-xs inline-block ${getStatusColor(rsi.rsi7.signal)}`}>
              {getStatusText(rsi.rsi7.signal)}
            </div>
          </button>
          <button
            onClick={() => setSelectedPeriod('rsi14')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPeriod === 'rsi14'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-900 hover:border-slate-600'
            }`}
          >
            <div className="text-xs text-slate-400 mb-1">RSI14 (标准周期)</div>
            <div className="text-xl font-bold text-white">{rsi.rsi14.value.toFixed(2)}</div>
            <div className={`mt-2 px-2 py-0.5 rounded-full text-xs inline-block ${getStatusColor(rsi.rsi14.signal)}`}>
              {getStatusText(rsi.rsi14.signal)}
            </div>
          </button>
          <button
            onClick={() => setSelectedPeriod('rsi24')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPeriod === 'rsi24'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-900 hover:border-slate-600'
            }`}
          >
            <div className="text-xs text-slate-400 mb-1">RSI24 (长期平滑)</div>
            <div className="text-xl font-bold text-white">{rsi.rsi24.value.toFixed(2)}</div>
            <div className={`mt-2 px-2 py-0.5 rounded-full text-xs inline-block ${getStatusColor(rsi.rsi24.signal)}`}>
              {getStatusText(rsi.rsi24.signal)}
            </div>
          </button>
        </div>

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
                formatter={(value: number) => [`${value.toFixed(2)}`, selectedPeriod.toUpperCase()]}
              />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-red-500"></div><span className="text-slate-400">超买线 (70)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-green-500"></div><span className="text-slate-400">超卖线 (30)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-slate-500"></div><span className="text-slate-400">中轴线 (50)</span></div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-slate-400">当前显示：</span>
            <span className="text-blue-400 font-medium">{selectedPeriod.toUpperCase()}</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">📊 指标说明</h4>
          <div className="space-y-3 text-sm text-slate-300">
            <p><strong className="text-white">RSI (相对强弱指数)</strong> 是一种动量振荡器，通过计算一定周期内的平均上涨幅度和平均下跌幅度来衡量价格变动的速度和幅度。提供三个周期用于对比分析：</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2"><span className="text-cyan-400">●</span><span className="font-medium text-white">RSI7 - 短期敏感</span></div>
                <p className="text-xs text-slate-400">7 日周期，对价格变化更敏感，能更快捕捉短期趋势反转，但也更容易产生虚假信号。适合短线交易者。</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2"><span className="text-blue-400">●</span><span className="font-medium text-white">RSI14 - 标准周期</span></div>
                <p className="text-xs text-slate-400">14 日周期，Welles Wilder 发明的标准周期。在敏感性和稳定性之间取得平衡，是最常用的周期设置。</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2"><span className="text-purple-400">●</span><span className="font-medium text-white">RSI24 - 长期平滑</span></div>
                <p className="text-xs text-slate-400">24 日周期，更长的周期使信号更平滑，减少噪音，但滞后性也更强。适合中长线投资者判断主要趋势。</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2"><span className="text-green-400">●</span><span className="font-medium text-white">超卖区域 (≤ 30)</span></div>
                <p className="text-xs text-slate-400">通常被视为买入信号，表明价格可能被过度抛售，存在反弹机会。</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2"><span className="text-red-400">●</span><span className="font-medium text-white">超买区域 (≥ 70)</span></div>
                <p className="text-xs text-slate-400">通常被视为卖出信号，表明价格可能被过度买入，存在回调风险。</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2"><span className="text-blue-400">●</span><span className="font-medium text-white">多周期共振</span></div>
                <p className="text-xs text-slate-400">当 RSI7、RSI14、RSI24 同时进入超买/超卖区域时，信号更可靠。周期越大，趋势越强。</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border-l-4 border-blue-500">
              <p className="text-xs text-slate-300"><strong className="text-blue-400">参考提示：</strong> {rsi.reference.description}</p>
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
    const length = Math.max(macd.macdLine.length, macd.signalLine.length, macd.histogram.length);
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

  return (
    <CollapsibleSection
      title={`MACD (指数平滑异同移动平均线)`}
      signal={getSignalDisplay(macd.signal)}
      signalType={getSignalType(macd.signal)}
      defaultOpen={true}
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
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="macd" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="signal" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
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
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Bar dataKey="histogram">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={(entry.histogram ?? 0) >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">📊 指标说明</h4>
          <div className="space-y-3 text-sm text-slate-300">
            <p><strong className="text-blue-400">金叉条件：</strong> {macd.reference.crossoverCondition}</p>
            <p><strong className="text-red-400">柱状图解读：</strong> {macd.reference.histogramInterpretation}</p>
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
      sma50: number | null;
      sma200: number | null;
    }> = [];
    const length = Math.max(sma.sma10.length, sma.sma50.length, sma.sma200.length);
    for (let i = 0; i < Math.min(length, 60); i++) {
      dataPoints.push({
        index: i,
        sma10: !isNaN(sma.sma10[i]) ? sma.sma10[i] : null,
        sma50: !isNaN(sma.sma50[i]) ? sma.sma50[i] : null,
        sma200: !isNaN(sma.sma200[i]) ? sma.sma200[i] : null,
      });
    }
    return dataPoints;
  }, [sma]);

  return (
    <CollapsibleSection
      title={`SMA (简单移动平均线)`}
      signal={getSignalDisplay(sma.signal)}
      signalType={getSignalType(sma.signal)}
      defaultOpen={true}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">SMA5</p>
            <p className="text-green-400 font-semibold">{sma.currentSma5 ? `$${sma.currentSma5.toFixed(2)}` : '-'}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">SMA10</p>
            <p className="text-green-400 font-semibold">{sma.currentSma10 ? `$${sma.currentSma10.toFixed(2)}` : '-'}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">SMA20</p>
            <p className="text-amber-400 font-semibold">{sma.currentSma20 ? `$${sma.currentSma20.toFixed(2)}` : '-'}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">SMA50</p>
            <p className="text-orange-400 font-semibold">{sma.currentSma50 ? `$${sma.currentSma50.toFixed(2)}` : '-'}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">SMA100</p>
            <p className="text-red-400 font-semibold">{sma.currentSma100 ? `$${sma.currentSma100.toFixed(2)}` : '-'}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">SMA200</p>
            <p className="text-purple-400 font-semibold">{sma.currentSma200 ? `$${sma.currentSma200.toFixed(2)}` : '-'}</p>
          </div>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis hide />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="sma10" stroke="#22c55e" strokeWidth={2} dot={false} connectNulls name="SMA10" />
              <Line type="monotone" dataKey="sma50" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls name="SMA50" />
              <Line type="monotone" dataKey="sma200" stroke="#a855f7" strokeWidth={2} dot={false} connectNulls name="SMA200" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">📊 指标说明</h4>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong className="text-green-400">黄金交叉：</strong> {sma.reference.goldenCrossDescription}</p>
            <p><strong className="text-red-400">死亡交叉：</strong> {sma.reference.deathCrossDescription}</p>
            <p><strong className="text-purple-400">200日均线作用：</strong> {sma.reference.sma200Role}</p>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-slate-200">{sma.interpretation}</p>
        </div>
      </div>
    </CollapsibleSection>
  );
}

function EMASection({ ema }: { ema: EMAIndicator }) {
  const chartData = useMemo(() => {
    const dataPoints: Array<{
      index: number;
      ema12: number | null;
      ema26: number | null;
      ema50: number | null;
    }> = [];
    const length = Math.max(ema.ema12.length, ema.ema26.length, ema.ema50.length);
    for (let i = 0; i < Math.min(length, 60); i++) {
      dataPoints.push({
        index: i,
        ema12: !isNaN(ema.ema12[i]) ? ema.ema12[i] : null,
        ema26: !isNaN(ema.ema26[i]) ? ema.ema26[i] : null,
        ema50: !isNaN(ema.ema50[i]) ? ema.ema50[i] : null,
      });
    }
    return dataPoints;
  }, [ema]);

  return (
    <CollapsibleSection
      title={`EMA (指数移动平均线)`}
      signal={getSignalDisplay(ema.signal)}
      signalType={getSignalType(ema.signal)}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">EMA5</p>
            <p className="text-green-400 font-semibold">{ema.currentEma5 ? `$${ema.currentEma5.toFixed(2)}` : '-'}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">EMA12</p>
            <p className="text-blue-400 font-semibold">{ema.currentEma12 ? `$${ema.currentEma12.toFixed(2)}` : '-'}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">EMA20</p>
            <p className="text-amber-400 font-semibold">{ema.currentEma20 ? `$${ema.currentEma20.toFixed(2)}` : '-'}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">EMA26</p>
            <p className="text-orange-400 font-semibold">{ema.currentEma26 ? `$${ema.currentEma26.toFixed(2)}` : '-'}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">EMA50</p>
            <p className="text-red-400 font-semibold">{ema.currentEma50 ? `$${ema.currentEma50.toFixed(2)}` : '-'}</p>
          </div>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis hide />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="ema12" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls name="EMA12" />
              <Line type="monotone" dataKey="ema26" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls name="EMA26" />
              <Line type="monotone" dataKey="ema50" stroke="#ef4444" strokeWidth={2} dot={false} connectNulls name="EMA50" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">📊 指标说明</h4>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong className="text-blue-400">EMA 定义：</strong> {ema.reference.description}</p>
            <p><strong className="text-green-400">与 SMA 对比：</strong> {ema.reference.comparisonWithSMA}</p>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-slate-200">{ema.interpretation}</p>
        </div>
      </div>
    </CollapsibleSection>
  );
}

function BollingerSection({ bollinger }: { bollinger: BollingerIndicator }) {
  const chartData = useMemo(() => {
    const dataPoints: Array<{
      index: number;
      upper: number | null;
      middle: number | null;
      lower: number | null;
    }> = [];
    const length = Math.max(bollinger.upperBand.length, bollinger.middleBand.length, bollinger.lowerBand.length);
    for (let i = 0; i < Math.min(length, 60); i++) {
      dataPoints.push({
        index: i,
        upper: !isNaN(bollinger.upperBand[i]) ? bollinger.upperBand[i] : null,
        middle: !isNaN(bollinger.middleBand[i]) ? bollinger.middleBand[i] : null,
        lower: !isNaN(bollinger.lowerBand[i]) ? bollinger.lowerBand[i] : null,
      });
    }
    return dataPoints;
  }, [bollinger]);

  return (
    <CollapsibleSection
      title={`布林带 (Bollinger Bands)`}
      signal={getSignalDisplay(bollinger.signal)}
      signalType={getSignalType(bollinger.signal)}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">上轨</p>
            <p className="text-red-400 font-semibold">{bollinger.currentUpper ? `$${bollinger.currentUpper.toFixed(2)}` : '-'}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">中轨 (SMA20)</p>
            <p className="text-blue-400 font-semibold">{bollinger.currentMiddle ? `$${bollinger.currentMiddle.toFixed(2)}` : '-'}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">下轨</p>
            <p className="text-green-400 font-semibold">{bollinger.currentLower ? `$${bollinger.currentLower.toFixed(2)}` : '-'}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">带宽</p>
            <p className="text-purple-400 font-semibold">{bollinger.currentBandWidth ? `${(bollinger.currentBandWidth * 100).toFixed(2)}%` : '-'}</p>
          </div>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis hide />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="upper" stroke="#ef4444" strokeWidth={1} dot={false} connectNulls name="上轨" />
              <Line type="monotone" dataKey="middle" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls name="中轨" />
              <Line type="monotone" dataKey="lower" stroke="#22c55e" strokeWidth={1} dot={false} connectNulls name="下轨" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">📊 指标说明</h4>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong className="text-purple-400">收缩（Squeeze）：</strong> {bollinger.reference.squeezeDescription}</p>
            <p><strong className="text-green-400">触及解读：</strong> {bollinger.reference.touchInterpretation}</p>
            <p><strong className="text-blue-400">带宽意义：</strong> {bollinger.reference.bandWidthMeaning}</p>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-slate-200">{bollinger.interpretation}</p>
        </div>
      </div>
    </CollapsibleSection>
  );
}

function KDJSection({ kdj }: { kdj: KDJIndicator }) {
  const chartData = useMemo(() => {
    const dataPoints: Array<{
      index: number;
      k: number | null;
      d: number | null;
      j: number | null;
    }> = [];
    const length = Math.max(kdj.k.length, kdj.d.length, kdj.j.length);
    for (let i = 0; i < Math.min(length, 40); i++) {
      dataPoints.push({
        index: i,
        k: !isNaN(kdj.k[i]) ? kdj.k[i] : null,
        d: !isNaN(kdj.d[i]) ? kdj.d[i] : null,
        j: !isNaN(kdj.j[i]) ? kdj.j[i] : null,
      });
    }
    return dataPoints;
  }, [kdj]);

  return (
    <CollapsibleSection
      title={`KDJ (随机指标)`}
      signal={getSignalDisplay(kdj.signal)}
      signalType={getSignalType(kdj.signal)}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">K 值</p>
            <p className="text-blue-400 font-semibold">{kdj.currentK.toFixed(2)}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">D 值</p>
            <p className="text-amber-400 font-semibold">{kdj.currentD.toFixed(2)}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">J 值</p>
            <p className="text-purple-400 font-semibold">{kdj.currentJ.toFixed(2)}</p>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis hide />
              <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="5 5" />
              <ReferenceLine y={20} stroke="#22c55e" strokeDasharray="5 5" />
              <ReferenceLine y={50} stroke="#64748b" strokeDasharray="3 3" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="k" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls name="K线" />
              <Line type="monotone" dataKey="d" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls name="D线" />
              <Line type="monotone" dataKey="j" stroke="#a855f7" strokeWidth={1} dot={false} connectNulls name="J线" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">📊 指标说明</h4>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong className="text-green-400">超卖区域 (≤ 20)：</strong> 可能反弹</p>
            <p><strong className="text-red-400">超买区域 (≥ 80)：</strong> 可能回调</p>
            <p><strong className="text-blue-400">金叉/死叉：</strong> {kdj.reference.crossInterpretation}</p>
            <p><strong className="text-purple-400">J 值意义：</strong> {kdj.reference.jValueMeaning}</p>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-slate-200">{kdj.interpretation}</p>
        </div>
      </div>
    </CollapsibleSection>
  );
}

function CCISection({ cci }: { cci: CCIIndicator }) {
  const chartData = useMemo(() => {
    const validValues = cci.values.filter(v => !isNaN(v)).slice(-30);
    return validValues.map((value, index) => ({
      index,
      value: Math.round(value * 100) / 100,
    }));
  }, [cci.values]);

  return (
    <CollapsibleSection
      title={`CCI (顺势指标) - 当前值: ${cci.currentValue.toFixed(2)}`}
      signal={getSignalDisplay(cci.signal)}
      signalType={getSignalType(cci.signal)}
    >
      <div className="space-y-6">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis hide />
              <YAxis domain={[-200, 200]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="5 5" />
              <ReferenceLine y={-100} stroke="#22c55e" strokeDasharray="5 5" />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">📊 指标说明</h4>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong className="text-red-400">超买区域 (≥ +100)：</strong> 可能回调</p>
            <p><strong className="text-green-400">超卖区域 (≤ -100)：</strong> 可能反弹</p>
            <p><strong className="text-blue-400">零线穿越：</strong> {cci.reference.zeroLineCross}</p>
            <p><strong className="text-purple-400">周期意义：</strong> {cci.reference.periodMeaning}</p>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-slate-200">{cci.interpretation}</p>
        </div>
      </div>
    </CollapsibleSection>
  );
}

function ATRSection({ atr }: { atr: ATRIndicator }) {
  const chartData = useMemo(() => {
    const validValues = atr.values.filter(v => !isNaN(v)).slice(-30);
    return validValues.map((value, index) => ({
      index,
      value: Math.round(value * 10000) / 10000,
    }));
  }, [atr.values]);

  return (
    <CollapsibleSection
      title={`ATR (平均真实波幅) - 当前值: ${atr.currentValue.toFixed(4)} (${atr.atrPercentage.toFixed(2)}%)`}
      signal={getSignalDisplay(atr.signal)}
      signalType={getSignalType(atr.signal)}
    >
      <div className="space-y-6">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis hide />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">📊 指标说明</h4>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong className="text-amber-400">ATR 定义：</strong> {atr.reference.description}</p>
            <p><strong className="text-blue-400">交易应用：</strong> {atr.reference.usageInTrading}</p>
            <p><strong className="text-green-400">止损参考：</strong> {atr.reference.stopLossReference}</p>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-slate-200">{atr.interpretation}</p>
        </div>
      </div>
    </CollapsibleSection>
  );
}

function OBVSection({ obv }: { obv: OBVIndicator }) {
  const chartData = useMemo(() => {
    const validValues = obv.values.filter(v => !isNaN(v)).slice(-30);
    return validValues.map((value, index) => ({
      index,
      value,
    }));
  }, [obv.values]);

  return (
    <CollapsibleSection
      title={`OBV (能量潮)`}
      signal={getSignalDisplay(obv.signal)}
      signalType={getSignalType(obv.signal)}
    >
      <div className="space-y-6">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis hide />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">📊 指标说明</h4>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong className="text-green-400">OBV 定义：</strong> {obv.reference.description}</p>
            <p><strong className="text-blue-400">背离解读：</strong> {obv.reference.divergenceInterpretation}</p>
            <p><strong className="text-purple-400">趋势确认：</strong> {obv.reference.confirmationMeaning}</p>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-slate-200">{obv.interpretation}</p>
        </div>
      </div>
    </CollapsibleSection>
  );
}

function WilliamsRSection({ williamsR }: { williamsR: WilliamsRIndicator }) {
  const chartData = useMemo(() => {
    const validValues = williamsR.values.filter(v => !isNaN(v)).slice(-30);
    return validValues.map((value, index) => ({
      index,
      value: Math.round(value * 100) / 100,
    }));
  }, [williamsR.values]);

  return (
    <CollapsibleSection
      title={`威廉指标 (%R) - 当前值: ${williamsR.currentValue.toFixed(2)}`}
      signal={getSignalDisplay(williamsR.signal)}
      signalType={getSignalType(williamsR.signal)}
    >
      <div className="space-y-6">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis hide />
              <YAxis domain={[-100, 0]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <ReferenceLine y={-20} stroke="#ef4444" strokeDasharray="5 5" />
              <ReferenceLine y={-80} stroke="#22c55e" strokeDasharray="5 5" />
              <ReferenceLine y={-50} stroke="#64748b" strokeDasharray="3 3" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">📊 指标说明</h4>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong className="text-red-400">超买区域 (≥ -20)：</strong> 可能回调</p>
            <p><strong className="text-green-400">超卖区域 (≤ -80)：</strong> 可能反弹</p>
            <p><strong className="text-purple-400">与随机指标对比：</strong> {williamsR.reference.comparisonWithStochastic}</p>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-slate-200">{williamsR.interpretation}</p>
        </div>
      </div>
    </CollapsibleSection>
  );
}

function StochasticSection({ stoch }: { stoch: StochasticIndicator }) {
  const chartData = useMemo(() => {
    const dataPoints: Array<{
      index: number;
      k: number | null;
      d: number | null;
    }> = [];
    const length = Math.max(stoch.k.length, stoch.d.length);
    for (let i = 0; i < Math.min(length, 40); i++) {
      dataPoints.push({
        index: i,
        k: !isNaN(stoch.k[i]) ? stoch.k[i] : null,
        d: !isNaN(stoch.d[i]) ? stoch.d[i] : null,
      });
    }
    return dataPoints;
  }, [stoch]);

  return (
    <CollapsibleSection
      title={`慢速随机指标 (Slow Stochastic)`}
      signal={getSignalDisplay(stoch.signal)}
      signalType={getSignalType(stoch.signal)}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">%K (快线)</p>
            <p className="text-blue-400 font-semibold">{stoch.currentK.toFixed(2)}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs mb-1">%D (慢线)</p>
            <p className="text-amber-400 font-semibold">{stoch.currentD.toFixed(2)}</p>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis hide />
              <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="5 5" />
              <ReferenceLine y={20} stroke="#22c55e" strokeDasharray="5 5" />
              <ReferenceLine y={50} stroke="#64748b" strokeDasharray="3 3" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="k" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls name="%K" />
              <Line type="monotone" dataKey="d" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls name="%D" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">📊 指标说明</h4>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong className="text-red-400">超买区域 (≥ 80)：</strong> 可能回调</p>
            <p><strong className="text-green-400">超卖区域 (≤ 20)：</strong> 可能反弹</p>
            <p><strong className="text-blue-400">金叉/死叉：</strong> {stoch.reference.crossInterpretation}</p>
            <p><strong className="text-purple-400">与快速随机指标对比：</strong> {stoch.reference.vsFastStochastic}</p>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-slate-200">{stoch.interpretation}</p>
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
      <EMASection ema={indicators.ema} />
      <BollingerSection bollinger={indicators.bollinger} />
      <KDJSection kdj={indicators.kdj} />
      <CCISection cci={indicators.cci} />
      <ATRSection atr={indicators.atr} />
      <OBVSection obv={indicators.obv} />
      <WilliamsRSection williamsR={indicators.williamsR} />
      <StochasticSection stoch={indicators.stoch} />
    </div>
  );
}

export default TechnicalIndicatorsPanel;
