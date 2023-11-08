<template>
  <div class="radial-plot"></div>
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
    fetch('../../data/radar_data.json') // Adjust the path based on your project setup
      .then((response) => response.json())
      .then((data) => {
        this.jsonData = data.data;
        this.createRadialPlot();
      })
      .catch((error) => {
        console.error('Error loading JSON data:', error);
      });
  },
  methods: {
    createRadialPlot() {
      // Sort jsonData based on a custom order
      const categoryOrder = ['HP', 'Defense', 'Attack', 'Speed', 'Sp. Attack', 'Sp. Defense'];
      const data = categoryOrder.map((category) => this.jsonData.find((item) => item.category === category));

      const width = 400;
      const height = 400;
      const margin = { top: 100, right: 70, bottom: 70, left: 90 };
      const innerWidth = width - margin.left - margin.right - 20;
      const innerHeight = height - margin.top - margin.bottom - 20;
      const radius = Math.min(width, height) / 2 - 50;

      const svg = d3
        .select('.radial-plot')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left + innerWidth / 2},${margin.top + innerHeight / 3})`);

      const maxRange = Math.max(...data.map((d) => d.value));
      const radiusScale = d3.scaleLinear().domain([0, maxRange]).range([0, Math.min(innerWidth, innerHeight) / 2]);

      // Add title as text
      svg
        .append('text')
        .attr('class', 'plot-title')
        .attr('x', 0)
        .attr('y', - radius - 10) // Adjust the position as needed
        .text('Mean Pokemon Stats')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-size', '20px')
        .attr('font-weight', 'bold') // Set font weight to bold
        .attr('fill', 'black');

      // Draw circular axes
      const circularAxes = svg.append('g');
      const numCircularAxes = 5;
      for (let i = 0; i < numCircularAxes; i++) {
        const radius = ((i + 1) * Math.min(innerWidth, innerHeight)) / (2 * numCircularAxes);
        circularAxes
          .append('circle')
          .attr('r', radius)
          .attr('fill', 'none')
          .attr('stroke', 'gray')
          .attr('stroke-width', 1);
      }

      // Draw radial axes
      const radialAxes = svg.append('g');

      radialAxes
        .selectAll('.axis-line')
        .data(data)
        .enter()
        .append('line')
        .attr('class', 'axis-line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d) => radiusScale(d.value) * Math.cos(Math.PI / 3 - Math.PI / 3 * categoryOrder.indexOf(d.category)))
        .attr('y2', (d) => -radiusScale(d.value) * Math.sin(Math.PI / 3 - Math.PI / 3 * categoryOrder.indexOf(d.category)))
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 3);

      radialAxes
        .selectAll('.axis-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.2em')
        .attr('x', (d) => radiusScale(maxRange) * 1.38 * Math.cos(Math.PI / 3 - Math.PI / 3 * categoryOrder.indexOf(d.category)))
        .attr('y', (d) => -radiusScale(maxRange) * 1.38 * Math.sin(Math.PI / 3 - Math.PI / 3 * categoryOrder.indexOf(d.category)))
        .text((d) => d.category)
        .attr('font-size', '12px');

      // Append additional text below axis label
      radialAxes
        .selectAll('.axis-label2')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.3em')
        .attr('x', (d) => radiusScale(maxRange) * 1.38 * Math.cos(Math.PI / 3 - Math.PI / 3 * categoryOrder.indexOf(d.category)))
        .attr('y', (d) => -radiusScale(maxRange) * 1.38 * Math.sin(Math.PI / 3 - Math.PI / 3 * categoryOrder.indexOf(d.category)))
        .text((d) => `${d.value} (Max: ${d.maxValue})`)
        .attr('font-size', '12px'); 
    },
  },
};
</script>

<style scoped>
.radial-plot {
  position: absolute;
  left: 1000px; /* Adjust the left position as needed */
  top: 90px; /* Adjust the top position as needed */
}
.axis-label {
  font-size: 12px; /* Adjust the font size as needed */
  fill: black; /* Set the text color */
}
.axis-value {
  font-size: 12px; /* Adjust the font size as needed */
  fill: gray; /* Set the additional text color */
}
</style>