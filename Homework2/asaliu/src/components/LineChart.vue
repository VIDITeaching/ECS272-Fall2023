<template>
  <div>
    <svg ref="lineChart"></svg>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  data() {
    return {
      data: [
        { imonth: 1, count: 14936 },
        { imonth: 2, count: 13879 },

        { imonth: 3, count: 15257 },

        { imonth: 4, count: 15152 },

        { imonth: 5, count: 16875 },

        { imonth: 6, count: 15359 },

        { imonth: 7, count: 16268 },

        { imonth: 8, count: 15800 },

        { imonth: 9, count: 14180 },

        { imonth: 10, count: 15563 },

        { imonth: 11, count: 14906 },

        { imonth: 12, count: 13496 },
      ],
    };
  },
  mounted() {
    this.createLineChart();
  },
  methods: {
    createLineChart() {
      const width = 400;
      const height = 200;
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };

      const svg = d3
        .select(this.$refs.lineChart)
        .attr("width", width)
        .attr("height", height);

      const x = d3
        .scaleLinear()
        .domain([0, this.data.length - 1])
        .range([margin.left, width - margin.right]);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(this.data, (d) => d.count)])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const line = d3
        .line()
        .x((d, i) => x(i))
        .y((d) => y(d.count));

      const g = svg.append("g");

      // Add the line
      g.append("path")
        .datum(this.data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

      // Add X-axis
      g.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

      // Add Y-axis
      g.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5));

      // Add X-axis label
      svg
        .append("text")
        .attr("transform", `translate(${width / 2},${height})`)
        .style("text-anchor", "middle")
        .text("Month");

      // Add Y-axis label
      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Count");

      // Add chart title
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Global Terrorism Incidents Trend by Month");

      // Customize the chart as needed
    },
  },
};
</script>
