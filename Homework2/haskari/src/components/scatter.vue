<script lang="ts">
import * as d3 from "d3";
import { max, min } from "lodash";


export default {
  methods: {
    plot: async function () {
      // set the dimensions and margins of the graph
      var margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = d3.select("#plot3")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `-100 0 ${ width + margin.left + margin.right} ${height + margin.top + margin.bottom + 60}`)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

      //Read the data

      const data = await d3.csv("../../data/ds_salaries.csv");

      // Add X axis
      var x = d3.scaleLinear()
        .domain([2019, 2024])
        .range([0, width]);

      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues([2020, 2021, 2022, 2023]).tickFormat(d => d.toFixed(0)))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(-45)');

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, 300000])
        .range([height, 0]);

      var color = d3.scaleOrdinal()
        .domain(['IL', 'US', 'PR', 'RU', 'NZ', 'CA'])
        .range(['red', 'blue', 'orange', 'pink', 'gray', 'purple']);

      svg.append("g")
        .call(d3.axisLeft(y));

      svg.append("text")
        .text("Salary (in USD)")
        .attr("transform", `translate(-80, ${height / 2 + 80}) rotate(-90)`)

      svg.append("text")
        .text("Year")
        .attr("transform", `translate(${width / 2 - 80}, ${height + 50})`)

      let boxplot = this.boxplot_data(data);
      console.log(boxplot);


      // Show the main vertical line
      svg
        .selectAll("vertLines")
        .data(boxplot)
        .enter()
        .append("line")
        .attr("x1", function (d) { return (x(d.year)) })
        .attr("x2", function (d) { return (x(d.year)) })
        .attr("y1", function (d) { return (y(d.min)) })
        .attr("y2", function (d) { return (y(d.max)) })
        .attr("stroke", "black")
        .style("width", 40)

      // rectangle for the main box
      var boxWidth = 100
      svg
        .selectAll("boxes")
        .data(boxplot)
        .enter()
        .append("rect")
        .attr("x", function (d) { return (x(d.year) - boxWidth / 2) })
        .attr("y", function (d) { return (y(d.q3)) })
        .attr("height", function (d) { return (y(d.q1) - y(d.q3)) })
        .attr("width", boxWidth)
        .attr("stroke", "black")
        .style("fill", "white")

      // Show the median
      svg
        .selectAll("medianLines")
        .data(boxplot)
        .enter()
        .append("line")
        .attr("x1", function (d) { return (x(d.year) - boxWidth / 2) })
        .attr("x2", function (d) { return (x(d.year) + boxWidth / 2) })
        .attr("y1", function (d) { return (y(d.median)) })
        .attr("y2", function (d) { return (y(d.median)) })
        .attr("stroke", "black")
        .style("width", 80)


    },
    boxplot_data: function (data) {
      const pdata = []
      for (let i = 2020; i <= 2023; ++i) {
        const year = i.toString();
        let subdata = data.filter(x => x.work_year == year).map(x => parseInt(x.salary_in_usd));
        let q1 = d3.quantile(subdata.sort(d3.ascending), .25)
        let median = d3.quantile(subdata.sort(d3.ascending), .5)
        let q3 = d3.quantile(subdata.sort(d3.ascending), .75)
        let interQuantileRange = q3 - q1;
        
        let min = Math.max(q1 - 1.5 * interQuantileRange, Math.min(...subdata));
        let max = Math.min(q3 + 1.5 * interQuantileRange, Math.max(...subdata));
        pdata.push({ q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, year })
      }
      return pdata;
    }
  },
  mounted: function () {
    this.plot();
  }
}


</script>


  
  <!-- "ref" registers a reference to the HTML element so that we can access it via the reference in Vue.  -->
  <!-- We use flex (d-flex) to arrange the layout-->
<template>
  <div>
    <h2>Box Plot </h2>
    <svg id="plot3"></svg>
  </div>
</template>


<style scoped></style>
  
  