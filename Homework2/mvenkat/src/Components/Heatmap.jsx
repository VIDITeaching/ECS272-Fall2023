import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const Heatmap = ({ data, attribute, width = 500, height = 500 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Clean svg
    svg.selectAll("*").remove();

    // Set up scales
    const xScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.BPM), d3.max(data, (d) => d.BPM)])
      .range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 10]).range([height, 0]);

    // Histogram data
    const bins = d3
      .histogram()
      .domain(xScale.domain())
      .thresholds(40)
      .value((d) => d.BPM)(data);

    // Color scale for heatmap
    const colorScale = d3
      .scaleSequential(d3.interpolateViridis)
      .domain([0, d3.max(bins, (d) => d3.max(d, (d) => d[attribute]))]);

    // Create heatmap
    svg
      .selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.x0))
      .attr("width", (d) => xScale(d.x1) - xScale(d.x0) - 1)
      .attr("y", (d) => yScale(d3.max(d, (d) => d[attribute])))
      .attr("height", (d) => height - yScale(d3.max(d, (d) => d[attribute])))
      .attr("fill", (d) => colorScale(d3.max(d, (d) => d[attribute])));

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    svg.append("g").call(d3.axisLeft(yScale));
  }, [data, attribute]);

  return (
    <div style={{ margin: "10px" }}>
      <h3>{attribute}</h3>
      <svg ref={svgRef} width={400} height={300}></svg>
    </div>
  );
};

export default Heatmap;
