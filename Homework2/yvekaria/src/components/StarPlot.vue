<template>
  <div class="star-plot"></div>
</template>

<script>
import * as d3 from 'd3';

export default {
  data() {
    return {
      jsonData: null,
    };
  },
  mounted() {
    fetch('../../data/star_data.json') // Adjust the path based on your project setup
      .then((response) => response.json())
      .then((data) => {
        this.jsonData = data.data;
        this.createStarPlot();
      })
      .catch((error) => {
        console.error('Error loading JSON data:', error);
      });
  },
  methods: {
    createStarPlot() {
      // const data = this.jsonData; // Unsorted data
      // Sort jsonData based on a custom order
      const categoryOrder = ['HP', 'Defense', 'Attack', 'Speed', 'Sp. Attack', 'Sp. Defense'];
      const data = categoryOrder.map((category) => this.jsonData.find((item) => item.category === category));

      const margin = { top: 5, right: 5, bottom: 65, left: 5 }; // Minimal margin values
      const width = 375 - margin.left - margin.right;
      const height = 575 - margin.top - margin.bottom;
      const radius = Math.min(width, height) / 2 - 50;

      const svg = d3
        .select('.star-plot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

      const angleSlice = (Math.PI * 2) / data.length;

      // Add title as text
      svg
        .append('text')
        .attr('class', 'plot-title')
        .attr('x', 0)
        .attr('y', -radius - 90) // Adjust the position as needed
        .text('Mean Pokemon Stats')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-size', '20px')
        .attr('font-weight', 'bold') // Set font weight to bold
        .attr('fill', 'black');

      // Draw grey radial axes
      svg
        .selectAll('.axis')
        .data(data)
        .enter()
        .append('line')
        .attr('class', 'axis')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d, i) => Math.cos(i * angleSlice - Math.PI / 2) * radius)
        .attr('y2', (d, i) => Math.sin(i * angleSlice - Math.PI / 2) * radius)
        .attr('stroke', 'grey');

      // Draw circular bounding box
      svg
        .append('circle')
        .attr('class', 'bounding-circle')
        .attr('r', radius) // Radius of the circle
        .attr('stroke', 'grey')
        .attr('fill', 'rgba(200, 200, 200, 0.5)'); // Light greyish hue for circular bounding box

      // Draw the star plot
      const line = d3
        .lineRadial()
        .curve(d3.curveLinearClosed)
        .radius((d) => Math.min((d.value / 100) * radius, radius)) // Ensure the star plot stays inside the boundary
        .angle((d, i) => i * angleSlice - Math.PI / 2);

      svg
        .append('path')
        .datum(data)
        .attr('class', 'radar-chart')
        .attr('d', line)
        .attr('fill', 'rgba(102, 153, 255, 0.7)') // Bluish hue color for star plot
        .attr('stroke', 'blue')
        .attr('stroke-width', 2);

      // Adjust radius and label positions for better spacing
      const labelRadius = radius * 1.3; // Radius for labels
      const valueRadius = radius * 1.1; // Radius for values

      // Add axis labels
      const labelPositions = [
        { x: 0, y: -labelRadius + 5 }, // HP
        { x: labelRadius * Math.cos(Math.PI / 6) + 5, y: labelRadius * Math.sin(Math.PI / 6) - 15}, // Defense
        { x: labelRadius * Math.cos(Math.PI / 9) - 15, y: -labelRadius * Math.sin(Math.PI / 9) - 30}, // Attack
        { x: 0, y: labelRadius - 25 }, // Speed
        { x: -labelRadius * Math.cos(Math.PI / 6), y: -labelRadius * Math.sin(Math.PI / 6) }, // Sp. Attack
        { x: -labelRadius * Math.cos(Math.PI / 9) - 5, y: labelRadius * Math.sin(Math.PI / 9) + 15} // Sp. Defense
      ];

      svg
        .selectAll('.axis-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'axis-label')
        .attr('x', (d, i) => labelPositions[i].x)
        .attr('y', (d, i) => labelPositions[i].y)
        .text((d) => `${d.category}`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('fill', 'black');

      // Add axis values
      const valuePositions = [
        { x: 0, y: -valueRadius }, // HP
        { x: valueRadius * Math.cos(Math.PI / 6) + 28, y: valueRadius * Math.sin(Math.PI / 6) + 22}, // Defense
        { x: valueRadius * Math.cos(Math.PI / 9) + 10, y: -valueRadius * Math.sin(Math.PI / 9) - 15}, // Attack
        { x: 0, y: valueRadius + 30}, // Speed
        { x: -valueRadius * Math.cos(Math.PI / 6) - 25, y: -valueRadius * Math.sin(Math.PI / 6) + 10}, // Sp. Attack
        { x: -valueRadius * Math.cos(Math.PI / 9) - 30, y: valueRadius * Math.sin(Math.PI / 9) + 48} // Sp. Defense
      ];

      svg
        .selectAll('.axis-value')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'axis-value')
        .attr('x', (d, i) => valuePositions[i].x)
        .attr('y', (d, i) => valuePositions[i].y)
        .text((d) => `${d.value}`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('fill', 'blue');
    }
  }
};
</script>

<style scoped>
.star-plot {
  text-align: center;
}
.axis {
  stroke-dasharray: 4;
}
</style>