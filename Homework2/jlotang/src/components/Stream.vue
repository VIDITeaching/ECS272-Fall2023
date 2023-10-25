<template>
  <div>
    <div id="my_dataviz"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      // Set the dimensions and margins of the graph
      const margin = { top: 20, right: 30, bottom: 0, left: 10 };
      const width = 460 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      // Append the SVG object to the body of the page
      const svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      // Read the data
      d3.csv("../../data/terrorism.csv").then(data => {

   
        const statistics = [];
        for (let year = 1970; year <= 2017; year++) {
          statistics.push({ year: year });
          for (let region = 1; region <= 12; region++) {
            statistics[year - 1970][`region${region}`] = 0;
          }
        }

      
        data.forEach(row => {
          const year = row.iyear;
          const region = row.region;
          statistics[year - 1970][`region${region}`]++;
        });

        console.log(statistics);

        const keys = ['region1', 'region2', 'region3', 'region4', 'region5', 'region6', 'region7', 'region8', 'region9', 'region10', 'region11', 'region12'];


        // Add X axis
        const x = d3.scaleLinear()
          .domain(d3.extent(statistics, d => +d.year))
          .range([0, width]);
        svg.append("g")
          .attr("transform", `translate(0, ${height * 0.8})`)
          .call(d3.axisBottom(x).tickSize(-height * 0.7).tickValues([1976, 1988, 2000, 2012]))
          .select(".domain").remove();

        // Customization
        svg.selectAll(".tick line").attr("stroke", "#b8b8b8");

        // Add X axis label
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("x", width)
          .attr("y", height - 30)
          .text("Time (year)");

        // Add Y axis
        const y = d3.scaleLinear()
          .domain([-15000, 15000])
          .range([height, 0]);

        // Color palette
        const color = d3.scaleOrdinal()
          .domain(keys)
          .range(d3.schemeDark2);

        // Stack the data
        const stackedData = d3.stack()
          .offset(d3.stackOffsetSilhouette)
          .keys(keys)
          (statistics);

        // Create a tooltip
        const Tooltip = d3.select("#my_dataviz")
          .append("text")
          .attr("x", 0)
          .attr("y", 0)
          .style("opacity", 0)
          .style("font-size", 17);

        // Functions for mouseover, mousemove, and mouseleave
        const mouseover = function (event, d) {
          Tooltip.style("opacity", 1);
          d3.selectAll(".myArea").style("opacity", 0.2);
          d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1);
        };
        const mousemove = function (event, d, i) {
          const grp = d.key;
          Tooltip.text(grp);
        };
        const mouseleave = function (event, d) {
          Tooltip.style("opacity", 0);
          d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none");
        };

        // Area generator
        const area = d3.area()
          .x(d => x(+d.data.year))
          .y0(d => y(d[0]))
          .y1(d => y(d[1]));

        // Show the areas
        svg
          .selectAll("mylayers")
          .data(stackedData)
          .join("path")
          .attr("class", "myArea")
          .style("fill", d => color(d.key))
          .attr("d", area)
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave);

        svg.append("text")
          .attr("x", width / 2)
          .attr("y", 0 - margin.top / 2+5) // Adjust the position based on your needs
          .attr("text-anchor", "middle") // Center the text
          .style("font-size", "18px")
          .style("font-weight", "bold")
          .text("Global Terrorism Incidents from 1970 to 2017"); // Replace with your desired title

      });

    },
  },
};
</script>
