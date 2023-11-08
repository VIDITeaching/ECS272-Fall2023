<template>
  <div>
    <svg ref="pieChart"></svg>
    <div class="legend">
      <ul>
        <li
          v-for="(item, index) in data"
          :key="index"
          :style="{
            transform: `rotate(${(index / data.length) * 360 + 90}deg)`,
            transformOrigin: 'left center',
          }"
        >
          <span :style="{ backgroundColor: color(index) }"></span>
          {{ item.country_txt }} ({{ percentage(item.count) }}%)
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  //data() {
  //return {
  //width: 860,
  //height: 400,
  //};
  //},
  mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      const margin = { top: 100, right: 30, bottom: 100, left: 60 };
      const width = 600;
      const height = 600;
      const radius = Math.min(width, height) / 2 - 100;
      const svg = d3
        .select(this.$refs.pieChart)
        .attr("width", width)
        .attr("height", height);

      const g = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      const data = [
        { country_txt: "Iraq", count: 24636 },
        { country_txt: "Pakistan", count: 14368 },
        { country_txt: "Other", count: 142687 },
      ];

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      const pie = d3.pie().value((d) => d.count);
      const arc = d3
        .arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

      const pieData = pie(data);

      const arcGroup = g
        .selectAll(".arc")
        .data(pieData)
        .enter()
        .append("g")
        .attr("class", "arc");

      arcGroup
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(i));

      // Adding labels
      arcGroup
        .append("text")
        .attr("transform", (d) => {
          const pos = arc.centroid(d);
          const x = pos[0];
          const y = pos[1];
          const angle = Math.atan2(y, x);
          const angleDeg = (angle * 180) / Math.PI;
          const labelRadius = radius + 10; // Adjust the label radius as needed
          return `translate(${Math.cos(angle) * labelRadius},${
            Math.sin(angle) * labelRadius
          })`;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", (d) =>
          (d.startAngle + d.endAngle) / 2 > Math.PI ? "end" : "start"
        ) // Adjust text-anchor
        .text((d) => d.data.country_txt);

      arcGroup
        .append("text")
        .attr("class", "chart-title")
        .attr("text-anchor", "middle")
        .attr("x", this.width / 2)
        .attr("y", -250) // 负值将标题放在图表的顶部
        .text("Global Terrorism Incidents Percentage in Different Countries")
        .style("font-weight", "bold");

      // Legend - Rotation is applied through CSS
      const legend = d3.select(this.$el).select(".legend ul");
      const legendItems = legend.selectAll("li").data(this.data);
      const newLegendItems = legendItems.enter().append("li");
      newLegendItems
        .append("span")
        .attr("style", (d, i) => `background-color: ${color(i)}`);
      newLegendItems
        .append("span")
        .text((d) => d.country_txt + ` (${percentage(d.count)}%)`);
    },
    percentage(value) {
      const total = this.data.reduce((sum, item) => sum + item.count, 0);
      return ((value / total) * 100).toFixed(2);
    },
  },
};
</script>

<!-- const chinaEmissions = []; -->

<!-- data.forEach(d => {
  if (d.iyear_code === "CHN") {
    for (const key in d) {
      if (!isNaN(parseInt(key)) && key.length === 4) {
        const year = key;
        const emissions = d[key];
        chinaEmissions.push({ year, emissions });
      }
    }
  }
}) -->
