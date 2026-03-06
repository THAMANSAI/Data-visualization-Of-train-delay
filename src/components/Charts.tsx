import React, { useMemo, useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X, TrendingUp, Clock, CheckCircle2, MapPin, BarChart3, Play, Pause, Activity } from 'lucide-react';
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
    <div className="glass-panel rounded-3xl p-8 h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <TrendingUp size={120} />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Temporal Latency</h3>
        <p className="metadata-xs text-text-secondary mt-1 mb-8">Delay progression telemetry per unit journey.</p>
      </div>

      <div className="flex-1 relative z-10">
        <Plot
          data={traces as any}
          layout={{
            autosize: true,
            height: 400,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: 'rgba(255,255,255,0.5)', family: 'Inter, sans-serif' },
            margin: { l: 40, r: 20, t: 20, b: 40 },
            xaxis: { gridcolor: 'rgba(255,255,255,0.05)', zeroline: false },
            yaxis: { gridcolor: 'rgba(255,255,255,0.05)', zeroline: false, title: 'Delay (min)' },
            legend: { orientation: 'h', y: -0.2, font: { size: 10 } },
            hovermode: 'closest'
          }}
          config={{ 
            responsive: true, 
            displayModeBar: false,
            scrollZoom: true,
            displaylogo: false
          }}
          className="w-full"
        />
      </div>
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
    <div className="glass-panel rounded-3xl p-8 h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <BarChart3 size={120} />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Node Efficiency</h3>
        <p className="metadata-xs text-text-secondary mt-1 mb-8">Average variance recorded at each station node.</p>
      </div>

      <div className="flex-1 relative z-10">
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
            font: { color: 'rgba(255,255,255,0.5)', family: 'Inter, sans-serif' },
            margin: { l: 40, r: 20, t: 20, b: 80 },
            xaxis: { gridcolor: 'rgba(255,255,255,0.05)', zeroline: false, tickangle: -45 },
            yaxis: { gridcolor: 'rgba(255,255,255,0.05)', zeroline: false, title: 'Avg Delay (min)' }
          }}
          config={{ 
            responsive: true, 
            displayModeBar: false,
            scrollZoom: true,
            displaylogo: false
          }}
          className="w-full"
        />
      </div>
    </div>
  );
};

export const DelayDistributionChart = ({ data }: ChartProps) => {
  const delays = data.map(d => d.Delay_Minutes);
  
  return (
    <div className="glass-panel rounded-3xl p-6 h-full">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-white font-black text-lg uppercase tracking-widest italic">Delay Density</h3>
        <span className="metadata-xs font-black text-accent-cyan bg-accent-cyan/10 px-2 py-1 rounded border border-accent-cyan/20">PROBABILITY MODEL</span>
      </div>
      <p className="metadata-xs text-text-secondary mb-6">Frequency of delay durations across all trains.</p>
      <Plot
        data={[
          {
            x: delays,
            type: 'histogram',
            name: 'Frequency',
            marker: { color: 'rgba(0, 209, 255, 0.3)' },
            nbinsx: 30,
            histnorm: 'probability density'
          },
          {
            x: delays,
            type: 'violin',
            name: 'Density Curve',
            side: 'positive',
            line: { color: '#00D1FF' },
            fillcolor: 'rgba(0, 209, 255, 0.1)',
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
          font: { color: 'rgba(255,255,255,0.5)', family: 'Inter, sans-serif' },
          margin: { l: 50, r: 20, t: 20, b: 40 },
          yaxis: { gridcolor: 'rgba(255,255,255,0.05)', zeroline: false, title: 'Density' },
          xaxis: { gridcolor: 'rgba(255,255,255,0.05)', zeroline: false, title: 'Delay (min)' },
          legend: { orientation: 'h', y: -0.2, font: { size: 10 } },
          barmode: 'overlay'
        }}
        config={{ 
          responsive: true, 
          displayModeBar: false,
          scrollZoom: true,
          displaylogo: false
        }}
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
    <div className="glass-panel rounded-3xl p-6 h-full group">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-white font-black text-lg uppercase tracking-widest italic">Spatial Clusters</h3>
        <div className="flex gap-2">
          <span className="metadata-xs font-black px-2 py-0.5 rounded bg-white/5 text-text-secondary uppercase tracking-widest border border-white/10">Spatial</span>
          <span className="metadata-xs font-black px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan uppercase tracking-widest border border-accent-cyan/20">Dynamic</span>
        </div>
      </div>
      <p className="metadata-xs text-text-secondary mb-6">Clustering of delay events based on duration and time.</p>
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
          font: { color: 'rgba(255,255,255,0.5)', family: 'Inter, sans-serif' },
          scene: {
            xaxis: { title: 'Latitude', gridcolor: 'rgba(255,255,255,0.05)', showbackground: false },
            yaxis: { title: 'Hour', gridcolor: 'rgba(255,255,255,0.05)', showbackground: false },
            zaxis: { title: 'Delay', gridcolor: 'rgba(255,255,255,0.05)', showbackground: false },
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
        config={{ 
          responsive: true, 
          displayModeBar: false,
          scrollZoom: true,
          displaylogo: false
        }}
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
    <div className="glass-panel rounded-3xl h-full overflow-hidden flex flex-col">
      <div className="p-6 border-b border-white/5 bg-white/5">
        <h3 className="text-white font-black text-lg uppercase tracking-widest italic">Node Performance</h3>
        <p className="metadata-xs text-text-secondary mt-1">Station-level latency & reliability metrics.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5">
              <th className="px-6 py-4 metadata-xs text-accent-cyan border-b border-white/10 uppercase tracking-widest">Station</th>
              <th className="px-6 py-4 metadata-xs text-accent-cyan border-b border-white/10 text-right uppercase tracking-widest">Latency</th>
              <th className="px-6 py-4 metadata-xs text-accent-cyan border-b border-white/10 text-right uppercase tracking-widest">Reliability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {ranking.map((s) => (
              <tr key={s.name} className="group hover:bg-white/5 transition-all duration-300 cursor-pointer">
                <td className="px-6 py-5">
                  <div className="text-sm font-black tracking-tight text-white group-hover:text-accent-cyan transition-colors">{s.name}</div>
                  <div className="text-[9px] text-text-muted uppercase tracking-widest font-bold">Station Node</div>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className={`font-mono font-black ${s.avgDelay > 30 ? 'text-accent-rose' : 'text-white'}`}>
                    {s.avgDelay}m
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-xs font-black text-white">{s.onTimeRate}%</span>
                    <div className="w-20 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ${s.onTimeRate > 80 ? 'bg-accent-cyan shadow-[0_0_8px_rgba(0,209,255,0.5)]' : s.onTimeRate > 50 ? 'bg-accent-amber' : 'bg-accent-rose'}`} 
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
    <div className="glass-panel rounded-3xl p-8 h-full group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <BarChart3 size={120} />
      </div>
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Delay Surface Model</h3>
          <p className="metadata-xs text-text-secondary mt-1">Spatiotemporal latency distribution mesh.</p>
        </div>
        <div className="flex gap-2">
          <span className="metadata-xs font-black px-2 py-1 rounded-md bg-white/5 text-text-secondary border border-white/10 uppercase tracking-widest">GPU Core</span>
          <span className="metadata-xs font-black px-2 py-1 rounded-md bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 uppercase tracking-widest">Live</span>
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
          font: { color: 'rgba(255,255,255,0.5)', family: 'Inter, sans-serif' },
          scene: {
            xaxis: { title: 'Node', gridcolor: 'rgba(255,255,255,0.05)', showbackground: false },
            yaxis: { title: 'Hour', gridcolor: 'rgba(255,255,255,0.05)', showbackground: false },
            zaxis: { title: 'Delay', gridcolor: 'rgba(255,255,255,0.05)', showbackground: false },
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
      
      <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-8">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="metadata-xs text-text-muted uppercase tracking-widest">Resolution</span>
            <span className="text-xs font-black font-mono text-white">64x24 GRID</span>
          </div>
          <div className="flex flex-col">
            <span className="metadata-xs text-text-muted uppercase tracking-widest">Algorithm</span>
            <span className="text-xs font-black font-mono text-white">BILINEAR</span>
          </div>
        </div>
        <button className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan hover:text-white transition-colors">
          Export Mesh
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
    <div className="glass-panel rounded-3xl p-8 h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Activity size={120} />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Regional Intensity</h3>
        <p className="metadata-xs text-text-secondary mt-1 mb-8">Heatmap showing delay intensity across zones and nodes.</p>
      </div>

      <div className="flex-1 relative z-10">
        <Plot
          data={[{
            z: zData,
            x: stations,
            y: zones,
            type: 'heatmap',
            colorscale: 'YlOrRd',
            showscale: true,
            hovertemplate: 'Zone: %{y}<br>Station: %{x}<br>Avg Delay: %{z:.1f} min<extra></extra>'
          }]}
          layout={{
            autosize: true,
            height: 400,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: 'rgba(255,255,255,0.5)', family: 'Inter, sans-serif' },
            margin: { l: 80, r: 20, t: 20, b: 100 },
            xaxis: { tickangle: -45, gridcolor: 'rgba(255,255,255,0.05)' },
            yaxis: { gridcolor: 'rgba(255,255,255,0.05)' }
          }}
          config={{ 
            responsive: true, 
            displayModeBar: false,
            scrollZoom: true,
            displaylogo: false
          }}
          className="w-full"
        />
      </div>
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
    if (avgDelay < 15) return '#00D1FF';
    if (avgDelay < 45) return '#FFB800';
    return '#FF2D55';
  };

  return (
    <div className="glass-panel rounded-[2rem] p-8 h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Geospatial Variance</h3>
        <div className="flex gap-4 text-[9px] font-black uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(0,209,255,0.5)]"></span> Nominal</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-accent-amber shadow-[0_0_8px_rgba(255,184,0,0.5)]"></span> Warning</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-accent-rose shadow-[0_0_8px_rgba(255,45,85,0.5)]"></span> Critical</div>
        </div>
      </div>
      <p className="metadata-xs text-text-secondary mb-8">Map view of stations colored by average delay severity.</p>
      
      <div className="relative h-[500px] rounded-2xl overflow-hidden border border-white/5">
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
              line: { width: 0 }
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
              style: 'dark',
              center: { lat: 20.5937, lon: 78.9629 },
              zoom: 3.5
            },
            margin: { l: 0, r: 0, t: 0, b: 0 },
            showlegend: false
          }}
          config={{ 
            responsive: true, 
            displayModeBar: false,
            scrollZoom: true,
            displaylogo: false
          }}
          className="w-full h-full"
        />

        {/* Station Detail Panel */}
        <AnimatePresence>
          {selectedStationData && (
            <motion.div 
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="absolute top-6 right-6 w-80 glass-panel border border-white/20 rounded-3xl shadow-2xl p-6 z-10 backdrop-blur-2xl"
            >
              <button 
                onClick={() => setSelectedStation(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-accent-cyan/10 rounded-xl border border-accent-cyan/20">
                  <MapPin className="w-5 h-5 text-accent-cyan" />
                </div>
                <h4 className="font-black text-white uppercase tracking-widest truncate pr-8">{selectedStationData.name}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1.5">
                    <Clock className="w-3 h-3" /> Latency
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{selectedStationData.avgDelay}m</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1.5">
                    <CheckCircle2 className="w-3 h-3" /> Reliability
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{selectedStationData.onTimeRate}%</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 text-[9px] font-black text-text-secondary uppercase tracking-widest mb-4">
                  <TrendingUp className="w-3 h-3" /> 24h Variance Trend
                </div>
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedStationData.trend}>
                      <XAxis dataKey="hour" hide />
                      <YAxis hide domain={[0, 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
                        itemStyle={{ color: '#00D1FF', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
                        labelStyle={{ display: 'none' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="delay" 
                        stroke="#00D1FF" 
                        strokeWidth={3} 
                        dot={false}
                        activeDot={{ r: 4, fill: '#fff', strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="text-[9px] text-text-muted font-black uppercase tracking-widest text-center opacity-40">
                Telemetry based on {selectedStationData.count} units
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
        marker: { size: 2, color: 'rgba(255,255,255,0.2)' },
        line: { width: 1.5, color: '#00D1FF' },
        fillcolor: 'rgba(0, 209, 255, 0.1)'
      };
    });
  }, [data]);

  return (
    <div className="glass-panel rounded-3xl p-8 h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <BarChart3 size={120} />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Unit Variability</h3>
        <p className="metadata-xs text-text-secondary mt-1 mb-8">Statistical spread of delay minutes per train unit.</p>
      </div>

      <div className="flex-1 relative z-10">
        <Plot
          data={plotData as any}
          layout={{
            autosize: true,
            height: 400,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: 'rgba(255,255,255,0.5)', family: 'Inter, sans-serif' },
            margin: { l: 40, r: 20, t: 20, b: 80 },
            xaxis: { 
              gridcolor: 'rgba(255,255,255,0.05)', 
              zeroline: false,
              tickangle: -45
            },
            yaxis: { gridcolor: 'rgba(255,255,255,0.05)', zeroline: false, title: 'Delay (min)' },
            showlegend: false,
            hovermode: 'closest'
          }}
          config={{ 
            responsive: true, 
            displayModeBar: false,
            scrollZoom: true,
            displaylogo: false
          }}
          className="w-full"
        />
      </div>
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
    <div className="glass-panel rounded-3xl p-8 h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Clock size={120} />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Hourly Variance Trend</h3>
        <p className="metadata-xs text-text-secondary mt-1 mb-8">Aggregate network latency across 24h cycle.</p>
      </div>

      <div className="h-[400px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} unit="m" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
              itemStyle={{ color: '#BF5AF2', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
            />
            <Line 
              type="monotone" 
              dataKey="avgDelay" 
              stroke="#BF5AF2" 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#BF5AF2', strokeWidth: 2, stroke: '#fff' }}
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
    <div className="glass-panel rounded-[2.5rem] p-8 h-full flex flex-col relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
        <div>
          <h3 className="text-white font-black text-2xl uppercase tracking-widest italic">Live Telemetry Map</h3>
          <p className="metadata-xs text-text-secondary mt-1">Real-time geospatial tracking of active fleet units.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-xl">
          <button 
            onClick={() => onPlayPause?.(!isPlaying)}
            className="w-12 h-12 rounded-xl bg-accent-cyan text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,209,255,0.4)]"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          
          <div className="flex flex-col min-w-[120px]">
            <span className="text-[10px] font-black text-accent-cyan uppercase tracking-widest mb-1">Mission Time</span>
            <span className="text-2xl font-black text-white font-mono tracking-tighter">
              {formatTime(currentTime)}
            </span>
          </div>
          
          <input 
            type="range" 
            min={0} 
            max={1439} 
            value={currentTime}
            onChange={(e) => onTimeChange?.(parseInt(e.target.value))}
            className="w-48 accent-accent-cyan bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-4">
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
              marker: { size: 6, color: 'rgba(255,255,255,0.2)', opacity: 0.7 },
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
                size: 14, 
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
            height: 600,
            margin: { l: 0, r: 0, t: 0, b: 0 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            showlegend: false,
            hovermode: 'closest',
            mapbox: {
              style: 'dark',
              center: { lat: 20.5937, lon: 78.9629 },
              zoom: 4
            },
          }}
          config={{ 
            responsive: true, 
            displayModeBar: false,
            scrollZoom: true,
            displaylogo: false
          }}
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
              className="absolute bottom-8 left-8 right-8 md:right-auto md:w-96 glass-panel border border-white/20 rounded-3xl p-8 shadow-2xl backdrop-blur-3xl z-20"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
                    <TrendingUp className="text-accent-cyan" size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-widest italic">{selectedTrainInfo.name}</h4>
                    <p className="metadata-xs text-accent-cyan font-mono">{selectedTrainId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTrainId(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={18} className="text-white/40" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Status</span>
                  <p className={`text-sm font-black uppercase tracking-widest ${
                    selectedTrainInfo.status === 'At Station' ? 'text-accent-cyan' : 'text-accent-amber'
                  }`}>
                    {selectedTrainInfo.status}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Variance</span>
                  <p className={`text-sm font-black font-mono ${selectedTrainInfo.delay > 15 ? 'text-accent-rose' : 'text-accent-cyan'}`}>
                    +{selectedTrainInfo.delay}m
                  </p>
                </div>

                {selectedTrainInfo.status === 'In Transit' ? (
                  <>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">From</span>
                      <p className="text-sm font-black text-white">{selectedTrainInfo.fromStation}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">To</span>
                      <p className="text-sm font-black text-white">{selectedTrainInfo.toStation}</p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 col-span-2">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Current Node</span>
                    <p className="text-sm font-black text-white">{selectedTrainInfo.stationName}</p>
                  </div>
                )}
              </div>

              <button className="w-full py-4 bg-accent-cyan text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(0,209,255,0.3)]">
                Intercept Communications
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
    <div className="glass-panel rounded-3xl p-8 h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Activity size={120} />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Causal Attribution</h3>
        <p className="metadata-xs text-text-secondary mt-1">Breakdown of delays by primary reported cause.</p>
      </div>
      
      <div className="flex-1 min-h-[300px] relative z-10">
        <Plot
          data={[{
            values: chartData.values,
            labels: chartData.labels,
            type: 'pie',
            hole: 0.7,
            marker: {
              colors: ['#00D1FF', '#BF5AF2', '#FFB800', '#FF2D55', '#32D74B']
            },
            textinfo: 'none',
            hoverinfo: 'label+percent',
            insidetextorientation: 'radial'
          }]}
          layout={{
            autosize: true,
            height: 300,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: 'rgba(255,255,255,0.5)', family: 'Inter, sans-serif' },
            margin: { l: 0, r: 0, t: 0, b: 0 },
            showlegend: false
          }}
          config={{ 
            responsive: true, 
            displayModeBar: false,
            scrollZoom: true,
            displaylogo: false
          }}
          className="w-full"
        />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] block mb-1">Total Events</span>
          <span className="text-3xl font-black text-white font-mono">{chartData.values.reduce((a: number, b: number) => a + b, 0)}</span>
        </div>
      </div>

      <div className="mt-8 border-t border-white/5 pt-8 relative z-10">
        <h4 className="text-[10px] font-black text-accent-cyan uppercase tracking-[0.3em] mb-6">Primary Disruptors</h4>
        <div className="space-y-6">
          {causeStats.map((item, idx) => (
            <div key={item.cause} className="group cursor-pointer">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-accent-cyan/40 group-hover:text-accent-cyan transition-colors font-mono">0{idx + 1}</span>
                  <span className="text-sm font-black text-white uppercase tracking-widest group-hover:text-accent-cyan transition-colors">{item.cause}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-accent-rose font-mono">+{item.avgDelay}m</span>
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">avg</span>
                </div>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed pl-7 group-hover:text-white transition-colors">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
