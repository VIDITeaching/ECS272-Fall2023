<script lang="ts">
import * as d3 from "d3";
import { max, min } from "lodash";


export default {
  methods: {
    plot: async function () {

      const plot3 = d3.select("#plot3");
      // set the dimensions and margins of the graph
      var margin = { top: 10, right: 30, bottom: 10, left: 60 },
        width = plot3.node().clientWidth - margin.left - margin.right,
        height = plot3.node().clientHeight - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = plot3
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${ width  } ${height + 100}`)
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
        .domain(['US', 'GB', 'CA', 'ES', 'IN', 'DE'])
        //.domain(['IL', 'US', 'PR', 'RU', 'NZ', 'CA'])
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
        .style("fill", "violet")
        .on('mousemove', function (e, d) {
          const event = d3.pointer(e);
          info.attr('transform', `translate(${event[0] + 10}, ${event[1] + 10})`);
          texts[0].text(`${y.invert(event[1]).toFixed(0)}`);
          texts[1].text(`q3: ${d.q3.toFixed(0)}`);
          texts[2].text(`Median: ${d.median}`);
          texts[3].text(`q1: ${d.q1.toFixed(0)}`);
          info.style('opacity', 1);
          const elem = d3.select(this);
          elem.style('fill', 'violet');
          elem.style('opacity', 1);
        })
        .on('mouseout', function (e, d) {
          info.style('opacity', 0);
          d3.select(this).style("fill", "violet")
        });

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
        .style("width", 80);
      svg.append('text')
        .attr('x', width -50) // Set x-coordinate for the center of the plot
        .attr('y', 10) // Set y-coordinate for the top of the plot
        .attr('text-anchor', 'middle')
        .style('font-size', '24px')
        .text('Most Frequent Countries:');
      svg.append('text')
        .attr('x', width-50) // Set x-coordinate for the center of the plot
        .attr('y', 30) // Set y-coordinate for the top of the plot
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .text('US = United States');
      svg.append('text')
        .attr('x', width-50) // Set x-coordinate for the center of the plot
        .attr('y', 50) // Set y-coordinate for the top of the plot
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .text('GB = Great Britain');
      svg.append('text')
        .attr('x', width-50) // Set x-coordinate for the center of the plot
        .attr('y', 70) // Set y-coordinate for the top of the plot
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .text('CA = Canada');
      svg.append('text')
        .attr('x', width-50) // Set x-coordinate for the center of the plot
        .attr('y', 90) // Set y-coordinate for the top of the plot
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .text('ES = Spain');
      svg.append('text')
        .attr('x', width-50) // Set x-coordinate for the center of the plot
        .attr('y', 110) // Set y-coordinate for the top of the plot
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .text('IN = India');
      svg.append('text')
        .attr('x', width-50) // Set x-coordinate for the center of the plot
        .attr('y', 130) // Set y-coordinate for the top of the plot
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .text('DE = Denmark');
      



      const info = svg.append("g").style('opacity', 0);
      info.append('rect')
        .attr('width', 200)
        .attr('height', 120)
        .attr('fill', 'white')
        .attr('stroke', 'blue');

      const texts = [info.append('text'), info.append('text'), info.append('text'), info.append('text')];
      let yPos = 25;

      for (let text of texts) {
        text.attr('width', 200)
        .attr('height', 50)
        .attr('x', 100)
        .attr('y', yPos)
        .style('font-size', '1em')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle');
        yPos += 25;
      }

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


<template>
  <h3>Box Plot of the yearly salaries of the top 6 most frequent countries</h3>
  <svg id="plot3"></svg>
</template>


<style scoped>

#plot3 {
  width: 80%;
  height: 100%;
}

</style>
  
  