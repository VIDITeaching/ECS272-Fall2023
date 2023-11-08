<template>
  <div>
    <svg :viewBox="`0 0 ${width} ${height}`">
      <path
        :d="lineData"
        fill="none"
        stroke="steelblue"
        stroke-width="1.5"
        :stroke-dasharray="dashArray"
      />
      <g ref="xAxis"></g>
      <g ref="yAxis"></g>
    </svg>
    <button @click="animateLine">Play</button>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  data() {
    return {
      width: 400,
      height: 200,
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
        // ... other data points
      ],
      lineData: "", // will hold the path data
      dashArray: "0, 1", // initial dash array
      animationDuration: 5000, // initial animation duration in milliseconds
    };
  },
  mounted() {
    this.createLineChart();
  },
  methods: {
    createLineChart() {
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };

      const svg = d3
        .select(this.$el)
        .select("svg")
        .attr("width", this.width + margin.left + margin.right)
        .attr("height", this.height + margin.top + margin.bottom);

      const x = d3
        .scaleLinear()
        .domain([0, this.data.length - 1])
        .range([margin.left, this.width - margin.right]);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(this.data, (d) => d.count)])
        .nice()
        .range([this.height - margin.bottom, margin.top]);

      const line = d3
        .line()
        .x((d, i) => x(i))
        .y((d) => y(d.count));

      // Save the path data
      this.lineData = line(this.data);

      // Create X and Y axes
      // Add X-axis
      const g = svg.append("g");
      g.append("g")
        .attr("transform", `translate(0,${this.height - margin.bottom})`)
        .call(d3.axisBottom(x));

      // Add Y-axis
      g.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5));

      // Add X-axis label
      svg
        .append("text")
        .attr("transform", `translate(${this.width / 2},${this.height})`)
        .style("text-anchor", "middle")
        .text("Month");

      // Add Y-axis label
      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - this.height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Count");

      // Add chart title
      svg
        .append("text")
        .attr("x", this.width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Global Terrorism Incidents Trend by Month");
      // const xAxis = d3.axisBottom(x);
      // const yAxis = d3.axisLeft(y).ticks(5);

      // d3.select(this.$refs.xAxis).call(xAxis);
      // d3.select(this.$refs.yAxis).call(yAxis);
    },
    animateLine() {
      // Animate the line by changing the dash array
      // this.dashArray = `${this.lineData.length}, ${this.lineData.length}`;
      // Control the duration of the animation
      this.dashArray = "0, " + this.lineData.length;
      console.log(this.lineData.length);

      d3.select(this.$el)
        .select("path")
        .transition()
        .duration(this.animationDuration)
        .attr("stroke-dasharray", this.lineData.length + "," + 1)
        .attr("stroke-dashoffset", 0);
    },
  },
};
</script>
