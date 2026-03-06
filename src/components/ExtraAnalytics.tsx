import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { TrainData } from '../data';
import { CloudRain, GitBranch, Layers, Activity, Sun, Zap, Share2, Box } from 'lucide-react';

interface ChartProps {
  data: TrainData[];
}

// 1. 3D Weather-Delay Terrain
export const WeatherDelayTerrain = ({ data }: ChartProps) => {
  const plotData = useMemo(() => {
    const weatherTypes = Array.from(new Set(data.map(d => d.Weather_Condition)));
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const z: number[][] = weatherTypes.map(weather => {
      return hours.map(hour => {
        const matches = data.filter(d => d.Weather_Condition === weather && d.Hour === hour);
        return matches.length > 0 ? matches.reduce((acc, curr) => acc + curr.Delay_Minutes, 0) / matches.length : 0;
      });
    });

    return [{
      type: 'surface',
      z: z,
      x: hours,
      y: weatherTypes,
      colorscale: 'Electric',
      showscale: false,
      opacity: 0.9,
      contours: {
        z: { show: true, usecolormap: true, highlightcolor: "#fff", project: { z: true } }
      }
    }];
  }, [data]);

  return (
    <div className="glass-panel rounded-3xl p-8 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <CloudRain size={120} />
      </div>
      
      <div className="flex justify-between items-start mb-8 z-10 relative">
        <div>
          <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Weather-Delay Terrain</h3>
          <p className="metadata-xs text-text-secondary mt-1">3D Surface showing average delay by Hour and Weather Condition.</p>
        </div>
        <div className="flex gap-2">
          <span className="metadata-xs font-black px-2 py-1 rounded-md bg-white/5 text-text-secondary border border-white/10 uppercase tracking-widest">Environment</span>
          <span className="metadata-xs font-black px-2 py-1 rounded-md bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 uppercase tracking-widest">Live</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-[400px] relative z-10">
        <Plot
          data={plotData as any}
          layout={{
            autosize: true,
            height: 400,
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: 'rgba(255,255,255,0.5)', family: 'Inter, sans-serif' },
            scene: {
              xaxis: { title: 'Hour', gridcolor: 'rgba(255,255,255,0.05)', showbackground: false },
              yaxis: { title: 'Weather', gridcolor: 'rgba(255,255,255,0.05)', showbackground: false },
              zaxis: { title: 'Avg Delay', gridcolor: 'rgba(255,255,255,0.05)', showbackground: false },
              camera: { eye: { x: 1.8, y: 1.2, z: 1.2 } },
              aspectmode: 'manual',
              aspectratio: { x: 1, y: 1, z: 0.5 }
            },
            margin: { l: 0, r: 0, t: 0, b: 0 }
          }}
          config={{ 
            responsive: true, 
            displayModeBar: false,
            scrollZoom: true,
            displaylogo: false
          }}
          className="w-full h-full"
        />
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-8 relative z-10">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="metadata-xs text-text-muted uppercase tracking-widest">Atmospheric</span>
            <span className="text-xs font-black font-mono text-white">REAL-TIME</span>
          </div>
          <div className="flex flex-col">
            <span className="metadata-xs text-text-muted uppercase tracking-widest">Resolution</span>
            <span className="text-xs font-black font-mono text-white">HIGH-RES</span>
          </div>
        </div>
        <Zap size={16} className="text-accent-cyan animate-pulse" />
      </div>
    </div>
  );
};

// 2. Delay Flow Sankey
export const DelayFlowSankey = ({ data }: ChartProps) => {
  const plotData = useMemo(() => {
    const zones = Array.from(new Set(data.map(d => d.Railway_Zone)));
    const causes = Array.from(new Set(data.map(d => d.Cause)));
    
    const nodes = [...zones, ...causes];
    const nodeMap = new Map(nodes.map((name, i) => [name, i]));
    
    const sources: number[] = [];
    const targets: number[] = [];
    const values: number[] = [];

    zones.forEach(zone => {
      causes.forEach(cause => {
        const totalDelay = data
          .filter(d => d.Railway_Zone === zone && d.Cause === cause)
          .reduce((acc, curr) => acc + curr.Delay_Minutes, 0);
        
        if (totalDelay > 0) {
          sources.push(nodeMap.get(zone)!);
          targets.push(nodeMap.get(cause)!);
          values.push(totalDelay);
        }
      });
    });

    return [{
      type: 'sankey',
      orientation: 'h',
      node: {
        pad: 20,
        thickness: 15,
        line: { color: 'rgba(255,255,255,0.1)', width: 1 },
        label: nodes,
        color: nodes.map((_, i) => i < zones.length ? 'rgba(0, 209, 255, 0.8)' : 'rgba(191, 90, 242, 0.8)'),
        font: { color: 'white', size: 10, family: 'Inter, sans-serif' }
      },
      link: {
        source: sources,
        target: targets,
        value: values,
        color: 'rgba(255, 255, 255, 0.05)',
        hovercolor: 'rgba(0, 209, 255, 0.2)'
      }
    }];
  }, [data]);

  return (
    <div className="glass-panel rounded-3xl p-8 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Share2 size={120} />
      </div>
      
      <div className="flex justify-between items-start mb-8 z-10 relative">
        <div>
          <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Delay Flow Dynamics</h3>
          <p className="metadata-xs text-text-secondary mt-1">Sankey diagram showing how delays flow from Zones to Root Causes.</p>
        </div>
        <div className="flex gap-2">
          <span className="metadata-xs font-black px-2 py-1 rounded-md bg-white/5 text-text-secondary border border-white/10 uppercase tracking-widest">Flow Analysis</span>
          <span className="metadata-xs font-black px-2 py-1 rounded-md bg-accent-violet/10 text-accent-violet border border-accent-violet/20 uppercase tracking-widest">Neural</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-[400px] relative z-10">
        <Plot
          data={plotData as any}
          layout={{
            autosize: true,
            height: 400,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { l: 0, r: 0, t: 20, b: 20 },
            font: { color: 'rgba(255,255,255,0.5)', family: 'Inter, sans-serif' }
          }}
          config={{ 
            responsive: true, 
            displayModeBar: false,
            scrollZoom: true,
            displaylogo: false
          }}
          className="w-full h-full"
        />
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-8 relative z-10">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="metadata-xs text-text-muted uppercase tracking-widest">Topology</span>
            <span className="text-xs font-black font-mono text-white">DIRECTED GRAPH</span>
          </div>
          <div className="flex flex-col">
            <span className="metadata-xs text-text-muted uppercase tracking-widest">Nodes</span>
            <span className="text-xs font-black font-mono text-white">ACTIVE</span>
          </div>
        </div>
        <Activity size={16} className="text-accent-violet animate-pulse" />
      </div>
    </div>
  );
};

// 3. Performance Parallel Coordinates
export const PerformanceParallel = ({ data }: ChartProps) => {
  const plotData = useMemo(() => {
    const sample = data.slice(0, 500); // Sample for performance
    
    // Convert categorical to numeric for parallel coordinates
    const zones = Array.from(new Set(data.map(d => d.Railway_Zone)));
    const weather = Array.from(new Set(data.map(d => d.Weather_Condition)));
    
    return [{
      type: 'parcoords',
      line: {
        color: sample.map(d => d.Delay_Minutes),
        colorscale: 'Viridis',
        showscale: false,
        reversescale: true,
        cmin: 0,
        cmax: 60
      },
      labelfont: { color: 'white', size: 11, family: 'Inter, sans-serif' },
      tickfont: { color: 'rgba(255,255,255,0.5)', size: 9 },
      dimensions: [
        {
          label: 'Zone',
          values: sample.map(d => zones.indexOf(d.Railway_Zone)),
          tickvals: zones.map((_, i) => i),
          ticktext: zones
        },
        {
          label: 'Delay (min)',
          values: sample.map(d => d.Delay_Minutes)
        },
        {
          label: 'Distance (km)',
          values: sample.map(d => d.Distance_KM)
        },
        {
          label: 'Weather',
          values: sample.map(d => weather.indexOf(d.Weather_Condition)),
          tickvals: weather.map((_, i) => i),
          ticktext: weather
        }
      ]
    }];
  }, [data]);

  return (
    <div className="glass-panel rounded-3xl p-8 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <GitBranch size={120} />
      </div>
      
      <div className="flex justify-between items-start mb-8 z-10 relative">
        <div>
          <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Multivariate Performance</h3>
          <p className="metadata-xs text-text-secondary mt-1">Parallel coordinates comparing multiple operational dimensions.</p>
        </div>
        <div className="flex gap-2">
          <span className="metadata-xs font-black px-2 py-1 rounded-md bg-white/5 text-text-secondary border border-white/10 uppercase tracking-widest">Dimensions</span>
          <span className="metadata-xs font-black px-2 py-1 rounded-md bg-accent-amber/10 text-accent-amber border border-accent-amber/20 uppercase tracking-widest">Vector</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-[400px] relative z-10">
        <Plot
          data={plotData as any}
          layout={{
            autosize: true,
            height: 400,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { l: 60, r: 60, t: 40, b: 40 },
            font: { color: 'rgba(255,255,255,0.5)', family: 'Inter, sans-serif' }
          }}
          config={{ 
            responsive: true, 
            displayModeBar: false,
            scrollZoom: true,
            displaylogo: false
          }}
          className="w-full h-full"
        />
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-8 relative z-10">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="metadata-xs text-text-muted uppercase tracking-widest">Correlation</span>
            <span className="text-xs font-black font-mono text-white">MULTI-AXIS</span>
          </div>
          <div className="flex flex-col">
            <span className="metadata-xs text-text-muted uppercase tracking-widest">Sample</span>
            <span className="text-xs font-black font-mono text-white">500 UNITS</span>
          </div>
        </div>
        <Zap size={16} className="text-accent-amber animate-pulse" />
      </div>
    </div>
  );
};

// 4. 3D Zone-Time Ribbon
export const ZoneTimeRibbon = ({ data }: ChartProps) => {
  const plotData = useMemo(() => {
    const zones = Array.from(new Set(data.map(d => d.Railway_Zone))).sort();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return zones.map((zone, i) => {
      const zValues = hours.map(hour => {
        const matches = data.filter(d => d.Railway_Zone === zone && d.Hour === hour);
        return matches.length > 0 ? matches.reduce((acc, curr) => acc + curr.Delay_Minutes, 0) / matches.length : 0;
      });
      
      return {
        type: 'scatter3d',
        mode: 'lines',
        name: zone,
        x: hours,
        y: Array(24).fill(i),
        z: zValues,
        line: { width: 8, color: i, colorscale: 'Viridis' },
        opacity: 0.8
      };
    });
  }, [data]);

  return (
    <div className="glass-panel rounded-3xl p-8 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Layers size={120} />
      </div>
      
      <div className="flex justify-between items-start mb-8 z-10 relative">
        <div>
          <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Temporal Zone Ribbons</h3>
          <p className="metadata-xs text-text-secondary mt-1">3D Ribbon chart showing delay trends across zones over 24 hours.</p>
        </div>
        <div className="flex gap-2">
          <span className="metadata-xs font-black px-2 py-1 rounded-md bg-white/5 text-text-secondary border border-white/10 uppercase tracking-widest">Trends</span>
          <span className="metadata-xs font-black px-2 py-1 rounded-md bg-accent-rose/10 text-accent-rose border border-accent-rose/20 uppercase tracking-widest">Temporal</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-[400px] relative z-10">
        <Plot
          data={plotData as any}
          layout={{
            autosize: true,
            height: 400,
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: 'rgba(255,255,255,0.5)', family: 'Inter, sans-serif' },
            scene: {
              xaxis: { title: 'Hour', gridcolor: 'rgba(255,255,255,0.05)', showbackground: false },
              yaxis: { title: 'Zone Index', gridcolor: 'rgba(255,255,255,0.05)', showbackground: false },
              zaxis: { title: 'Avg Delay', gridcolor: 'rgba(255,255,255,0.05)', showbackground: false },
              camera: { eye: { x: 2, y: 1.5, z: 1 } },
              aspectmode: 'manual',
              aspectratio: { x: 1, y: 1, z: 0.5 }
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
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-8 relative z-10">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="metadata-xs text-text-muted uppercase tracking-widest">Projection</span>
            <span className="text-xs font-black font-mono text-white">3D RIBBON</span>
          </div>
          <div className="flex flex-col">
            <span className="metadata-xs text-text-muted uppercase tracking-widest">Sampling</span>
            <span className="text-xs font-black font-mono text-white">24H CYCLE</span>
          </div>
        </div>
        <Zap size={16} className="text-accent-rose animate-pulse" />
      </div>
    </div>
  );
};

// 5. Hierarchical Delay Sunburst
export const DelaySunburst = ({ data }: ChartProps) => {
  const plotData = useMemo(() => {
    const labels: string[] = ['Railway Network'];
    const parents: string[] = [''];
    const values: number[] = [data.reduce((acc, curr) => acc + curr.Delay_Minutes, 0)];
    
    const zones = Array.from(new Set(data.map(d => d.Railway_Zone)));
    
    zones.forEach(zone => {
      const zoneData = data.filter(d => d.Railway_Zone === zone);
      const zoneDelay = zoneData.reduce((acc, curr) => acc + curr.Delay_Minutes, 0);
      
      labels.push(zone);
      parents.push('Railway Network');
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
      type: 'sunburst',
      labels: labels,
      parents: parents,
      values: values,
      branchvalues: 'total',
      marker: { line: { width: 1, color: 'rgba(255,255,255,0.1)' } },
      colorscale: 'Viridis',
      opacity: 0.9
    }];
  }, [data]);

  return (
    <div className="glass-panel rounded-3xl p-8 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Box size={120} />
      </div>
      
      <div className="flex justify-between items-start mb-8 z-10 relative">
        <div>
          <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Hierarchical Delay Breakdown</h3>
          <p className="metadata-xs text-text-secondary mt-1">Sunburst chart showing delay distribution from Network to Zone to Cause.</p>
        </div>
        <div className="flex gap-2">
          <span className="metadata-xs font-black px-2 py-1 rounded-md bg-white/5 text-text-secondary border border-white/10 uppercase tracking-widest">Hierarchy</span>
          <span className="metadata-xs font-black px-2 py-1 rounded-md bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 uppercase tracking-widest">Structural</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-[400px] relative z-10">
        <Plot
          data={plotData as any}
          layout={{
            autosize: true,
            height: 400,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { l: 0, r: 0, t: 0, b: 0 },
            font: { color: 'rgba(255,255,255,0.5)', family: 'Inter, sans-serif' }
          }}
          config={{ 
            responsive: true, 
            displayModeBar: false,
            scrollZoom: true,
            displaylogo: false
          }}
          className="w-full h-full"
        />
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-8 relative z-10">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="metadata-xs text-text-muted uppercase tracking-widest">Depth</span>
            <span className="text-xs font-black font-mono text-white">3 LEVELS</span>
          </div>
          <div className="flex flex-col">
            <span className="metadata-xs text-text-muted uppercase tracking-widest">Metric</span>
            <span className="text-xs font-black font-mono text-white">AGGREGATE</span>
          </div>
        </div>
        <Zap size={16} className="text-accent-cyan animate-pulse" />
      </div>
    </div>
  );
};
