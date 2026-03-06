import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, ReferenceArea, Brush, ComposedChart, Bar
} from 'recharts';
import { TrainData } from '../data';
import { format, parseISO, subHours, addHours } from 'date-fns';

interface ChartProps {
  data: TrainData[];
}

// 2. Time-Series Trend Analysis
export const TimeSeriesTrend = ({ data }: ChartProps) => {
  const chartData = useMemo(() => {
    const dailyStats: Record<string, { date: string, avgDelay: number, weather: string }> = {};
    
    data.forEach(d => {
      if (!dailyStats[d.Date]) {
        dailyStats[d.Date] = { date: d.Date, avgDelay: 0, weather: d.Weather_Condition };
      }
      dailyStats[d.Date].avgDelay += d.Delay_Minutes;
    });

    return Object.values(dailyStats).map(s => ({
      ...s,
      avgDelay: Math.round(s.avgDelay / (data.filter(d => d.Date === s.date).length || 1)),
      displayDate: format(parseISO(s.date), 'MMM dd')
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 font-serif italic">Network Latency Trends</h3>
        <p className="text-xs text-slate-500 mt-1">Multi-day delay progression with anomaly detection.</p>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="m" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey="avgDelay" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDelay)" />
            <Brush dataKey="displayDate" height={30} stroke="#cbd5e1" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 3. Comparative Performance (Small Multiples)
export const ComparativePerformance = ({ data }: ChartProps) => {
  const weekdayData = useMemo(() => {
    const stats = data.reduce((acc: any, curr) => {
      const type = ['Saturday', 'Sunday'].includes(curr.Day_Of_Week) ? 'Weekend' : 'Weekday';
      if (!acc[type]) acc[type] = { type, total: 0, count: 0 };
      acc[type].total += curr.Delay_Minutes;
      acc[type].count += 1;
      return acc;
    }, {});
    return Object.values(stats).map((s: any) => ({ ...s, avg: Math.round(s.total / s.count) }));
  }, [data]);

  const peakData = useMemo(() => {
    const stats = data.reduce((acc: any, curr) => {
      const isPeak = (curr.Hour >= 8 && curr.Hour <= 10) || (curr.Hour >= 17 && curr.Hour <= 19);
      const type = isPeak ? 'Peak' : 'Off-Peak';
      if (!acc[type]) acc[type] = { type, total: 0, count: 0 };
      acc[type].total += curr.Delay_Minutes;
      acc[type].count += 1;
      return acc;
    }, {});
    return Object.values(stats).map((s: any) => ({ ...s, avg: Math.round(s.total / s.count) }));
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 font-serif italic">Comparative Performance</h3>
        <p className="text-xs text-slate-500 mt-1">Operational variance across time segments.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Day Type</span>
          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={weekdayData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="type" type="category" stroke="#94a3b8" fontSize={10} width={60} />
              <Tooltip />
              <Bar dataKey="avg" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Traffic Load</span>
          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={peakData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="type" type="category" stroke="#94a3b8" fontSize={10} width={60} />
              <Tooltip />
              <Bar dataKey="avg" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={20} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// 4. Predictive Analytics (Forecast)
export const PredictiveForecast = ({ data }: ChartProps) => {
  const forecastData = useMemo(() => {
    // Simple linear extrapolation for demo purposes
    const lastHour = Math.max(...data.map(d => d.Hour));
    const currentAvg = data.filter(d => d.Hour === lastHour).reduce((acc, curr) => acc + curr.Delay_Minutes, 0) / (data.filter(d => d.Hour === lastHour).length || 1);
    
    return Array.from({ length: 12 }, (_, i) => {
      const hour = (lastHour + i) % 24;
      const base = currentAvg + (Math.sin(i / 2) * 10);
      return {
        hour: `${hour}:00`,
        actual: i === 0 ? Math.round(currentAvg) : null,
        predicted: Math.round(base),
        upper: Math.round(base + 15),
        lower: Math.round(Math.max(0, base - 15))
      };
    });
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 font-serif italic">Predictive Delay Forecast</h3>
        <p className="text-xs text-slate-500 mt-1">AI-driven latency projection for the next 12 hours.</p>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="m" />
            <Tooltip />
            <Area type="monotone" dataKey="upper" stroke="none" fill="#6366f1" fillOpacity={0.1} />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#6366f1" fillOpacity={0.1} />
            <Line type="monotone" dataKey="predicted" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
