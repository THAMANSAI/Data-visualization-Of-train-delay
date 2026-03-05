import React from 'react';
import { TrainData } from '../data';

export const TrainDetailsTable = ({ data }: { data: TrainData[] }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-xl font-bold text-text-primary font-serif italic">Train Operations Details</h3>
        <p className="text-sm text-text-muted mt-1">Comprehensive log of train movements, station delays, and operational status.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-text-secondary font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">Train No.</th>
              <th className="px-6 py-4 whitespace-nowrap">Train Name</th>
              <th className="px-6 py-4 whitespace-nowrap">Station</th>
              <th className="px-6 py-4 whitespace-nowrap">Scheduled Arrival</th>
              <th className="px-6 py-4 whitespace-nowrap">Actual Arrival</th>
              <th className="px-6 py-4 whitespace-nowrap">Delay (Min)</th>
              <th className="px-6 py-4 whitespace-nowrap">Status</th>
              <th className="px-6 py-4 whitespace-nowrap">Cause</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-text-primary font-medium">{row.Train_ID}</td>
                <td className="px-6 py-4 text-text-primary font-medium">{row.Train_Name}</td>
                <td className="px-6 py-4 text-text-secondary">{row.Station_Name}</td>
                <td className="px-6 py-4 text-text-secondary tabular-nums">{row.Scheduled_Arrival}</td>
                <td className="px-6 py-4 text-text-secondary tabular-nums">{row.Actual_Arrival}</td>
                <td className={`px-6 py-4 font-bold tabular-nums ${row.Delay_Minutes > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {row.Delay_Minutes}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                    row.Delay_Minutes === 0 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : row.Delay_Minutes < 15 
                        ? 'bg-amber-50 text-amber-700 border-amber-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    {row.Delay_Minutes === 0 ? 'On Time' : 'Delayed'}
                  </span>
                </td>
                <td className="px-6 py-4 text-text-secondary text-xs">{row.Cause}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
