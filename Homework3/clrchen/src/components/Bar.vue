<script lang="ts">
import * as d3 from "d3";
import Data from "../../data/data.json";
import { isEmpty, debounce } from "lodash";

import { Bar, ComponentSize, Margin } from "../types";

interface CategoricalBar extends Bar {
  category: string;
}


export default {
  data() {
    const styleList =[...new Set(Data.map(d => d['Body_Style']))];
    return {
      bars: [] as CategoricalBar[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
      size: { width: 0, height: 0 } as ComponentSize,
      margin: { left: 40, right: 20, top: 20, bottom: 60 } as Margin,
      styleList,
    };
  },
  computed: {
    rerender() {
      return !isEmpty(this.bars) && this.size;
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
    let types = groupBy(Data, "Type_1");
    let tmp = [];
    Data.map((i)=> {
      let processedObj = {
        category: i.Body_Style,
        value: i.Total,
        catch: i.Catch_Rate,
        height: i.Height_m,
        weight: i.Weight_kg
      };
      tmp.push(processedObj)
    })
      console.log('ggg', tmp)

    let totalByTypeOne = [];
    Object.keys(types).forEach((d) => {
      let initialValue = 0;
      let cumulativeValue = types[d].reduce(
        (acc, curvalue) => acc + curvalue.Total,
        initialValue
      );
      let average = cumulativeValue / types[d].length;
      console.log('xxxxxxx-catch', types[d])
      let processedObj = {
        category: d,
        value: Math.round(average),
      };
      totalByTypeOne.push(processedObj);
    });
    console.log('xxx-totalByTypeOne', totalByTypeOne);
    this.bars = tmp;
  },
  methods: {
    onResize() {
      // record the updated size of the target element
      let target = this.$refs.barContainer as HTMLElement;
      if (target === undefined) return;
      this.size = { width: target.clientWidth, height: target.clientHeight };
    },
    initChart() {
      let vm = this;
      
      // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
      let chartContainer = d3.select("#bar-svg").append("g").call(d3.zoom().on("zoom", function(e){
        chartContainer.attr("transform", e.transform)
      }))

      // Here we compute the [min, max] from the data values of the attributes that will be used to represent x- and y-axis.
      let yExtents = d3.extent(
        this.bars.map((d: CategoricalBar) => d.height as number)
      ) as [number, number];

      let xExtents = d3.extent(
        this.bars.map((d: CategoricalBar) => d.weight as number)
      ) as [number, number];

      // This is to get the unique categories from the data using Set, then store in an array.
      let xCategories: string[] | unknown[] = [
        ...new Set(this.bars.map((d: CategoricalBar) => d.category as string)),
      ];

      let xScale = d3
        // .scaleBand()
        // .rangeRound([this.margin.left, this.size.width - this.margin.right])
        // .domain(xCategories as string[])
        // .padding(0.4);
        .scaleLinear()
        .range([this.margin.left, this.size.width - this.margin.right]) //bottom side to the top side on the screen
        .domain([0, xExtents[1]]).nice(); // This is based on your data, but if there is a natural value range for your data attribute, you should follow
        
      
      let yScale = d3
        .scaleLinear()
        .range([this.size.height - this.margin.bottom, this.margin.top]) //bottom side to the top side on the screen
        .domain([0, yExtents[1]]).nice(); // This is based on your data, but if there is a natural value range for your data attribute, you should follow
        
      const x = d3.axisBottom(xScale).tickSizeOuter(0);


      const xAxis = chartContainer
        .append("g")
        .attr("class", "x-axis")
        .attr(
          "transform",
          `translate(0, ${this.size.height - this.margin.bottom})`
        )
        .call(x)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", `rotate(-35)`);
        
      const yAxis = chartContainer
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${this.margin.left}, 0)`)
        .call(d3.axisLeft(yScale))

      const yLabel = chartContainer
        .append("g")
        .attr(
          "transform",
          `translate(${10}, ${this.size.height / 2}) rotate(-90)`
        )
        .append("text")
        .text("Height")
        .style("font-size", ".8rem");

      const xLabel = chartContainer
        .append("g")
        .attr(
          "transform",
          `translate(${this.size.width / 2 - this.margin.left}, ${
            this.size.height - this.margin.top + 5
          })`
        )
        .append("text")
        .text("Weight")
        .style("font-size", ".8rem")


    //   function onMouseOver(d, i) {
    //     d3.select(this).attr('class', 'highlight');
    //     d3.select(this)
    //       .transition()     // adds animation
    //       .duration(400)
    //       .attr('width', xScale.bandwidth() + 5)
    //       .attr("fill", "red")
    //       .attr("y", function(d) { return yScale(d.value); })
    // }

    // //mouseout event handler function
    // function onMouseOut(d, i) {
    //     // use the text label class to remove label on mouseout
    //     // console.log('hiiiii')
    //     d3.select(this).attr('class', 'bar');
    //     d3.select(this)
    //       .transition()     // adds animation
    //       .duration(400)
    //       .attr('width', xScale.bandwidth())
    //       .attr("fill", "pink")
    //       .attr("y", d => yScale(d.value))
    //       .attr("height", d => Math.abs(yScale(0) - yScale(d.value)));

    //     d3.selectAll('.val')
    //       .remove()
    // }

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



      const a = Object.values(this.styleList).map(v => v)
      var bodyColor = d3.scaleOrdinal(color).domain(a);
      console.log('this.styleList', bodyColor)
      const bars = chartContainer
        .append("g")
        .attr("class", "bars")
        .selectAll("circle")
        .data<CategoricalBar>(this.bars) // TypeScript expression. This always expects an array of objects.
        .enter()
        .append('circle')
        .attr("class", "bar")
        // .on("mouseover", onMouseOver) //Add listener for the mouseover event
        // .on("mouseout", onMouseOut)
        .attr("cx", (d: CategoricalBar) => xScale(d.weight) as number)
        .attr("cy", (d: CategoricalBar) => yScale(d.height) as number)
        .attr("r", 2)
        // .attr("stroke", "pink")
        .attr("fill", d => {
          console.log('d.category',d.category)
          return bodyColor(d.category)})

            // new X axis
        xScale.domain([0, 300])
        chartContainer.select(".x-axis")
          .transition()
          .duration(2000)
          .attr("opacity", "1")
          .call(d3.axisBottom(xScale));

        chartContainer.selectAll("circle")
          .transition()
          .delay(function(d,i){return(i*3)})
          .duration(2000)
          .attr("cx", function (d) { return xScale(d.weight); } )
          .attr("cy", function (d) { return yScale(d.height); } )

      // draw labels & dots
        chartContainer.append("g").selectAll("rect")
          .data(this.styleList)
          .enter()
          .append("rect")
          .attr("x", this.size.width - this.margin.left * 2 - 20)
          .attr("y", (_,i)=> i * 12 + 50) 
          .attr("width", 5)
          .attr("height", 5)
          .style("fill", (_, i) => color[i])
        
        chartContainer.selectAll("mylabels")
          .data(this.styleList)
          .enter()
          .append("text")
          .attr("x", this.size.width - this.margin.left * 2)
          .attr("y", (_,i)=> i * 12 + 50)
          .style("fill", (_, i) => color[i])
          .text((d) =>  d.category || d)
          .style("alignment-baseline", "middle")
          .style("font-weight", 600)
          .style("font-size", 10)
          .transition()
          .duration(600)



      const titleContainer = chartContainer
        .append("g")
        .append("text")
        .attr("class", "title-container")

      // add tooltip
      var tooltip = d3.select("div.chart-container-bar")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", 'absolute')
        .style("background", '#000')
        .style("color", '#fff')
        .style("padding", "5px")

      titleContainer
        .append("text")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", (d) => {
          // console.log('sssss')
          return '#000'
        })
        
      const description = chartContainer.append('g')
        .append('text')
        .attr('transform', `translate(${this.margin.left * 2}, ${this.margin.top * 2 - 5})`)
        .attr('dy', '0.5rem')
        // .style('text-anchor', 'middle')
        .text('Hover on the title to see more description')
        .style("font-size", 12)
        .attr("fill", 'grey')
              
      const title = titleContainer
        .attr('transform', `translate(${this.margin.left * 2}, ${this.margin.top})`)
        .attr("dy", "0.5rem") // relative distance from the indicated coordinates.
        // .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Pokemon: Height and Weight in different Body Style of Pokemon") // text content
        .on("mouseover", function(d){ 
          console.log('this', this);
          tooltip.html("After overview in the scatter plot, I found the dots are cluttered in the left-bottom corner, so I truncate the domain into 0 - 300")
            .style("right", "20px")
            .style("top", "60px")
          return tooltip.style("opacity", .5);})
        .on("mouseout", (d) => {
          d3.select("text.title-container").style("fill", "black");
          return tooltip.style("opacity", 0)});
    },
  },
  watch: {
    rerender(newSize) {
      if (!isEmpty(newSize)) {
        d3.select("#bar-svg").selectAll("*").remove(); // Clean all the elements in the chart
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
  <div class="chart-container-bar d-flex" ref="barContainer">
    <svg id="bar-svg" width="100%" height="50vh">
      <!-- all the visual elements we create in initChart() will be inserted here in DOM-->
    </svg>
  </div>
</template>

<style scoped>
.chart-container-bar {
  height: 50vh;
  position: relative;
}
</style>
