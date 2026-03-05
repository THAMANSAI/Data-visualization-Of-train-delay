import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendDirection?: 'up' | 'down';
  subtext: string;
  icon: LucideIcon;
  gradient: string;
}

export const MetricCard = ({ 
  label, 
  value, 
  unit, 
  trend, 
  trendDirection, 
  subtext, 
  icon: Icon, 
  gradient 
}: MetricCardProps) => {
  const isPositiveTrend = trendDirection === 'down'; // Down arrow is good for delays/latency
  
  return (
    <motion.div 
      whileHover={{ translateY: -2 }}
      className="min-h-[140px] bg-card-bg border border-slate-200 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:border-text-primary/10 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundImage: `linear-gradient(to bottom, ${gradient.split(' ')[1]}, ${gradient.split(' ')[3]})` }} />
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="metadata-xs text-text-muted mb-0.5">{label}</span>
          <div className="flex items-baseline gap-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={value}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold tracking-tighter text-text-primary font-mono"
              >
                {value}
              </motion.span>
            </AnimatePresence>
            {unit && <span className="text-sm font-bold text-text-muted uppercase tracking-widest">{unit}</span>}
          </div>
        </div>
        
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm bg-linear-to-br ${gradient}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] font-serif italic text-text-secondary">{subtext}</span>
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[10px] font-bold font-mono ${
            isPositiveTrend 
              ? 'text-accent-emerald' 
              : 'text-accent-rose'
          }`}>
            {trendDirection === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend}%
          </div>
        )}
      </div>
    </motion.div>
  );
};
