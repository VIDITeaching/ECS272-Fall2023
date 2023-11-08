<template>
  <div>
    <svg ref="parallelCoordinates"></svg>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  mounted() {
    this.createParallelCoordinatesPlot();
  },
  methods: {
    createParallelCoordinatesPlot() {
      // Data for the parallel coordinates plot
      d3.csv("../../data/globalterrorismdb_0718dist.csv").then((data) => {
        const counts = {};

        data.forEach((row) => {
          const iyear = row.iyear;
          if (counts[iyear]) {
            counts[iyear]++;
          } else {
            counts[iyear] = 1;
          }
        });

        const result = Object.entries(counts).map(([iyear, count]) => ({
          iyear: parseInt(iyear),
          count,
        }));

        console.log(result);

        // Define the dimensions of the SVG container
        const width = 800;
        const height = 400;

        // Create the SVG element
        const svg = d3
          .select(this.$refs.parallelCoordinates)
          .attr("width", width)
          .attr("height", height);

        // Define scales and axes for each dimension
        const dimensions = Object.keys(data[0]); // Assuming data is an array of objects

        // Define scales and axes for each dimension based on the data

        // Create lines connecting data points
        const path = svg
          .append("g")
          .selectAll("path")
          .data(data)
          .enter()
          .append("path")
          .attr("d" /* Calculate path data here */)
          .style("fill", "none")
          .style("stroke", "steelblue");

        // Add interaction and styling as needed

        // Add labels for each dimension

        // Add a legend

        // Additional styling and customization

        // Handle user interactions, such as brushing and filtering

        // You can also add zooming and tooltip functionality
      });
    },
  },
};
</script>
