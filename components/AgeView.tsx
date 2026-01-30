import React from 'react';
import { YearlyResult } from '../types';
import { formatCurrency } from '../utils/calculations';
import { ChevronRight } from 'lucide-react';

interface AgeViewProps {
  data: YearlyResult[];
  onYearClick: (year: number) => void;
}

const AgeView: React.FC<AgeViewProps> = ({ data, onYearClick }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-void-800 text-void-700 text-xs tracking-wider uppercase">
            <th className="p-4 pl-6">年齡</th>
            <th className="p-4">經過年數</th>
            <th className="p-4 text-right">總投入本金</th>
            <th className="p-4 text-right">當年利息</th>
            <th className="p-4 text-right">總資產</th>
            <th className="p-4 text-right text-accent-400">實質購買力</th>
            <th className="p-4 text-center">狀態</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            if (row.year === 0) return null; // Skip year 0 for cleaner table
            return (
              <tr 
                key={row.year} 
                onClick={() => onYearClick(row.year)}
                className={`border-b border-void-800/50 hover:bg-void-800/50 cursor-pointer transition-colors group
                  ${row.isRetirement ? 'hover:border-red-900/30' : 'hover:border-accent-500/30'}
                `}
              >
                <td className="p-4 pl-6 font-mono font-bold text-white text-lg">{row.age} <span className="text-xs text-void-700 font-sans font-normal">歲</span></td>
                <td className="p-4 text-void-700">{row.year} 年</td>
                <td className="p-4 text-right font-mono text-gray-400">{formatCurrency(row.totalInvested)}</td>
                <td className="p-4 text-right font-mono text-emerald-400/80">+{formatCurrency(row.interestEarnedYearly)}</td>
                <td className="p-4 text-right font-mono font-bold text-lg text-white group-hover:text-accent-400 transition-colors">{formatCurrency(row.totalAssets)}</td>
                <td className="p-4 text-right font-mono text-void-400">{formatCurrency(row.purchasingPower)}</td>
                <td className="p-4 text-center">
                  {row.isRetirement ? (
                    <span className="inline-block px-3 py-1 bg-red-950/50 text-red-300 text-[10px] rounded-full border border-red-900/30">
                      提領期
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-emerald-950/50 text-emerald-300 text-[10px] rounded-full border border-emerald-900/30">
                      累積期
                    </span>
                  )}
                </td>
                <td className="p-4 text-right text-void-800 group-hover:text-white transition-colors">
                    <ChevronRight size={16} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AgeView;