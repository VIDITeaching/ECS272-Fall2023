import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const BarChart = ({ data }) => {
  const svgRef = useRef(null);

  const margin = { top: 50, right: 30, bottom: 50, left: 50 };
  const width = 500;
  const height = 300;

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Clear any existing bars (to prevent stacking upon re-render)
    svg.selectAll("*").remove();

    // X scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d["Hours per day"]))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    // Y scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d["Age"])])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Bars
    svg
      .selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d["Hours per day"]))
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(d["Age"]))
      .attr("height", (d) => height - y(d["Age"]) - margin.bottom)
      .attr("fill", "blue");

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-90)")
      .attr("dy", "-0.5em")
      .attr("dx", "-2em")
      .style("text-anchor", "end");

    // Y axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }, [data]);

  return (
    <>
      {/* <div className="barContainer"> */}
      <svg ref={svgRef} width={width} height={height}></svg>
      {/* </div> */}
    </>
  );
};

export default BarChart;
