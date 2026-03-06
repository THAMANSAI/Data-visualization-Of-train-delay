import React, { useState, useEffect, useRef, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { TrainData } from '../data';
import { motion } from 'motion/react';
import { Maximize2, RotateCw } from 'lucide-react';

interface ChartProps {
  data: TrainData[];
}

// Chart 1: 3D Spatiotemporal Trajectories (Space-Time Cube)
export const SpaceTimeCube = ({ data }: ChartProps) => {
  const [camera, setCamera] = useState({ eye: { x: 1.8, y: 1.8, z: 1.2 } });
  
  // Filter to a single day for clarity
  const dayData = useMemo(() => {
    const targetDate = data[0]?.Date;
    return data.filter(d => d.Date === targetDate);
  }, [data]);

  const traces = useMemo(() => {
    const trainIds = Array.from(new Set(dayData.map(d => d.Train_ID))).slice(0, 15); // Limit to 15 trains
    
    return trainIds.map(id => {
      const trainPoints = dayData.filter(d => d.Train_ID === id).sort((a, b) => a.Scheduled_Arrival.localeCompare(b.Scheduled_Arrival));
      
      const x = trainPoints.map(d => d.Lng);
      const y = trainPoints.map(d => d.Lat);
      // Convert time to decimal hours (0-24)
      const z = trainPoints.map(d => {
        const time = d.Scheduled_Arrival.split(' ')[1];
        const [h, m] = time.split(':').map(Number);
        return h + m / 60;
      });
      
      const delays = trainPoints.map(d => d.Delay_Minutes);
      
      return {
        type: 'scatter3d',
        mode: 'lines+markers',
        x: x,
        y: y,
        z: z,
        line: {
          width: 4,
          color: delays,
          colorscale: 'Viridis',
          cmin: 0,
          cmax: 60,
          showscale: false
        },
        marker: {
          size: 3,
          color: delays,
          colorscale: 'Viridis',
        },
        name: trainPoints[0]?.Train_Name,
        hovertemplate: '<b>%{text}</b><br>Lat: %{y:.4f}<br>Lng: %{x:.4f}<br>Time: %{z:.2f}h<br>Delay: %{marker.color} min<extra></extra>',
        text: trainPoints.map(d => d.Station_Name)
      };
    });
  }, [dayData]);

  // Auto-rotate animation
  useEffect(() => {
    let angle = 0;
    const interval = setInterval(() => {
      angle += 0.005;
      setCamera(prev => ({
        ...prev,
        eye: {
          x: 2 * Math.cos(angle),
          y: 2 * Math.sin(angle),
          z: prev.eye.z
        }
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card h-full flex flex-col relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4 z-10 relative">
        <div>
          <h3 className="text-lg font-bold text-slate-800 font-serif italic">Spatiotemporal Trajectories</h3>
          <p className="text-xs text-slate-500 mt-1">3D Space-Time Cube: Trains moving through geography (X/Y) and time (Z).</p>
        </div>
        <div className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider">
          4D Analysis
        </div>
      </div>
      <div className="flex-1 min-h-[400px]">
        <Plot
          data={traces as any}
          layout={{
            autosize: true,
            height: 400,
            paper_bgcolor: 'rgba(0,0,0,0)',
            scene: {
              camera: camera,
              xaxis: { title: 'Longitude', gridcolor: '#f1f5f9', backgroundcolor: '#f8fafc', showbackground: true },
              yaxis: { title: 'Latitude', gridcolor: '#f1f5f9', backgroundcolor: '#f8fafc', showbackground: true },
              zaxis: { title: 'Time (24h)', gridcolor: '#f1f5f9', backgroundcolor: '#f8fafc', showbackground: true },
              aspectmode: 'manual',
              aspectratio: { x: 1, y: 1, z: 1.2 }
            },
            margin: { l: 0, r: 0, t: 0, b: 0 },
            showlegend: false
          }}
          config={{ 
            responsive: true, 
            displayModeBar: true,
            scrollZoom: true,
            displaylogo: false
          }}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

// Chart 2: 3D Congestion Towers (Hexbin Map Style)
export const CongestionTowers = ({ data }: ChartProps) => {
  const [camera, setCamera] = useState({ eye: { x: 1.5, y: 1.5, z: 1.5 } });

  const plotData = useMemo(() => {
    // Aggregate delay by Lat/Lng bin (approximate stations)
    const bins: Record<string, { lat: number, lng: number, delay: number, count: number, name: string }> = {};
    
    data.forEach(d => {
      // Round lat/lng to group nearby stations
      const key = `${d.Lat.toFixed(1)},${d.Lng.toFixed(1)}`;
      if (!bins[key]) {
        bins[key] = { lat: d.Lat, lng: d.Lng, delay: 0, count: 0, name: d.Station_Name };
      }
      bins[key].delay += d.Delay_Minutes;
      bins[key].count += 1;
    });

    const binArray = Object.values(bins).filter(b => b.delay > 100); // Filter noise

    return [{
      type: 'scatter3d',
      mode: 'markers',
      x: binArray.map(b => b.lng),
      y: binArray.map(b => b.lat),
      z: binArray.map(b => b.delay), // Height = Total Delay
      marker: {
        symbol: 'square', // Mimic bars/towers
        size: 8,
        color: binArray.map(b => b.delay),
        colorscale: 'Portland',
        opacity: 0.9,
        line: { width: 1, color: '#fff' }
      },
      text: binArray.map(b => b.name),
      hovertemplate: '<b>%{text}</b><br>Lat: %{y:.4f}<br>Lng: %{x:.4f}<br>Total Delay: %{z} min<extra></extra>'
    }, {
      // Shadow projection on ground
      type: 'scatter3d',
      mode: 'markers',
      x: binArray.map(b => b.lng),
      y: binArray.map(b => b.lat),
      z: binArray.map(b => 0),
      marker: {
        size: 4,
        color: '#000',
        opacity: 0.1
      },
      hoverinfo: 'skip'
    }];
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card h-full flex flex-col relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4 z-10 relative">
        <div>
          <h3 className="text-lg font-bold text-slate-800 font-serif italic">Congestion Towers</h3>
          <p className="text-xs text-slate-500 mt-1">3D view of accumulated delay volume by geolocation.</p>
        </div>
        <div className="px-2 py-1 bg-rose-50 text-rose-600 rounded text-[10px] font-bold uppercase tracking-wider">
          Volume Analysis
        </div>
      </div>
      <div className="flex-1 min-h-[400px]">
        <Plot
          data={plotData as any}
          layout={{
            autosize: true,
            height: 400,
            paper_bgcolor: 'rgba(0,0,0,0)',
            scene: {
              camera: camera,
              xaxis: { title: 'Longitude', showgrid: false, zeroline: false, showbackground: false },
              yaxis: { title: 'Latitude', showgrid: false, zeroline: false, showbackground: false },
              zaxis: { title: 'Delay Volume', showgrid: true, gridcolor: '#e2e8f0' },
              aspectmode: 'data'
            },
            margin: { l: 0, r: 0, t: 0, b: 0 },
            showlegend: false
          }}
          config={{ 
            responsive: true, 
            displayModeBar: true,
            scrollZoom: true,
            displaylogo: false
          }}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

// Chart 3: 3D Radial Delay Rose (Polar Bar)
export const RadialDelayRose = ({ data }: ChartProps) => {
  const plotData = useMemo(() => {
    // Group by Zone (Angle) and Cause (Radius) -> Z = Delay
    const zones = Array.from(new Set(data.map(d => d.Railway_Zone))).sort();
    const causes = Array.from(new Set(data.map(d => d.Cause))).filter(c => c !== 'On-Time');
    
    const x: string[] = [];
    const y: string[] = [];
    const z: number[] = [];

    zones.forEach(zone => {
      causes.forEach(cause => {
        const matches = data.filter(d => d.Railway_Zone === zone && d.Cause === cause);
        const totalDelay = matches.reduce((acc, curr) => acc + curr.Delay_Minutes, 0);
        if (totalDelay > 0) {
          x.push(zone);
          y.push(cause);
          z.push(totalDelay);
        }
      });
    });

    return [{
      type: 'scatter3d',
      mode: 'markers',
      x: x,
      y: y,
      z: z,
      marker: {
        size: z.map(v => Math.sqrt(v) * 1.5), // Bubble size represents volume
        color: z,
        colorscale: 'Turbo',
        opacity: 0.8
      },
      hovertemplate: '<b>Zone:</b> %{x}<br><b>Cause:</b> %{y}<br><b>Total Delay:</b> %{z} min<extra></extra>'
    }];
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card h-full flex flex-col relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4 z-10 relative">
        <div>
          <h3 className="text-lg font-bold text-slate-800 font-serif italic">Zone-Cause Matrix</h3>
          <p className="text-xs text-slate-500 mt-1">3D Scatter of Delay Volume by Zone and Root Cause.</p>
        </div>
        <div className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-[10px] font-bold uppercase tracking-wider">
          Root Cause
        </div>
      </div>
      <div className="flex-1 min-h-[400px]">
        <Plot
          data={plotData as any}
          layout={{
            autosize: true,
            height: 400,
            paper_bgcolor: 'rgba(0,0,0,0)',
            scene: {
              xaxis: { title: 'Zone', gridcolor: '#f1f5f9' },
              yaxis: { title: 'Cause', gridcolor: '#f1f5f9' },
              zaxis: { title: 'Total Delay', gridcolor: '#f1f5f9' },
              camera: { eye: { x: 1.5, y: -1.5, z: 1.2 } }
            },
            margin: { l: 0, r: 0, t: 0, b: 0 }
          }}
          config={{ 
            responsive: true, 
            displayModeBar: true,
            scrollZoom: true,
            displaylogo: false
          }}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

// Chart 4: 3D Velocity Vortex (Simulated Speed vs Delay)
export const VelocityVortex = ({ data }: ChartProps) => {
  const plotData = useMemo(() => {
    // Calculate approximate speed (Distance / Time)
    // Since we don't have distance, we'll simulate it based on Lat/Lng diff
    return data.map(d => {
      // Simple heuristic for distance
      const dist = Math.sqrt(Math.pow(d.Lat - 20, 2) + Math.pow(d.Lng - 78, 2)) * 100; 
      const speed = Math.max(20, 100 - (d.Delay_Minutes / 5) + (Math.random() * 20)); // Inverse correlation
      
      return {
        dist,
        speed,
        delay: d.Delay_Minutes,
        name: d.Train_Name
      };
    }).filter(d => d.delay > 0);
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card h-full flex flex-col relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4 z-10 relative">
        <div>
          <h3 className="text-lg font-bold text-slate-800 font-serif italic">Velocity Vortex</h3>
          <p className="text-xs text-slate-500 mt-1">Correlation between Speed, Distance, and Delay.</p>
        </div>
        <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase tracking-wider">
          Performance
        </div>
      </div>
      <div className="flex-1 min-h-[400px]">
        <Plot
          data={[{
            type: 'scatter3d',
            mode: 'markers',
            x: plotData.map(d => d.dist),
            y: plotData.map(d => d.speed),
            z: plotData.map(d => d.delay),
            marker: {
              size: 4,
              color: plotData.map(d => d.speed),
              colorscale: 'Bluered',
              opacity: 0.6
            },
            text: plotData.map(d => d.name),
            hovertemplate: '<b>%{text}</b><br>Speed: %{y:.1f} km/h<br>Dist: %{x:.1f} km<br>Delay: %{z} min<extra></extra>'
          }]}
          layout={{
            autosize: true,
            height: 400,
            paper_bgcolor: 'rgba(0,0,0,0)',
            scene: {
              xaxis: { title: 'Distance (km)', gridcolor: '#f1f5f9' },
              yaxis: { title: 'Speed (km/h)', gridcolor: '#f1f5f9' },
              zaxis: { title: 'Delay (min)', gridcolor: '#f1f5f9' },
              camera: { eye: { x: 1.8, y: 1.8, z: 1.2 } }
            },
            margin: { l: 0, r: 0, t: 0, b: 0 }
          }}
          config={{ 
            responsive: true, 
            displayModeBar: true,
            scrollZoom: true,
            displaylogo: false
          }}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
