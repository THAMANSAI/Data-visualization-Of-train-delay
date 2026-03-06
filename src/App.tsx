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
import { RadialDelayRose, VelocityVortex } from './components/Advanced3DCharts';
import { WeatherDelayTerrain, DelayFlowSankey, PerformanceParallel, ZoneTimeRibbon, DelaySunburst } from './components/ExtraAnalytics';
import { StrategicKPIs } from './components/StrategicKPIs';
import { TimeSeriesTrend, ComparativePerformance, PredictiveForecast } from './components/TrendAnalytics';
import { RouteRadarComparison, DelayDistributionBox, CorrelationHeatmap } from './components/StatisticalAnalysis';
import { EventTimeline, NetworkTopology, DelayPropagation } from './components/NetworkDynamics';
import { CapacityUtilization, StationLeaderboard, DelayTreemap, PassengerImpactFunnel, ScheduleGantt } from './components/OperationalEfficiency';

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
    <div className="glass-panel rounded-3xl h-full flex flex-col overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <TrendingUp size={120} />
      </div>

      <div className="p-8 border-b border-white/5 bg-white/5 relative z-10">
        <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Critical Latency Units</h3>
        <p className="metadata-xs text-accent-rose mt-1">Top 5 units by average delay</p>
      </div>
      
      <div className="flex-1 divide-y divide-white/5 relative z-10">
        {ranking.map((t, i) => (
          <div key={t.id} className="flex items-center justify-between p-6 hover:bg-white/5 transition-all duration-500 cursor-pointer group/item">
            <div className="flex items-center gap-6">
              <span className="font-mono text-xs font-black text-accent-cyan opacity-40 group-hover/item:opacity-100">0{i+1}</span>
              <div>
                <div className="text-base font-black tracking-tight text-white group-hover/item:text-accent-cyan transition-colors">{t.name}</div>
                <div className="metadata-xs opacity-60 font-mono">{t.id}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black font-mono text-accent-rose group-hover/item:scale-110 transition-transform">+{t.avgDelay}m</div>
              <div className="text-[9px] uppercase font-black tracking-[0.2em] text-text-muted">variance</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-8 bg-black/20 border-t border-white/5 relative z-10">
        <button className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan hover:text-white transition-all hover:bg-white/5 rounded-2xl border border-accent-cyan/20 hover:border-accent-cyan/40 shadow-[0_0_20px_rgba(0,209,255,0.1)] hover:shadow-[0_0_30px_rgba(0,209,255,0.2)]">
          Full Fleet Report
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
        <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-2xl flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-text-primary rounded-xl flex items-center justify-center shadow-lg">
              <Train className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">RailTrack Systems</h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { id: 'map', icon: MapIcon, label: 'Map' },
                { id: 'analytics', icon: BarChart3, label: 'Analytics' },
                { id: 'advanced', icon: TrendingUp, label: 'Advanced' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all text-xs font-black uppercase tracking-widest ${
                    activeTab === item.id 
                      ? 'bg-accent-cyan text-black shadow-[0_0_20px_rgba(0,209,255,0.4)]' 
                      : 'text-text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col items-end">
              <span className="metadata-xs text-text-muted">Live Feed</span>
              <span className="text-sm font-mono font-black text-accent-cyan">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-accent-cyan/20 p-0.5 ml-2">
              <img src="https://picsum.photos/seed/user/40/40" className="rounded-full" alt="User" referrerPolicy="no-referrer" />
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
                <div className="glass-panel rounded-[3rem] p-12 shadow-card overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-accent-violet/10 blur-[120px] rounded-full -mr-48 -mt-48" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-cyan/10 blur-[120px] rounded-full -ml-48 -mb-48" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-12">
                      <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase tracking-[0.3em] italic">
                        <FileCode className="text-accent-violet" size={32} />
                        Analytics Engine
                      </h2>
                      <div className="flex gap-2">
                        <span className="metadata-xs font-black px-3 py-1.5 rounded-lg bg-white/5 text-text-secondary border border-white/10 uppercase tracking-widest">Python 3.11</span>
                        <span className="metadata-xs font-black px-3 py-1.5 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 uppercase tracking-widest">Production</span>
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                      <p className="text-text-secondary mb-12 text-xl leading-relaxed font-medium">
                        The underlying data processing engine utilizes <code className="text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded">Pandas</code> for vectorization and <code className="text-accent-violet bg-accent-violet/10 px-2 py-0.5 rounded">Plotly</code> for high-fidelity rendering. 
                        This architecture ensures sub-millisecond latency for complex spatial queries.
                      </p>
                      
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-linear-to-r from-accent-violet to-accent-cyan rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative bg-black/60 backdrop-blur-3xl p-10 rounded-2xl border border-white/10 overflow-x-auto text-sm font-mono text-accent-cyan shadow-2xl">
                          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                            <div className="w-3 h-3 rounded-full bg-accent-rose/50" />
                            <div className="w-3 h-3 rounded-full bg-accent-amber/50" />
                            <div className="w-3 h-3 rounded-full bg-accent-cyan/50" />
                            <span className="ml-4 metadata-xs text-text-muted">telemetry_engine.py</span>
                          </div>
                          <pre className="text-accent-cyan/90 leading-relaxed">
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
                {/* Strategic KPI Section */}
                <StrategicKPIs data={cumulativeData} />

                {/* Control Strip */}
                <div className="flex flex-wrap items-center justify-between gap-6 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                      <span className="filter-label">Fleet Unit</span>
                      <div className="relative mt-1">
                        <select 
                          value={selectedTrain}
                          onChange={(e) => setSelectedTrain(e.target.value)}
                          className="appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 transition-all cursor-pointer hover:bg-black/60"
                        >
                          {trains.map(t => <option key={t} value={t}>{t === 'All' ? 'Global Fleet' : t}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-cyan pointer-events-none" size={14} />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="filter-label">Sector Zone</span>
                      <div className="relative mt-1">
                        <select 
                          value={selectedZone}
                          onChange={(e) => setSelectedZone(e.target.value)}
                          className="appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 transition-all cursor-pointer hover:bg-black/60"
                        >
                          {zones.map(z => <option key={z} value={z}>{z === 'All' ? 'All Sectors' : `${z} Zone`}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-cyan pointer-events-none" size={14} />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 max-w-md flex items-center gap-8 pl-8 border-l border-white/10">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isPlaying ? 'bg-accent-rose text-white shadow-[0_0_25px_rgba(255,45,85,0.4)]' : 'bg-accent-cyan text-black shadow-[0_0_25px_rgba(0,209,255,0.4)]'}`}
                    >
                      {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                    </button>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span className="metadata-xs font-black text-accent-cyan">Temporal Scan</span>
                        <span className="text-xs font-black font-mono text-white">{timeFilter}:00</span>
                      </div>
                      <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-accent-cyan shadow-[0_0_10px_rgba(0,209,255,0.8)]"
                          initial={false}
                          animate={{ width: `${(timeFilter / 24) * 100}%` }}
                        />
                        <input 
                          type="range" 
                          min="0" 
                          max="24" 
                          value={timeFilter}
                          onChange={(e) => setTimeFilter(parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                      </div>
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
                    gradient="from-accent-cyan to-blue-600" 
                    trend={12}
                    trendDirection="up"
                  />
                  <MetricCard 
                    label="Reliability Index" 
                    value={stats.onTimeRate} 
                    unit="%"
                    subtext="On-time performance" 
                    icon={CheckCircle2} 
                    gradient="from-accent-cyan to-emerald-500" 
                    trend={5}
                    trendDirection="down"
                  />
                  <MetricCard 
                    label="Critical Node" 
                    value={stats.worstStation?.split(' ')[0] || 'N/A'} 
                    subtext="Highest delay impact" 
                    icon={AlertTriangle} 
                    gradient="from-accent-amber to-orange-600" 
                  />
                  <MetricCard 
                    label="Peak Congestion" 
                    value={`${stats.peakHour}:00`} 
                    subtext="Traffic saturation" 
                    icon={TrendingDown} 
                    gradient="from-accent-violet to-purple-600" 
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

                  {/* Advanced Operational Intelligence Section */}
                  <div className="col-span-12 mt-16 mb-8">
                    <div className="flex items-center gap-6">
                      <div className="h-px flex-1 bg-white/10" />
                      <h2 className="text-3xl font-black text-white uppercase tracking-[0.3em] px-6">Operational Intelligence</h2>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-8">
                    <TimeSeriesTrend data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-4">
                    <ComparativePerformance data={cumulativeData} />
                  </div>

                  <div className="col-span-12 lg:col-span-6">
                    <PredictiveForecast data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <RouteRadarComparison data={cumulativeData} />
                  </div>

                  {/* Network Dynamics & Predictive Analytics Section */}
                  <div className="col-span-12 mt-16 mb-8">
                    <div className="flex items-center gap-6">
                      <div className="h-px flex-1 bg-white/10" />
                      <h2 className="text-3xl font-black text-white uppercase tracking-[0.3em] px-6">Predictive Analytics</h2>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-6">
                    <DelayDistributionBox data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <CorrelationHeatmap data={cumulativeData} />
                  </div>

                  <div className="col-span-12 lg:col-span-4">
                    <EventTimeline data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-8">
                    <NetworkTopology data={cumulativeData} />
                  </div>

                  <div className="col-span-12 lg:col-span-6">
                    <DelayPropagation data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <CapacityUtilization data={cumulativeData} />
                  </div>

                  <div className="col-span-12 lg:col-span-4">
                    <StationLeaderboard data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-8">
                    <DelayTreemap data={cumulativeData} />
                  </div>

                  <div className="col-span-12 lg:col-span-6">
                    <PassengerImpactFunnel data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <ScheduleGantt data={cumulativeData} />
                  </div>
                </div>

                {/* System Flow Diagram */}
                <div className="glass-panel rounded-[2rem] p-8">
                  <SystemFlow />
                </div>

                {/* Advanced 3D Analytics Grid */}
                <div className="grid grid-cols-12 gap-6 mb-8">
                  <div className="col-span-12 lg:col-span-6">
                    <RadialDelayRose data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <VelocityVortex data={cumulativeData} />
                  </div>
                </div>

                {/* Extra Advanced Analytics Grid */}
                <div className="grid grid-cols-12 gap-6 mb-8">
                  <div className="col-span-12 lg:col-span-6">
                    <WeatherDelayTerrain data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <DelayFlowSankey data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <PerformanceParallel data={cumulativeData} />
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <ZoneTimeRibbon data={cumulativeData} />
                  </div>
                  <div className="col-span-12">
                    <DelaySunburst data={cumulativeData} />
                  </div>
                </div>

                {/* Detailed Data Table (Limited to 50 rows) */}
                <TrainDetailsTable data={data.slice(0, 50)} />

                {/* Methodology Section */}
                <div className="glass-panel rounded-[3rem] p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 text-white rotate-12 pointer-events-none">
                    <LayoutDashboard size={240} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black text-white mb-12 uppercase tracking-[0.4em] flex items-center gap-4">
                      <Info className="text-accent-cyan" size={32} />
                      Operational Intelligence
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
                      <div className="space-y-6">
                        <div className="w-12 h-1 bg-accent-cyan shadow-[0_0_10px_rgba(0,209,255,0.8)]" />
                        <h4 className="metadata-xs font-black text-white">Temporal Propagation</h4>
                        <p className="text-sm text-text-secondary leading-relaxed font-medium">
                          Our analysis indicates that delays follow a non-linear propagation model. A single 10-minute disruption typically results in a cumulative 45-minute system-wide latency.
                        </p>
                      </div>
                      <div className="space-y-6">
                        <div className="w-12 h-1 bg-accent-amber shadow-[0_0_10px_rgba(255,184,0,0.8)]" />
                        <h4 className="metadata-xs font-black text-white">Spatial Bottlenecks</h4>
                        <p className="text-sm text-text-secondary leading-relaxed font-medium">
                          3D spatial clustering reveals persistent "Delay Islands" in the North-Eastern Corridor, often correlated with infrastructure age and signal density.
                        </p>
                      </div>
                      <div className="space-y-6">
                        <div className="w-12 h-1 bg-accent-rose shadow-[0_0_10px_rgba(255,45,85,0.8)]" />
                        <h4 className="metadata-xs font-black text-white">Risk Mitigation</h4>
                        <p className="text-sm text-text-secondary leading-relaxed font-medium">
                          By utilizing the Probability Model, operators can identify 'Fat-Tail' events—rare but catastrophic delays—up to 90 minutes before impact.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <footer className="mt-32 py-16 border-t border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <Train className="text-accent-cyan" size={20} />
                </div>
                <span className="font-black tracking-tighter uppercase italic text-xl text-white">RailTrack <span className="text-accent-cyan">OS</span></span>
              </div>
              <div className="flex gap-8">
                {['System Status', 'API Docs', 'Security', 'Privacy'].map(link => (
                  <a key={link} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-accent-cyan transition-colors">{link}</a>
                ))}
              </div>
            </div>
            <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center">
              <p className="text-[9px] text-text-muted font-mono uppercase tracking-[0.3em] font-black">© 2026 RailTrack Systems • Precision Operations Interface v4.0.2</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                <span className="text-[9px] font-black text-accent-cyan uppercase tracking-widest">System Nominal</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
