<template>
  <div id="chart"></div>
</template>

<script>
import * as d3 from 'd3';

export default {
  mounted() {
    // Load data from CSV file
    d3.csv('../../data/bar_data.csv').then(data => {
      // Parse numeric values
      data.forEach(d => {
        d["1"] = +d["1"];
        d["2"] = +d["2"];
        d["3"] = +d["3"];
        d["4"] = +d["4"];
        d["5"] = +d["5"];
        d["6"] = +d["6"];
      });

      // data.sort((a, b) => a["1"] - b["1"]); // sorted based on increaseing Gen 1 values
      
      // Sorted in decreasing order based on total pokemons of each type
      data.forEach(d => {
        d.total = d["1"] + d["2"] + d["3"] + d["4"] + d["5"] + d["6"];
      });
      data.sort((a, b) => b.total - a.total);

      // Set up chart dimensions
      const margin = { top: 70, right: 30, bottom: 70, left: 70 };
      const width = 930 - margin.left - margin.right;
      const height = 465 - margin.top - margin.bottom;

      // Create SVG container
      const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Extract unique Type_1 values for x-axis
      const type1Values = Array.from(new Set(data.map(d => d.Type_1)));

      // Set up color scale
      const color = d3.scaleOrdinal()
        .domain(["1", "2", "3", "4", "5", "6"])
        .range(d3.schemeCategory10);

      // Stack data
      const stack = d3.stack()
        .keys(["1", "2", "3", "4", "5", "6"])
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

      const stackedData = stack(data);

      // Create x-axis scale
      const xScale = d3.scaleBand()
        .domain(type1Values)
        .range([0, width])
        .padding(0.25);

      // Create y-axis scale
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])])
        .nice()
        .range([height, 0]);

      // Create y-axis with gridlines
      svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(''));

      // Style gridlines
      svg.selectAll('.tick line')
        .attr('stroke', 'lightgrey')
        .attr('stroke-opacity', 0.7);

      // Draw stacked bars
      svg.selectAll('.bar')
        .data(stackedData)
        .enter()
        .append('g')
        .attr('class', 'bar')
        .attr('fill', d => color(d.key))
        .selectAll('rect')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.data.Type_1))
        .attr('y', d => yScale(d[1]))
        .attr('height', d => yScale(d[0]) - yScale(d[1]))
        .attr('width', xScale.bandwidth());

      // Create x-axis
      svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .style('font-size', '14px');

      // Create y-axis
      svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('font-size', '14px'); // Increase font size of y-axis labels

      // Add x-axis label
      svg.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', height + margin.top - 5)
        .style('text-anchor', 'middle')
        .style('font-size', '16px') // Increase font size of x-axis label
        .text('Pokemon Types');

      // Add y-axis label
      svg.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 25)
        .style('text-anchor', 'middle')
        .style('font-size', '16px') // Increase font size of y-axis label
        .text('Number of Pokemons');

      // Add chart title
      svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .style('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text('Pokemon Distribution by Types across Generations');

      // Add legend
      const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width / 2 - 100},${-margin.top / 2})`); // Center the legend at the top of the plot

      const legendKeys = ["1", "2", "3", "4", "5", "6"];

      legend.selectAll('rect')
        .data(legendKeys)
        .enter()
        .append('rect')
        .attr('x', (d, i) => i * 100 - 175)
        .attr('y', 10)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', d => color(d));

      legend.selectAll('text')
        .data(legendKeys)
        .enter()
        .append('text')
        .attr('x', (d, i) => i * 100 - 150)
        .attr('y', 25)
        .text(d => `Gen ${d}`)
        .style('font-size', '14px') // Font size of legend items
        .attr('text-anchor', 'left');

    });
  }
};
</script>

<style scoped>
/* Add your scoped CSS styles here */
</style>
