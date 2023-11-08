<script lang="ts">
import * as d3 from "d3";
import Data from "../../data/data.json"; /* Example of reading in data directly from file */
import { isEmpty, debounce } from "lodash";
import { Spider, ComponentSize, Margin, FeatureData } from "../types";

export default {
  props: {
    filter: {
      required: true,
      type: Array
    }
  },
  data() {
    const styleList =[...new Set(Data.map(d => d['Body_Style']))];
    console.log('xxx-styleList', styleList)
    // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
    return {
      spider: [] as Spider[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
      names: [],
      size: { width: 0, height: 0 } as ComponentSize,
      margin: { left: 40, right: 20, top: 20, bottom: 60 } as Margin,
      colors: [],
      styleList
    };
  },
  computed: {
    // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
    rerender() {
      return !isEmpty(this.spider) && this.size;
    },
    showData() {
      const d = Data.filter(d => {
        console.log('ttt', d['Body_Style'], this.filter);

        return this.filter.length <= 0 || this.filter.includes(d['Body_Style'])
      });

      return Object.values(this.filter).length===0 ? ['head_only']: d;
    }
  },
  created() {
    this.createChart();
  },
  methods: {
    onResize() {
      // record the updated size of the target element
      let target = this.$refs.spiderContainer as HTMLElement;
      if (target === undefined) return;
      this.size = { width: target?.clientWidth, height: target?.clientHeight };
    },
    createChart() {

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
    let styles = groupBy(this.showData, "Body_Style");

    // this.names = ["Defense", "Speed", "Hp", "Catch_Rate", "Attack"];
    this.names = ["Defense", "Speed", "Hp", "Attack"];

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
      let processedObj = {
        Body_Style: d,
        speed: Math.round(averageSpd),
        hp: Math.round(averageHp),
        attack: Math.round(averageAtk),
        defense: Math.round(averageDfs),
      };
      let processedColor = {
        style: d,
      }
      spiderByStyles.push(processedObj);
      styleColors.push(processedColor);
      totalByTypeOne[d] = processedObj;
    });
    console.log("spiderByStyles", spiderByStyles);
    console.log("xxxx", totalByTypeOne);
    this.spider = spiderByStyles;
    this.colors = styleColors;
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
        .join(
          function(enter) {
          enter
            .append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("fill", "none")
            .attr("stroke", "#CCC")
            .attr("r", (d) => radialScale(d))
       },
          function(update) {
				    return update;
			    },
          function(exit) {
            return exit
              .transition()
              .duration(1000)
              .remove();
          });
      spiderContainer
        .selectAll(".ticklabel")
        .data(ticks)
        .join(function(enter) {
          enter
            .append("text")
            .attr("class", "ticklabel")
            .attr("x", width / 2)
            .attr("y", (d) => height / 2 - radialScale(d))
            .text((d) => d.toString())
            .style("font-size", "12px")
        },
          function(update) {
				    return update;
			    },
          function(exit) {
            return exit
              .transition()
              .duration(1000)
              .remove();
          });

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
          label_coord: angleToCoordinate(angle, 120),
        };
      });

      // draw axis line
      console.log('featureData', featureData);
      spiderContainer
        .selectAll("line")
        .data(featureData)
        .join(function(enter) {
          enter
            .append("line")
            .attr("x1", width / 2)
            .attr("y1", height / 2)
            .attr("x2", (d: FeatureData) => d.line_coord.x)
            .attr("y2", (d: FeatureData) => d.line_coord.y)
            .attr("stroke", "#CCC")
    },
          function(update) {
				    return update;
			    },
    function(exit) {
            return exit
              .transition()
              .duration(1000)
              .remove();
          });

      // draw axis label
      spiderContainer
        .selectAll(".axislabel")
        .data(featureData)
        .join(function(enter) {
          enter
            .append("text")
            .attr("x", (d: FeatureData) => d.label_coord.x - 25)
            .attr("y", (d: FeatureData) => d.label_coord.y + 10)
            .text((d: FeatureData) => d.name)
            .style("font-size", "12px")
    },
          function(update) {
				    return update;
			    },
    function(exit) {
            return exit
              .transition()
              .duration(1000)
              .remove();
          });
      let line = d3
        .line()
        .x((d) => d.x)
        .y((d) => d.y);
        
    let color = [
      '#e6194b',
      '#f58231',
      '#ffe119',
      '#bcf60c',
      '#3cb44b', 
      '#008080', 
      '#aaffc3', 
      '#46f0f0', 
      '#4363d8', 
      '#911eb4', 
      '#f032e6', 
      '#fabebe', 
      '#e6beff', 
      '#ffd8b1',];


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
      spiderContainer.selectAll("path").remove();
      spiderContainer
        .selectAll("path")
        .data(this.spider)
        .join(function(enter) {
          return enter
            .append("path")
            .datum((d) => {
              console.log('xxxx-vm', d)
              return getPathCoordinates(vm, d);
            })
            .attr("d", line)
            .attr("stroke-width", 3)
            .attr("stroke", (_, i) => color[vm.styleList.indexOf(vm.showData[i]['Body_Style'])])
            .attr("fill", (_, i) =>  color[vm.styleList.indexOf(vm.showData[i]['Body_Style'])])
            .attr("stroke-opacity", 1)
            .transition()
            .duration(600)
            .attr("opacity", 0.6)
          },
          function(update) {
				    return update;
			    },
          function(exit) {
            return exit
              .transition()
              .duration(600)
              .remove();
          })
        
        const title = spiderContainer.append('g')
            .append('text')
            .attr('transform', `translate(${this.size.width / 4.5}, ${this.size.height - this.margin.top * 6})`)
            .attr('dy', '0.5rem')
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text('POKEMON') // text content
            .style("font-size", 35)

        const description1 = spiderContainer.append('g')
            .append('text')
            .attr('transform', `translate(${this.size.width / 4.5}, ${this.size.height - this.margin.top * 4})`)
            .attr('dy', '0.5rem')
            .style('text-anchor', 'middle')
            .text('Different Scores of Pokemons')
            .style("font-size", 15)
            .attr("fill", 'grey')

        const description2 = spiderContainer.append('g')
            .append('text')
            .attr('transform', `translate(${this.size.width / 4.5}, ${this.size.height - this.margin.top * 3})`)
            .attr('dy', '0.5rem')
            .style('text-anchor', 'middle')
            .text('among different body styles')
            .style("font-size", 15)
            .attr("fill", 'grey')

        const hoverHint = spiderContainer.append('g')
            .append('text')
            .attr('transform', `translate(${this.size.width / 4.5}, ${this.margin.top * 3})`)
            .attr('dy', '0.5rem')
            .text('Hover on the x-label in bar chart to show individual Radar!')
            .style("font-size", 15)
            .attr("fill", 'black')
            .style('font-weight', 'bold')


        if (this.filter.length > 0) {
          const description3 = spiderContainer.append('g')
              .append('text')
              .attr('transform', `translate(${this.size.width / 2}, ${this.size.height / 2})`)
              .attr('dy', '0.5rem')
              .style('text-anchor', 'middle')
              .text(`${this.filter.map(f => f).join(', ')}`)
              .style("font-size", 20)
              .style('font-weight', 'bold')
              .attr("fill", 'black')
        }

        // // draw labels & dots
        // spiderContainer.selectAll("rect")
        //   .data(this.styleList)
        //   .enter()
        //   .append("rect")
        //   .attr("x", this.margin.left - 20)
        //   .attr("y", (_,i)=> i * 12 + 50) 
        //   .attr("width", 5)
        //   .attr("height", 5)
        //   .style("fill", (_, i) => color[i])
        
        // spiderContainer.selectAll("mylabels")
        //   .data(this.styleList)
        //   .enter()
        //   .append("text")
        //   .attr("x", this.margin.left)
        //   .attr("y", (_,i)=> i * 12 + 50)
        //   .style("fill", (_, i) => color[i])
        //   .text((d) =>  d.style || d)
        //   .style("alignment-baseline", "middle")
        //   .style("font-weight", 600)
        //   .style("font-size", 10)
        //   .transition()
        //   .duration(600)
        
    },
  },
  watch: {
    rerender(newSize) {
      if (!isEmpty(newSize)) {
        d3.select("#spider-svg").selectAll("*").remove(); // Clean all the elements in the chart
        this.initChart();
      }
    },
    showData() {
      // d3.select("#spider-svg").selectAll("*").remove(); // Clean all the elements in the chart
      this.createChart();
       d3.select("#spider-svg").selectAll("text").remove();
       d3.select("#spider-svg").selectAll("circle").remove();
      this.initChart();
    }
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
