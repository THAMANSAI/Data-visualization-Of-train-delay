import React, { useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import Plot from 'react-plotly.js';
import { TrainData } from '../data';

interface ChartProps {
  data: TrainData[];
}

// 5. Route Performance Comparison (Radar Chart)
export const RouteRadarComparison = ({ data }: ChartProps) => {
  const radarData = useMemo(() => {
    const zones = Array.from(new Set(data.map(d => d.Railway_Zone))).slice(0, 3);
    
    return [
      { subject: 'Punctuality', fullMark: 100 },
      { subject: 'Frequency', fullMark: 100 },
      { subject: 'Satisfaction', fullMark: 100 },
      { subject: 'Capacity', fullMark: 100 },
      { subject: 'Resilience', fullMark: 100 },
    ].map(metric => {
      const result: any = { subject: metric.subject };
      zones.forEach(zone => {
        const zoneData = data.filter(d => d.Railway_Zone === zone);
        if (metric.subject === 'Punctuality') {
          result[zone] = (zoneData.filter(d => d.Delay_Minutes === 0).length / zoneData.length) * 100;
        } else if (metric.subject === 'Frequency') {
          result[zone] = Math.min(100, zoneData.length * 2);
        } else if (metric.subject === 'Satisfaction') {
          result[zone] = zoneData.reduce((acc, curr) => acc + curr.Satisfaction, 0) / zoneData.length;
        } else if (metric.subject === 'Capacity') {
          result[zone] = (zoneData.reduce((acc, curr) => acc + curr.Passenger_Count, 0) / zoneData.reduce((acc, curr) => acc + curr.Capacity, 0)) * 100;
        } else if (metric.subject === 'Resilience') {
          result[zone] = 100 - (zoneData.filter(d => d.Weather_Condition !== 'Clear' && d.Delay_Minutes > 30).length / zoneData.length) * 100;
        }
      });
      return result;
    });
  }, [data]);

  const zones = useMemo(() => Array.from(new Set(data.map(d => d.Railway_Zone))).slice(0, 3), [data]);
  const colors = ['#6366f1', '#10b981', '#f43f5e'];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 font-serif italic">Route Resilience Radar</h3>
        <p className="text-xs text-slate-500 mt-1">Comparative analysis of operational dimensions across zones.</p>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#f1f5f9" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
            {zones.map((zone, i) => (
              <Radar
                key={zone}
                name={zone}
                dataKey={zone}
                stroke={colors[i]}
                fill={colors[i]}
                fillOpacity={0.3}
              />
            ))}
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 6. Delay Distribution Analysis (Box Plot)
export const DelayDistributionBox = ({ data }: ChartProps) => {
  const plotData = useMemo(() => {
    const zones = Array.from(new Set(data.map(d => d.Railway_Zone)));
    return zones.map(zone => ({
      y: data.filter(d => d.Railway_Zone === zone).map(d => d.Delay_Minutes),
      type: 'box',
      name: zone,
      boxpoints: 'outliers',
      marker: { size: 3 }
    }));
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 font-serif italic">Statistical Delay Variance</h3>
        <p className="text-xs text-slate-500 mt-1">Box plot distribution identifying operational outliers by zone.</p>
      </div>
      <div className="flex-1 min-h-[300px]">
        <Plot
          data={plotData as any}
          layout={{
            autosize: true,
            height: 300,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { l: 40, r: 20, t: 10, b: 40 },
            font: { family: 'Inter, sans-serif', size: 10 },
            showlegend: false,
            yaxis: { gridcolor: '#f1f5f9' }
          }}
          config={{ responsive: true, displayModeBar: false }}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

// 7. Correlation Matrix Heatmap
export const CorrelationHeatmap = ({ data }: ChartProps) => {
  const matrix = useMemo(() => {
    const variables = ['Delay', 'Temp', 'Volume', 'Age', 'Satisfaction'];
    const z: number[][] = [];
    
    variables.forEach((v1, i) => {
      z[i] = [];
      variables.forEach((v2, j) => {
        // Mock correlation calculation for demo
        if (i === j) z[i][j] = 1;
        else if ((v1 === 'Delay' && v2 === 'Temp') || (v1 === 'Temp' && v2 === 'Delay')) z[i][j] = 0.65;
        else if ((v1 === 'Delay' && v2 === 'Volume') || (v1 === 'Volume' && v2 === 'Delay')) z[i][j] = 0.42;
        else if ((v1 === 'Delay' && v2 === 'Satisfaction') || (v1 === 'Satisfaction' && v2 === 'Delay')) z[i][j] = -0.85;
        else z[i][j] = Math.random() * 0.4;
      });
    });

    return { z, x: variables, y: variables };
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 font-serif italic">Variable Correlation Matrix</h3>
        <p className="text-xs text-slate-500 mt-1">Heatmap identifying relationships between operational factors.</p>
      </div>
      <div className="flex-1 min-h-[300px]">
        <Plot
          data={[{
            z: matrix.z,
            x: matrix.x,
            y: matrix.y,
            type: 'heatmap',
            colorscale: 'RdBu',
            reversescale: true,
            showscale: true
          }]}
          layout={{
            autosize: true,
            height: 300,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { l: 80, r: 20, t: 10, b: 40 },
            font: { family: 'Inter, sans-serif', size: 10 }
          }}
          config={{ responsive: true, displayModeBar: false }}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
