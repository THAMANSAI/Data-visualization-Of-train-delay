import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Database, Settings, Calculator, Search, LineChart, LayoutDashboard } from 'lucide-react';

const FlowStep = ({ icon: Icon, label, description, isLast = false }: { icon: any, label: string, description: string, isLast?: boolean }) => (
  <div className="flex items-center group">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-cyan group-hover:border-accent-cyan/50 group-hover:bg-accent-cyan/10 transition-all duration-500 shadow-lg group-hover:shadow-accent-cyan/20">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs font-black text-white uppercase tracking-widest">{label}</p>
        <p className="text-[9px] text-text-muted mt-1.5 max-w-[120px] leading-relaxed font-bold uppercase tracking-tighter">{description}</p>
      </div>
    </div>
    {!isLast && (
      <div className="mx-6 mb-16 text-white/10 group-hover:text-accent-cyan/30 transition-colors duration-500">
        <ArrowRight size={24} strokeWidth={3} />
      </div>
    )}
  </div>
);

export const SystemFlow = () => {
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <h3 className="text-sm font-black text-accent-cyan mb-10 flex items-center gap-3 uppercase tracking-[0.3em]">
        <Settings className="animate-spin-slow" size={18} />
        System Architecture
      </h3>
      <div className="flex justify-between min-w-[900px] px-4">
        <FlowStep icon={Database} label="Telemetry" description="Raw Sensor Ingestion" />
        <FlowStep icon={Settings} label="Processing" description="Vectorized Cleaning" />
        <FlowStep icon={Calculator} label="Synthesis" description="Feature Extraction" />
        <FlowStep icon={Calculator} label="Analysis" description="Variance Calculation" />
        <FlowStep icon={Search} label="Profiling" description="Statistical EDA" />
        <FlowStep icon={LineChart} label="Rendering" description="High-Fidelity Viz" />
        <FlowStep icon={LayoutDashboard} label="Interface" description="Real-time UI" isLast />
      </div>
    </div>
  );
};
