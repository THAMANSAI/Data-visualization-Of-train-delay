import React from 'react';
import { TrainData } from '../data';

export const TrainDetailsTable = ({ data }: { data: TrainData[] }) => {
  return (
    <div className="glass-panel rounded-[2rem] overflow-hidden">
      <div className="p-8 border-b border-white/5 bg-white/5">
        <h3 className="text-2xl font-black text-white uppercase tracking-widest italic">Operations Log</h3>
        <p className="text-sm text-text-secondary mt-2 font-medium">Real-time telemetry and schedule adherence data.</p>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-white/5 text-accent-cyan font-black uppercase tracking-widest text-[10px] border-b border-white/10">
            <tr>
              <th className="px-8 py-5 whitespace-nowrap">Unit ID</th>
              <th className="px-8 py-5 whitespace-nowrap">Designation</th>
              <th className="px-8 py-5 whitespace-nowrap">Node</th>
              <th className="px-8 py-5 whitespace-nowrap">ETA</th>
              <th className="px-8 py-5 whitespace-nowrap">ATA</th>
              <th className="px-8 py-5 whitespace-nowrap">Variance</th>
              <th className="px-8 py-5 whitespace-nowrap">Status</th>
              <th className="px-8 py-5 whitespace-nowrap">Telemetry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-white/5 transition-all duration-300 group">
                <td className="px-8 py-5 font-mono text-white font-black group-hover:text-accent-cyan transition-colors">{row.Train_ID}</td>
                <td className="px-8 py-5 text-white font-bold">{row.Train_Name}</td>
                <td className="px-8 py-5 text-text-secondary font-medium">{row.Station_Name}</td>
                <td className="px-8 py-5 text-text-secondary tabular-nums font-mono">{row.Scheduled_Arrival}</td>
                <td className="px-8 py-5 text-text-secondary tabular-nums font-mono">{row.Actual_Arrival}</td>
                <td className={`px-8 py-5 font-black font-mono tabular-nums ${row.Delay_Minutes > 0 ? 'text-accent-rose' : 'text-accent-cyan'}`}>
                  {row.Delay_Minutes}m
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    row.Delay_Minutes === 0 
                      ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20' 
                      : row.Delay_Minutes < 15 
                        ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' 
                        : 'bg-accent-rose/10 text-accent-rose border-accent-rose/20'
                  }`}>
                    {row.Delay_Minutes === 0 ? 'Nominal' : 'Critical'}
                  </span>
                </td>
                <td className="px-8 py-5 text-text-muted text-[10px] font-bold uppercase tracking-tighter">{row.Cause}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
