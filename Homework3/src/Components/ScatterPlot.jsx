import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import "../App.css";

const ScatterPlot = ({ data }) => {
  const [filter, setFilter] = useState("All");
  const ref = useRef();
  const brushRef = useRef();

  useEffect(() => {
    const filteredData =
      filter === "All"
        ? data
        : data.filter((d) => d["Primary streaming service"] === filter);

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 10, right: 200, bottom: 200, left: 0 };
    const width = 670;
    const height = 300;

    const mainGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left + 50},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(filteredData.map((d) => d["Fav genre"]))
      .range([0, width])
      .padding(0.2);

    const xAxisGroup = mainGroup
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => +d.Age)])
      .range([height, 0]);

    mainGroup.append("g").call(d3.axisLeft(yScale));

    const colorScale = d3
      .scaleOrdinal()
      .domain(["Improve", "No effect", "Worsen"])
      .range(["green", "blue", "red"]);

    const circles = mainGroup
      .selectAll("circle")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d["Fav genre"]) + xScale.bandwidth() / 2)
      .attr("cy", (d) => yScale(d.Age))
      .attr("r", 2.5)
      .attr("fill", (d) => colorScale(d["Music effects"]))
      .attr("class", "dot");
    // Transition setup
    const t = d3.transition().duration(750);

    // Brushing
    const brush = d3
      .brush()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("end", brushed);

    mainGroup.append("g").attr("class", "brush").call(brush);

    function brushed(event) {
      const selection = event.selection;
      if (selection) {
        // Calculate the sub-domain for the y-axis
        const [y0, y1] = selection
          .map((d) => d[1])
          .map(yScale.invert)
          .sort((a, b) => a - b);
        yScale.domain([y1, y0]);

        // Identify categories within the selection for the x-axis
        const [x0, x1] = selection.map((d) => d[0]);
        const selectedCategories = xScale.domain().filter((d) => {
          const xPosition = xScale(d) + xScale.bandwidth() / 2;
          return xPosition >= x0 && xPosition <= x1;
        });

        // Update the xScale domain to the selected categories
        xScale.domain(selectedCategories);
        xAxisGroup.transition().call(d3.axisBottom(xScale));

        // Update the y-axis with the new domain
        mainGroup.select(".y-axis").transition().call(d3.axisLeft(yScale));

        // Update circles based on the new domain
        mainGroup
          .selectAll("circle")
          .attr("cx", (d) =>
            selectedCategories.includes(d["Fav genre"])
              ? xScale(d["Fav genre"]) + xScale.bandwidth() / 2
              : -100
          )
          .attr("cy", (d) => yScale(d.Age))
          .attr("r", (d) =>
            selectedCategories.includes(d["Fav genre"]) ? 2.5 : 0
          ); // Hide circles not in the selection

        // Clear the brush selection
        mainGroup.select(".brush").call(brush.move, null);
      } else {
        // Reset the scales if there's no selection
        xScale.domain(filteredData.map((d) => d["Fav genre"]));
        yScale.domain([0, d3.max(filteredData, (d) => +d.Age)]);

        // Redraw the axes and circles
        xAxisGroup.transition().call(d3.axisBottom(xScale));
        mainGroup.select(".y-axis").transition().call(d3.axisLeft(yScale));
        mainGroup
          .selectAll("circle")
          .data(filteredData)
          .attr("cx", (d) => xScale(d["Fav genre"]) + xScale.bandwidth() / 2)
          .attr("cy", (d) => yScale(d.Age))
          .attr("r", 2.5); // Make all circles visible
      }
    }
    const legend = mainGroup
      .append("g")
      .attr("transform", `translate(${width + 30},10)`);

    colorScale.domain().forEach((value, index) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0,${index * 20})`);

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
  }, [data, filter]);

  const streamingServices = [
    "All",
    ...new Set(data.map((d) => d["Primary streaming service"])),
  ];

  return (
    <div className="scatterContainer">
      <p style={{ color: "#ACACAC", fontSize: 18, fontFamily: "serif" }}>
        Favorite Music Genre across Ages (Overview)
        <br />
        <span style={{ color: "grey", fontSize: 14, fontFamily: "serif" }}>
          {" "}
          Along with Effects on Mental Health
        </span>
      </p>
      <div style={{ marginBottom: "10px" }}>
        <label
          htmlFor="streamingService"
          style={{
            color: "#ACACAC",
            fontSize: 15,
            fontFamily: "serif",
            marginRight: "10px",
          }}
        >
          Choose a streaming service:
        </label>
        <select
          id="streamingService"
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
        >
          <option value="All">All</option>
          {Array.from(
            new Set(data.map((d) => d["Primary streaming service"]))
          ).map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>
      <svg ref={ref} width="760" height="800"></svg>
    </div>
  );
};

export default ScatterPlot;
