import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Database, Settings, Calculator, Search, LineChart, LayoutDashboard } from 'lucide-react';

const FlowStep = ({ icon: Icon, label, description, isLast = false }: { icon: any, label: string, description: string, isLast?: boolean }) => (
  <div className="flex items-center group">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover:border-blue-300 transition-colors shadow-sm">
        <Icon size={24} />
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-[10px] text-slate-500 mt-1 max-w-[100px] leading-tight">{description}</p>
      </div>
    </div>
    {!isLast && (
      <div className="mx-4 mb-12 text-slate-300">
        <ArrowRight size={20} />
      </div>
    )}
  </div>
);

export const SystemFlow = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 overflow-x-auto shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-8 flex items-center gap-2">
        <Settings className="text-blue-600" size={20} />
        System Flow Architecture
      </h3>
      <div className="flex justify-between min-w-[800px]">
        <FlowStep icon={Database} label="Data Source" description="Raw CSV/API train logs" />
        <FlowStep icon={Settings} label="Data Cleaning" description="Pandas preprocessing" />
        <FlowStep icon={Calculator} label="Feature Eng." description="Time-delta extraction" />
        <FlowStep icon={Calculator} label="Delay Calc." description="Actual vs Scheduled" />
        <FlowStep icon={Search} label="EDA" description="Statistical profiling" />
        <FlowStep icon={LineChart} label="Viz Engine" description="Plotly/D3 generation" />
        <FlowStep icon={LayoutDashboard} label="Dashboard" description="Interactive UI" isLast />
      </div>
    </div>
  );
};
