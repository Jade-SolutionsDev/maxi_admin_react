import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { salesData } from '@/data/mockData';
import { useTheme } from '../admin';

const timeFilters = ['7D', '30D', '3M', '1A'];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  const { theme:mode } = useTheme();
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-4 py-3 border"
        style={{
          backgroundColor: mode === 'dark' ? '#161D27' : '#FFFFFF',
          borderColor: mode === 'dark' ? '#1E293B' : '#E2E8F0',
          boxShadow: '0 10px 40px rgba(0,0,0,0.10)',
        }}
      >
        <p className="text-[12px] mb-1" style={{ color: '#94A3B8' }}>{label}</p>
        <p className="text-[16px] font-semibold" style={{ color: mode === 'dark' ? '#E2E8F0' : '#1E293B' }}>
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

export default function SalesChart() {
  const { theme:mode } = useTheme();
  const [activeFilter, setActiveFilter] = useState('1A');

  const textColor = mode === 'dark' ? '#64748B' : '#94A3B8';
  const gridColor = mode === 'dark' ? '#1E293B' : '#E2E8F0';

  return (
    <div
      className="rounded-2xl p-6 shadow-card"
      style={{ backgroundColor: mode === 'dark' ? '#161D27' : '#FFFFFF' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3
            className="text-[18px] font-semibold"
            style={{ color: mode === 'dark' ? '#E2E8F0' : '#1E293B' }}
          >
            Tendencia de Ventas
          </h3>
          <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>Últimos 12 meses</p>
        </div>
        <div className="flex gap-1">
          {timeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`
                px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150
                ${activeFilter === filter
                  ? 'bg-[#10B981] text-white'
                  : ''
                }
              `}
              style={{
                backgroundColor: activeFilter === filter ? '#10B981' : (mode === 'dark' ? '#1A2535' : '#F1F5F9'),
                color: activeFilter === filter ? '#FFFFFF' : (mode === 'dark' ? '#94A3B8' : '#64748B'),
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 12 }}
            tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
            dx={-8}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#10B981"
            strokeWidth={3}
            fill="url(#salesGradient)"
            dot={{ r: 4, fill: mode === 'dark' ? '#161D27' : '#FFFFFF', stroke: '#10B981', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#10B981', stroke: mode === 'dark' ? '#161D27' : '#FFFFFF', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
