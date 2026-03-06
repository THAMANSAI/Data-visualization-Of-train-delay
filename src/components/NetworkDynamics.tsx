import React, { useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import * as d3 from 'd3';
import { TrainData } from '../data';
import { AlertTriangle, CloudRain, Settings, Clock } from 'lucide-react';

interface ChartProps {
  data: TrainData[];
}

// 8. Real-Time Event Timeline
export const EventTimeline = ({ data }: ChartProps) => {
  const events = useMemo(() => {
    return data
      .filter(d => d.Delay_Minutes > 45)
      .slice(0, 10)
      .map((d, i) => ({
        id: i,
        time: d.Scheduled_Arrival.split(' ')[1],
        type: d.Cause,
        station: d.Station_Name,
        severity: d.Delay_Minutes > 90 ? 'Critical' : 'Major'
      }));
  }, [data]);

  const getIcon = (type: string) => {
    if (type === 'Weather') return <CloudRain size={14} />;
    if (type === 'Technical Fault') return <Settings size={14} />;
    return <AlertTriangle size={14} />;
  };

  return (
    <div className="glass-panel rounded-3xl p-8 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Clock size={120} />
      </div>

      <div className="mb-8 relative z-10">
        <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Incident Event Stream</h3>
        <p className="metadata-xs text-text-secondary mt-1">Chronological log of significant network disruptions.</p>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
        <div className="relative border-l-2 border-white/5 ml-2 pl-8 space-y-8">
          {events.map((event, i) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-bg-primary shadow-lg flex items-center justify-center ${
                event.severity === 'Critical' ? 'bg-accent-rose shadow-[0_0_10px_rgba(255,45,85,0.5)]' : 'bg-accent-amber shadow-[0_0_10px_rgba(255,184,0,0.5)]'
              }`}>
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black text-text-muted font-mono">{event.time}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest border ${
                    event.severity === 'Critical' ? 'bg-accent-rose/10 text-accent-rose border-accent-rose/20' : 'bg-accent-amber/10 text-accent-amber border-accent-amber/20'
                  }`}>
                    {event.severity}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-text-secondary">{getIcon(event.type)}</div>
                  <span className="text-sm font-black text-white tracking-tight">{event.type} at {event.station}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 9. Network Topology Graph
export const NetworkTopology = ({ data }: ChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 600;
    const height = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const stations = Array.from(new Set(data.map(d => d.Station_Name))).slice(0, 20);
    const nodes = stations.map(name => ({ id: name, group: data.find(d => d.Station_Name === name)?.Railway_Zone }));
    
    const links: any[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({ source: nodes[i].id, target: nodes[i+1].id, value: Math.random() * 10 });
      if (i % 3 === 0 && i + 5 < nodes.length) {
        links.push({ source: nodes[i].id, target: nodes[i+5].id, value: Math.random() * 5 });
      }
    }

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(50))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 8)
      .attr("fill", (d: any) => d3.schemeTableau10[nodes.indexOf(d) % 10])
      .call(d3.drag<SVGCircleElement, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append("title").text(d => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });

    return () => simulation.stop();
  }, [data]);

  return (
    <div className="glass-panel rounded-3xl p-8 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Settings size={120} />
      </div>

      <div className="mb-8 relative z-10">
        <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Network Topology Graph</h3>
        <p className="metadata-xs text-text-secondary mt-1">Force-directed visualization of station connectivity nodes.</p>
      </div>
      <div className="flex-1 min-h-[300px] bg-black/20 rounded-2xl border border-white/5 overflow-hidden relative z-10">
        <svg ref={svgRef} viewBox="0 0 600 400" className="w-full h-full" />
      </div>
    </div>
  );
};

// 10. Delay Propagation Animation
export const DelayPropagation = ({ data }: ChartProps) => {
  const propagationData = useMemo(() => {
    const criticalTrains = Array.from(new Set(data.filter(d => d.Delay_Minutes > 60).map(d => d.Train_ID))).slice(0, 5);
    return criticalTrains.map(id => {
      const trainData = data.filter(d => d.Train_ID === id).sort((a, b) => a.Scheduled_Arrival.localeCompare(b.Scheduled_Arrival));
      return {
        id,
        name: trainData[0].Train_Name,
        path: trainData.map(d => ({ station: d.Station_Name, delay: d.Delay_Minutes }))
      };
    });
  }, [data]);

  return (
    <div className="glass-panel rounded-3xl p-8 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <AlertTriangle size={120} />
      </div>

      <div className="mb-8 relative z-10">
        <h3 className="text-white font-black text-xl uppercase tracking-widest italic">Delay Propagation Analysis</h3>
        <p className="metadata-xs text-text-secondary mt-1">Visualizing the "ripple effect" of latency across connected nodes.</p>
      </div>
      <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2 relative z-10">
        {propagationData.map((train, idx) => (
          <div key={train.id} className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-white uppercase tracking-widest">{train.name}</span>
              <span className="text-[9px] text-text-muted uppercase font-black tracking-[0.2em]">Propagation Path</span>
            </div>
            <div className="flex items-center gap-2">
              {train.path.map((step, i) => (
                <React.Fragment key={i}>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.2 + idx * 0.5 }}
                    className={`w-4 h-4 rounded-full shadow-lg border-2 border-bg-primary ${
                      step.delay > 60 ? 'bg-accent-rose shadow-[0_0_10px_rgba(255,45,85,0.5)]' : step.delay > 15 ? 'bg-accent-amber shadow-[0_0_10px_rgba(255,184,0,0.5)]' : 'bg-accent-cyan shadow-[0_0_10px_rgba(0,209,255,0.5)]'
                    }`}
                    title={`${step.station}: ${step.delay}m`}
                  />
                  {i < train.path.length - 1 && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: 24 }}
                      transition={{ delay: i * 0.2 + idx * 0.5 + 0.1 }}
                      className="h-0.5 bg-white/5" 
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
