import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle2, AlertTriangle, TrendingDown } from 'lucide-react';

interface KPIProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: any;
  color: string;
}

const KPICard = ({ label, value, subtext, icon: Icon, color, trend }: KPIProps & { trend?: number }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-slate-300 transition-all relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-slate-100 transition-all" />
    
    {/* Subtle progress bar at bottom */}
    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 1 }}
        className={`h-full ${color} opacity-20`}
      />
    </div>

    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
    
    <h3 className="text-slate-500 text-sm font-medium mb-1 relative z-10">{label}</h3>
    
    <div className="flex items-baseline gap-2 relative z-10">
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.1, y: -10, filter: 'blur(4px)' }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          className="text-3xl font-bold text-slate-900 inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <span className="text-xs text-slate-400">{subtext}</span>
    </div>

    {/* Subtle update pulse */}
    <motion.div
      key={`pulse-${value}`}
      initial={{ opacity: 0.5, scale: 0.8 }}
      animate={{ opacity: 0, scale: 1.5 }}
      transition={{ duration: 0.5 }}
      className={`absolute inset-0 ${color} opacity-0 pointer-events-none`}
    />
  </motion.div>
);

export const PerformanceKPIs = ({ data }: { data: any[] }) => {
  const stats = useMemo(() => {
    if (!data.length) return { avgDelay: 0, onTimeRate: 0, worstStation: 'N/A', peakHour: '00' };

    const avgDelay = Math.round(data.reduce((acc, curr) => acc + curr.Delay_Minutes, 0) / data.length);
    const onTimeRate = Math.round((data.filter(d => d.Delay_Minutes === 0).length / data.length) * 100);
    
    const stationDelays = data.reduce((acc: any, curr) => {
      acc[curr.Station_Name] = (acc[curr.Station_Name] || 0) + curr.Delay_Minutes;
      return acc;
    }, {});
    const worstStation = Object.entries(stationDelays).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A';

    const hourDelays = data.reduce((acc: any, curr) => {
      const arrival = curr.Scheduled_Arrival || curr.Arrival_Time;
      if (arrival && arrival.includes(' ')) {
        const hour = arrival.split(' ')[1]?.split(':')[0] || '00';
        acc[hour] = (acc[hour] || 0) + curr.Delay_Minutes;
      }
      return acc;
    }, {});
    const peakHour = Object.entries(hourDelays).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '00';

    return { avgDelay, onTimeRate, worstStation, peakHour };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard 
        label="Average Delay" 
        value={`${stats.avgDelay}m`} 
        subtext="system latency" 
        icon={Clock} 
        color="bg-cyan-500" 
        trend={12}
      />
      <KPICard 
        label="On-Time Rate" 
        value={`${stats.onTimeRate}%`} 
        subtext="reliability" 
        icon={CheckCircle2} 
        color="bg-emerald-500" 
        trend={-5}
      />
      <KPICard 
        label="Most Delayed" 
        value={stats.worstStation?.split(' ')[0] || 'N/A'} 
        subtext="bottleneck" 
        icon={AlertTriangle} 
        color="bg-amber-500" 
      />
      <KPICard 
        label="Peak Delay Hour" 
        value={`${stats.peakHour}:00`} 
        subtext="high traffic" 
        icon={TrendingDown} 
        color="bg-indigo-500" 
      />
    </div>
  );
};
