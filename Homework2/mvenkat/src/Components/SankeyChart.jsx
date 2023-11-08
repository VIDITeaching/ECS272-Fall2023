import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "../App.css";
import { sankey, sankeyLinkHorizontal, sankeyLeft } from "d3-sankey";

function SankeyChart({ data }) {
  const ref = useRef();

  useEffect(() => {
    if (!data) {
      return;
    }

    const { nodes, links } = data;
    const svg = d3.select(ref.current);
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const colors22 = [
      "#66c2a5", // Similar to the first color in d3.schemeSet2
      "#fc8d62", // Close to the second color in d3.schemeSet2
      "#8da0cb", // Third color in d3.schemeSet2
      "#e78ac3", // Fourth color in d3.schemeSet2
      "#a6d854", // Fifth color in d3.schemeSet2
      "#ffd92f", // Sixth color in d3.schemeSet2
      "#e5c494", // Seventh color in d3.schemeSet2
      "#b3b3b3", // Eighth color in d3.schemeSet2
      "#7E57C2", // Lavender
      "#00A4B4", // Turquoise
      "#29B6F6", // Sky Blue
      "#9E0031", // Dark Red
      "#263238", // Dark Blue
      "#5C6BC0", // Mild Blue
      "#26A69A", // Teal
      "#D4E157", // Lime
      "#8D6E63", // Darker Brown
      "#C62828", // Deep Red
      "#81C784", // Soft Green
      "#F05822", // Deep Orange
      "#FFA6C9", // Warm Pink
      "#BA68C8", // Orchid Purple
    ];

    const color = d3.scaleOrdinal(colors22);

    const mySankey = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .nodeAlign(sankeyLeft)
      .extent([
        [1, 0], // Adjusted vertical start position here
        [width - 1, height - 5],
      ]);

    const { nodes: sankeyNodes, links: sankeyLinks } = mySankey({
      nodes: nodes.map((d) => Object.assign({}, d)),
      links: links.map((d) => Object.assign({}, d)),
    });

    svg
      .append("g")
      .selectAll("rect")
      .data(sankeyNodes)
      .enter()
      .append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("fill", (d) => color(d.name))
      .append("title")
      .text((d) => `${d.name}\n${d.value}`);

    svg
      .append("g")
      .attr("font-family", "Arial")
      .attr("font-size", 7.5)
      .selectAll("text")
      .data(sankeyNodes)
      .enter()
      .append("text")
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d) => (d.y1 + d.y0) / 2 + 2)
      .attr("dy", "0.35em")
      .attr("fill", "white")
      .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d) => d.name);

    svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.4)
      .selectAll("g")
      .data(sankeyLinks)
      .enter()
      .append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d) => color(d.source.name))
      .attr("stroke-width", (d) => Math.max(1, d.width));
  }, [data]);

  return (
    <>
      <div className="sankeyContainer">
        <p
          style={{
            color: "#ACACAC",
            fontSize: 18,
            fontFamily: "serif",
          }}
        >
          Preferred Platforms to Preferred Genres
        </p>
        <svg ref={ref} width={800} height={280}></svg>
      </div>
    </>
  );
}

export default SankeyChart;
