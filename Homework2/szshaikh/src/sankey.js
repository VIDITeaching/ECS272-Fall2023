import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';


function createSankeyDiagram(graph) {
    const width = 450;
    const height = 225;
  
    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);
  
    const color = d3.scaleOrdinal()
      .domain(["No effect", "Improve", "Worsen"])
      .range(["#a1d99b", "#ffff99", "#e31a1c"])
      .unknown("#ccc");
  
    const sankeyGenerator = sankey()
      .nodeSort(null)
      .linkSort(null)
      .nodeWidth(4)
      .nodePadding(2)
      .extent([[0, 5], [width, height - 0]]);
  
    const { nodes, links } = sankeyGenerator({
      nodes: graph.nodes.map(d => Object.assign({}, d)),
      links: graph.links.map(d => Object.assign({}, d))
    });
  
    svg.append("g")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", d => color(d.name))
      .append("title")
      .text(d => `${d.name}\n${d.value.toLocaleString()}`);
  
    svg.append("g")
      .attr("fill", "none")
      .selectAll("g")
      .data(links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", d => color(d.names[0]))
      .attr("stroke-width", d => Math.max(1, d.width))
      .style("mix-blend-mode", "multiply")
      .append("title")
      .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);
  
    svg.append("g")
      .style("font", "5px sans-serif")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => d.name)
      .append("tspan")
      .attr("fill-opacity", 0.5)
      .text(d => `(${d.value.toLocaleString()})`);


      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 6) // Adjust the vertical position based on your preference
        .attr("text-anchor", "middle")
        .style("font-size", "8px") // Set the font size of the title
        .style("font-weight", "bold") // Set the font weight of the title
        .text("Sankey Diagram: Exploring the Influence of Music, Anxiety, and Favorite Genre "); // Set the descriptive title text
  
    return svg.node();
}

export default createSankeyDiagram;

  
  
  
  
  