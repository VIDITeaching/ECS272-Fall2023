<template>
  <div>
    <svg :width="width" :height="height">
      <g :transform="`translate(${width / 2}, ${height / 2})`">
        <text text-anchor="middle" font-size="20" font-weight="bold" dy="-100">
          <tspan x="0" dy="-10.5em">{{ firstLine }}</tspan>
          <tspan x="0" dy="1.2em">{{ secondLine }}</tspan>
         </text>
        
        <template v-for="(dataEntry, index) in dataEntries" :key="index">
          <path :d="computedArcGenerator(dataEntry)" :fill="color(dataEntry.data[0])" stroke="black" stroke-width="2px"
            opacity="0.7"></path>
          <text :transform="`translate(${computedArcCentroid(dataEntry)})`" text-anchor="middle" font-size="10">
            <tspan x="0" dy="0.05em">{{ `region ${dataEntry.data[0]}` }}</tspan>
            <tspan x="0" dy="1.2em">{{ `${getPercentage(dataEntry)}%` }}</tspan>
          </text>
        </template>

      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  data() {
    return {
      width: 450,
      height: 450,
      margin: 40,
      data: {},
      firstLine: "Percentage of Global Terrorism ",
      secondLine: "Incidents Categorized by Region",
    };
  },
  computed: {
    radius() {
      return Math.min(this.width, this.height) / 2 - this.margin;
    },
    dataEntries() {
      const pie = d3.pie().value((d) => d[1]);
      return pie(Object.entries(this.data));
    },
    computedArcGenerator() {
      return d3.arc()
        .innerRadius(0)
        .outerRadius(this.radius);
    },
    computedArcCentroid() {
      return (dataEntry) => {
        const centroid = this.computedArcGenerator.centroid(dataEntry);
        return `${centroid[0]},${centroid[1]}`;
      };
    },
  },
  mounted() {
    this.createChart();
  },
  methods: {
    color: d3.scaleOrdinal().range(d3.schemeSet2),

    createChart() {
      d3.csv("../../data/terrorism.csv").then(data => {
        const counts = data.reduce((acc, row) => {
          const region = row.region;
          if (acc[region]) {
            acc[region]++;
          } else {
            acc[region] = 1;
          }
          return acc;
        }, {});

        this.data = counts;

        console.log(this.data);
      });
    },

    getPercentage(dataEntry) {
      const percentage = (dataEntry.endAngle - dataEntry.startAngle) / (2 * Math.PI) * 100;
      return percentage.toFixed(2); 
    },

  },
};
</script>

