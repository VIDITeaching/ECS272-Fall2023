import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const StackedBarChart = ({ data }) => {
  const svgRef = useRef(null);
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 300;

    const colors = d3.scaleOrdinal(d3.schemeSet2);

    const stack = d3
      .stack()
      .keys(["Never", "Rarely", "Sometimes", "Very frequently"]);

    const layers = stack(data);
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.genre))
      .range([0, width])
      .padding(0.25);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(layers[layers.length - 1], (d) => d[1])])
      .range([height, 0]);

    svg.selectAll("*").remove();

    svg
      .selectAll("g.layer")
      .data(layers)
      .enter()
      .append("g")
      .classed("layer", true)
      .attr("fill", (d) => colors(d.key))
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("x", (d, i) => x(d.data.genre))
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .append("title") // Tooltip for each bar segment
      .text((d) => `${d[1] - d[0]} occurrences`);

    // Adding labels in the middle of each bar segment
    svg
      .selectAll("g.layer")
      .data(layers)
      .selectAll("text")
      .data((d) => d)
      .enter()
      .append("text")
      .attr("x", (d, i) => x(d.data.genre) + x.bandwidth() / 2)
      .attr("y", (d) => y((d[1] + d[0]) / 2))
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .attr("font-size", 8)
      .attr("dy", "0.35em")
      .text((d) => d[1] - d[0]);

    svg
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 60) // You can adjust this value for positioning
      .text("Favorite genre")
      .attr("fill", "white")
      .style("font-size", "12px");

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg
      .append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y))
      .selectAll("text") // Select all text elements of the y-axis
      .style("font-size", "4px") // Adjust font size to desired value, e.g., 14px
      .attr("dy", "-0.5em");

    // Legend
    const legend = svg
      .append("g")
      .attr("font-family", "Arial")
      .attr("font-size", 10)
      .selectAll("g")
      .data(colors.domain().slice())
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend
      .append("rect")
      .attr("x", width - 19 + 85)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", colors);

    legend
      .append("text")
      .attr("x", width - 24 + 85)
      .attr("fill", "white")
      .attr("y", 9.5)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .text((d) => d);
  }, [data]);

  return (
    <>
      <div>
        <p style={{ color: "#ACACAC", fontSize: 18, fontFamily: "serif" }}>
          Preference of Listening across Genres
        </p>
        <svg ref={svgRef} width="900" height="450"></svg>
      </div>
    </>
  );
};

export default StackedBarChart;
