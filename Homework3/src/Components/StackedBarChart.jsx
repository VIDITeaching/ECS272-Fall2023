import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "../App.css";

const StackedBarChart = ({ data }) => {
  const svgRef = useRef(null);
  const [view, setView] = useState("stacked");

  const handleViewChange = (event) => {
    setView(event.target.value);
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const margin = { top: 50, right: 30, bottom: 50, left: 100 }; // Added left margin for shifting
    svg.selectAll("*").remove();

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    const width = 400; // Adjusted width
    const height = 300; // Adjusted height

    const colors = d3.scaleOrdinal(d3.schemeSet2);

    const keys = ["Never", "Rarely", "Sometimes", "Very frequently"];
    const colorScale = d3.scaleOrdinal().domain(keys).range(d3.schemeSet2);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.genre))
      .rangeRound([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear().rangeRound([height, 0]);

    // Update yScale's domain based on the view
    if (view === "stacked") {
      const stackedData = d3.stack().keys(keys)(data);
      yScale.domain([0, d3.max(stackedData, (d) => d3.max(d, (d) => d[1]))]);

      // Draw stacked bars
      chartGroup
        .append("g")
        .selectAll("g")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("fill", (d) => colorScale(d.key))
        .selectAll("rect")
        .data((d) => d)
        .enter()
        .append("rect")
        .attr("x", (d) => xScale(d.data.genre))
        .attr("y", (d) => yScale(d[1]))
        .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth());
    } else if (view === "grouped") {
      yScale.domain([0, d3.max(data, (d) => d3.max(keys, (key) => d[key]))]);

      // Draw grouped bars
      const groupScale = d3
        .scaleBand()
        .domain(keys)
        .rangeRound([0, xScale.bandwidth()])
        .padding(0.05);

      chartGroup
        .append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${xScale(d.genre)}, 0)`)
        .selectAll("rect")
        .data((d) => keys.map((key) => ({ key, value: d[key] })))
        .enter()
        .append("rect")
        .attr("x", (d) => groupScale(d.key))
        .attr("y", (d) => yScale(d.value))
        .attr("width", groupScale.bandwidth())
        .attr("height", (d) => height - yScale(d.value))
        .attr("fill", (d) => colorScale(d.key));
    } else {
      yScale.domain([0, d3.max(data, (d) => d[view])]);

      // Draw bars for single category view
      chartGroup
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d) => xScale(d.genre))
        .attr("y", (d) => yScale(d[view]))
        .attr("height", (d) => height - yScale(d[view]))
        .attr("width", xScale.bandwidth())
        .attr("fill", colorScale(view));
    }

    // Add the X Axis
    chartGroup
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Add the Y Axis
    chartGroup
      .append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(yScale).ticks(10));

    if (view === "stacked" || view === "grouped") {
      chartGroup.selectAll(".legend").remove();

      const legend = chartGroup
        .append("g")
        .attr("font-family", "Arial")
        .attr("font-size", 10)
        .selectAll(".legend")
        .data(colorScale.domain())
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

      legend
        .append("rect")
        .attr("x", width - 15 + 85)
        .attr("width", 19)
        .attr("height", 19)
        .style("fill", colorScale);

      legend
        .append("text")
        .attr("x", width - 18 + 85)
        .attr("fill", "white")
        .attr("y", 9.5)
        .attr("dy", "0.35em")
        .style("text-anchor", "end")
        .text((d) => d);
    }
  }, [data, view]);

  return (
    <>
      <div className="stackContainer">
        <div style={{ marginLeft: "10%" }}>
          <p style={{ color: "#ACACAC", fontSize: 18, fontFamily: "serif" }}>
            Frequency of Listening across Genres
          </p>
          <div>
            <label
              htmlFor="chartView"
              style={{ color: "#ACACAC", fontSize: 15, fontFamily: "serif" }}
            >
              Choose a view:{" "}
            </label>
            <select id="chartView" onChange={handleViewChange} value={view}>
              <option value="stacked">Stacked Bar Chart</option>
              <option value="grouped">Grouped Bar Chart</option>
              <option value="Never">Never</option>
              <option value="Rarely">Rarely</option>
              <option value="Sometimes">Sometimes</option>
              <option value="Very frequently">Very Frequently</option>
            </select>
          </div>
        </div>
        <svg ref={svgRef} width={600} height={450} />
      </div>
    </>
  );
};

export default StackedBarChart;
