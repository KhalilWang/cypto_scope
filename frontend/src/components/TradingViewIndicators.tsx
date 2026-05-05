import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
  ComposedChart,
  Area,
  Cell,
} from 'recharts';
import type {
  TechnicalIndicators,
  RSIIndicator,
  MACDIndicator,
  SMAIndicator,
  BollingerIndicator,
  KDJIndicator,
  CCIIndicator,
  ATRIndicator,
  PriceHistoryPoint,
  TimeRange,
} from '../types';
import { TIME_RANGE_OPTIONS } from '../services/api';

interface TradingViewIndicatorsProps {
  indicators: TechnicalIndicators;
  priceHistory: PriceHistoryPoint[];
}

type IndicatorKey = 'rsi' | 'macd' | 'sma' | 'bollinger' | 'kdj' | 'cci' | 'atr' | 'none';

function formatTimestamp(ts: number, timeRange: TimeRange): string {
  const date = new Date(ts);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  if (timeRange === '15m') {
    return `${hours}:${minutes}`;
  } else if (timeRange === '1h' || timeRange === '4h') {
    return `${hours}:00`;
  } else if (timeRange === '1d') {
    return `${month}/${day} ${hours}:00`;
  } else {
    return `${month}/${day}`;
  }
}

function getStatusColor(signal: string): string {
  const bullishSignals = ['oversold', 'bullish_crossover', 'golden_cross', 'bullish', 'lower_touch', 'high_volatility', 'bullish_divergence'];
  const bearishSignals = ['overbought', 'bearish_crossover', 'death_cross', 'bearish', 'upper_touch', 'squeeze', 'low_volatility', 'bearish_divergence', 'expanding'];
  
  if (bullishSignals.includes(signal)) return 'text-green-400';
  if (bearishSignals.includes(signal)) return 'text-red-400';
  return 'text-slate-400';
}

function getStatusBg(signal: string): string {
  const bullishSignals = ['oversold', 'bullish_crossover', 'golden_cross', 'bullish', 'lower_touch', 'high_volatility', 'bullish_divergence'];
  const bearishSignals = ['overbought', 'bearish_crossover', 'death_cross', 'bearish', 'upper_touch', 'squeeze', 'low_volatility', 'bearish_divergence', 'expanding'];
  
  if (bullishSignals.includes(signal)) return 'bg-green-500/10 border-green-500/30';
  if (bearishSignals.includes(signal)) return 'bg-red-500/10 border-red-500/30';
  return 'bg-slate-700 border-slate-600';
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

export function TradingViewIndicators({ indicators, priceHistory }: TradingViewIndicatorsProps) {
  const [activeIndicator, setActiveIndicator] = useState<IndicatorKey>('none');
  const [showSingleView, setShowSingleView] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const getPointsForTimeRange = (range: TimeRange): number => {
    const rangePoints: Record<TimeRange, number> = {
      '15m': 48,
      '1h': 24,
      '4h': 42,
      '1d': 7,
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };
    return rangePoints[range] || 30;
  };

  const priceChartData = useMemo(() => {
    const points = getPointsForTimeRange(timeRange);
    return priceHistory.slice(-points).map((point) => ({
      timestamp: point.timestamp,
      date: formatTimestamp(point.timestamp, timeRange),
      price: Math.round(point.price * 100) / 100,
      volume: point.volume,
    }));
  }, [priceHistory, timeRange]);

  const rsiChartData = useMemo(() => {
    const rsi14Data = indicators.rsi.rsi14.historicalValues.filter(v => !isNaN(v)).slice(-30);
    const rsi7Data = indicators.rsi.rsi7.historicalValues.filter(v => !isNaN(v)).slice(-30);
    const rsi24Data = indicators.rsi.rsi24.historicalValues.filter(v => !isNaN(v)).slice(-30);
    
    const minLength = Math.min(rsi7Data.length, rsi14Data.length, rsi24Data.length);
    
    return Array.from({ length: minLength }, (_, i) => ({
      index: i,
      rsi7: Math.round(rsi7Data[i] * 100) / 100,
      rsi14: Math.round(rsi14Data[i] * 100) / 100,
      rsi24: Math.round(rsi24Data[i] * 100) / 100,
    }));
  }, [indicators.rsi]);

  const macdChartData = useMemo(() => {
    const length = Math.min(indicators.macd.macdLine.length, indicators.macd.signalLine.length, indicators.macd.histogram.length);
    const data = [];
    
    for (let i = Math.max(0, length - 30); i < length; i++) {
      const macdVal = indicators.macd.macdLine[i];
      const signalVal = indicators.macd.signalLine[i];
      const histVal = indicators.macd.histogram[i];
      
      if (!isNaN(macdVal) && !isNaN(signalVal) && !isNaN(histVal)) {
        data.push({
          index: data.length,
          macd: Math.round(macdVal * 10000) / 10000,
          signal: Math.round(signalVal * 10000) / 10000,
          histogram: Math.round(histVal * 10000) / 10000,
        });
      }
    }
    
    return data;
  }, [indicators.macd]);

  const bollingerChartData = useMemo(() => {
    const upperValid = indicators.bollinger.upperBand.filter(v => !isNaN(v)).slice(-30);
    const middleValid = indicators.bollinger.middleBand.filter(v => !isNaN(v)).slice(-30);
    const lowerValid = indicators.bollinger.lowerBand.filter(v => !isNaN(v)).slice(-30);
    const priceValid = priceHistory.slice(-upperValid.length);
    
    const minLength = Math.min(upperValid.length, middleValid.length, lowerValid.length, priceValid.length);
    
    return Array.from({ length: minLength }, (_, i) => ({
      index: i,
      upper: Math.round(upperValid[i] * 100) / 100,
      middle: Math.round(middleValid[i] * 100) / 100,
      lower: Math.round(lowerValid[i] * 100) / 100,
      price: priceValid[i] ? Math.round(priceValid[i].price * 100) / 100 : 0,
    }));
  }, [indicators.bollinger, priceHistory]);

  const kdjChartData = useMemo(() => {
    const kValid = indicators.kdj.k.filter(v => !isNaN(v)).slice(-30);
    const dValid = indicators.kdj.d.filter(v => !isNaN(v)).slice(-30);
    const jValid = indicators.kdj.j.filter(v => !isNaN(v)).slice(-30);
    
    const minLength = Math.min(kValid.length, dValid.length, jValid.length);
    
    return Array.from({ length: minLength }, (_, i) => ({
      index: i,
      k: Math.round(kValid[i] * 100) / 100,
      d: Math.round(dValid[i] * 100) / 100,
      j: Math.round(jValid[i] * 100) / 100,
    }));
  }, [indicators.kdj]);

  const cciChartData = useMemo(() => {
    const cciValid = indicators.cci.values.filter(v => !isNaN(v)).slice(-30);
    
    return cciValid.map((value, index) => ({
      index,
      cci: Math.round(value * 100) / 100,
    }));
  }, [indicators.cci]);

  const atrChartData = useMemo(() => {
    const atrValid = indicators.atr.values.filter(v => !isNaN(v)).slice(-30);
    
    return atrValid.map((value, index) => ({
      index,
      atr: Math.round(value * 10000) / 10000,
    }));
  }, [indicators.atr]);

  const indicatorCards = [
    {
      key: 'rsi' as IndicatorKey,
      name: 'RSI',
      title: '相对强弱指数',
      value: indicators.rsi.value.toFixed(2),
      signal: indicators.rsi.signal,
      extra: `RSI7: ${indicators.rsi.rsi7.value.toFixed(2)} | RSI14: ${indicators.rsi.rsi14.value.toFixed(2)} | RSI24: ${indicators.rsi.rsi24.value.toFixed(2)}`,
    },
    {
      key: 'macd' as IndicatorKey,
      name: 'MACD',
      title: '指数平滑异同移动平均线',
      value: indicators.macd.currentMacd.toFixed(4),
      signal: indicators.macd.signal,
      extra: `柱状图: ${indicators.macd.currentHistogram >= 0 ? '+' : ''}${indicators.macd.currentHistogram.toFixed(4)}`,
    },
    {
      key: 'sma' as IndicatorKey,
      name: 'SMA',
      title: '简单移动平均线',
      value: indicators.sma.currentSma20 ? `$${indicators.sma.currentSma20.toFixed(2)}` : '-',
      signal: indicators.sma.signal,
      extra: `SMA10: ${indicators.sma.currentSma10 ? '$' + indicators.sma.currentSma10.toFixed(2) : '-'} | SMA50: ${indicators.sma.currentSma50 ? '$' + indicators.sma.currentSma50.toFixed(2) : '-'}`,
    },
    {
      key: 'bollinger' as IndicatorKey,
      name: '布林带',
      title: 'Bollinger Bands',
      value: indicators.bollinger.currentBandWidth ? `${(indicators.bollinger.currentBandWidth).toFixed(2)}%` : '-',
      signal: indicators.bollinger.signal,
      extra: `上轨: ${indicators.bollinger.currentUpper ? '$' + indicators.bollinger.currentUpper.toFixed(2) : '-'} | 下轨: ${indicators.bollinger.currentLower ? '$' + indicators.bollinger.currentLower.toFixed(2) : '-'}`,
    },
    {
      key: 'kdj' as IndicatorKey,
      name: 'KDJ',
      title: '随机指标',
      value: `K: ${indicators.kdj.currentK.toFixed(1)}`,
      signal: indicators.kdj.signal,
      extra: `D: ${indicators.kdj.currentD.toFixed(1)} | J: ${indicators.kdj.currentJ.toFixed(1)}`,
    },
    {
      key: 'cci' as IndicatorKey,
      name: 'CCI',
      title: '顺势指标',
      value: indicators.cci.currentValue.toFixed(1),
      signal: indicators.cci.signal,
      extra: `周期: ${indicators.cci.period}`,
    },
    {
      key: 'atr' as IndicatorKey,
      name: 'ATR',
      title: '平均真实波幅',
      value: indicators.atr.currentValue.toFixed(4),
      signal: indicators.atr.signal,
      extra: `波动率: ${indicators.atr.atrPercentage.toFixed(2)}%`,
    },
  ];

  const renderActiveChart = () => {
    switch (activeIndicator) {
      case 'rsi':
        return (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rsiChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis hide />
                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" />
                <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="5 5" />
                <ReferenceLine y={50} stroke="#64748b" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="linear" dataKey="rsi7" stroke="#06b6d4" strokeWidth={1.5} dot={false} name="RSI7" />
                <Line type="linear" dataKey="rsi14" stroke="#3b82f6" strokeWidth={2} dot={false} name="RSI14" />
                <Line type="linear" dataKey="rsi24" stroke="#a855f7" strokeWidth={1.5} dot={false} name="RSI24" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case 'macd':
        return (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={macdChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis hide />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <ReferenceLine y={0} stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="histogram" name="柱状图" opacity={0.6}>
                  {macdChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.histogram >= 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
                <Line type="linear" dataKey="macd" stroke="#3b82f6" strokeWidth={2} dot={false} name="MACD线" />
                <Line type="linear" dataKey="signal" stroke="#f59e0b" strokeWidth={2} dot={false} name="信号线" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );
      case 'bollinger':
        return (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bollingerChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis hide />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`]}
                />
                <Legend />
                <Line type="linear" dataKey="upper" stroke="#ef4444" strokeWidth={1} dot={false} name="上轨" />
                <Line type="linear" dataKey="middle" stroke="#3b82f6" strokeWidth={2} dot={false} name="中轨" />
                <Line type="linear" dataKey="lower" stroke="#22c55e" strokeWidth={1} dot={false} name="下轨" />
                <Line type="linear" dataKey="price" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="价格" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case 'kdj':
        return (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kdjChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis hide />
                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="5 5" />
                <ReferenceLine y={20} stroke="#22c55e" strokeDasharray="5 5" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="linear" dataKey="k" stroke="#3b82f6" strokeWidth={2} dot={false} name="K线" />
                <Line type="linear" dataKey="d" stroke="#f59e0b" strokeWidth={2} dot={false} name="D线" />
                <Line type="linear" dataKey="j" stroke="#a855f7" strokeWidth={1.5} dot={false} name="J线" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case 'cci':
        return (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cciChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis hide />
                <YAxis domain={[-200, 200]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="5 5" />
                <ReferenceLine y={-100} stroke="#22c55e" strokeDasharray="5 5" />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="linear" dataKey="cci" stroke="#3b82f6" strokeWidth={2} dot={false} name="CCI" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case 'atr':
        return (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={atrChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis hide />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                />
                <Legend />
                <Area type="linear" dataKey="atr" stroke="#f59e0b" fill="#f59e0b20" strokeWidth={2} name="ATR" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return (
          <div className="h-56 flex items-center justify-center">
            <p className="text-slate-400">点击上方指标卡片查看详细图表</p>
          </div>
        );
    }
  };

  if (showSingleView) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">技术指标详情</h3>
          <button
            onClick={() => setShowSingleView(false)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
          >
            ← 返回综合视图
          </button>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          {renderActiveChart()}
        </div>
        {activeIndicator !== 'none' && (
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <h4 className="text-white font-medium">
                {indicatorCards.find(c => c.key === activeIndicator)?.title}
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusBg(indicators[activeIndicator].signal)} ${getStatusColor(indicators[activeIndicator].signal)}`}>
                {getSignalDisplay(indicators[activeIndicator].signal)}
              </span>
            </div>
            <div className="text-slate-300 text-sm">
              {indicators[activeIndicator].interpretation}
            </div>
          </div>
        )}
      </div>
    );
  }

  const getTimeRangeLabel = () => {
    const option = TIME_RANGE_OPTIONS.find(o => o.key === timeRange);
    return option ? option.label : '30天';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">技术指标总览 (TradingView 风格)</h3>
        <button
          onClick={() => setShowSingleView(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          查看详细指标
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h4 className="text-white font-medium">价格走势 (最近 {getTimeRangeLabel()})</h4>
          <div className="flex flex-wrap gap-1 bg-slate-900 rounded-lg p-1">
            {TIME_RANGE_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => setTimeRange(option.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  timeRange === option.key
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, '价格']}
              />
              <Line type="linear" dataKey="price" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="价格" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {indicatorCards.map((card) => (
          <button
            key={card.key}
            onClick={() => setActiveIndicator(activeIndicator === card.key ? 'none' : card.key)}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              activeIndicator === card.key
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-750'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">{card.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusBg(card.signal)} ${getStatusColor(card.signal)}`}>
                {getSignalDisplay(card.signal)}
              </span>
            </div>
            <div className="text-lg font-bold text-white">{card.value}</div>
            <div className="text-xs text-slate-400 mt-1 truncate" title={card.extra}>
              {card.extra}
            </div>
          </button>
        ))}
      </div>

      {activeIndicator !== 'none' && (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">
              {indicatorCards.find(c => c.key === activeIndicator)?.title}
            </h4>
            <button
              onClick={() => setShowSingleView(true)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              查看详情 →
            </button>
          </div>
          {renderActiveChart()}
        </div>
      )}

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h4 className="text-white font-medium mb-3">信号汇总</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-900 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-green-400 text-sm font-medium">看涨信号</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {indicatorCards
                .filter(c => ['oversold', 'bullish_crossover', 'golden_cross', 'bullish', 'lower_touch', 'high_volatility', 'bullish_divergence'].includes(c.signal))
                .map(c => (
                  <span key={c.key} className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded">
                    {c.name}
                  </span>
                ))}
              {indicatorCards.filter(c => ['oversold', 'bullish_crossover', 'golden_cross', 'bullish', 'lower_touch', 'high_volatility', 'bullish_divergence'].includes(c.signal)).length === 0 && (
                <span className="text-slate-500 text-xs">暂无看涨信号</span>
              )}
            </div>
          </div>
          <div className="bg-slate-900 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-red-400 text-sm font-medium">看跌信号</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {indicatorCards
                .filter(c => ['overbought', 'bearish_crossover', 'death_cross', 'bearish', 'upper_touch', 'squeeze', 'low_volatility', 'bearish_divergence', 'expanding'].includes(c.signal))
                .map(c => (
                  <span key={c.key} className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded">
                    {c.name}
                  </span>
                ))}
              {indicatorCards.filter(c => ['overbought', 'bearish_crossover', 'death_cross', 'bearish', 'upper_touch', 'squeeze', 'low_volatility', 'bearish_divergence', 'expanding'].includes(c.signal)).length === 0 && (
                <span className="text-slate-500 text-xs">暂无看跌信号</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TradingViewIndicators;
