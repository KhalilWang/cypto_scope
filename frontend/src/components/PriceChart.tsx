import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PriceHistoryPoint } from '../types';
import { formatPrice, formatTimestamp } from '../utils/formatters';

interface PriceChartProps {
  priceHistory: PriceHistoryPoint[];
  sma10: number[];
  sma30: number[];
}

interface ChartDataPoint {
  timestamp: number;
  date: string;
  price: number;
  sma10: number | null;
  sma30: number | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
        <p className="text-slate-400 text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="text-white font-medium">
              {entry.name === '价格' ? formatPrice(entry.value) : entry.value?.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function PriceChart({ priceHistory, sma10, sma30 }: PriceChartProps) {
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const dataPoints = priceHistory.slice(-60);
    
    return dataPoints.map((point, index) => ({
      timestamp: point.timestamp,
      date: formatTimestamp(point.timestamp),
      price: point.price,
      sma10: !isNaN(sma10[index]) ? sma10[index] : null,
      sma30: !isNaN(sma30[index]) ? sma30[index] : null,
    }));
  }, [priceHistory, sma10, sma30]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-slate-400">
        暂无价格数据
      </div>
    );
  }

  const hasSma10 = chartData.some(d => d.sma10 !== null);
  const hasSma30 = chartData.some(d => d.sma30 !== null);

  return (
    <div className="w-full h-80 md:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#475569' }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#475569' }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => {
              if (value >= 1000) {
                return `$${(value / 1000).toFixed(1)}K`;
              }
              return `$${value.toFixed(0)}`;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => (
              <span className="text-slate-300 text-sm">{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="price"
            name="价格"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6' }}
          />
          {hasSma10 && (
            <Line
              type="monotone"
              dataKey="sma10"
              name="SMA10"
              stroke="#22c55e"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="5 5"
              connectNulls
            />
          )}
          {hasSma30 && (
            <Line
              type="monotone"
              dataKey="sma30"
              name="SMA30"
              stroke="#f59e0b"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="3 3"
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceChart;
