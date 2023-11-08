<template>
  <div id="chart">
    <div class="chart-container" ref="barContainer">
      <div class="tooltip"></div>
    </div>
    <button class="reset-button" @click="resetChart">Reset Chart</button>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  emits: ['countrySelected', 'resetSelected'],
  setup(props, { emit }) {
    const countrySelected = (country) => {
      emit('countrySelected', country);
    };
    const resetSelected = (reset) => {
      emit('resetSelected', reset);
    };
    return { countrySelected, resetSelected };
  },
  data() {
    return {
      stackedData: null,
      xScale: null,
      yScale: null,
      color: d3.scaleOrdinal().domain(["Iraq", "Pakistan", "Afghanistan", "India", "Colombia", "Philippines", "Peru", "El Salvador", "UK", "Turkey", "Other"]).range(d3.schemeTableau10)
    };
  },
  mounted() {
    let target = d3.select('#chart').node();
    if (target === undefined) return;
    this.size = { width: target.clientWidth, height: target.clientHeight };
    this.margin = { top: 70, right: 30, bottom: 70, left: 70 };
    this.width = this.size.width - 200;
    this.height = this.size.height + 200;
    this.initializeBarPlot();
  },
  methods: {
    initializeBarPlot() {
      const self = this;

      const countries = ["Iraq", "Pakistan", "Afghanistan", "India", "Colombia", "Philippines", "Peru", "El Salvador", "UK", "Turkey", "Other"];

      // Load data from CSV file
      d3.csv('../../data/bar_graph.csv').then(data => {
        data.forEach(d => {
          d["Iraq"] = +d["Iraq"];
          d["Pakistan"] = +d["Pakistan"];
          d["Afghanistan"] = +d["Afghanistan"];
          d["India"] = +d["India"];
          d["Colombia"] = +d["Colombia"];
          d["Philippines"] = +d["Philippines"];
          d["Peru"] = +d["Peru"];
          d["El Salvador"] = +d["El Salvador"];
          d["UK"] = +d["UK"];
          d["Turkey"] = +d["Turkey"];
          d["Other"] = +d["Other"];
        });

        data.forEach(d => {
          d.total = d["Iraq"] + d["Pakistan"] + d["Afghanistan"] + d["India"] + d["Colombia"] + d["Philippines"] + d["Peru"] + d["El Salvador"] + d["UK"] + d["Turkey"] + d["Other"];
        });

        data.sort((a, b) => b.total - a.total);


        // Set up chart dimensions
        this.margin = { top: 70, right: 30, bottom: 200, left: 100 };
        // this.width = 1000 - this.margin.left - this.margin.right;
        // this.height = 665 - this.margin.top - this.margin.bottom;


        // Create SVG container
        this.svg = d3.select('#chart')
          .append('svg')
          .attr('viewBox', `-10 -10 ${this.width + this.margin.right + this.margin.left + 80} ${this.height + this.margin.top + this.margin.bottom}`)
          .attr('width', this.width + this.margin.left + this.margin.right)
          .attr('height', this.height + this.margin.top + this.margin.bottom)
          .append('g')
          .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        const groupValues = Array.from(new Set(data.map(d => d.group)));

        console.log(groupValues)

        // Stack data
        const stack = d3.stack()
          .keys(countries)
          .order(d3.stackOrderNone)
          .offset(d3.stackOffsetNone);

        const keys = data.columns.slice(1)

        this.stackedData = stack(data);

        // Set up color scale
        const color = d3.scaleOrdinal()
          .domain(keys)
          .range(d3.schemeTableau10);


        // Create x-axis scale
        this.xScale = d3.scaleBand()
          .domain(groupValues)
          .range([0, this.width])
          .padding(0.25);


        // Create y-axis scale
        this.yScale = d3.scaleLinear()
          .domain([0, d3.max(this.stackedData[this.stackedData.length - 1], d => d[1])])
          .nice()
          .range([this.height, 0]);


        // Create y-axis with gridlines
        this.svg.append('g')
          .attr('class', 'y-axis')
          .call(d3.axisLeft(this.yScale).tickSize(-this.width).tickFormat(''));


        // Style gridlines
        this.svg.selectAll('.tick line')
          .attr('stroke', 'lightgrey')
          .attr('stroke-opacity', 0.7);

        // Draw stacked bars
        this.svg.selectAll('.bar-group')
          .data(this.stackedData)
          .enter()
          .append('g')
          .attr('class', 'bar-group')
          .attr('fill', d => color(d.key))
          .selectAll('rect')
          .data(d => d)
          .enter()
          .append('rect')
          .attr('x', d => this.xScale(d.data.group))
          .attr('y', d => this.yScale(d[1]))
          .attr('height', d => this.yScale(d[0]) - this.yScale(d[1]))
          .attr('width', this.xScale.bandwidth())
          .on('mouseover', function (event, d) {
            const total = d[1] - d[0];
            const country = d3.select(this.parentNode).datum().key; // Access the country number from the parent datum
            const tooltip = d3.select('.tooltip');
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip.html(`<div>${country}</div><div>${total}</div>`)
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY - 10}px`);
          })
          .on('mouseout', function (event, d) {
            d3.select('.tooltip').transition().duration(500).style('opacity', 0);
          })
          .on('click', function (event, d) {
            const country = d3.select(this.parentNode).datum().key; // Access the country number from the parent datum
            self.countrySelected(country);
            self.handleBarClick(country);
          });

        // Create x-axis
        this.svg.append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${this.height})`)
          .call(d3.axisBottom(this.xScale))
          .selectAll('text')
          .attr('transform', 'rotate(-45)')
          .style('text-anchor', 'end')
          .style('font-size', '100%');

        // Create y-axis
        this.svg.append('g')
          .attr('class', 'y-axis')
          .call(d3.axisLeft(this.yScale))
          .selectAll('text')
          .style('font-size', '100%'); // Increase font size of y-axis labels

        // Add x-axis label
        this.svg.append('text')
          .attr('class', 'x-axis-label')
          .attr('x', this.width / 2)
          .attr('y', this.height + this.margin.top - 5)
          .style('text-anchor', 'middle')
          .style('font-size', '16px') // Increase font size of x-axis label
          .text('');

        // Add y-axis label
        this.svg.append('text')
          .attr('class', 'y-axis-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -this.height / 2)
          .attr('y', -this.margin.left + 25)
          .style('text-anchor', 'middle')
          .style('font-size', '16px') // Increase font size of y-axis label
          .text('Number of Attacks');


        // Add chart title
        this.svg.append('text')
          .attr('class', 'chart-title')
          .attr('x', this.width / 2)
          .attr('y', -this.margin.top / 2)
          .style('text-anchor', 'middle')
          .style('font-size', '100%')
          .style('font-weight', 'bold')
          .text('Terrorist attacks by different groups (Click a stacked bar to filter by country)');


        // Add legend
        const legend = this.svg.append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(${this.width / 2 - 80},${-this.margin.top / 2})`); // Center the legend at the top of the plot


        const legendKeys = countries

        legend.selectAll('rect')
          .data(legendKeys)
          .enter()
          .append('rect')
          .attr('x', this.width - 150)
          .attr('y', (d, i) => (i + 2) * 20)
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', d => color(d));


        legend.selectAll('text')
          .data(legendKeys)
          .enter()
          .append('text')
          .attr('x', this.width - 130)
          .attr('y', (d, i) => (i + 2) * 20 + 10)
          .text(d => `${d}`)
          .style('font-size', '10px') // Font size of legend items
          .style("fill", function (d) { return color(d) })
          .attr('text-anchor', 'center');

      });

    },
    resetChart() {
      const self = this;
      // Select and remove existing chart elements
      d3.select('#chart svg').remove();
      self.countrySelected(-1);
      self.resetSelected(0);
      this.initializeBarPlot();
    },
    handleBarClick(country) {

      const ticks = 7
      this.svg.select('.y-axis')
        .transition()
        .duration(500)
        .call(d3.axisLeft(this.yScale).ticks(ticks).tickSize(-this.width).tickFormat(d3.format('.0f')))
        .selectAll('text')
        .style('font-size', '14px');

      // Remove the existing y-axis
      this.svg.select('.y-axis').remove();

      // Transition the yScale domain smoothly
      this.yScale.domain([0, d3.max(this.stackedData.find(d => d.key === country), d => d[1])]).nice();

      // Append the new y-axis with a transition
      this.svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(this.yScale).ticks(ticks).tickSize(-this.width).tickFormat(d3.format('.0f')))
        .selectAll('text')
        .style('font-size', '14px')
        .filter(d => d === this.yScale.domain()[1])  // Select only the last tick label (maximum value)
        .remove();  // Remove all other tick labels except the last one

      // Transition gridlines opacity
      this.svg.selectAll('.tick line')
        .filter(d => d >= 0 && d <= this.yScale.domain()[1])  // Select gridlines within the new y-axis range
        .transition()
        .duration(500)
        .attr('stroke-opacity', 0.7);

      // Remove existing y-axis and gridlines
      this.svg.selectAll('.y-axis, .tick line').remove();

      // Filter data based on the selected country
      const filteredData = this.stackedData.filter(d => d.key === country);
      const bars = this.svg.selectAll('.bar-group')
        .data(filteredData)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('fill', d => this.color(d.key));

      // Update yScale domain based on the filtered data
      this.yScale.domain([0, d3.max(filteredData[0], d => d[1] - d[0])]).nice();

      // Remove the original bars and redraw stacked bars for the selected country
      this.svg.selectAll('.bar-group').remove();

      // Draw new y-axis with gridlines
      this.svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(this.yScale).ticks(ticks).tickSize(-this.width).tickFormat(d3.format('.0f')))
        // .selectAll('.tick line')
        .filter(d => d === this.yScale.domain()[1])  // Select only the last gridline (corresponding to the maximum value)
        .attr('stroke', 'lightgrey')
        .attr('stroke-opacity', 0.7);

      // Draw stacked bars for the selected country
      this.svg.selectAll('.bar-group')
        .data(filteredData)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('fill', d => this.color(d.key))
        .selectAll('rect')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('x', d => this.xScale(d.data.group))
        .attr('y', d => this.yScale(d[1]) - this.yScale(d[0]) + 200)
        .attr('height', d => this.yScale(d[0]) - this.yScale(d[1]))
        .attr('width', this.xScale.bandwidth())
        .on('mouseover', function (event, d) {
          const total = d.total;
          const country = d3.select(this.parentNode).datum().key;
          const tooltip = d3.select('.tooltip');
          tooltip.transition().duration(200).style('opacity', 0.9);
          tooltip.html(`<div>${country}</div><div>${total}</div>`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .style('width', '150px');
        })
        .on('mouseout', function () {
          d3.select('.tooltip').transition().duration(500).style('opacity', 0);
        });

      this.svg.select('.y-axis')
        .transition()
        .duration(500)
        .call(d3.axisLeft(this.yScale).ticks(ticks).tickSize(-(this.width + 10)).tickFormat(d3.format('.0f')))
        .selectAll('.tick line')
        .attr('stroke', 'lightgrey')
        .attr('transform', `translate(${-8}, 0)`);

      this.svg.selectAll('.tick line')
        .attr('stroke', 'lightgrey')
        .attr('stroke-opacity', 0.7);

      // Create x-axis
      this.svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${this.height})`)
        .call(d3.axisBottom(this.xScale))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .style('font-size', '100%');

      this.svg.select('.y-axis')
        .selectAll('text')
        .style('font-size', '14px')
        .attr('transform', `translate(${-8}, 0)`);
    }
  }
};

</script>

<style scoped>
#chart {
  position: relative;
}

.chart-container {
  position: relative;
  width: 100%;
  /* Set width to 100% to fill the entire chart area */
  height: 100%;
  /* Set height to 100% to fill the entire chart area */
  /* Add other styling properties for the chart container if needed */
}

.tooltip {
  position: absolute;
  background-color: white;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  pointer-events: none;
  opacity: 0;
  top: 20px;
  left: 20px;
}

.reset-button {
  position: absolute;
  top: 400px;
  left: 50px;
  z-index: 1;
  padding: 5px 10px;
  background-color: #050505;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.reset-button:hover {
  background-color: #662c2c;
}
</style>
