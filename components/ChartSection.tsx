import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { YearlyResult } from '../types';
import { formatCompact, formatCurrency } from '../utils/calculations';

interface ChartSectionProps {
  data: YearlyResult[];
  retirementYear: number;
}

const ChartSection: React.FC<ChartSectionProps> = ({ data, retirementYear }) => {
  return (
    <div className="w-full h-[400px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="year" 
            stroke="#94a3b8" 
            label={{ value: '年份', position: 'insideBottomRight', offset: -5, fill: '#94a3b8' }} 
          />
          <YAxis 
            stroke="#94a3b8" 
            tickFormatter={(val) => formatCompact(val)}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
            itemStyle={{ color: '#e2e8f0' }}
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => `第 ${label} 年 (Age ${data[label]?.age})`}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Area
            type="monotone"
            dataKey="totalInvested"
            name="投入本金"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorInvested)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="totalAssets"
            name="總資產 (複利後)"
            stroke="#6366f1"
            fillOpacity={1}
            fill="url(#colorTotal)"
            strokeWidth={3}
          />
          
          {retirementYear > 0 && retirementYear < data.length && (
            <ReferenceLine 
              x={retirementYear} 
              stroke="#f43f5e" 
              strokeDasharray="5 5" 
              label={{ position: 'top', value: '退休/提領開始', fill: '#f43f5e', fontSize: 12 }} 
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartSection;