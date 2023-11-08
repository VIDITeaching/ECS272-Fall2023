<script lang="ts">
import * as d3 from "d3";


export default {
  methods: {
    plot: function (data_radar) {
      console.log(data_radar);

      const categoryOrder = data_radar.map(x => x.company_location);
      const data = data_radar.map(x => x.salary_in_usd);
      console.log(categoryOrder, data);
      const margin = { top: 5, right: 5, bottom: 5, left: 20 }; 
      const width = 450 - margin.left - margin.right;
      const height = 450 - margin.top - margin.bottom;
      const radius = Math.min(width, height) / 2 - 50;

      const svg = d3
        .select('#plot2')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

      const angleSlice = (Math.PI * 2) / data.length;


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
        .attr('stroke', 'black');

      // Draw circular bounding box
      svg
        .append('circle')
        .attr('class', 'bounding-circle')
        .attr('r', radius) // Radius of the circle
        .attr('stroke', 'black')
        .attr('fill', 'rgba(200, 200, 200, 0.5)'); 

      // Draw the star plot
      const line = d3
        .lineRadial()
        .curve(d3.curveLinearClosed)
        .radius((d) => Math.min((d / 300000) * radius, radius)) // Ensure the star plot stays inside the boundary
        .angle((d, i) => i * angleSlice - Math.PI / 2);

      svg
        .append('path')
        .datum(data)
        .attr('class', 'radar-chart')
        .attr('d', line)
        .attr('fill', 'green') // Bluish hue color for star plot
        .attr('opacity', '0.5')
        .attr('stroke', 'darkgreen')
        .attr('stroke-width', 2)
        .style("transform", "rotate(90deg)");

      
      const labelRadius = radius * 1.275; 
      const valueRadius = radius * 1.1175; 

  
      const labelPositions = [
        { x: 0, y: -labelRadius + 5 }, 
        { x: labelRadius * Math.cos(Math.PI / 6) + 5, y: labelRadius * Math.sin(Math.PI / 6) - 15}, 
        { x: labelRadius * Math.cos(Math.PI / 9) - 15, y: -labelRadius * Math.sin(Math.PI / 9) - 30}, 
        { x: 0, y: labelRadius - 25 }, 
        { x: -labelRadius * Math.cos(Math.PI / 6), y: -labelRadius * Math.sin(Math.PI / 6) }, 
        { x: -labelRadius * Math.cos(Math.PI / 9) - 5, y: labelRadius * Math.sin(Math.PI / 9) + 15} 
      ];

      svg
        .selectAll('.axis-label')
        .data(categoryOrder)
        .enter()
        .append('text')
        .attr('class', 'axis-label')
        .attr('x', (d, i) => labelPositions[i].x)
        .attr('y', (d, i) => labelPositions[i].y)
        .text((d) => `${d}`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('fill', 'black');

 
      const valuePositions = [
        { x: 0, y: -valueRadius },
        { x: valueRadius * Math.cos(Math.PI / 6) + 28, y: valueRadius * Math.sin(Math.PI / 6) + 22}, 
        { x: valueRadius * Math.cos(Math.PI / 9) + 10, y: -valueRadius * Math.sin(Math.PI / 9) - 15}, 
        { x: 0, y: valueRadius + 30}, 
        { x: -valueRadius * Math.cos(Math.PI / 6) - 25, y: -valueRadius * Math.sin(Math.PI / 6) + 10},
        { x: -valueRadius * Math.cos(Math.PI / 9) - 30, y: valueRadius * Math.sin(Math.PI / 9) + 48} 
      ];

      svg
        .selectAll('.axis-value')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'axis-value')
        .attr('x', (d, i) => valuePositions[i].x)
        .attr('y', (d, i) => valuePositions[i].y)
        .text((d) => `\$${d.toFixed(0)}`)
        .attr('text-anchor', 'middle')
        .style('font-size', '0.7em')
        .attr('alignment-baseline', 'middle')
        .attr('fill', 'red');

    }
  },
  mounted: async function () {
    const dataJson = await fetch('../../data/radar_data.json');
    const data = await dataJson.json();
    this.plot(data.data);
  }
}


</script>



<template>
  <div>
    <h3>Radar Plot of the Mean Salaries of the top 6 Highest Paid Countries</h3>
    <svg id="plot2"></svg>
    <p>
      IL= Israel, US= United States, PR= Puerto Rico, RU= Russia, NZ= New Zealand, CA= Canada
    </p>
  </div>
</template>


<style scoped>
p{font-size: 0.7em;}
</style>
  
  