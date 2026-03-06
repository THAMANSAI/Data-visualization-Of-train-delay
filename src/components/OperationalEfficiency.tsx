import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  FunnelChart, Funnel, LabelList, Cell
} from 'recharts';
import Plot from 'react-plotly.js';
import { motion, AnimatePresence } from 'motion/react';
import { TrainData } from '../data';

interface ChartProps {
  data: TrainData[];
}

// 11. Capacity vs. Utilization
export const CapacityUtilization = ({ data }: ChartProps) => {
  const chartData = useMemo(() => {
    const hourly = Array.from({ length: 24 }, (_, i) => {
      const hourData = data.filter(d => d.Hour === i);
      const capacity = hourData.reduce((acc, curr) => acc + curr.Capacity, 0);
      const usage = hourData.reduce((acc, curr) => acc + curr.Passenger_Count, 0);
      return {
        hour: `${i}:00`,
        capacity,
        usage,
        utilization: capacity > 0 ? (usage / capacity) * 100 : 0
      };
    });
    return hourly;
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 font-serif italic">Capacity vs. Utilization</h3>
        <p className="text-xs text-slate-500 mt-1">System-wide passenger load vs. theoretical throughput.</p>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="capacity" stroke="#cbd5e1" fill="#f8fafc" name="Total Capacity" />
            <Area type="monotone" dataKey="usage" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name="Actual Usage" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 12. Station Performance Leaderboard (Animated)
export const StationLeaderboard = ({ data }: ChartProps) => {
  const [ranking, setRanking] = useState<any[]>([]);

  useEffect(() => {
    const stats = data.reduce((acc: any, curr) => {
      if (!acc[curr.Station_Name]) acc[curr.Station_Name] = { name: curr.Station_Name, score: 0, count: 0 };
      acc[curr.Station_Name].score += (100 - curr.Delay_Minutes);
      acc[curr.Station_Name].count += 1;
      return acc;
    }, {});

    const sorted = Object.values(stats)
      .map((s: any) => ({ ...s, avgScore: Math.round(s.score / s.count) }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 8);
    
    setRanking(sorted);
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 font-serif italic">Station Reliability Leaderboard</h3>
        <p className="text-xs text-slate-500 mt-1">Real-time ranking of top performing nodes by punctuality.</p>
      </div>
      <div className="flex-1 space-y-4">
        <AnimatePresence mode="popLayout">
          {ranking.map((item, i) => (
            <motion.div 
              key={item.name}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="flex items-center gap-4"
            >
              <span className="w-6 text-xs font-black text-slate-300">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">{item.name}</span>
                  <span className="text-xs font-mono text-slate-400">{item.avgScore}%</span>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.avgScore}%` }}
                    className={`h-full ${item.avgScore > 90 ? 'bg-emerald-500' : item.avgScore > 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// 13. Delay Reason Breakdown (Treemap)
export const DelayTreemap = ({ data }: ChartProps) => {
  const plotData = useMemo(() => {
    const zones = Array.from(new Set(data.map(d => d.Railway_Zone)));
    const labels: string[] = [];
    const parents: string[] = [];
    const values: number[] = [];

    zones.forEach(zone => {
      const zoneData = data.filter(d => d.Railway_Zone === zone);
      const zoneDelay = zoneData.reduce((acc, curr) => acc + curr.Delay_Minutes, 0);
      
      labels.push(zone);
      parents.push("");
      values.push(zoneDelay);

      const causes = Array.from(new Set(zoneData.map(d => d.Cause)));
      causes.forEach(cause => {
        const causeDelay = zoneData.filter(d => d.Cause === cause).reduce((acc, curr) => acc + curr.Delay_Minutes, 0);
        if (causeDelay > 0) {
          labels.push(`${zone} - ${cause}`);
          parents.push(zone);
          values.push(causeDelay);
        }
      });
    });

    return [{
      type: "treemap",
      labels,
      parents,
      values,
      textinfo: "label+value",
      marker: { colorscale: 'Blues' }
    }];
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 font-serif italic">Hierarchical Cause Distribution</h3>
        <p className="text-xs text-slate-500 mt-1">Treemap visualization of delay contributors by zone and category.</p>
      </div>
      <div className="flex-1 min-h-[300px]">
        <Plot
          data={plotData as any}
          layout={{
            autosize: true,
            height: 300,
            margin: { l: 0, r: 0, t: 0, b: 0 },
            paper_bgcolor: 'rgba(0,0,0,0)'
          }}
          config={{ responsive: true, displayModeBar: false }}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

// 14. Passenger Impact Metrics (Funnel Chart)
export const PassengerImpactFunnel = ({ data }: ChartProps) => {
  const funnelData = useMemo(() => {
    const total = data.reduce((acc, curr) => acc + curr.Passenger_Count, 0);
    const minor = data.filter(d => d.Delay_Minutes > 0 && d.Delay_Minutes <= 15).reduce((acc, curr) => acc + curr.Passenger_Count, 0);
    const significant = data.filter(d => d.Delay_Minutes > 15 && d.Delay_Minutes <= 60).reduce((acc, curr) => acc + curr.Passenger_Count, 0);
    const critical = data.filter(d => d.Delay_Minutes > 60).reduce((acc, curr) => acc + curr.Passenger_Count, 0);

    return [
      { value: total, name: 'Total Passengers', fill: '#6366f1' },
      { value: minor, name: 'Minor Delay (<15m)', fill: '#10b981' },
      { value: significant, name: 'Significant (15-60m)', fill: '#f59e0b' },
      { value: critical, name: 'Critical (>60m)', fill: '#f43f5e' },
    ];
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 font-serif italic">Passenger Impact Funnel</h3>
        <p className="text-xs text-slate-500 mt-1">Segmentation of user base affected by operational latency.</p>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip />
            <Funnel
              dataKey="value"
              data={funnelData}
              isAnimationActive
            >
              <LabelList position="right" fill="#64748b" stroke="none" dataKey="name" fontSize={10} />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 15. Schedule Adherence Gantt Chart
export const ScheduleGantt = ({ data }: ChartProps) => {
  const ganttData = useMemo(() => {
    const trains = Array.from(new Set(data.map(d => d.Train_ID))).slice(0, 10);
    return trains.map(id => {
      const trainData = data.filter(d => d.Train_ID === id).sort((a, b) => a.Scheduled_Arrival.localeCompare(b.Scheduled_Arrival));
      return {
        id,
        name: trainData[0].Train_Name,
        start: trainData[0].Hour,
        duration: trainData.length,
        delay: trainData.reduce((acc, curr) => acc + curr.Delay_Minutes, 0) / trainData.length
      };
    });
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 font-serif italic">Schedule Adherence Gantt</h3>
        <p className="text-xs text-slate-500 mt-1">Timeline view of individual train journeys vs. planned schedules.</p>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
        {ganttData.map((train, i) => (
          <div key={train.id} className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>{train.name}</span>
              <span>{Math.round(train.delay)}m avg delay</span>
            </div>
            <div className="h-4 bg-slate-50 rounded-full relative overflow-hidden">
              <motion.div 
                initial={{ width: 0, x: 0 }}
                animate={{ width: `${train.duration * 5}%`, x: `${train.start * 4}%` }}
                className={`h-full rounded-full ${train.delay > 30 ? 'bg-rose-400' : 'bg-indigo-400'}`}
              />
            </div>
          </div>
        ))}
        <div className="flex justify-between text-[8px] text-slate-300 font-mono pt-2">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:59</span>
        </div>
      </div>
    </div>
  );
};
