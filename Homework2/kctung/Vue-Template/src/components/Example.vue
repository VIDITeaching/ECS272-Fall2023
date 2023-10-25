<script lang="ts">
import * as d3 from "d3";
//import Data from "../../data/demo.json"; /* Example of reading in data directly from file */
import testData from "../../data/demo.json"; /* Example of reading in data directly from file */
const Data = await d3.csv("../../data/ds_salaries.csv");
import axios from "axios";
import { isEmpty, debounce } from "lodash";

import { Bar, ComponentSize, Margin } from "../types";
// A "extends" B means A inherits the properties and methods from B.
interface CategoricalBar extends Bar {
  category: string;
}

// Computed property: https://vuejs.org/guide/essentials/computed.html
// Lifecycle in vue.js: https://vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram

export default {
  data() {
    // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
    return {
      bars: [] as CategoricalBar[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
      size: { width: 0, height: 0 } as ComponentSize,
      margin: { left: 130, right: 20, top: 20, bottom: 60 } as Margin,
    };
  },
  computed: {
    // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
    rerender() {
      return !isEmpty(this.bars) && this.size;
    },
  },
  // Anything in here will only be executed once.
  // Refer to the lifecycle in Vue.js for more details, mentioned at the very top of this file.
  created() {
    // fetch the data via GET request when we init this component.
    // In axios anything we send back in the response are always bound to the "data" property.
    /*
        axios.get(`<some-API-endpoint>`)
            .then(resp => { 
                this.bars = resp.data; // resp.data contains the content, with the format specified by the API you use.
                return true;
            })
            .catch(error => console.log(error));
        */
    console.log(Data);
    if (isEmpty(Data)) return;
    this.bars = testData.data;
  },
  methods: {
    onResize() {
      // record the updated size of the target element
      let target = this.$refs.barContainer as HTMLElement;
      if (target === undefined) return;
      this.size = { width: target.clientWidth, height: target.clientHeight };
    },
    initFirstChart() {
      // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
      let chartContainer = d3.select("#first-svg");

      // calculate the max and min number of the salary_in_usd of all data items
      let xExtents = d3.extent(Data.map((d) => d.salary as number)) as [
        number,
        number
      ];
      //collect all job_title names for scatter plot
      let yCategoryRaw: string[] = [];
      let yCategoryCountRaw: number[] = [];
      Data.forEach((d) => {
        if (yCategoryRaw.includes(d.job_title)) {
          yCategoryCountRaw[yCategoryRaw.indexOf(d.job_title)]++;
        } else {
          yCategoryRaw.push(d.job_title);
          yCategoryCountRaw.push(0);
        }
      });

      let yCategory: string[] = [];
      for (let i = 0; i < yCategoryCountRaw.length; i++) {
        if (yCategoryCountRaw[i] > 20) {
          yCategory.push(yCategoryRaw[i]);
        }
      }
      console.log(yCategory.length);

      let xScale = d3
        .scaleLinear()
        .range([this.margin.left, this.size.width - this.margin.right]) //bottom side to the top side on the screen
        .domain([0, 450000]);

      let yScale = d3
        .scalePoint()
        .rangeRound([this.size.height - this.margin.bottom, this.margin.top])
        .domain(yCategory);

      Data.forEach((d) => {
        if (!(d.salary_currency == "USD" || d.salary_currency == "EUR")) {
          d.salary_currency = "Others";
        }
      });

      let zCategory: string[] = ["USD", "EUR", "Others"];

      let zScale = d3
        .scaleOrdinal()
        .range(["red", "blue", "green"])
        .domain(zCategory);
      // There are other scales such as scaleOrdinal,
      // whichever is appropriate depends on the data types and the kind of visualizations you're creating.

      // This following part visualizes the axes along with axis labels.
      // Check out https://observablehq.com/@d3/margin-convention?collection=@d3/d3-axis for more details
      const xAxis = chartContainer
        .append("g")
        .attr(
          "transform",
          `translate(0, ${this.size.height - this.margin.bottom})`
        )
        .call(d3.axisBottom(xScale));

      const yAxis = chartContainer
        .append("g")
        .attr("transform", `translate(${this.margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

      const yLabel = chartContainer
        .append("g")
        .attr(
          "transform",
          `translate(${10}, ${this.size.height / 2}) rotate(-90)`
        )
        .append("text")
        .text("Majority Job Title")
        .style("font-size", ".8rem");

      const xLabel = chartContainer
        .append("g")
        .attr(
          "transform",
          `translate(${this.size.width / 2}, ${
            this.size.height - this.margin.top - 5
          })`
        )
        .append("text")
        .text("Salary in each currency")
        .style("font-size", ".8rem");

      const title = chartContainer
        .append("g")
        .append("text") // adding the text
        .attr(
          "transform",
          `translate(${this.size.width / 2 + 25}, ${
            this.size.height - this.margin.top + 5
          })`
        )
        .attr("dy", "0.5rem") // relative distance from the indicated coordinates.
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Distribution of Job Title's Salary in Original Currency"); // text content

      const scatterPlot = chartContainer
        .append("g")
        .selectAll("dot")
        .data(Data)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
          return xScale(d.salary);
        })
        .attr("cy", function (d) {
          return yScale(d.job_title);
        })
        .attr("r", 3)
        .attr("fill", function (d) {
          return zScale(d.salary_currency);
        });

      const legendsLabels = chartContainer
        .append("g")
        .selectAll("labels")
        .data(zCategory)
        .enter()
        .append("text")
        .attr("x", this.margin.left / 2 - 60)
        .attr(
          "y",
          (d, i) => this.size.height - this.margin.bottom + 20 + 15 * i
        )
        .text((d) => d);

      const legendsRect = chartContainer
        .append("g")
        .selectAll("rects")
        .data(zCategory)
        .enter()
        .append("circle")
        .attr("cx", this.margin.left / 2)
        .attr(
          "cy",
          (d, i) => this.size.height - this.margin.bottom + 15 + 15 * i
        )
        .attr("r", 3)
        .attr("fill", (d) => zScale(d));
    },
    initSecondChart() {
      // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
      let chartContainer = d3.select("#second-svg");

      let xScale = d3
        .scalePoint()
        .range([this.margin.left, this.size.width - this.margin.right])
        .domain([
          "work_year",
          "employment_type",
          "experience_level",
          "salary_in_usd",
        ]);

      let yScale: any = {};

      let workYearCategory: string[] = ["2020", "2021", "2022", "2023"];
      let experienceLevelCategory: string[] = ["EN", "MI", "SE", "EX"];
      let employmentTypeCategory: string[] = [
        ...new Set(Data.map((d) => d.employment_type as string)),
      ];

      yScale["work_year"] = d3
        .scalePoint()
        .domain(workYearCategory)
        .range([this.size.height - this.margin.bottom, this.margin.top]);

      yScale["employment_type"] = d3
        .scalePoint()
        .domain(employmentTypeCategory)
        .range([this.size.height - this.margin.bottom, this.margin.top]);

      yScale["experience_level"] = d3
        .scalePoint()
        .domain(experienceLevelCategory)
        .range([this.size.height - this.margin.bottom, this.margin.top]);

      yScale["salary_in_usd"] = d3
        .scaleLinear()
        .domain([0, 450000])
        .range([this.size.height - this.margin.bottom, this.margin.top]);

      const title = chartContainer
        .append("g")
        .append("text") // adding the text
        .attr(
          "transform",
          `translate(${this.size.width / 2}, ${
            this.size.height - this.margin.top + 5
          })`
        )
        .attr("dy", "0.5rem") // relative distance from the indicated coordinates.
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Parallel Coordinate Plot for Certain Attributes"); // text content

      function linePath(d: any) {
        return d3.line()([
          [
            Number(xScale("work_year")),
            Number(yScale["work_year"](d.work_year)),
          ],
          [
            Number(xScale("employment_type")),
            Number(yScale["employment_type"](d.employment_type)),
          ],
          [
            Number(xScale("experience_level")),
            Number(yScale["experience_level"](d.experience_level)),
          ],
          [
            Number(xScale("salary_in_usd")),
            Number(yScale["salary_in_usd"](d.salary_in_usd)),
          ],
        ]);
      }

      //draw dataset
      chartContainer
        .append("g")
        .selectAll("myPath")
        .data(Data)
        .join("path")
        .attr("d", linePath)
        .style("fill", "none")
        .style("stroke", "#69b3a2")
        .style("opacity", 0.5);

      //draw axis
      chartContainer
        .append("g")
        .attr(
          "transform",
          `translate(0,${this.size.height - this.margin.bottom})`
        )
        .call(d3.axisBottom(xScale));

      chartContainer
        .append("g")
        .attr("transform", `translate(${xScale("work_year")},0)`)
        .call(d3.axisLeft(yScale["work_year"]));

      chartContainer
        .append("g")
        .attr("transform", `translate(${xScale("employment_type")},0)`)
        .call(d3.axisLeft(yScale["employment_type"]));

      chartContainer
        .append("g")
        .attr("transform", `translate(${xScale("experience_level")},0)`)
        .call(d3.axisLeft(yScale["experience_level"]));

      chartContainer
        .append("g")
        .attr("transform", `translate(${xScale("salary_in_usd")},0)`)
        .call(d3.axisLeft(yScale["salary_in_usd"]));
    },
    initThirdChart() {
      // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
      let chartContainer = d3.select("#third-svg");

      let remoteRatioTotal: number[] = [0, 0, 0];
      let total: number = 0;
      Data.forEach((d) => {
        if (d.remote_ratio <= 10) {
          remoteRatioTotal[0]++;
        } else if (d.remote_ratio > 10 && d.remote_ratio < 90) {
          remoteRatioTotal[1]++;
        } else {
          remoteRatioTotal[2]++;
        }
        total++;
      });

      let radius = 75;
      let remote_ratio = {
        1: remoteRatioTotal[0],
        2: remoteRatioTotal[1],
        3: remoteRatioTotal[2],
      };
      let ratio_name: string[] = ["Barely Remote Ratio", "Partly Remote Ratio", "Almost Fully Remote Ratio"];

      let color = d3.scaleOrdinal().range(d3.schemeSet2);

      const pie = d3.pie().value(function (d) {
        return d[1];
      });
      const data_ready = pie(Object.entries(remote_ratio));
      const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

      //draw dataset
      chartContainer
        .append("g")
        .selectAll("mySlices")
        .data(data_ready)
        .join("path")
        .attr("d", arcGenerator)
        .attr("fill", function (d) {
          return color(d.data[0]);
        })
        .attr("stroke", "black")
        .attr("transform", `translate(150,150)`)
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

      //add annotation
      chartContainer
        .append("g")
        .attr("transform", `translate(150,150)`)
        .selectAll("mySlices")
        .data(data_ready)
        .join("text")
        .text(function (d) {
          return ((d.data[1] / total) * 100).toFixed(0) + "%";
        })
        .attr("transform", function (d) {
          return `translate(${arcGenerator.centroid(d)})`;
        })
        .style("text-anchor", "middle")
        .style("font-size", 17);

      
      const legendsLabels = chartContainer
        .append("g")
        .selectAll("labels")
        .data(ratio_name)
        .enter()
        .append("text")
        .attr("x", this.margin.left / 2 - 60)
        .attr(
          "y",
          (d, i) => this.size.height - this.margin.bottom + 20 + 15 * i
        )
        .text((d) => d);

      const legendsRect = chartContainer
        .append("g")
        .selectAll("rects")
        .data(data_ready)
        .enter()
        .append("circle")
        .attr("cx", this.margin.left / 2 + 150)
        .attr(
          "cy",
          (d, i) => this.size.height - this.margin.bottom + 15 + 15 * i
        )
        .attr("r", 4)
        .attr("fill", (d) => color(d.data[0]));

      
      const title = chartContainer
        .append("g")
        .append("text") // adding the text
        .attr(
          "transform",
          `translate(${this.size.width / 2}, ${
            this.size.height - this.margin.top - 50
          })`
        )
        .attr("dy", "0.5rem") // relative distance from the indicated coordinates.
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Remote Ratio Distribution"); // text content
    },
  },
  watch: {
    rerender(newSize) {
      if (!isEmpty(newSize)) {
        d3.select("#first-svg").selectAll("*").remove(); // Clean all the elements in the chart
        this.initFirstChart();
        d3.select("#second-svg").selectAll("*").remove();
        this.initSecondChart();
        d3.select("#third-svg").selectAll("*").remove();
        this.initThirdChart();
      }
    },
  },
  // The following are general setup for resize events.
  mounted() {
    window.addEventListener("resize", debounce(this.onResize, 100));
    this.onResize();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
};
</script>

<!-- "ref" registers a reference to the HTML element so that we can access it via the reference in Vue.  -->
<!-- We use flex (d-flex) to arrange the layout-->
<template>
  <v-container id="main-container" class="d-flex flex-column flex-nowrap" fluid>
    <v-row no-gutters>
      <v-col>
        <div class="chart-container d-flex" ref="barContainer">
          <svg id="first-svg" width="100%" height="100%">
            <!-- all the visual elements we create in initChart() will be inserted here in DOM-->
          </svg>
        </div>
      </v-col>
      <v-col>
        <div class="chart-container d-flex" ref="barContainer">
          <svg id="second-svg" width="100%" height="100%"></svg>
        </div>
      </v-col>
      <v-col>
        <div class="chart-container d-flex" ref="barContainer">
          <svg id="third-svg" width="100%" height="100%"></svg>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.chart-container {
  height: 100%;
}
</style>

