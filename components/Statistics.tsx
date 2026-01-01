
import React, { useMemo } from 'react';
import { Ink, UsageRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface StatisticsProps {
  inks: Ink[];
  records: UsageRecord[];
}

const Statistics: React.FC<StatisticsProps> = ({ inks, records }) => {
  const stats = useMemo(() => {
    const totalUsage = records.reduce((acc, r) => acc + r.amount, 0);
    const inkUsageMap = records.reduce((acc, r) => {
      acc[r.inkId] = (acc[r.inkId] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);

    // Explicitly cast Object.entries to [string, number][] to ensure 'usage' is correctly inferred as a number
    const usageChartData = (Object.entries(inkUsageMap) as [string, number][])
      .map(([id, usage]) => {
        const ink = inks.find(i => i.id === id);
        return {
          name: ink?.name || '未知',
          brand: ink?.brand || '未知',
          usage,
          color: ink?.color || '#ccc'
        };
      })
      // Sorting usage values which are now correctly typed as numbers to fix subtraction errors
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);

    // Explicitly type the accumulator and cast entries to resolve "unknown" type errors during addition
    const brandUsageMap = (Object.entries(inkUsageMap) as [string, number][]).reduce((acc: Record<string, number>, [id, usage]) => {
      const ink = inks.find(i => i.id === id);
      if (ink) {
        acc[ink.brand] = (acc[ink.brand] || 0) + usage;
      }
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(brandUsageMap).map(([name, value]) => ({ name, value }));

    const favoriteInk = usageChartData[0] || null;

    return {
      totalUsage,
      usageChartData,
      pieData,
      favoriteInk
    };
  }, [inks, records]);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <span className="text-6xl mb-4">📉</span>
        <p>积累一些上墨记录后，这里将展示你的用墨偏好</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#d4c4a8] text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">累计书写用墨</p>
          <p className="text-4xl font-bold text-[#c9a66b]">{stats.totalUsage.toFixed(1)} <span className="text-sm">ml</span></p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#d4c4a8] text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">上墨频次</p>
          <p className="text-4xl font-bold text-[#c9a66b]">{records.length} <span className="text-sm">次</span></p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#d4c4a8] text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">最宠爱的墨水</p>
          <p className="text-xl font-bold text-[#c9a66b] truncate">
            {stats.favoriteInk ? stats.favoriteInk.name : '-'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Usage Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-[#d4c4a8]">
          <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span>🔥</span> TOP 10 使用排行
          </h4>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={stats.usageChartData} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '12px' }} />
                <Tooltip 
                  cursor={{ fill: '#f5f0e8' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 shadow-xl border border-gray-100 rounded-xl">
                          <p className="font-bold text-sm">{payload[0].payload.brand}</p>
                          <p className="text-xs">{payload[0].payload.name}</p>
                          <p className="text-[#c9a66b] font-bold mt-1">{payload[0].value}ml</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="usage" radius={[0, 10, 10, 0]} barSize={24}>
                  {stats.usageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-[#d4c4a8]">
          <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span>🏷️</span> 品牌使用分布
          </h4>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#c9a66b"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#c9a66b', '#8b6914', '#5a4030', '#d4c4a8', '#f5f0e8'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
