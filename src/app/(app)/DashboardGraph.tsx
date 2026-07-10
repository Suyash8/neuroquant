"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function DashboardGraph({ data }: { data: { date: string, velocity: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500">
        No performance data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#ffffff50" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(val) => {
            const date = new Date(val);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
        />
        <YAxis 
          stroke="#ffffff50" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(val) => `${(val / 1000).toFixed(1)}s`}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1C1F26', border: '1px solid #ffffff20', borderRadius: '8px' }}
          itemStyle={{ color: '#00FF9D' }}
          labelStyle={{ color: '#ffffff80', marginBottom: '4px' }}
          formatter={(value: any) => [`${(Number(value) / 1000).toFixed(2)}s`, 'Avg Velocity']}
          labelFormatter={(label) => new Date(label).toLocaleDateString()}
        />
        <Line 
          type="step" 
          dataKey="velocity" 
          stroke="#00FF9D" 
          strokeWidth={3} 
          dot={{ r: 4, fill: "#00FF9D", strokeWidth: 0 }} 
          activeDot={{ r: 6, fill: "#00FF9D" }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
