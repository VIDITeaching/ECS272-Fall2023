<template>
  <h2>Data Science Job Salaries</h2>
  <div>
    <div ref="sankey"></div> <!-- container for Sankey diagram -->
  </div>
</template>

<script lang="ts">
import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

export default {
  data() {
    return {
      sankeyData: {
        nodes: [],
        links: []
      },
      size: { width: 700, height: 300 },
      margin: { left: 50, right: 40, top: 40, bottom: 60 },
    }
  },
  mounted() {
    this.loadDataAndConvert().then(() => {
      this.createSankeydiagram();
    });
  },
  methods: {
    async loadDataAndConvert() {
      const data = await d3.csv('../../data/ds_salaries.csv');
      if (data && data.length > 0) {
        const rawLinks = data.map(d => ({
          source: d.experience_level || '',
          target: d.job_title || '',
          value: Number(d.salary_in_usd) || 0,
        }));
        
        const topTenSalaries = rawLinks.sort((a, b) => b.value - a.value).slice(0, 10);
        const uniqueNodeNames = new Set();

        topTenSalaries.forEach(link => {
          uniqueNodeNames.add(link.source);
          uniqueNodeNames.add(link.target);
        });

        const nodes = [...uniqueNodeNames].map(name => ({ name }));
        const links = topTenSalaries.map(d => ({
          source: nodes.findIndex(node => node.name === d.source),
          target: nodes.findIndex(node => node.name === d.target),
          value: d.value
        }));

        this.sankeyData = { nodes, links };
        // console.log(this.sankeyData, "curr sankey");
      }
    },

    createSankeydiagram() {
      const svgContainer = this.$refs.sankey as HTMLElement;
      d3.select(svgContainer).selectAll("*").remove();

      const width = this.size.width - this.margin.left - this.margin.right;
      const height = this.size.height - this.margin.top - this.margin.bottom;
      const svg = d3.select(svgContainer)
        .append('svg')
        .attr('width', this.size.width)
        .attr('height', this.size.height)
        .append('g')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

      const sankeyLayout = sankey()
        .nodeWidth(10)
        .nodePadding(10)
        .extent([[1, 1], [width - 1, height - 6]]);

      // console.log(this.sankeyData);

      const { nodes, links } = sankeyLayout(this.sankeyData);
      // console.log(nodes, "nodes");
      // console.log(links, "links");
      
      // 1. Define the Logarithmic Scale
      const widthLogScale = d3.scaleLog()
          .domain([1, d3.max(links, d => d.width) + 1])
          .range([1, 20]);  // Adjust the output range as needed

      const colorScale = d3.scaleOrdinal(d3.schemePastel1);
      
      svg.append("g")
        .selectAll(".link")
        .data(links)
        .join("path")
        .attr("class", "link")
        .attr("d", sankeyLinkHorizontal())
        .attr("stroke-width", d => Math.max(1, d.width))
        .attr("stroke-opacity", 1)
        .attr("stroke", d => colorScale(d.source.name));
       
      svg.append("g")
        .selectAll(".node")
        .data(nodes)
        .join("rect")
        .attr("class", "node")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => colorScale(d.name));

      svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => d.name);


    svg.append("text")
    .attr("x", width / 2) 
    .attr("y", -15)
    .style('text-anchor', 'middle')
    .style('font-weight', 'bold')
    .text('10 job titles with highest Salary and experience levels') 
    }
  }
}
</script>
