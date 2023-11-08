import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import Data from '../data/mentalH.json';


function createGraph(filteredData, keys) {
  const data = filteredData;
  let index = -1;
  const nodes = [];
  const nodeByKey = new Map();
  const indexByKey = new Map();
  const links = [];

  for (const k of keys) {
    for (const d of data) {
      const key = JSON.stringify([k, d[k]]);
      if (nodeByKey.has(key)) continue;
      const node = { name: d[k] };
      nodes.push(node);
      nodeByKey.set(key, node);
      indexByKey.set(key, ++index);
    }
  }

  for (let i = 1; i < keys.length; ++i) {
    const a = keys[i - 1];
    const b = keys[i];
    const prefix = keys.slice(0, i + 1);
    const linkByKey = new Map();
    for (const d of data) {
      const names = prefix.map(k => d[k]);
      const key = JSON.stringify(names);
      const value = d.value || 1;
      let link = linkByKey.get(key);
      if (link) {
        link.value += value;
        continue;
      }
      link = {
        source: indexByKey.get(JSON.stringify([a, d[a]])),
        target: indexByKey.get(JSON.stringify([b, d[b]])),
        names,
        value
      };
      links.push(link);
      linkByKey.set(key, link);
    }
  }

  return { nodes, links };
}

function createSankeyDiagram() {
  const filteredData = Data.filter(entry => entry['Music effects'] !== "" && entry['While working'] !== "");
  const keys = ["Music effects", "Fav genre"];
  console.log('Keys:', keys);
  const graph = createGraph(filteredData, keys);
  
    const width = 440;
    const height = 250;
  
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
      .extent([[0, 5], [width, height - 40]]);
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
      .text(d => `${d.name}\n${(d.value || 0).toLocaleString()}`);
  
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
      .text(d => `${d.names.join(" → ")}\n${(d.value || 0).toLocaleString()}`);
  
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
      .text(d => `(${(d.value || 0).toLocaleString()})`);

      const linkGroup = svg.append("g")
      .attr("fill", "none")
      .selectAll("g")
      .data(links)
      .join("g")
      .attr("class", "link-group");

  linkGroup.append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke-width", d => Math.max(1, d.width))
      .style("mix-blend-mode", "multiply")
      .attr("class", "link")
      .style("stroke", d => color(d.names[0]))
      .on("mouseover", function (event, d) {
          d3.select(this)
              .style("stroke", d3.color(color(d.names[0])).darker(1.5)) // Brighten the color for highlighting
              .style("stroke-width", d => Math.max(1, d.width) + 4); // Increase stroke width for a more noticeable effect

         

      })
      .on("mouseout", function (event, d) {
          d3.select(this)
              .style("stroke", color(d.names[0]))
              .style("stroke-width", d => Math.max(1, d.width));

          

      })
      .append("title")
      .text(d => `${d.names.join(" → ")}\n${(d.value || 0).toLocaleString()}`);

      const legendData = Array.from(new Set(links.map((d) => d.names[0])));
      const legendColors = legendData.map((name) => color(name));
    
      // Create a legend for the Sankey diagram
      const legendGroup = svg
        .append("g")
        .attr("transform", `translate(${width / 2 - 50}, ${height - 60})`);
    
      legendGroup
        .selectAll(".legend")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0, ${i * 10})`);
    
      legendGroup
        .selectAll(".legend")
        .append("rect")
        .attr("x", 0)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", (d, i) => legendColors[i]);
    
      legendGroup
        .selectAll(".legend")
        .append("text")
        .attr("x", 24)
        .attr("y", 6)
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .style("font-size", "6px")
        .text((d, i) => legendData[i]);
      

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 6) 
        .attr("text-anchor", "middle")
        .style("font-size", "8px") 
        .style("font-weight", "bold") 
        .text("Sankey Diagram: Exploring the Influence of Music on Favorite Genre "); 
  
    return svg.node();
}

export { createSankeyDiagram, createGraph };
