import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { TrainData } from '../data';
import { motion } from 'motion/react';
import { Activity, Clock, Users, Heart } from 'lucide-react';

interface KPIProps {
  data: TrainData[];
}

const Gauge = ({ value, label, icon: Icon, color, unit = '%' }: { value: number, label: string, icon: any, color: string, unit?: string }) => {
  const chartData = [
    { name: 'Value', value: value },
    { name: 'Remaining', value: Math.max(0, 100 - value) },
  ];

  return (
    <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          style={{ backgroundColor: color }}
        />
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
          <Icon size={20} style={{ color: color }} />
        </div>
        <span className="text-xs font-black text-text-secondary uppercase tracking-[0.2em]">{label}</span>
      </div>

      <div className="w-full h-44 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={65}
              outerRadius={85}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} className="drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
              <Cell fill="rgba(255,255,255,0.05)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-4xl font-black text-white font-mono tracking-tighter"
            style={{ textShadow: `0 0 20px ${color}40` }}
          >
            {Math.round(value)}{unit}
          </motion.span>
        </div>
      </div>
    </div>
  );
};

export const StrategicKPIs = ({ data }: KPIProps) => {
  const metrics = useMemo(() => {
    const onTimeCount = data.filter(d => d.Delay_Minutes === 0).length;
    const onTimeRate = (onTimeCount / data.length) * 100;
    
    const avgDelay = data.reduce((acc, curr) => acc + curr.Delay_Minutes, 0) / data.length;
    // Normalize delay to a 0-100 scale where 0 delay = 100 score
    const delayScore = Math.max(0, 100 - (avgDelay * 2));
    
    const totalCapacity = data.reduce((acc, curr) => acc + curr.Capacity, 0);
    const totalPassengers = data.reduce((acc, curr) => acc + curr.Passenger_Count, 0);
    const utilization = (totalPassengers / totalCapacity) * 100;
    
    const avgSatisfaction = data.reduce((acc, curr) => acc + curr.Satisfaction, 0) / data.length;

    return {
      onTimeRate,
      delayScore,
      avgDelay,
      utilization,
      avgSatisfaction
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Gauge 
        value={metrics.onTimeRate} 
        label="Network Health" 
        icon={Activity} 
        color="#00D1FF" 
      />
      <Gauge 
        value={metrics.delayScore} 
        label="Punctuality Index" 
        icon={Clock} 
        color="#BF5AF2" 
      />
      <Gauge 
        value={metrics.utilization} 
        label="System Capacity" 
        icon={Users} 
        color="#FFB800" 
      />
      <Gauge 
        value={metrics.avgSatisfaction} 
        label="User Satisfaction" 
        icon={Heart} 
        color="#FF2D55" 
      />
    </div>
  );
};
