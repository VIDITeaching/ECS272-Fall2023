import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, sankeyLeft } from "d3-sankey";

function SankeyChart({ data }) {
  const ref = useRef();
  const [activeNode, setActiveNode] = useState(null);

  const highlightConnectedPaths = (node) => {
    // Only proceed if the clicked node is different from the currently active node
    if (node !== activeNode) {
      // Update the active node
      setActiveNode(node);

      // Highlight the links and nodes connected to the clicked node
      d3.selectAll(".link")
        .transition()
        .duration(300)
        .style("stroke-opacity", (d) =>
          d.source === node || d.target === node ? 0.7 : 0.05
        );
      d3.selectAll(".node")
        .transition()
        .duration(300)
        .style("opacity", (d) => (d === node ? 1 : 0.5));
    } else {
      // Reset if the same node is clicked
      setActiveNode(null);
      d3.selectAll(".link")
        .transition()
        .duration(300)
        .style("stroke-opacity", 0.5);
      d3.selectAll(".node").transition().duration(300).style("opacity", 1);
    }
  };

  useEffect(() => {
    if (!data || !data.nodes || !data.links) {
      return;
    }

    const { nodes, links } = data;
    const svgElement = ref.current;
    const svgWidth = 780;
    const svgHeight = 350;
    const svg = d3.select(svgElement);
    // const svgWidth = +svg.attr("width");
    // const svgHeight = +svg.attr("height");

    const legendRectSize = 15; // Size of the legend marker
    const legendSpacing = 4; // Spacing between markers and text
    const legendX = svgWidth - 200; // X position of the legend
    const legendY = 10;

    svg.selectAll("*").remove(); // Clear any previous SVG content

    const colors22 = [
      "#66c2a5", // Similar to the first color in d3.schemeSet2
      "#F05822", // Close to the second color in d3.schemeSet2
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
      "#fc8d62", // Dark Blue
      "#5C6BC0", // Mild Blue
      "#AF97B4", // Teal
      "#D4E157", // Lime
      "#8D6E63", // Darker Brown
      "#e789c3", // Deep Red
      "#D56D6D", // Soft Green
      "#F05822", // Deep Orange
      "#FFA6C9", // Warm Pink
      "#BA68C8", // Orchid Purple
    ];

    const color = d3.scaleOrdinal(colors22);

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendX}, ${legendY})`);

    const legendItem = legend
      .selectAll(".legend-item")
      .data(color.domain())
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr(
        "transform",
        (d, i) => `translate(0, ${i * (legendRectSize + legendSpacing)})`
      );

    // Legend squares
    legendItem
      .append("rect")
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .attr("fill", color);

    // Legend labels
    legendItem
      .append("text")
      .attr("x", legendRectSize + legendSpacing)
      .attr("y", legendRectSize - legendSpacing)
      .text((d) => d);

    const sankeyGenerator = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .nodeAlign(sankeyLeft)
      .extent([
        [1, 1],
        [svgWidth - 1, svgHeight - 5],
      ]);

    const { nodes: graphNodes, links: graphLinks } = sankeyGenerator({
      nodes: nodes.map((d) => Object.assign({}, d)),
      links: links.map((d) => Object.assign({}, d)),
    });

    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.5)
      .selectAll("path")
      .data(graphLinks)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d) => color(d.source.name))
      .attr("stroke-width", (d) => Math.max(1, d.width));

    const node = svg
      .append("g")
      .attr("stroke", "#000")
      .selectAll("rect")
      .data(graphNodes)
      .enter()
      .append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", sankeyGenerator.nodeWidth())
      .attr("fill", (d) => color(d.name))
      .attr("class", "node");

    // Update the diagram with the active node's connected links
    function updateHighlights() {
      if (activeNode) {
        link.style("stroke-opacity", (d) =>
          d.source === activeNode || d.target === activeNode ? 0.7 : 0.05
        );
        node.style("opacity", (d) => (d === activeNode ? 1 : 0.5));
      } else {
        link.style("stroke-opacity", 0.5);
        node.style("opacity", 1);
      }
    }

    svg.selectAll(".node").on("click", (event, d) => {
      // We call the highlight function directly with the clicked node data
      highlightConnectedPaths(d);
    });

    node.append("title").text((d) => `${d.name}\n${d.value}`);
    link
      .append("title")
      .text((d) => `${d.source.name} → ${d.target.name}\n${d.value}`);

    svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("fill", "#fff")
      .selectAll("text")
      .data(graphNodes)
      .enter()
      .append("text")
      .attr("x", (d) => (d.x0 < svgWidth / 2 ? d.x1 + 6 + 5 : d.x0 - 6))
      .attr("y", (d) => (d.y1 + d.y0) / 2 + 2)
      .attr("dy", "0.2em")
      .attr("text-anchor", (d) => (d.x0 < svgWidth / 2 ? "start" : "end"))
      .text((d) => d.name);
  }, [data]); // Rerun the effect when data changes

  return (
    <>
      <div className="sankeyContainer">
        <p
          style={{
            color: "#ACACAC",
            fontSize: 18,
            fontFamily: "serif",
            marginBottom: 3,
          }}
        >
          Preferred Platforms to Preferred Genres
        </p>
        <svg ref={ref} width={850} height={350}></svg>
      </div>
    </>
  );
}

export default SankeyChart;
