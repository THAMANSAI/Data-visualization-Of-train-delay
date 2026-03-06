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
      whileHover={{ translateY: -4, scale: 1.02 }}
      className="glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col justify-between group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-accent-cyan/10 transition-colors duration-700" />
      
      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col">
          <span className="metadata-xs text-accent-cyan mb-1">{label}</span>
          <div className="flex items-baseline gap-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="metric-value"
              >
                {value}
              </motion.span>
            </AnimatePresence>
            {unit && <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">{unit}</span>}
          </div>
        </div>
        
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-linear-to-br ${gradient} neon-glow`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{subtext}</span>
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black font-mono border ${
            isPositiveTrend 
              ? 'text-accent-cyan border-accent-cyan/20 bg-accent-cyan/5' 
              : 'text-accent-rose border-accent-rose/20 bg-accent-rose/5'
          }`}>
            {trendDirection === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}%
          </div>
        )}
      </div>
    </motion.div>
  );
};
