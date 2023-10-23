<script lang="ts">
import * as d3 from "d3";
import Data from "../../data/data.json"; /* Example of reading in data directly from file */
import { isEmpty, debounce } from "lodash";

import { Spider, ComponentSize, Margin, FeatureData } from "../types";

// Computed property: https://vuejs.org/guide/essentials/computed.html
// Lifecycle in vue.js: https://vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram

export default {
  data() {
    // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
    return {
      spider: [] as Spider[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
      names: [],
      size: { width: 0, height: 0 } as ComponentSize,
      margin: { left: 40, right: 20, top: 20, bottom: 60 } as Margin,
    };
  },
  computed: {
    // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
    rerender() {
      return !isEmpty(this.spider) && this.size;
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
    function groupBy(objectArray, property) {
      return objectArray.reduce(function (acc, obj) {
        let key = obj[property];
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
      }, {});
    }
    let styles = groupBy(Data, "Body_Style");

    this.names = ["Catch_Rate", "Hp", "Attack", "Defense", "Speed"];

    let totalByTypeOne = [];
    let spiderByStyles = [];
    Object.keys(styles).forEach((d) => {
      let initialValue = 0;
      let cumulativeSpd = styles[d].reduce(
        (acc, curvalue) => acc + curvalue.Speed,
        initialValue
      );
      let cumulativeHp = styles[d].reduce(
        (acc, curvalue) => acc + curvalue.HP,
        initialValue
      );
      let cumulativeAtk = styles[d].reduce(
        (acc, curvalue) => acc + curvalue.Attack,
        initialValue
      );
      let cumulativeDfs = styles[d].reduce(
        (acc, curvalue) => acc + curvalue.Defense,
        initialValue
      );
      let cumulativeCth = styles[d].reduce(
        (acc, curvalue) => acc + curvalue.Catch_Rate,
        initialValue
      );
      let averageSpd = cumulativeSpd / styles[d].length;
      let averageHp = cumulativeHp / styles[d].length;
      let averageAtk = cumulativeAtk / styles[d].length;
      let averageDfs = cumulativeDfs / styles[d].length;
      let averageCth = cumulativeCth / styles[d].length;
      let processedObj = {
        speed: Math.round(averageSpd),
        hp: Math.round(averageHp),
        attack: Math.round(averageAtk),
        defense: Math.round(averageDfs),
        catch_rate: Math.round(averageCth),
      };
      spiderByStyles.push(processedObj);
      totalByTypeOne[d] = processedObj;
    });
    console.log("xxxx", spiderByStyles);
    console.log("xxxx", totalByTypeOne);
    this.spider = spiderByStyles;
  },
  methods: {
    onResize() {
      // record the updated size of the target element
      let target = this.$refs.spiderContainer as HTMLElement;
      if (target === undefined) return;
      this.size = { width: target?.clientWidth, height: target?.clientHeight };
    },
    initChart() {
      let width = this.size.width;
      let height = this.size.height;
      let spiderContainer = d3.select("#spider-svg");
    
      let radius = width / 3
      let radialScale = d3
        .scaleLinear()
        .domain([0, 180])
        .range([0, radius]);
      let ticks = [20, 60, 100, 140, 180];

      spiderContainer
        .selectAll("circle")
        .data(ticks)
        .join((enter) =>
          enter
            .append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("fill", "none")
            .attr("stroke", "#CCC")
            .attr("r", (d) => radialScale(d))
        );
      spiderContainer
        .selectAll(".ticklabel")
        .data(ticks)
        .join((enter) =>
          enter
            .append("text")
            .attr("class", "ticklabel")
            .attr("x", width / 2)
            .attr("y", (d) => height / 2 - radialScale(d))
            .text((d) => d.toString())
            .style("font-size", "12px")
        );

      function angleToCoordinate(angle, value) {
        let x = Math.cos(angle) * radialScale(value);
        let y = Math.sin(angle) * radialScale(value);
        return { x: width / 2 + x, y: height / 2 - y };
      }

      let featureData = this.names.map((f, i) => {
        let angle = Math.PI / 2 + (2 * Math.PI * i) / this.names.length;
        return {
          name: f,
          angle: angle,
          line_coord: angleToCoordinate(angle, 180),
          label_coord: angleToCoordinate(angle, 220),
        };
      });

      // draw axis line
      spiderContainer
        .selectAll("line")
        .data(featureData)
        .join((enter) =>
          enter
            .append("line")
            .attr("x1", width / 2)
            .attr("y1", height / 2)
            .attr("x2", (d: FeatureData) => d.line_coord.x)
            .attr("y2", (d: FeatureData) => d.line_coord.y)
            .attr("stroke", "#CCC")
        );

      // draw axis label
      spiderContainer
        .selectAll(".axislabel")
        .data(featureData)
        .join((enter) =>
          enter
            .append("text")
            .attr("x", (d: FeatureData) => d.label_coord.x - 25)
            .attr("y", (d: FeatureData) => d.label_coord.y + 10)
            .text((d: FeatureData) => d.name)
            .style("font-size", "12px")
        );
      let line = d3
        .line()
        .x((d) => d.x)
        .y((d) => d.y);
      let color = [
        "#e6194b",
        "#f58231",
        "#ffe119",
        "#bcf60c",
        "#3cb44b",
        "#008080",
        "#aaffc3",
        "#46f0f0",
        "#4363d8",
        "#911eb4",
        "#f032e6",
        "#fabebe",
        "#e6beff",
        "#ffd8b1",
        "#fffac8",
        "#800000",
        "#000075",
        "#000000",
      ];

      function getPathCoordinates(data_point) {
        let coordinates = [];
        for (var i = 0; i < this.names.length; i++) {
          let ft_name = this.names[i];
          console.log("xxxx-data_point[ft_name]", data_point[ft_name]);
          console.log("xxxx-ft_name", ft_name);
          console.log("xxxx-data_point", data_point);
          let angle = Math.PI / 2 + (2 * Math.PI * i) / this.names.length;
          coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
        }
        return coordinates;
      }
    //   spiderContainer
    //     .selectAll("path")
    //     .data(this.spider)
    //     .join((enter) =>
    //       enter
    //         .append("path")
    //         .datum((d) => {
    //           console.log("xxx-1", d);
    //           return getPathCoordinates(d);
    //         })
    //         .attr("d", line)
    //         .attr("stroke-width", 3)
    //         .attr("stroke", (_, i) => color[i])
    //         .attr("fill", (_, i) => color[i])
    //         .attr("stroke-opacity", 1)
    //         .attr("opacity", 0.5)
    //     );
    },
  },
  watch: {
    rerender(newSize) {
      if (!isEmpty(newSize)) {
        d3.select("#spider-svg").selectAll("*").remove(); // Clean all the elements in the chart
        this.initChart();
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
  <div class="chart-container-spider d-flex" ref="spiderContainer">
    <svg id="spider-svg" width="100%" height="100%">
      <!-- all the visual elements we create in initChart() will be inserted here in DOM-->
    </svg>
  </div>
</template>

<style scoped>
.chart-container-spider {
  height: 100%;
}
</style>
