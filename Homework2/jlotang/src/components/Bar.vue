<template>
  <div>
    <div id="my_dataviz"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  data() {
    return {
      width: 460,
      height: 400,
    };
  },
  mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      const margin = { top: 30, right: 30, bottom: 70, left: 60 };

      const svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", this.width + margin.left + margin.right)
        .attr("height", this.height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


      d3.csv("../../data/terrorism.csv").then(data => {

        const counts = {};


        data.forEach(row => {
          const region = row.region;
          if (counts[region]) {
            counts[region]++;
          } else {
            counts[region] = 1;
          }
        });

        const result = Object.entries(counts).map(([region, count]) => ({ region: parseInt(region), count }));

        console.log(result);

        const x = d3.scaleBand()
          .range([0, this.width])
          .domain(result.map(d => d.region))
          .padding(0.2);
        svg.append("g")
          .attr("transform", `translate(0, ${this.height})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

        // const y = d3.scaleLinear()
        //   .domain([0, 13000])
        //   .range([this.height, 0]);
        const y = d3.scaleLinear()
          .domain([0, d3.max(result, d => d.count)])
          .nice()
          .range([this.height, 0]);
        svg.append("g")
          .call(d3.axisLeft(y));

        svg.selectAll("mybar")
          .data(result)
          .enter()
          .append("rect")
          .attr("x", d => x(d.region))
          .attr("y", d => y(d.count))
          .attr("width", x.bandwidth())
          .attr("height", d => this.height - y(d.count))
          .attr("fill", "#69b3a2");


        svg.append("text")
          .attr("class", "x-label")
          .attr("text-anchor", "end")
          .attr("x", this.width)
          .attr("y", this.height + 30) 
          .text("region");

        svg.append("text")
          .attr("class", "y-label")
          .attr("text-anchor", "middle")
          .attr("x", -30) 
          .attr("y", -50)
          .attr("transform", "rotate(-90)")
          .text("count");


        svg.append("text")
          .attr("class", "chart-title")
          .attr("text-anchor", "middle")
          .attr("x", this.width / 2)
          .attr("y", -10) 
          .text("Global Terrorism Incidents Counted and Categorized by Region")
          .style('font-weight', 'bold');



      });


    },
  },
};
</script>
