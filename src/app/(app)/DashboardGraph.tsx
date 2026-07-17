"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function DashboardGraph({ data }: { data: { date: string, velocity: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-zinc-500 font-medium">
        No performance data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#ffffff40" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false} 
          tickMargin={10}
          tickFormatter={(val) => {
            const date = new Date(val);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
        />
        <YAxis 
          stroke="#ffffff40" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false} 
          tickMargin={10}
          tickFormatter={(val) => `${(val / 1000).toFixed(1)}s`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(24, 24, 27, 0.8)', 
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            padding: '12px'
          }}
          itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
          labelStyle={{ color: '#a1a1aa', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          formatter={(value: any) => [`${(Number(value) / 1000).toFixed(2)}s`, 'Avg Velocity']}
          labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        />
        <Area 
          type="monotone" 
          dataKey="velocity" 
          stroke="#3b82f6" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorVelocity)"
          activeDot={{ r: 6, fill: "#3b82f6", stroke: "#18181b", strokeWidth: 2 }} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
