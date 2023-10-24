<template>
  <div id="scatter-plot"></div>
</template>

<script>
import * as d3 from 'd3';

export default {
  mounted() {
    // Fetch and parse the CSV file
    d3.csv('../../data/pokemon_alopez247.csv').then(data => {
      // Process and retain only necessary columns
      data = data.map(d => ({
        Weight_kg: +d.Weight_kg,
        Height_cm: +d.Height_m * 100,
        Body_Style: d.Body_Style,
        Catch_Rate: +d.Catch_Rate
      }));

      // Your D3.js code to create the scatter plot using processed data
      const margin = { top: 2, right: 20, bottom: 50, left: 50 };
      const width = 1450 // 1100 - margin.left - margin.right;
      const height = 240 - margin.top - margin.bottom;

      const svg = d3
        .select('#scatter-plot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // X-axis scale (log scale for Height_cm)
      const xScale = d3
        .scaleLog()
        .domain([9, d3.max(data, d => d.Height_cm)])
        .range([0, width-300]);

      // Y-axis scale (log scale for Weight_kg)
      const yScale = d3
        .scaleLog()
        .domain([0.1, d3.max(data, d => d.Weight_kg)])
        .range([height, 0]);

      // Scale for circle size based on Catch_Rate
      const sizeScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.Catch_Rate)])
        .range([1.5, 16.5]);

      // Color scale for Body_Style
      const colorScale = d3
        .scaleOrdinal(d3.schemeCategory10)
        .domain(data.map(d => d.Body_Style));

      // Draw circles
      svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.Height_cm))
        .attr('cy', d => yScale(d.Weight_kg))
        .attr('r', d => sizeScale(0.5 * d.Catch_Rate))
        .attr('fill', d => colorScale(d.Body_Style));

      // X-axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5, '.0s'))
        .selectAll('text')
        .style('font-size', '14px');
      
      svg.append('text')
        .attr('x', (width - 275) / 2)
        .attr('y', height + margin.bottom - 5)
        .attr('fill', '#000')
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text('Height (cm) (logscale)');

      // Y-axis
      svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5, '.0s'))
        .selectAll('text')
        .style('font-size', '14px');
        
      svg.append('text')
        .attr('x', -(height / 2))
        .attr('y', -margin.left + 10)
        .attr('fill', '#000')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .style('font-size', '16px')
        .text('Weight (kg) (logscale)');

      // Legend
      const legend = svg.append('g')
        .attr('class', 'legend')
        //.attr('transform', 'translate(${width + 200}, 0)');

      const legendKeys = Array.from(new Set(data.map(d => d.Body_Style)));
      legend.selectAll('rect')
        .data(legendKeys)
        .enter()
        .append('rect')
        .attr('x', width - 275)
        .attr('y', (d, i) => i * 17)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => colorScale(d));

      legend.selectAll('text')
        .data(legendKeys)
        .enter()
        .append('text')
        .attr('x', width - 250)
        .attr('y', (d, i) => i * 17 + 12.5)
        .text(d => d.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));

      // Add capture rate description
      svg.append('text')
        .attr('x', 85) // Set x-coordinate for the center of the plot
        .attr('y', -height + 420) // Set y-coordinate for the top of the plot
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text('Pokemon Physique Distribution');

      // Title
      svg.append('text')
        .attr('x', 175) // Set x-coordinate for the center of the plot
        .attr('y', -height + 200) // Set y-coordinate for the top of the plot
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Size represents the scaled Pokemon Capture Rate');
    });
  }
};
</script>

<style scoped>
/* Add your component-specific styles here */
</style>
