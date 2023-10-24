import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import "../App.css";

const ScatterPlot = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear SVG

    const margin = { top: 10, right: 200, bottom: 200, left: 0 };
    const width = 600 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // Appends a group element to the SVG
    const mainGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left + 50},${margin.top})`);

    // X scale and axis
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d["Fav genre"]))
      .range([0, width])
      .padding(0.2);

    mainGroup
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    mainGroup
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 70) // You can adjust this value for positioning
      .text("Favorite genre")
      .attr("fill", "white")
      .style("font-size", "12px");

    // Y scale and axis
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => +d.Age)])
      .range([height, 0]);

    mainGroup.append("g").call(d3.axisLeft(yScale));

    mainGroup
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "middle")
      .attr("y", -50) // You can adjust this value for positioning
      .attr("x", -height / 2)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Age")
      .attr("fill", "white")
      .style("font-size", "12px");

    // Color palette based on 'Music effects'
    const colorScale = d3
      .scaleOrdinal()
      .domain(["Improve", "No effect", "Worsen"])
      .range(["green", "blue", "red"]);

    // Create the scatter plot
    mainGroup
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d["Fav genre"]) + xScale.bandwidth() / 2)
      .attr("cy", (d) => yScale(d.Age))
      .attr("r", 2.5)
      .style("fill", (d) => colorScale(d["Music effects"]))
      .style("opacity", 0.8);

    // Legend
    const legend = mainGroup
      .append("g")
      .attr("transform", `translate(${width + 30},10)`);

    colorScale.domain().forEach((value, index) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0,${index * 20})`);

      // legendRow
      //   .append("rect")
      //   .attr("width", 10)
      //   .attr("height", 10)
      //   .attr("fill", colorScale(value));

      legendRow
        .append("circle")
        .attr("cx", 5) // Half of the previous width/height (10/2)
        .attr("cy", 5) // Half of the previous width/height (10/2)
        .attr("r", 5) // Radius of the circle
        .attr("fill", colorScale(value));

      legendRow
        .append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("font-family", "Arial")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .style("text-transform", "capitalize")
        .attr("fill", "white")
        .text(value);
    });
  }, [data]);

  return (
    <div className="scatterContainer">
      <p style={{ color: "#ACACAC", fontSize: 18, fontFamily: "serif" }}>
        Favorite Music Genre across Ages
        <br />
        <span style={{ color: "grey", fontSize: 14, fontFamily: "serif" }}>
          {" "}
          Along with Effects on Mental Health
        </span>
      </p>
      <svg width="500" height="350" ref={ref}></svg>
    </div>
  );
};

export default ScatterPlot;
