<template>
    <h2>Data Science Job Salaries</h2>
    <div>
      <div ref="sankey"></div> 
    </div>
  </template>

<script lang="ts">
import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

export default{
    data() {
    return {
      sankeyData: {
        nodes: [],
        links: []
      },
      size: { width: 800, height: 500 },
      margin: { left: 50, right: 40, top: 40, bottom: 60 },
    }
  },
  mounted() {
    this.loadDataAndConvert().then(() => {
    this.createSankeydiagram();
    });
  },

  methods:{
    async loadDataAndConvert() {
    const data = await d3.csv('../../data/ds_salaries.csv');
    if (data && data.length > 0) {
            // Group the data by job title and experience level, then calculate the mean salary for each group
            const groupedData = d3.groups(data, d => d.job_title, d => d.experience_level);
            const meanSalaries = groupedData.flatMap(([jobTitle, experienceLevels]) => 
            experienceLevels.map(([experienceLevel, values]) => ({
                source: jobTitle,
                target: experienceLevel,
                value: d3.mean(values, d => Number(d.salary_in_usd)) || 0,
            }))
            );

            // Sort the groups by mean salary in descending order and take the top 10
            const topTenCategories = meanSalaries.sort((a, b) => b.value - a.value).slice(0, 15);

            // Create nodes for the Sankey diagram
            const uniqueNodeNames = new Set(topTenCategories.flatMap(d => [d.source, d.target]));
            const nodes = [...uniqueNodeNames].map(name => ({ name }));

            // Map node names to indices for the links
            const links = topTenCategories.map(d => ({
            source: nodes.findIndex(node => node.name === d.source),
            target: nodes.findIndex(node => node.name === d.target),
            value: d.value
            }));

            this.sankeyData = { nodes, links };
            console.log(this.sankeyData);
        }

    },
    addFlowAnimation(linkSelection, speed = 0.5) {
        linkSelection.each(function(d) {
            const totalParticles = Math.floor(d.width * speed); // Determine particle count based on link width
            for (let i = 0; i < totalParticles; i++) {
                const particle = d3.select(this.parentNode).append("circle") // Create particle as a circle
                    .attr("r", 3) // Particle size
                    .attr("cx", d.source.x1) // Start at the end of the source node
                    .attr("cy", d.source.y0 + (d.y0 - d.source.y0) * (i / totalParticles)) // Distribute particles along the height of the source node
                    .attr("fill", "blue"); // Particle color

                const length = this.getTotalLength(); 
                const duration = length * 10 / speed; 
                // Animate particle
                particle.transition()
                    .duration(duration)
                    .ease(d3.easeLinear)
                    .attrTween("transform", function() {
                        return d3.interpolateString(`translate(0,0)`, `translate(${d.target.x0 - d.source.x1},${d.target.y0 - d.source.y0 + (d.y1 - d.target.y0) * (i / totalParticles)})`);
                    })
                    .on("end", function() {
                        d3.select(this).remove(); 
                    });
            }
        });
    },

    createSankeydiagram() {
      const svgContainer = this.$refs.sankey as HTMLElement;
      d3.select(svgContainer).selectAll("*").remove();

      const width = 600 - this.margin.left - this.margin.right;
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

      const { nodes, links } = sankeyLayout(this.sankeyData);

      //const colorScale = d3.scaleOrdinal(d3.schemePastel2);
      const colorScale = d3.scaleOrdinal();
      

      const customColors = ['#B0FFAD', '#eecbff', '#b3e2cd', '#fdcdac ', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', 
                            '#fcfc7a ', '#cccccc', '#cc99ff', '#99ccff', '#dbdcff', '#ffb3c6', '#abc4ff'];

      colorScale.domain([...new Set(links.map(d => d.source.name))]) // unique combinations of source and target names
        .range(customColors);
      
      const linkSelection= svg.append("g")
        .selectAll(".link")
        .data(links)
        .join("path")
        .attr("class", "link")
        .attr("d", sankeyLinkHorizontal())
        .attr("stroke-width", d => Math.max(1, d.width))
        .attr("fill", "none")
        .attr("stroke-opacity", 1)
        .attr("stroke", d => {
            const color = colorScale(d.source.name);
            console.log(d.source.name, "source name", color, "color")
            return color;
        });

        this.addFlowAnimation(linkSelection);

        linkSelection
        .on("mouseover", function(event, d) {
            // Dim all links and nodes
            svg.selectAll(".link").attr("stroke-opacity", 0.1);
            svg.selectAll(".node").attr("fill-opacity", 0.1);

            // Highlight the hovered link
            d3.select(this).attr("stroke-opacity", 1);

            // Highlight the source and target nodes of the hovered link
            svg.select(`[data-node-id="${d.source.index}"]`).attr("fill-opacity", 1);
            svg.select(`[data-node-id="${d.target.index}"]`).attr("fill-opacity", 1);
        })
        .on("mouseout", function() {
            // Reset opacity for all links and nodes
            svg.selectAll(".link").attr("stroke-opacity", 1);
            svg.selectAll(".node").attr("fill-opacity", 1);
        });

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
        .transition()
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => d.name);


    svg.append("text")
      .attr("x", width / 2) 
      .attr("y", -15)
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .text('15 job titles with highest mean salary and experience levels') 

    function createLegend(svg, colorScale, width, margin) {
      // Define the size and spacing of the legend items
      const legendItemSize = 10;
      const legendSpacing = 5;

      const legendPadding = 225; //space from right edge

      // The x position is the width of the SVG minus the desired padding and the width of the legend
      const legendX = width - margin.right - legendPadding;
      const legendY = margin.top; 

      // Create a legend group
      const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${legendX},${legendY})`); 

      // Add legend items
      const legendItems = legend.selectAll('.legend-item')
        .data(colorScale.domain())
        .enter().append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * (legendItemSize + legendSpacing)})`);
      
      // Draw legend color boxes
      legendItems.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', legendItemSize)
        .attr('height', legendItemSize)
        .style('fill', colorScale)
        .style('stroke', colorScale);

      // Draw legend text
      legendItems.append('text')
        .attr('x', legendItemSize + legendSpacing)
        .attr('y', legendItemSize - legendSpacing)
        .style('font-size', '8px')
        .text(d => d);

      // // Optional: Add a title to your legend
      // legend.append('text')
      //   .attr('x', 0)
      //   .attr('y', -10) 
      //   .attr('class', 'legend-title')
      //   .style('font-size', '10px')
      //   .style('text-anchor', 'start')
      //   .text('Job Titles and ex');
      }

      createLegend(svg, colorScale, this.size.width, this.margin);

    }


  }

}









</script>