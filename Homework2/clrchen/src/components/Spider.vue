<script lang="ts">
import * as d3 from "d3";
import Data from "../../data/data.json"; /* Example of reading in data directly from file */
import { isEmpty, debounce } from "lodash";
import { Spider, ComponentSize, Margin, FeatureData } from "../types";

export default {
  data() {
    // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
    return {
      spider: [] as Spider[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
      names: [],
      size: { width: 0, height: 0 } as ComponentSize,
      margin: { left: 40, right: 20, top: 20, bottom: 60 } as Margin,
      colors: [],
    };
  },
  computed: {
    // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
    rerender() {
      return !isEmpty(this.spider) && this.size;
    },
  },
  created() {
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

    this.names = ["Defense", "Speed", "Hp", "Catch_Rate", "Attack"];

    let totalByTypeOne = [];
    let spiderByStyles = [];
    let styleColors = [];
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
      let processedColor = {
        style: d,
        catch_rate: Math.round(averageCth),
      }
      spiderByStyles.push(processedObj);
      styleColors.push(processedColor);
      totalByTypeOne[d] = processedObj;
    });
    const a = spiderByStyles.filter((v) => v.catch_rate < 100)
    const b = styleColors.filter((v) => v.catch_rate < 100).map((v)=> v.style)
    console.log("xxx", a)
    console.log("xxxx", spiderByStyles);
    console.log("xxxx", totalByTypeOne);
    this.spider = a;
    this.colors = b;
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
        .domain([0, 100])
        .range([0, radius]);
      let ticks = [20, 40, 60, 80, 100];

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
          line_coord: angleToCoordinate(angle, 100),
          label_coord: angleToCoordinate(angle, 130),
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
        "#ec8a83",
        "#ffad85",
        "#f9f176",
        "#8be59d",
        "#6ab4f1",
        "#a983d8",
      ];

      function getPathCoordinates(vm, data_point) {
        let coordinates = [];
        for (var i = 0; i < vm.names.length; i++) {
          let ft_name = vm.names[i].toLowerCase();
          let angle = Math.PI / 2 + (2 * Math.PI * i) / vm.names.length;
          coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
        }
        return coordinates;
      }
      const vm = this;
      spiderContainer
        .selectAll("path")
        .data(this.spider)
        .join((enter) =>
          enter
            .append("path")
            .datum((d) => {
              return getPathCoordinates(vm, d);
            })
            .attr("d", line)
            .attr("stroke-width", 3)
            .attr("stroke", (_, i) => color[i])
            .attr("fill", (_, i) => color[i])
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.3)
        );
        
        const title = spiderContainer.append('g')
            .append('text')
            .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top * 7})`)
            .attr('dy', '0.5rem')
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text('POKEMON') // text content
            .style("font-size", 35)

        const description1 = spiderContainer.append('g')
            .append('text')
            .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top * 5})`)
            .attr('dy', '0.5rem')
            .style('text-anchor', 'middle')
            .text('Parameters of Pokemons')
            .style("font-size", 15)
            .attr("fill", 'grey')

        const description2 = spiderContainer.append('g')
            .append('text')
            .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top * 4})`)
            .attr('dy', '0.5rem')
            .style('text-anchor', 'middle')
            .text('among different body styles')
            .style("font-size", 15)
            .attr("fill", 'grey')
        
        const description3 = spiderContainer.append('g')
            .append('text')
            .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top * 3})`)
            .attr('dy', '0.5rem')
            .style('text-anchor', 'middle')
            .text('with catch rate less than 100')
            .style("font-size", 15)
            .attr("fill", 'grey')

        const description4 = spiderContainer.append('g')
            .append('text')
            .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top * 2})`)
            .attr('dy', '0.5rem')
            .style('text-anchor', 'middle')
            .text('RARE POKEMONS!!')
            .style('font-weight', 'bold')
            .style("font-size", 13)
            .attr("fill", 'red')

        // draw labels & dots
        spiderContainer.selectAll("dots")
          .data(this.colors)
          .enter()
          .append("circle")
          .attr("cx", width / 6)
          .attr("cy", (_,i)=> i * 12 + 80) 
          .attr("r", 3)
          .style("fill", (_, i) => color[i])
        
        spiderContainer.selectAll("mylabels")
          .data(this.colors)
          .enter()
          .append("text")
          .attr("x", width / 6 + 20)
          .attr("y", (_,i)=> i * 12 + 80) 
          .style("fill", (_, i) => color[i])
          .text((d) =>  d)
          .style("alignment-baseline", "middle")
          .style("font-weight", 600)
          .style("font-size", 10)
        
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
