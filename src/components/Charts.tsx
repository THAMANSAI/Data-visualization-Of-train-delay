import React, { useMemo, useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X, TrendingUp, Clock, CheckCircle2, MapPin, BarChart3, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TrainData } from '../data';

interface ChartProps {
  data: TrainData[];
  currentTime?: number;
  isPlaying?: boolean;
  onPlayPause?: (isPlaying: boolean) => void;
  onTimeChange?: (time: number) => void;
}

export const TimelineDelayChart = ({ data }: ChartProps) => {
  const traces = Array.from(new Set(data.map(d => d.Train_Name))).map(train => {
    const trainData = data.filter(d => d.Train_Name === train);
    return {
      x: trainData.map(d => d.Scheduled_Arrival),
      y: trainData.map(d => d.Delay_Minutes),
      name: train,
      type: 'scatter',
      mode: 'lines+markers',
      line: { shape: 'spline', width: 3 },
      marker: { size: 6 },
      hovertemplate: '<b>%{text}</b><br>Delay: %{y} min<br>Time: %{x}<extra></extra>',
      text: trainData.map(d => d.Station_Name)
    };
  });

  return (
    <div className="bg-card-bg border border-slate-200 rounded-2xl p-5 shadow-card h-full">
      <h3 className="text-text-primary font-bold text-lg mb-1">Timeline Delay Visualization</h3>
      <p className="text-xs text-text-secondary mb-4">Tracks delay progression over time for each train journey.</p>
      <Plot
        data={traces as any}
        layout={{
          autosize: true,
          height: 400,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#64748b', family: 'Inter, sans-serif' },
          margin: { l: 40, r: 20, t: 20, b: 40 },
          xaxis: { gridcolor: '#f1f5f9', zeroline: false },
          yaxis: { gridcolor: '#f1f5f9', zeroline: false, title: 'Delay (min)' },
          legend: { orientation: 'h', y: -0.2 },
          hovermode: 'closest'
        }}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full"
      />
    </div>
  );
};

export const StationPerformanceChart = ({ data }: ChartProps) => {
  const stations = Array.from(new Set(data.map(d => d.Station_Name)));
  const avgDelays = stations.map(s => {
    const stationData = data.filter(d => d.Station_Name === s);
    return Math.round(stationData.reduce((acc, curr) => acc + curr.Delay_Minutes, 0) / stationData.length);
  });

  return (
    <div className="bg-card-bg border border-slate-200 rounded-2xl p-5 shadow-card h-full">
      <h3 className="text-text-primary font-bold text-lg mb-1">Station Performance Analysis</h3>
      <p className="text-xs text-text-secondary mb-4">Average delay minutes recorded at each station.</p>
      <Plot
        data={[{
          x: stations,
          y: avgDelays,
          type: 'bar',
          marker: {
            color: avgDelays,
            colorscale: 'Viridis',
            line: { width: 0 }
          },
          hovertemplate: '<b>%{x}</b><br>Avg Delay: %{y} min<extra></extra>'
        }]}
        layout={{
          autosize: true,
          height: 400,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#64748b', family: 'Inter, sans-serif' },
          margin: { l: 40, r: 20, t: 20, b: 80 },
          xaxis: { gridcolor: '#f1f5f9', zeroline: false, tickangle: -45 },
          yaxis: { gridcolor: '#f1f5f9', zeroline: false, title: 'Avg Delay (min)' }
        }}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full"
      />
    </div>
  );
};

export const DelayDistributionChart = ({ data }: ChartProps) => {
  const delays = data.map(d => d.Delay_Minutes);
  
  return (
    <div className="bg-card-bg border border-slate-200 rounded-2xl p-5 shadow-card h-full">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-text-primary font-bold text-lg">Delay Distribution & Density</h3>
        <span className="metadata-xs font-bold text-accent-cyan bg-accent-cyan/10 px-2 py-1 rounded">PROBABILITY MODEL</span>
      </div>
      <p className="text-xs text-text-secondary mb-4">Frequency of delay durations across all trains.</p>
      <Plot
        data={[
          {
            x: delays,
            type: 'histogram',
            name: 'Frequency',
            marker: { color: 'rgba(59, 130, 246, 0.5)' },
            nbinsx: 30,
            histnorm: 'probability density'
          },
          {
            x: delays,
            type: 'violin',
            name: 'Density Curve',
            side: 'positive',
            line: { color: '#2563eb' },
            fillcolor: 'rgba(37, 99, 235, 0.1)',
            points: false,
            box: { visible: true },
            meanline: { visible: true }
          }
        ]}
        layout={{
          autosize: true,
          height: 400,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#64748b', family: 'Inter, sans-serif' },
          margin: { l: 50, r: 20, t: 20, b: 40 },
          yaxis: { gridcolor: '#f1f5f9', zeroline: false, title: 'Density' },
          xaxis: { gridcolor: '#f1f5f9', zeroline: false, title: 'Delay (min)' },
          legend: { orientation: 'h', y: -0.2 },
          barmode: 'overlay'
        }}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full"
      />
    </div>
  );
};

export const ThreeDScatterClusters = ({ data }: ChartProps) => {
  const [camera, setCamera] = useState({ eye: { x: 1.8, y: 1.8, z: 1.5 } });
  const lastInteractionRef = useRef(Date.now());
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    let angle = Math.atan2(1.8, 1.8);
    const animate = () => {
      const now = Date.now();
      if (now - lastInteractionRef.current > 2000) {
        angle += 0.002;
        const radius = 2.5;
        setCamera({
          eye: {
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
            z: 1.5
          }
        });
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="bg-card-bg border border-slate-200 rounded-2xl p-5 shadow-card h-full group">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-text-primary font-bold text-lg">3D Delay Clusters</h3>
        <div className="flex gap-2">
          <span className="metadata-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-text-secondary uppercase tracking-wider">Spatial Analysis</span>
          <span className="metadata-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-[#3B82F6] uppercase tracking-wider">Dynamic View</span>
        </div>
      </div>
      <p className="text-xs text-text-secondary mb-4">Clustering of delay events based on duration and time.</p>
      <Plot
        data={[{
          x: data.map(d => d.Lat),
          y: data.map(d => d.Scheduled_Arrival ? parseInt(d.Scheduled_Arrival.split(' ')[1]?.split(':')[0] || '0') : 0),
          z: data.map(d => d.Delay_Minutes),
          mode: 'markers',
          type: 'scatter3d',
          marker: {
            size: 5,
            color: data.map(d => d.Delay_Minutes),
            colorscale: 'Plasma',
            opacity: 0.8,
            line: { width: 0.5, color: '#fff' }
          },
          text: data.map(d => `${d.Train_Name} at ${d.Station_Name}`),
          hovertemplate: '<b>%{text}</b><br>Lat: %{x}<br>Hour: %{y}:00<br>Delay: %{z}m<extra></extra>'
        }]}
        layout={{
          autosize: true,
          height: 500,
          paper_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#64748b', family: 'Inter, sans-serif' },
          scene: {
            xaxis: { title: 'Latitude', gridcolor: '#f1f5f9', showbackground: true, backgroundcolor: '#f8fafc' },
            yaxis: { title: 'Hour of Day', gridcolor: '#f1f5f9', showbackground: true, backgroundcolor: '#f8fafc' },
            zaxis: { title: 'Delay (min)', gridcolor: '#f1f5f9', showbackground: true, backgroundcolor: '#f8fafc' },
            camera: camera,
            aspectmode: 'manual',
            aspectratio: { x: 1, y: 1, z: 0.8 }
          },
          margin: { l: 0, r: 0, t: 0, b: 0 }
        }}
        onRelayout={(e: any) => {
          if (e['scene.camera']) {
            setCamera(e['scene.camera']);
            lastInteractionRef.current = Date.now();
          }
        }}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full"
      />
    </div>
  );
};

export const StationRankingTable = ({ data }: ChartProps) => {
  const ranking = useMemo(() => {
    const stats = data.reduce((acc: any, curr) => {
      if (!acc[curr.Station_Name]) {
        acc[curr.Station_Name] = { name: curr.Station_Name, totalDelay: 0, count: 0, onTime: 0 };
      }
      acc[curr.Station_Name].totalDelay += curr.Delay_Minutes;
      acc[curr.Station_Name].count += 1;
      if (curr.Delay_Minutes === 0) acc[curr.Station_Name].onTime += 1;
      return acc;
    }, {});

    return Object.values(stats)
      .map((s: any) => ({
        ...s,
        avgDelay: Math.round(s.totalDelay / s.count),
        onTimeRate: Math.round((s.onTime / s.count) * 100)
      }))
      .sort((a, b) => b.avgDelay - a.avgDelay);
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card h-full overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-text-primary font-bold text-lg font-serif italic">Node Performance Audit</h3>
        <p className="metadata-xs text-text-muted mt-1">Station-level latency & reliability metrics. Top stations ranked by accumulated delay minutes.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30">
              <th className="px-5 py-3 metadata-xs text-text-muted border-b border-slate-100">Station</th>
              <th className="px-5 py-3 metadata-xs text-text-muted border-b border-slate-100 text-right">Latency</th>
              <th className="px-5 py-3 metadata-xs text-text-muted border-b border-slate-100 text-right">Reliability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {ranking.map((s) => (
              <tr key={s.name} className="group hover:bg-text-primary hover:text-white transition-all duration-300 cursor-pointer">
                <td className="px-5 py-4">
                  <div className="text-sm font-bold tracking-tight group-hover:text-white">{s.name}</div>
                  <div className="text-[10px] opacity-40 group-hover:opacity-100 uppercase tracking-widest">Station Node</div>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={`font-mono font-bold ${s.avgDelay > 30 ? 'text-accent-rose group-hover:text-white' : 'text-text-primary group-hover:text-white'}`}>
                    {s.avgDelay}m
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-xs font-bold group-hover:text-white">{s.onTimeRate}%</span>
                    <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden group-hover:bg-white/20">
                      <div 
                        className={`h-full transition-all duration-500 group-hover:bg-white ${s.onTimeRate > 80 ? 'bg-accent-emerald' : s.onTimeRate > 50 ? 'bg-accent-amber' : 'bg-accent-rose'}`} 
                        style={{ width: `${s.onTimeRate}%` }} 
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ThreeDDelaySurface = ({ data }: ChartProps) => {
  const [camera, setCamera] = useState({ eye: { x: 1.8, y: 1.8, z: 1.2 } });
  const lastInteractionRef = useRef(Date.now());
  const requestRef = useRef<number | null>(null);

  const { stations, times, zData } = useMemo(() => {
    const stations = Array.from(new Set(data.map(d => d.Station_Name)));
    const times = Array.from(new Set(data.map(d => d.Scheduled_Arrival?.split(' ')[1]?.split(':')[0] || '0'))).sort();
    
    const zData = stations.map(s => {
      return times.map(t => {
        const matches = data.filter(d => d.Station_Name === s && d.Scheduled_Arrival?.includes(` ${t}:`));
        if (matches.length === 0) return 0;
        return matches.reduce((acc, curr) => acc + curr.Delay_Minutes, 0) / matches.length;
      });
    });
    return { stations, times, zData };
  }, [data]);

  useEffect(() => {
    let angle = Math.atan2(1.8, 1.8);
    const animate = () => {
      const now = Date.now();
      if (now - lastInteractionRef.current > 2000) {
        angle += 0.003;
        const radius = 2.2;
        const zBob = 1.2 + Math.sin(now / 2000) * 0.1;
        
        setCamera({
          eye: {
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
            z: zBob
          }
        });
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card h-full group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <BarChart3 size={100} />
      </div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-text-primary font-bold text-lg font-serif italic">3D Delay Surface Model</h3>
          <p className="metadata-xs text-text-muted mt-0.5">Spatiotemporal latency distribution. Visualizes delay intensity across different train routes.</p>
        </div>
        <div className="flex gap-2">
          <span className="metadata-xs font-bold px-2 py-1 rounded-md bg-slate-100 text-text-secondary border border-slate-200">GPU Accelerated</span>
          <span className="metadata-xs font-bold px-2 py-1 rounded-md bg-emerald-50 text-accent-emerald border border-emerald-100">Live Render</span>
        </div>
      </div>
      <Plot
        data={[{
          z: zData,
          type: 'surface',
          colorscale: 'Viridis',
          showscale: false,
          opacity: 0.9,
          contours: {
            z: { show: true, usecolormap: true, highlightcolor: "#fff", project: { z: true } }
          }
        }]}
        layout={{
          autosize: true,
          height: 400,
          paper_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#64748b', family: 'Inter, sans-serif' },
          scene: {
            xaxis: { title: 'Station Index', gridcolor: '#f1f5f9', showbackground: false },
            yaxis: { title: 'Hour', gridcolor: '#f1f5f9', showbackground: false },
            zaxis: { title: 'Delay', gridcolor: '#f1f5f9', showbackground: false },
            camera: camera,
            aspectmode: 'manual',
            aspectratio: { x: 1, y: 1, z: 0.5 }
          },
          margin: { l: 0, r: 0, t: 0, b: 0 }
        }}
        onRelayout={(e: any) => {
          if (e['scene.camera']) {
            setCamera(e['scene.camera']);
            lastInteractionRef.current = Date.now();
          }
        }}
        config={{ 
          responsive: true,
          displayModeBar: false,
          scrollZoom: true
        }}
        className="w-full"
      />
      
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="metadata-xs text-text-muted">Resolution</span>
            <span className="text-xs font-bold font-mono">64x24 Grid</span>
          </div>
          <div className="flex flex-col">
            <span className="metadata-xs text-text-muted">Algorithm</span>
            <span className="text-xs font-bold font-mono">Bilinear Interp.</span>
          </div>
        </div>
        <button className="text-[10px] font-bold uppercase tracking-widest text-accent-cyan hover:underline">
          Export Mesh Data
        </button>
      </div>
    </div>
  );
};

export const StationPerformanceHeatmap = ({ data }: ChartProps) => {
  const stations = Array.from(new Set(data.map(d => d.Station_Name)));
  const zones = Array.from(new Set(data.map(d => d.Railway_Zone)));
  
  const zData = zones.map(z => {
    return stations.map(s => {
      const matches = data.filter(d => d.Station_Name === s && d.Railway_Zone === z);
      if (matches.length === 0) return null;
      return matches.reduce((acc, curr) => acc + curr.Delay_Minutes, 0) / matches.length;
    });
  });

  return (
    <div className="bg-card-bg border border-slate-200 rounded-2xl p-5 shadow-card h-full">
      <h3 className="text-text-primary font-bold text-lg mb-1">Station Performance Heatmap</h3>
      <p className="text-xs text-text-secondary mb-4">Heatmap showing delay intensity across stations and trains.</p>
      <Plot
        data={[{
          z: zData,
          x: stations,
          y: zones,
          type: 'heatmap',
          colorscale: 'YlOrRd',
          showscale: true,
          hovertemplate: 'Zone: %{y}<br>Station: %{x}<br>Avg Delay: %{z:.1f}m<extra></extra>'
        }]}
        layout={{
          autosize: true,
          height: 400,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#64748b', family: 'Inter, sans-serif' },
          margin: { l: 80, r: 20, t: 20, b: 100 },
          xaxis: { tickangle: -45 }
        }}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full"
      />
    </div>
  );
};

export const GeographicDelayMap = ({ data }: ChartProps) => {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const stationAgg = useMemo(() => {
    const agg = data.reduce((acc: any, curr) => {
      if (!acc[curr.Station_Name]) {
        acc[curr.Station_Name] = { 
          lat: curr.Lat, 
          lng: curr.Lng, 
          delay: 0, 
          count: 0,
          onTime: 0,
          name: curr.Station_Name 
        };
      }
      acc[curr.Station_Name].delay += curr.Delay_Minutes;
      acc[curr.Station_Name].count += 1;
      if (curr.Delay_Minutes === 0) acc[curr.Station_Name].onTime += 1;
      return acc;
    }, {});
    return Object.values(agg);
  }, [data]);

  const selectedStationData = useMemo(() => {
    if (!selectedStation) return null;
    const stationData = data.filter(d => d.Station_Name === selectedStation);
    const agg = stationAgg.find((s: any) => s.name === selectedStation);
    
    // Trend data: average delay by hour
    const hourlyTrend = Array.from({ length: 24 }, (_, i) => {
      const hourStr = i.toString().padStart(2, '0');
      const matches = stationData.filter(d => d.Scheduled_Arrival?.includes(` ${hourStr}:`));
      const avg = matches.length > 0 
        ? matches.reduce((acc, curr) => acc + curr.Delay_Minutes, 0) / matches.length 
        : 0;
      return { hour: `${hourStr}:00`, delay: Math.round(avg) };
    });

    return {
      ...agg,
      avgDelay: Math.round(agg.delay / agg.count),
      onTimeRate: Math.round((agg.onTime / agg.count) * 100),
      trend: hourlyTrend
    };
  }, [selectedStation, data, stationAgg]);

  const getColor = (avgDelay: number) => {
    if (avgDelay < 15) return '#10b981';
    if (avgDelay < 45) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="bg-card-bg border border-slate-200 rounded-2xl p-5 shadow-card h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-text-primary font-bold text-lg">Geographical Delay Severity</h3>
        <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-emerald"></span> Low</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-amber"></span> Med</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-rose"></span> High</div>
        </div>
      </div>
      <p className="text-xs text-text-secondary mb-4">Map view of stations colored by average delay severity.</p>
      
      <div className="relative h-[500px]">
        <Plot
          data={[{
            type: 'scattermapbox',
            lat: stationAgg.map((s: any) => s.lat),
            lon: stationAgg.map((s: any) => s.lng),
            mode: 'markers',
            marker: {
              size: stationAgg.map((s: any) => 12 + (s.delay / s.count) * 0.3),
              color: stationAgg.map((s: any) => getColor(s.delay / s.count)),
              opacity: 0.85,
              line: { width: 2, color: '#fff' }
            },
            text: stationAgg.map((s: any) => s.name),
            hoverinfo: 'text'
          }] as any}
          onClick={(e: any) => {
            if (e.points && e.points[0]) {
              setSelectedStation(e.points[0].text);
            }
          }}
          layout={{
            autosize: true,
            height: 500,
            paper_bgcolor: 'rgba(0,0,0,0)',
            mapbox: {
              style: 'carto-positron',
              center: { lat: 20.5937, lon: 78.9629 },
              zoom: 3.5
            },
            margin: { l: 0, r: 0, t: 0, b: 0 },
            showlegend: false
          }}
          config={{ responsive: true, displayModeBar: false }}
          className="w-full h-full"
        />

        {/* Station Detail Panel */}
        <AnimatePresence>
          {selectedStationData && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-4 w-72 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-4 z-10"
            >
              <button 
                onClick={() => setSelectedStation(null)}
                className="absolute top-2 right-2 p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-slate-600" />
                </div>
                <h4 className="font-bold text-slate-900 truncate pr-6">{selectedStationData.name}</h4>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1">
                    <Clock className="w-3 h-3" /> Avg Delay
                  </div>
                  <div className="text-xl font-bold text-slate-900">{selectedStationData.avgDelay}m</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1">
                    <CheckCircle2 className="w-3 h-3" /> On-Time
                  </div>
                  <div className="text-xl font-bold text-slate-900">{selectedStationData.onTimeRate}%</div>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-2">
                  <TrendingUp className="w-3 h-3" /> 24h Delay Trend
                </div>
                <div className="h-24 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedStationData.trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="hour" hide />
                      <YAxis hide domain={[0, 'auto']} />
                      <Tooltip 
                        contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 'bold' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="delay" 
                        stroke="#6366f1" 
                        strokeWidth={2} 
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="text-[10px] text-slate-400 italic text-center">
                Based on {selectedStationData.count} recorded arrivals
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const DelayBoxPlot = ({ data }: ChartProps) => {
  const plotData = useMemo(() => {
    const trains = Array.from(new Set(data.map(d => d.Train_Name)));
    return trains.map(train => {
      const delays = data.filter(d => d.Train_Name === train).map(d => d.Delay_Minutes);
      return {
        y: delays,
        type: 'box',
        name: train,
        boxpoints: 'all',
        jitter: 0.3,
        pointpos: -1.8,
        marker: { size: 2 },
        line: { width: 1 }
      };
    });
  }, [data]);

  return (
    <div className="bg-card-bg border border-slate-200 rounded-2xl p-5 shadow-card h-full">
      <h3 className="text-text-primary font-bold text-lg mb-1">Delay Variability by Train</h3>
      <p className="text-xs text-text-secondary mb-4">Box plot showing the spread of delay minutes for each train.</p>
      <Plot
        data={plotData as any}
        layout={{
          autosize: true,
          height: 400,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#64748b', family: 'Inter, sans-serif' },
          margin: { l: 40, r: 20, t: 20, b: 80 },
          xaxis: { 
            gridcolor: '#f1f5f9', 
            zeroline: false,
            tickangle: -45
          },
          yaxis: { gridcolor: '#f1f5f9', zeroline: false, title: 'Delay (min)' },
          showlegend: false,
          hovermode: 'closest'
        }}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full"
      />
    </div>
  );
};

export const DelayLineChart = ({ data }: ChartProps) => {
  const chartData = useMemo(() => {
    // Group by hour of day
    const hourlyDelays: Record<string, { total: number, count: number }> = {};
    
    data.forEach(d => {
      const hour = d.Scheduled_Arrival ? d.Scheduled_Arrival.split(' ')[1]?.split(':')[0] : null;
      if (hour) {
        if (!hourlyDelays[hour]) hourlyDelays[hour] = { total: 0, count: 0 };
        hourlyDelays[hour].total += d.Delay_Minutes;
        hourlyDelays[hour].count += 1;
      }
    });

    return Object.keys(hourlyDelays).sort().map(hour => ({
      hour: `${hour}:00`,
      avgDelay: Math.round(hourlyDelays[hour].total / hourlyDelays[hour].count)
    }));
  }, [data]);

  return (
    <div className="bg-card-bg border border-slate-200 rounded-2xl p-5 shadow-card h-full">
      <h3 className="text-text-primary font-bold text-lg mb-1">Average Delay Trend (Hourly)</h3>
      <p className="text-xs text-text-secondary mb-4">Trend of average delays aggregated by hour of the day.</p>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit=" min" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#1e293b', fontWeight: 600 }}
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
            />
            <Line 
              type="monotone" 
              dataKey="avgDelay" 
              stroke="#8b5cf6" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const AnimatedTrainMap = ({ data, currentTime = 720, isPlaying, onPlayPause, onTimeChange }: ChartProps) => {
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [selectedTrainInfo, setSelectedTrainInfo] = useState<any>(null);

  const staticStationStats = useMemo(() => {
    const agg = data.reduce((acc: any, curr) => {
      if (!acc[curr.Station_Name]) {
        acc[curr.Station_Name] = { 
          lat: curr.Lat, 
          lng: curr.Lng, 
          name: curr.Station_Name,
          totalDelay: 0,
          trainCount: 0
        };
      }
      acc[curr.Station_Name].totalDelay += curr.Delay_Minutes;
      acc[curr.Station_Name].trainCount += 1;
      return acc;
    }, {});
    return Object.values(agg);
  }, [data]);

  const routes = useMemo(() => {
    const trains = Array.from(new Set(data.map(d => d.Train_ID)));
    return trains.map(id => {
      const trainData = data.filter(d => d.Train_ID === id).sort((a, b) => a.Scheduled_Arrival.localeCompare(b.Scheduled_Arrival));
      const isSelected = id === selectedTrainId;
      return {
        id,
        name: trainData[0]?.Train_Name,
        lat: trainData.map(d => d.Lat),
        lon: trainData.map(d => d.Lng),
        color: isSelected ? '#3b82f6' : '#cbd5e1',
        width: isSelected ? 4 : 1,
        opacity: isSelected ? 1 : (selectedTrainId ? 0.1 : 0.5)
      };
    });
  }, [data, selectedTrainId]);

  // Simulate train positions based on currentTime (minutes 0-1440)
  const trainPositions = useMemo(() => {
    const trains = Array.from(new Set(data.map(d => d.Train_ID)));
    return trains.map(id => {
      const trainData = data.filter(d => d.Train_ID === id).sort((a, b) => a.Scheduled_Arrival.localeCompare(b.Scheduled_Arrival));
      
      // Find where the train is at currentTime
      for (let i = 0; i < trainData.length - 1; i++) {
        const s1 = trainData[i];
        const s2 = trainData[i+1];
        
        // Parse time to minutes from start of day
        const getMinutes = (dateStr: string) => {
          if (!dateStr) return -1;
          const parts = dateStr.split(' ');
          if (parts.length < 2) return -1;
          const timeParts = parts[1].split(':');
          return parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
        };

        const t1 = getMinutes(s1.Scheduled_Departure);
        const t2 = getMinutes(s2.Scheduled_Arrival);
        
        // Handle overnight trains (t2 < t1)
        let effectiveT2 = t2;
        let effectiveCurrentTime = currentTime;
        
        if (t2 < t1) {
          effectiveT2 += 1440; // Add 24 hours in minutes
          if (currentTime < t1) {
            effectiveCurrentTime += 1440;
          }
        }
        
        if (effectiveCurrentTime >= t1 && effectiveCurrentTime <= effectiveT2) {
          const progress = (effectiveCurrentTime - t1) / (effectiveT2 - t1 || 1);
          const currentDelay = s1.Delay_Minutes + (s2.Delay_Minutes - s1.Delay_Minutes) * progress;
          
          let color = '#22c55e'; // Green (On time)
          if (currentDelay > 15 && currentDelay <= 60) color = '#eab308'; // Yellow (Minor delay)
          else if (currentDelay > 60) color = '#ef4444'; // Red (Major delay)

          return {
            id,
            name: s1.Train_Name,
            lat: s1.Lat + (s2.Lat - s1.Lat) * progress,
            lng: s1.Lng + (s2.Lng - s1.Lng) * progress,
            status: 'In Transit',
            fromStation: s1.Station_Name,
            toStation: s2.Station_Name,
            delay: Math.round(currentDelay),
            color,
            hoverText: `<b>${s1.Train_Name}</b><br>From: ${s1.Station_Name}<br>To: ${s2.Station_Name}<br>Delay: ${Math.round(currentDelay)} min`
          };
        }
      }
      
      // If not in transit, check if at station
      const atStation = trainData.find(d => {
        const getMinutes = (dateStr: string) => {
          if (!dateStr) return -1;
          const parts = dateStr.split(' ');
          if (parts.length < 2) return -1;
          const timeParts = parts[1].split(':');
          return parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
        };
        const t = getMinutes(d.Scheduled_Arrival);
        // Allow a small window (e.g., 15 mins) to show "At Station"
        return Math.abs(t - currentTime) <= 15;
      });
      
      if (atStation) {
        let color = '#22c55e';
        if (atStation.Delay_Minutes > 15 && atStation.Delay_Minutes <= 60) color = '#eab308';
        else if (atStation.Delay_Minutes > 60) color = '#ef4444';

        return { 
          id, 
          name: atStation.Train_Name,
          stationName: atStation.Station_Name,
          lat: atStation.Lat, 
          lng: atStation.Lng, 
          status: 'At Station',
          delay: atStation.Delay_Minutes,
          color,
          hoverText: `<b>${atStation.Train_Name}</b><br>At: ${atStation.Station_Name}<br>Delay: ${atStation.Delay_Minutes} min`
        };
      }
      
      return null;
    }).filter(Boolean);
  }, [data, currentTime]);

  // Update selectedTrainInfo when trainPositions change (e.g. during animation)
  useEffect(() => {
    if (selectedTrainId) {
      const info = trainPositions.find((p: any) => p.id === selectedTrainId);
      if (info) {
        setSelectedTrainInfo(info);
      }
    } else {
      setSelectedTrainInfo(null);
    }
  }, [trainPositions, selectedTrainId]);

  const stations = useMemo(() => {
    const currentCounts: Record<string, number> = {};
    trainPositions.forEach((p: any) => {
        if (p.status === 'At Station' && p.stationName) {
            currentCounts[p.stationName] = (currentCounts[p.stationName] || 0) + 1;
        }
    });

    return staticStationStats.map((s: any) => {
        const currentCount = currentCounts[s.name] || 0;
        const avgDelay = Math.round(s.totalDelay / s.trainCount);
        return {
            ...s,
            hoverText: `<b>${s.name}</b><br>Avg Delay: ${avgDelay} min<br>Total Trains: ${s.trainCount}<br>Current Trains: ${currentCount}`
        };
    });
  }, [staticStationStats, trainPositions]);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card-bg border border-slate-200 rounded-2xl p-5 shadow-card h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-bold text-lg">Live Geospatial Movement</h3>
        <div className="flex gap-3 metadata-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> On Time</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Minor Delay</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Major Delay</div>
          <div className="flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Stations</div>
        </div>
      </div>
      
      <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-100 mb-4">
        <Plot
          data={[
            ...routes.map(r => ({
              type: 'scattermapbox',
              lat: r.lat,
              lon: r.lon,
              mode: 'lines',
              line: { width: r.width, color: r.color },
              opacity: r.opacity,
              hoverinfo: 'none',
              showlegend: false,
              name: r.name
            })),
            {
              type: 'scattermapbox',
              lat: stations.map((s: any) => s.lat),
              lon: stations.map((s: any) => s.lng),
              mode: 'markers',
              marker: { size: 6, color: '#94a3b8', opacity: 0.7 },
              text: stations.map((s: any) => s.hoverText),
              hoverinfo: 'text',
              name: 'Stations'
            },
            {
              type: 'scattermapbox',
              lat: trainPositions.map((p: any) => p.lat),
              lon: trainPositions.map((p: any) => p.lng),
              mode: 'markers',
              marker: { 
                size: 12, 
                color: trainPositions.map((p: any) => p.color),
                line: { width: 2, color: '#ffffff' }
              },
              text: trainPositions.map((p: any) => p.hoverText),
              ids: trainPositions.map((p: any) => p.id),
              hoverinfo: 'text',
              name: 'Trains'
            }
          ] as any}
          layout={{
            autosize: true,
            height: 450,
            margin: { l: 0, r: 0, t: 0, b: 0 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            showlegend: false,
            hovermode: 'closest',
            mapbox: {
              style: 'carto-positron',
              center: { lat: 20.5937, lon: 78.9629 },
              zoom: 3.5
            },
          }}
          config={{ responsive: true, displayModeBar: false }}
          className="w-full h-full"
          onClick={(data) => {
            const point = data.points[0];
            if (point && point.data.name === 'Trains') {
              // @ts-ignore
              const trainId = point.id;
              setSelectedTrainId(prev => prev === trainId ? null : trainId);
            } else {
              setSelectedTrainId(null);
            }
          }}
        />

        {/* Selected Train Popup */}
        <AnimatePresence>
          {selectedTrainInfo && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-lg z-10 w-64"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-800 text-sm">{selectedTrainInfo.name}</h4>
                <button 
                  onClick={() => setSelectedTrainId(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full ${
                    selectedTrainInfo.status === 'At Station' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedTrainInfo.status}
                  </span>
                </div>

                {selectedTrainInfo.status === 'In Transit' ? (
                  <>
                    <div className="flex flex-col gap-1 text-xs border-l-2 border-slate-200 pl-2 ml-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">From</span>
                        <span className="font-medium text-slate-700 text-right">{selectedTrainInfo.fromStation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">To</span>
                        <span className="font-medium text-slate-700 text-right">{selectedTrainInfo.toStation}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Current Station</span>
                    <span className="font-medium text-slate-700">{selectedTrainInfo.stationName}</span>
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> Delay
                  </span>
                  <span className={`text-sm font-bold ${
                    selectedTrainInfo.delay > 60 ? 'text-rose-600' : 
                    selectedTrainInfo.delay > 15 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {selectedTrainInfo.delay} min
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 px-2">
        <button 
          onClick={() => onPlayPause && onPlayPause(!isPlaying)}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-700"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>
        
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between text-xs font-medium text-slate-500">
            <span>00:00</span>
            <span className="text-accent-violet font-bold">{formatTime(currentTime)}</span>
            <span>23:59</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1440" 
            value={currentTime} 
            onChange={(e) => onTimeChange && onTimeChange(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent-violet"
          />
        </div>
      </div>
    </div>
  );
};

export const CauseAnalysisChart = ({ data }: ChartProps) => {
  const causeStats = useMemo(() => {
    const stats = data.reduce((acc: any, curr) => {
      if (curr.Cause !== 'On-Time') {
        if (!acc[curr.Cause]) {
          acc[curr.Cause] = { count: 0, totalDelay: 0 };
        }
        acc[curr.Cause].count += 1;
        acc[curr.Cause].totalDelay += curr.Delay_Minutes;
      }
      return acc;
    }, {});

    const explanations: Record<string, string> = {
      'Weather': 'Adverse conditions like heavy rain or fog affecting visibility and track safety.',
      'Track Congestion': 'High traffic volume leading to bottlenecks at key junctions.',
      'Signal Issues': 'Technical failures in the automated signaling system requiring reduced speeds.',
      'Maintenance': 'Scheduled or emergency repairs on tracks or rolling stock.'
    };

    return Object.entries(stats)
      .map(([cause, s]: any) => ({
        cause,
        count: s.count,
        avgDelay: Math.round(s.totalDelay / s.count),
        explanation: explanations[cause] || 'General operational disruption.'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [data]);

  const chartData = useMemo(() => {
    const counts = data.reduce((acc: any, curr) => {
      if (curr.Cause !== 'On-Time') {
        acc[curr.Cause] = (acc[curr.Cause] || 0) + 1;
      }
      return acc;
    }, {});
    return {
      values: Object.values(counts),
      labels: Object.keys(counts)
    };
  }, [data]);

  return (
    <div className="bg-card-bg border border-slate-200 rounded-2xl p-5 shadow-card h-full flex flex-col">
      <h3 className="text-text-primary font-bold text-lg mb-1">Delay Cause Analysis</h3>
      <p className="text-xs text-text-secondary mb-4">Breakdown of delays by their primary reported cause.</p>
      
      <div className="flex-1 min-h-[300px]">
        <Plot
          data={[{
            values: chartData.values,
            labels: chartData.labels,
            type: 'pie',
            hole: 0.6,
            marker: {
              colors: ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e']
            },
            textinfo: 'label+percent',
            insidetextorientation: 'radial'
          }]}
          layout={{
            autosize: true,
            height: 300,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#64748b', family: 'Inter, sans-serif' },
            margin: { l: 0, r: 0, t: 0, b: 0 },
            showlegend: false
          }}
          config={{ responsive: true, displayModeBar: false }}
          className="w-full"
        />
      </div>

      <div className="mt-6 border-t border-slate-100 pt-6">
        <h4 className="metadata-xs font-bold text-text-muted uppercase tracking-widest mb-4">Top 3 Primary Disruptors</h4>
        <div className="space-y-4">
          {causeStats.map((item, idx) => (
            <div key={item.cause} className="group">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="metadata-xs font-bold text-accent-cyan">0{idx + 1}</span>
                  <span className="label-sm text-text-primary">{item.cause}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="metadata-xs font-bold text-accent-rose">{item.avgDelay}m</span>
                  <span className="metadata-xs text-text-muted">avg</span>
                </div>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed pl-6 group-hover:text-text-primary transition-colors">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
