import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { TrainData } from '../data';

interface PackedBubbleChartProps {
  data: TrainData[];
}

interface NodeData {
  id: string;
  group: string;
  value: number;
  radius: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  originalRadius: number;
}

interface GroupData {
  id: string;
  value: number;
  count: number;
}

export const PackedBubbleChart = ({ data }: PackedBubbleChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Aggregate data: Group by Railway_Zone -> Train_Name -> Average Delay
  const processedData = useMemo(() => {
    const zones = Array.from(new Set(data.map(d => d.Railway_Zone))).sort();
    
    const nodes: NodeData[] = [];
    const groups: GroupData[] = [];

    zones.forEach((zone) => {
      const zoneData = data.filter(d => d.Railway_Zone === zone);
      const trains = Array.from(new Set(zoneData.map(d => d.Train_Name)));
      
      let totalDelay = 0;
      let trainCount = 0;

      trains.forEach(train => {
        const trainEntries = zoneData.filter(d => d.Train_Name === train);
        const avgDelay = trainEntries.reduce((acc, curr) => acc + curr.Delay_Minutes, 0) / trainEntries.length;
        
        if (avgDelay > 0) {
          nodes.push({
            id: train,
            group: zone,
            value: avgDelay,
            // Scale radius: min 4px, max ~25px based on delay
            radius: Math.sqrt(avgDelay) * 2.5 + 4, 
            x: Math.random() * 800,
            y: Math.random() * 400,
            // Store original radius for hover effects
            originalRadius: Math.sqrt(avgDelay) * 2.5 + 4
          });
          totalDelay += avgDelay;
          trainCount++;
        }
      });

      if (trainCount > 0) {
        groups.push({
          id: zone,
          value: totalDelay / trainCount,
          count: trainCount
        });
      }
    });

    return { nodes, groups };
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || processedData.nodes.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = 600;
    const svg = d3.select(svgRef.current);
    
    svg.selectAll("*").remove();

    // --- Zoom Behavior ---
    const container = svg.append("g").attr("class", "zoom-container");
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // --- Definitions for Gradients & Filters ---
    const defs = svg.append("defs");

    // 1. Drop Shadow Filter
    const filter = defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");
    
    filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur");
    
    filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 2)
      .attr("dy", 2)
      .attr("result", "offsetBlur");
    
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "offsetBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // 2. Custom Color Palette
    const palette = [
      '#06b6d4', // Cyan
      '#8b5cf6', // Violet
      '#f43f5e', // Rose
      '#f59e0b', // Amber
      '#10b981', // Emerald
      '#3b82f6', // Blue
      '#ec4899', // Pink
      '#6366f1', // Indigo
    ];

    const colorScale = d3.scaleOrdinal(palette)
      .domain(processedData.groups.map(g => g.id));

    // 3. Radial Gradients for 3D Effect (one for each color)
    processedData.groups.forEach((g) => {
      const baseColor = d3.color(colorScale(g.id) as string)!;
      const gradientId = `grad-${g.id.replace(/\s+/g, '-')}`;
      
      const radialGradient = defs.append("radialGradient")
        .attr("id", gradientId)
        .attr("cx", "30%")
        .attr("cy", "30%")
        .attr("r", "70%");
      
      // Highlight
      radialGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", baseColor.brighter(1.2).toString());
      
      // Midtone
      radialGradient.append("stop")
        .attr("offset", "40%")
        .attr("stop-color", baseColor.toString());
      
      // Shadow
      radialGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", baseColor.darker(1.5).toString());
    });

    // --- Layout Calculation ---
    // Distribute group centers horizontally
    const groupCenters: Record<string, { x: number, y: number }> = {};
    const groupCount = processedData.groups.length;
    const padding = 100;
    const availableWidth = width - padding * 2;
    
    processedData.groups.forEach((g, i) => {
      groupCenters[g.id] = { 
        x: padding + (availableWidth / (groupCount - 1)) * i, 
        y: height / 2 
      };
    });

    // --- Draw Group Backgrounds (Subtle Zones) ---
    const groupG = container.append("g").attr("class", "groups");
    
    const groupCircles = groupG.selectAll<SVGCircleElement, GroupData>("circle")
      .data(processedData.groups)
      .join("circle")
      .attr("cx", (d: GroupData) => groupCenters[d.id].x)
      .attr("cy", (d: GroupData) => groupCenters[d.id].y)
      .attr("r", 0)
      .attr("fill", (d: GroupData) => colorScale(d.id) as string)
      .attr("opacity", 0.05)
      .attr("stroke", (d: GroupData) => colorScale(d.id) as string)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4 4");

    groupCircles.transition()
      .duration(1500)
      .ease(d3.easeElasticOut)
      .attr("r", 140);

    // --- Draw Group Labels ---
    const labelG = container.append("g").attr("class", "labels");
    
    const labels = labelG.selectAll<SVGGElement, GroupData>("g")
      .data(processedData.groups)
      .join("g")
      .attr("transform", (d: GroupData) => `translate(${groupCenters[d.id].x}, ${groupCenters[d.id].y - 160})`)
      .attr("opacity", 0);

    labels.append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "#1e293b")
      .attr("font-size", "14px")
      .attr("font-weight", "800")
      .attr("font-family", "Inter, sans-serif")
      .attr("letter-spacing", "0.05em")
      .text((d: GroupData) => d.id.toUpperCase());

    labels.append("text")
      .attr("dy", "1.4em")
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b")
      .attr("font-size", "11px")
      .attr("font-family", "Inter, sans-serif")
      .text((d: GroupData) => `${d.count} Active Units`);

    labels.transition()
      .delay(800)
      .duration(800)
      .attr("opacity", 1);

    // --- Force Simulation ---
    const simulation = d3.forceSimulation<NodeData>(processedData.nodes)
      .force("x", d3.forceX((d: NodeData) => groupCenters[d.group].x).strength(0.08))
      .force("y", d3.forceY((d: NodeData) => groupCenters[d.group].y).strength(0.08))
      .force("collide", d3.forceCollide((d: NodeData) => d.radius + 3).strength(0.9))
      .force("charge", d3.forceManyBody().strength(-2));

    // --- Draw Nodes (Bubbles) ---
    const nodeG = container.append("g").attr("class", "nodes");

    const node = nodeG.selectAll<SVGCircleElement, NodeData>("circle")
      .data(processedData.nodes)
      .join("circle")
      .attr("r", 0)
      // Use the radial gradient defined earlier
      .attr("fill", (d: NodeData) => `url(#grad-${d.group.replace(/\s+/g, '-')})`)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.4)
      .style("filter", "url(#drop-shadow)")
      .style("cursor", "pointer")
      .call(d3.drag<SVGCircleElement, NodeData>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Animate nodes entry
    node.transition()
      .duration(1000)
      .delay((d: NodeData, i: number) => i * 3)
      .ease(d3.easeBackOut.overshoot(1.7))
      .attr("r", (d: NodeData) => d.radius);

    // --- Tooltip Logic ---
    const tooltip = d3.select("body").append("div")
      .attr("class", "fixed z-50 px-4 py-3 text-sm bg-white/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl pointer-events-none opacity-0 transition-opacity duration-200 transform -translate-x-1/2 -translate-y-full mb-2");

    node.on("mouseover", (event: MouseEvent, d: NodeData) => {
      // Highlight effect
      d3.select(event.currentTarget as SVGCircleElement)
        .transition()
        .duration(300)
        .attr("r", d.radius * 1.2)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 1);

      // Show tooltip
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`
        <div class="flex items-center gap-2 mb-1">
          <div class="w-2 h-2 rounded-full" style="background-color: ${colorScale(d.group)}"></div>
          <span class="font-bold text-slate-800">${d.id}</span>
        </div>
        <div class="text-xs text-slate-500 font-medium mb-2">${d.group} Zone</div>
        <div class="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <span class="text-xs text-slate-400">Avg Delay</span>
          <span class="font-mono font-bold text-rose-500">${Math.round(d.value)} min</span>
        </div>
      `)
      .style("left", (event.pageX) + "px")
      .style("top", (event.pageY - 10) + "px");
    })
    .on("mousemove", (event: MouseEvent) => {
       tooltip
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", (event: MouseEvent, d: NodeData) => {
      // Reset effect
      d3.select(event.currentTarget as SVGCircleElement)
        .transition()
        .duration(300)
        .attr("r", d.radius)
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.4);

      tooltip.transition().duration(200).style("opacity", 0);
    });

    // --- Simulation Tick ---
    simulation.on("tick", () => {
      node
        .attr("cx", (d: NodeData) => d.x!)
        .attr("cy", (d: NodeData) => d.y!);
      
      // Gentle floating motion when alpha is low
      if (simulation.alpha() < 0.05) {
        node.attr("cy", (d: NodeData) => d.y! + Math.sin(Date.now() / 1000 + d.x!) * 2);
      }
    });

    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, NodeData, NodeData>, d: NodeData) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d3.select(event.sourceEvent.target).style("cursor", "grabbing");
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, NodeData, NodeData>, d: NodeData) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, NodeData, NodeData>, d: NodeData) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      d3.select(event.sourceEvent.target).style("cursor", "pointer");
    }

    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [processedData]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-card h-full flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-slate-50/30 grid-pattern opacity-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-cyan/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
      
      <div className="mb-8 relative z-10 flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold text-text-primary font-serif italic tracking-tight">Emerging Delay Clusters by Zone</h3>
          <p className="text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">
            Advanced force-directed simulation visualizing delay intensity across operational zones. 
            Each node represents a train unit; size correlates to delay magnitude.
            <span className="inline-block ml-2 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Interactive Physics
            </span>
          </p>
        </div>
        <div className="flex gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 shadow-sm"></div>
            <span>Low Impact</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 shadow-sm"></div>
            <span>High Impact</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full relative z-10 min-h-[600px] bg-white/40 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-inner">
        <svg ref={svgRef} className="w-full h-full" style={{ overflow: 'visible' }} />
      </div>
    </div>
  );
};

