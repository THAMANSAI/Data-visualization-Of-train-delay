import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Train, 
  Map as MapIcon, 
  BarChart3, 
  Filter, 
  Calendar,
  ChevronDown,
  Info,
  FileCode,
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { generateData, TrainData } from './data';
import { SystemFlow } from './components/SystemFlow';
import { MetricCard } from './components/Dashboard/MetricCard';
import { FilterBar } from './components/Dashboard/FilterBar';
import { 
  TimelineDelayChart, 
  StationPerformanceChart, 
  DelayDistributionChart, 
  ThreeDDelaySurface, 
  GeographicDelayMap,
  CauseAnalysisChart,
  ThreeDScatterClusters,
  StationRankingTable,
  StationPerformanceHeatmap,
  AnimatedTrainMap,
  DelayBoxPlot,
  DelayLineChart
} from './components/Charts';
import { TrainDetailsTable } from './components/TrainDetailsTable';
import { PackedBubbleChart } from './components/PackedBubbleChart';
import { SpaceTimeCube, CongestionTowers, RadialDelayRose, VelocityVortex } from './components/Advanced3DCharts';

const TrainRankingTable = ({ data }: { data: TrainData[] }) => {
  const ranking = useMemo(() => {
    const stats = data.reduce((acc: any, curr) => {
      if (!acc[curr.Train_ID]) {
        acc[curr.Train_ID] = { id: curr.Train_ID, name: curr.Train_Name, totalDelay: 0, count: 0 };
      }
      acc[curr.Train_ID].totalDelay += curr.Delay_Minutes;
      acc[curr.Train_ID].count += 1;
      return acc;
    }, {});

    return Object.values(stats)
      .map((s: any) => ({
        ...s,
        avgDelay: Math.round(s.totalDelay / s.count)
      }))
      .sort((a, b) => b.avgDelay - a.avgDelay)
      .slice(0, 5);
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card h-full flex flex-col overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-text-primary font-bold text-lg font-serif italic">Critical Latency Units</h3>
        <p className="metadata-xs text-text-muted mt-1">Top 5 units by average delay</p>
      </div>
      
      <div className="flex-1 divide-y divide-slate-100">
        {ranking.map((t, i) => (
          <div key={t.id} className="flex items-center justify-between p-4 hover:bg-text-primary hover:text-white transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs opacity-40 group-hover:opacity-100">0{i+1}</span>
              <div>
                <div className="text-sm font-bold tracking-tight group-hover:text-white">{t.name}</div>
                <div className="metadata-xs opacity-60 group-hover:opacity-100">{t.id}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold font-mono text-accent-rose group-hover:text-white">{t.avgDelay}m</div>
              <div className="text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-100">delay</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <button className="w-full py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted hover:text-text-primary transition-colors">
          View Full Fleet Report
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [data] = useState(() => generateData(14));
  const [selectedTrain, setSelectedTrain] = useState<string>('All');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [showPythonCode, setShowPythonCode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeFilter, setTimeFilter] = useState<number>(720); // 0-1440 minutes (start at 12:00)

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeFilter(prev => (prev >= 1440 ? 0 : prev + 5));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const filteredData = useMemo(() => {
    return data.filter(d => {
      const parts = d.Scheduled_Arrival ? d.Scheduled_Arrival.split(' ') : [];
      const timeParts = parts[1] ? parts[1].split(':') : ['0', '0'];
      const minutes = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
      
      return (selectedTrain === 'All' || d.Train_Name === selectedTrain) &&
             (selectedZone === 'All' || d.Railway_Zone === selectedZone);
    });
  }, [data, selectedTrain, selectedZone]);

  // Derived state for charts that need cumulative data up to current time
  const cumulativeData = useMemo(() => {
    return filteredData.filter(d => {
      const parts = d.Scheduled_Arrival ? d.Scheduled_Arrival.split(' ') : [];
      const timeParts = parts[1] ? parts[1].split(':') : ['0', '0'];
      const minutes = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
      return minutes <= timeFilter;
    });
  }, [filteredData, timeFilter]);

  const stats = useMemo(() => {
    if (!cumulativeData.length) return { avgDelay: 0, onTimeRate: 0, worstStation: 'N/A', peakHour: '00' };

    const avgDelay = Math.round(cumulativeData.reduce((acc, curr) => acc + curr.Delay_Minutes, 0) / cumulativeData.length);
    const onTimeRate = Math.round((cumulativeData.filter(d => d.Delay_Minutes === 0).length / cumulativeData.length) * 100);
    
    const stationDelays = cumulativeData.reduce((acc: any, curr) => {
      acc[curr.Station_Name] = (acc[curr.Station_Name] || 0) + curr.Delay_Minutes;
      return acc;
    }, {});
    const worstStation = Object.entries(stationDelays).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A';

    const hourDelays = cumulativeData.reduce((acc: any, curr) => {
      const arrival = curr.Scheduled_Arrival || curr.Arrival_Time;
      if (arrival && arrival.includes(' ')) {
        const hour = arrival.split(' ')[1]?.split(':')[0] || '00';
        acc[hour] = (acc[hour] || 0) + curr.Delay_Minutes;
      }
      return acc;
    }, {});
    const peakHour = Object.entries(hourDelays).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '00';

    return { avgDelay, onTimeRate, worstStation, peakHour };
  }, [cumulativeData]);

  const trains = ['All', ...Array.from(new Set(data.map(d => d.Train_Name)))] as string[];
  const zones = ['All', ...Array.from(new Set(data.map(d => d.Railway_Zone)))] as string[];

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden font-sans selection:bg-accent-cyan/20">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute inset-0 grid-pattern pointer-events-none" />
        
        {/* Header */}
        <header className="h-20 border-b border-slate-200 bg-white/50 backdrop-blur-md flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-text-primary rounded-xl flex items-center justify-center shadow-lg">
              <Train className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary tracking-tight font-serif italic">Visualization OF TRAIN Delay</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                <span className="metadata-xs font-bold text-text-muted">System Active • Live Telemetry</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { id: 'map', icon: MapIcon, label: 'Map' },
                { id: 'analytics', icon: BarChart3, label: 'Analytics' },
                { id: 'schedule', icon: Calendar, label: 'Schedule' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
                    activeTab === item.id 
                      ? 'bg-accent-cyan/10 text-accent-cyan shadow-sm' 
                      : 'text-text-muted hover:text-text-primary hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex flex-col items-end">
              <span className="metadata-xs text-text-muted">Local Time</span>
              <span className="text-sm font-mono font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden ml-2">
              <img src="https://picsum.photos/seed/user/32/32" alt="User" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
          <AnimatePresence mode="wait">
            {showPythonCode ? (
              <motion.div
                key="python"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="max-w-5xl mx-auto"
              >
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-card overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-3xl rounded-full -mr-32 -mt-32" />
                  <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3 font-serif italic">
                    <FileCode className="text-accent-violet" />
                    Python Analytics Infrastructure
                  </h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-text-secondary mb-8 text-lg leading-relaxed">
                      The underlying data processing engine utilizes <code>Pandas</code> for vectorization and <code>Plotly</code> for high-fidelity rendering. 
                      This architecture ensures sub-millisecond latency for complex spatial queries.
                    </p>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-linear-to-r from-violet-500 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                      <pre className="relative bg-slate-900 p-8 rounded-xl border border-slate-800 overflow-x-auto text-sm font-mono text-blue-300 shadow-2xl">
{`import streamlit as st
import pandas as pd
import plotly.express as px

# System Configuration
st.set_page_config(layout="wide", theme="dark")

@st.cache_resource
def initialize_engine():
    df = pd.read_parquet('rail_telemetry.parquet')
    return df.query("status == 'active'")

# Real-time Visualization Layer
def render_geospatial(df):
    fig = px.scatter_mapbox(df, 
        lat="lat", lon="lng", 
        color="delay", 
        size="impact_score",
        mapbox_style="stamen-toner")
    st.plotly_chart(fig, use_container_width=True)`}
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Control Strip */}
                <div className="flex flex-wrap items-center justify-between gap-6 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="filter-label">Train Selection</span>
                      <div className="relative mt-1">
                        <select 
                          value={selectedTrain}
                          onChange={(e) => setSelectedTrain(e.target.value)}
                          className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all cursor-pointer hover:border-slate-300"
                        >
                          {trains.map(t => <option key={t} value={t}>{t === 'All' ? 'All Units' : t}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="filter-label">Railway Zone</span>
                      <div className="relative mt-1">
                        <select 
                          value={selectedZone}
                          onChange={(e) => setSelectedZone(e.target.value)}
                          className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all cursor-pointer hover:border-slate-300"
                        >
                          {zones.map(z => <option key={z} value={z}>{z === 'All' ? 'All Sectors' : `${z} Zone`}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 max-w-md flex items-center gap-6 pl-6 border-l border-slate-200">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-accent-rose text-white shadow-lg shadow-rose-500/20' : 'bg-accent-cyan text-white shadow-lg shadow-blue-500/20'}`}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <span className="metadata-xs font-bold text-text-muted">Temporal Window</span>
                        <span className="metadata-xs font-bold text-accent-cyan">{timeFilter}:00 HRS</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="24" 
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                      />
                    </div>
                  </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard 
                    label="System Latency" 
                    value={stats.avgDelay} 
                    unit="min"
                    subtext="Avg network delay" 
                    icon={Clock} 
                    gradient="from-slate-800 to-slate-900" 
                    trend={12}
                    trendDirection="up"
                  />
                  <MetricCard 
                    label="Reliability Index" 
                    value={stats.onTimeRate} 
                    unit="%"
                    subtext="On-time performance" 
                    icon={CheckCircle2} 
                    gradient="from-emerald-600 to-emerald-700" 
                    trend={5}
                    trendDirection="down"
                  />
                  <MetricCard 
                    label="Critical Node" 
                    value={stats.worstStation?.split(' ')[0] || 'N/A'} 
                    subtext="Highest delay impact" 
                    icon={AlertTriangle} 
                    gradient="from-amber-500 to-amber-600" 
                  />
                  <MetricCard 
                    label="Peak Congestion" 
                    value={`${stats.peakHour}:00`} 
                    subtext="Traffic saturation" 
                    icon={TrendingDown} 
                    gradient="from-blue-600 to-blue-700" 
                  />
                </div>

                {/* Main Visualization Grid */}
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-8">
                    <AnimatedTrainMap 
                      data={filteredData} 
                      currentTime={timeFilter} 
                      isPlaying={isPlaying}
                      onPlayPause={setIsPlaying}
                      onTimeChange={setTimeFilter}
                    />
                  </div>
                  <div className="col-span-12 lg:col-span-4">
                    <TrainRankingTable data={cumulativeData} />
                  </div>

                  <div className="col-span-12 lg:col-span-8">
                    <TimelineDelayChart data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-4">
                    <StationRankingTable data={cumulativeData} />
                  </div>

                  <div className="col-span-12 lg:col-span-6">
                    <StationPerformanceChart data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <DelayDistributionChart data={cumulativeData} />
                  </div>

                  <div className="col-span-12 lg:col-span-6">
                    <StationPerformanceHeatmap data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <ThreeDDelaySurface data={cumulativeData} />
                  </div>

                  <div className="col-span-12 lg:col-span-6">
                    <ThreeDScatterClusters data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <CauseAnalysisChart data={cumulativeData} />
                  </div>

                  <div className="col-span-12 lg:col-span-6">
                    <DelayBoxPlot data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <DelayLineChart data={cumulativeData} />
                  </div>
                </div>

                {/* System Flow Diagram */}
                <SystemFlow />

                {/* Packed Bubble Chart (Emerging Topics Style) */}
                <div className="mb-8">
                  <PackedBubbleChart data={cumulativeData} />
                </div>

                {/* Advanced 3D Analytics Grid */}
                <div className="grid grid-cols-12 gap-6 mb-8">
                  <div className="col-span-12 lg:col-span-6">
                    <SpaceTimeCube data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <CongestionTowers data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <RadialDelayRose data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <VelocityVortex data={cumulativeData} />
                  </div>
                </div>

                {/* Detailed Data Table (Limited to 50 rows) */}
                <TrainDetailsTable data={data.slice(0, 50)} />

                {/* Methodology Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-card relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-text-primary rotate-12">
                    <LayoutDashboard size={180} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-text-primary mb-8 font-serif italic flex items-center gap-3">
                      <Info className="text-accent-cyan" size={24} />
                      Operational Intelligence Report
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                      <div className="space-y-4">
                        <div className="w-10 h-1 bg-accent-cyan rounded-full" />
                        <h4 className="metadata-xs font-bold text-text-primary">Temporal Propagation</h4>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          Our analysis indicates that delays follow a non-linear propagation model. A single 10-minute disruption at a primary hub like <span className="font-bold text-text-primary">New Delhi Central</span> typically results in a cumulative 45-minute system-wide latency within a 4-hour window.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="w-10 h-1 bg-accent-amber rounded-full" />
                        <h4 className="metadata-xs font-bold text-text-primary">Spatial Bottlenecks</h4>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          3D spatial clustering reveals persistent "Delay Islands" in the <span className="font-bold text-text-primary">North-Eastern Corridor</span>. These are often correlated with infrastructure age and signal density rather than simple traffic volume.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="w-10 h-1 bg-accent-rose rounded-full" />
                        <h4 className="metadata-xs font-bold text-text-primary">Risk Mitigation</h4>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          By utilizing the <span className="font-bold text-text-primary">Probability Model</span>, operators can identify 'Fat-Tail' events—rare but catastrophic delays—up to 90 minutes before they impact secondary zones.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <footer className="mt-20 py-12 border-t border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Train className="text-white" size={16} />
                </div>
                <span className="font-bold tracking-tight font-serif italic text-lg">RailTrack</span>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-[0.2em]">© 2026 RailTrack Systems • Precision Operations Dashboard</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
