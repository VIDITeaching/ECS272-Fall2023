<template>
  <div id="chart">
    <div class="chart-container" ref="barContainer">
      <div class="tooltip"></div>
    </div>
    <button class="reset-button" @click="resetChart">Reset Overview</button>
    <svg id="svg"></svg>
  </div>
</template>

<script>
import * as d3 from 'd3';


export default {
  emits: ['genSelect', 'resetSelect'],
  setup(props, { emit }) {
    const genSelect = (gen) => {
      emit('genSelect', gen);
    };
    const resetSelect = (res) => {
      emit('resetSelect', res);
    };
    return { genSelect, resetSelect };  //not sure
  },
  data() {
    return {
      stackedData: null,
      xScale: null,
      yScale: null,
      color: d3.scaleOrdinal()
        .domain(["1", "2", "3", "4", "5", "6"])
        .range(d3.schemeCategory10)
    };
  },
  mounted() {
    this.initializeBarPlot(); // Call the initialization method in the mounted hook
    window.addEventListener('resize', this.initializeBarPlot);
  },
  methods: {
    initializeBarPlot() {
      const self = this;

      // Create SVG container
      const chart = d3.select('#chart');
      chart.select('svg').selectAll('*').remove();

      if (!chart) return;
      this.size = { width: chart.node().clientWidth, height: chart.node().clientHeight };
      this.margin = { top: 70, right: 30, bottom: 70, left: 70 };
      this.width = this.size.width - 100;
      this.height = this.size.height - 150;


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
        // let target = this.$refs.barContainer;
        // if (target === undefined) return;
        // this.size = { width: target.clientWidth, height: target.clientHeight };
        // this.margin = { top: 70, right: 30, bottom: 70, left: 70 };
        // this.width = this.size.width - 100;
        // this.height = this.size.height + 325;

        // this.width = 930 - this.margin.left - this.margin.right;
        // this.height = 465 - this.margin.top - this.margin.bottom;



        this.svg = chart
          .select('svg')
          .attr('id', 'svgPlot')
          .attr('width', this.width + this.margin.left + this.margin.right)
          .attr('height', this.height + this.margin.top + this.margin.bottom)
          .append('g')
          .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

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

        this.stackedData = stack(data);

        // Create x-axis scale
        this.xScale = d3.scaleBand()
          .domain(type1Values)
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

        // console.log(this.stackedData);

        // Draw stacked bars
        this.svg.selectAll('.bar-group') // Updated class for the bars
          .data(this.stackedData)
          .enter()
          .append('g')
          .attr('class', 'bar-group') // Updated class for the bars
          .attr('fill', d => color(d.key))
          .selectAll('rect')
          .data(d => d)
          .enter()
          .append('rect')
          .attr('x', d => this.xScale(d.data.Type_1))
          .attr('y', d => this.yScale(d[1]))
          .attr('height', d => this.yScale(d[0]) - this.yScale(d[1]))
          .attr('width', this.xScale.bandwidth())
          .on('mouseover', function(event, d) {
            const total = d[1] - d[0];
            const generation = d3.select(this.parentNode).datum().key; // Access the generation number from the parent datum
            const tooltip = d3.select('.tooltip');
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip.html(`Gen ${generation}: ${total}`)
              .style('left', (event.pageX) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mouseout', function() {
            d3.select('.tooltip').transition().duration(500).style('opacity', 0);
          })
          .on('click', (event, d) => {
            console.log("clicked");
            const generation = d3.select(event.target.parentNode).datum().key;
            self.genSelect(generation);   // not sure
            this.handleBarClick(generation);
          });

        // Create x-axis
        this.svg.append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${this.height})`)
          .call(d3.axisBottom(this.xScale))
          .selectAll('text')
          .attr('transform', 'rotate(-45)')
          .style('text-anchor', 'end')
          .style('font-size', '14px');

        // Create y-axis
        this.svg.append('g')
          .attr('class', 'y-axis')
          .call(d3.axisLeft(this.yScale))
          .selectAll('text')
          .style('font-size', '14px'); // Increase font size of y-axis labels

        // Add x-axis label
        this.svg.append('text')
          .attr('class', 'x-axis-label')
          .attr('x', this.width / 2)
          .attr('y', this.height + this.margin.top - 5)
          .style('text-anchor', 'middle')
          .style('font-size', '16px') // Increase font size of x-axis label
          .text('Pokemon Types');

        // Add y-axis label
        this.svg.append('text')
          .attr('class', 'y-axis-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -this.height / 2)
          .attr('y', -this.margin.left + 25)
          .style('text-anchor', 'middle')
          .style('font-size', '16px') // Increase font size of y-axis label
          .text('Number of Pokemons');

        // Add chart title
        this.svg.append('text')
          .attr('class', 'chart-title')
          .attr('x', this.width / 2)
          .attr('y', -this.margin.top / 2)
          .style('text-anchor', 'middle')
          .style('font-size', '18px')
          .style('font-weight', 'bold')
          .text('Pokemon Distribution by Types across Generations');

        // Add legend
        const legend = this.svg.append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(${this.width / 2 - 100},${-this.margin.top / 2})`); // Center the legend at the top of the plot

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
    },
    resetChart() {
      const self = this;
      // Select and remove existing chart elements
      d3.select('#chart svg').selectAll('*').remove();
      self.genSelect(-1);
      self.resetSelect(0);
      this.initializeBarPlot();
    },
    handleBarClick(generation) {
      // Transition the yScale domain smoothly
      // this.yScale.domain([0, d3.max(this.stackedData.find(d => d.key === generation), d => d[1])]).nice();

      // Select the y-axis and apply transition for smooth update
      this.svg.select('.y-axis')
        .transition()
        .duration(500)
        .call(d3.axisLeft(this.yScale).ticks(10).tickSize(-this.width).tickFormat(d3.format('.0f')))
        .selectAll('text')
        .style('font-size', '14px');

      // Remove the existing y-axis
      this.svg.select('.y-axis').remove();

      // Transition the yScale domain smoothly
      this.yScale.domain([0, d3.max(this.stackedData.find(d => d.key === generation), d => d[1])]).nice();

      // Append the new y-axis with a transition
      this.svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(this.yScale).ticks(10).tickSize(-this.width).tickFormat(d3.format('.0f')))
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

      // Filter data based on the selected generation
      const filteredData = this.stackedData.filter(d => d.key === generation);
      const bars = this.svg.selectAll('.bar-group')
        .data(filteredData)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('fill', d => this.color(d.key));

      // Update yScale domain based on the filtered data
      this.yScale.domain([0, d3.max(filteredData[0], d => d[1]-d[0])]).nice();

      // Remove the original bars and redraw stacked bars for the selected generation
      this.svg.selectAll('.bar-group').remove();

      // Draw new y-axis with gridlines
      this.svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(this.yScale).ticks(10).tickSize(-this.width).tickFormat(d3.format('.0f')))
        // .selectAll('.tick line')
        .filter(d => d === this.yScale.domain()[1])  // Select only the last gridline (corresponding to the maximum value)
        .attr('stroke', 'lightgrey')
        .attr('stroke-opacity', 0.7);

      // Draw stacked bars for the selected generation
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
        .attr('x', d => this.xScale(d.data.Type_1))
        .attr('y', d => this.yScale(d[1]) - this.yScale(d[0]) + this.xScale.bandwidth()*9.15) //311
        .attr('height', d => this.yScale(d[0]) - this.yScale(d[1]))
        .attr('width', this.xScale.bandwidth())
        .on('mouseover', function(event, d) {
          const total = d[1] - d[0];
          const generation = d3.select(this.parentNode).datum().key;
          const tooltip = d3.select('.tooltip');
          tooltip.transition().duration(200).style('opacity', 0.9);
          tooltip.html(`Gen ${generation}: ${total}`)
            .style('left', (event.pageX) + 'px')
            .style('top', (event.pageY - 28) + 'px')
            .style('width', '150px');
        })
        .on('mouseout', function() {
          d3.select('.tooltip').transition().duration(500).style('opacity', 0);
        });

      this.svg.select('.y-axis')
        .transition()
        .duration(500)
        .call(d3.axisLeft(this.yScale).ticks(10).tickSize(-(this.width + 10)).tickFormat(d3.format('.0f')))
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
        .style('font-size', '14px');

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
  height: 100%;
  position: relative;
}

#chart svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}


.chart-container {
  width: 100%; /* Set width to 100% to fill the entire chart area */
  height: 100%; /* Set height to 100% to fill the entire chart area */
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
  z-index: 100;
}

.reset-button {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1;
  padding: 5px 10px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}
.reset-button:hover {
  background-color: #0056b3;
}

</style>
