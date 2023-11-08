<template>
  <div id="area">
    <div class="area-container" ref="areaContainer">
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  mounted() {
    let target = this.$refs.areaContainer;
    if (target === undefined) return;
    this.size = { width: target.clientWidth, height: target.clientHeight };
    this.margin = { top: 70, right: 30, bottom: 50, left: 70 };
    this.width = this.size.width - 100;
    this.height = this.size.height + 225;
    this.intializeAreaChart();
  },
  methods: {
    intializeAreaChart() {
      // The svg

      this.margin = { top: 150, right: 5, bottom: 100, left: 75 }; // Minimal margin values
      // const width = 950 - margin.left - margin.right;
      // const height = 700 - margin.top - margin.bottom;
      // append the svg object to the body of the page
      const svg = d3.select("#area")
        .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform",
          `translate(${this.margin.left}, ${this.margin.top})`);

      // Parse the Data
      d3.csv("../../data/attack_types.csv").then(data => {
        //////////
        // GENERAL //
        //////////

        // List of groups = header of the csv files
        const keys = data.columns.slice(1)

        console.log(keys)

        // color palette
        const color = d3.scaleOrdinal()
          .domain(keys)
          .range(d3.schemeTableau10);

        //stack the data?
        const stackedData = d3.stack()
          .keys(keys)
          (data)



        //////////
        // AXIS //
        //////////

        // Add X axis
        const x = d3.scaleLinear()
          .domain(d3.extent(data, function (d) { return d.year; }))
          .range([0, this.width]);
        const xAxis = svg.append("g")
          .attr("transform", `translate(0, ${this.height})`)
          .call(d3.axisBottom(x).ticks(5))
          .style("font-size", "100%");

        // Add X axis label:
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("x", this.width / 2)
          .attr("y", this.height + 60)
          .text("Time (year)").style("font-size", "100%");

        // Add Y axis label:
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("x", 0)
          .attr("y", -20)
          .text("Number of Attacks")
          .attr("text-anchor", "start").style("font-size", "100%");

        // Add Y axis
        const y = d3.scaleLinear()
          .domain([0, 18000])
          .range([this.height, 0]);
        svg.append("g").style("font-size", "100%")
          .call(d3.axisLeft(y).ticks(5))



        //////////
        // BRUSHING AND CHART //
        //////////

        // Add a clipPath: everything out of this area won't be drawn.
        const clip = svg.append("defs").append("svg:clipPath")
          .attr("id", "clip")
          .append("svg:rect")
          .attr("width", this.width)
          .attr("height", this.height)
          .attr("x", 0)
          .attr("y", 0);

        // // Add brushing
        // const brush = d3.brushX()                 // Add the brush feature using the d3.brush function
        //   .extent([[0, 0], [width, height]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        //   .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

        // Create the scatter variable: where both the circles and the brush take place
        const areaChart = svg.append('g')
          .attr("clip-path", "url(#clip)")

        // Area generator
        const area = d3.area()
          .x(function (d) { return x(d.data.year); })
          .y0(function (d) { return y(d[0]); })
          .y1(function (d) { return y(d[1]); })


        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function (event, d) {
          // Tooltip.style("opacity", 1)
          // place tooltip at the right position
          // Tooltip.attr("x", event.x)
          //     .attr("y", event.y)
          d3.selectAll(".myArea").style("opacity", .2)
          d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
        }
        const mousemove = function (event, d, i) {
          // // get the data from the hovered year
          // Tooltip.text(d.key)

          const tooltip = d3.select('.tooltip');
          tooltip.transition().duration(200).style('opacity', 0.9);
          tooltip.html(`<div>${d.key}</div>`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .style('width', '150px');
        }
        const mouseleave = function (event, d) {
          // Tooltip.style("opacity", 0)
          d3.select('.tooltip').transition().duration(100).style('opacity', 0);
          d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
        }
        // Show the areas
        areaChart
          .selectAll("mylayers")
          .data(stackedData)
          .join("path")
          .attr("class", function (d) { return "myArea " + d.key })
          .style("fill", function (d) { return color(d.key); })
          .attr("d", area)
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)

        // // Add the brushing
        // areaChart
        //   .append("g")
        //   .attr("class", "brush")
        //   .call(brush);

        let idleTimeout
        function idled() { idleTimeout = null; }

        // A function that update the chart for given boundaries
        function updateChart(event, d) {

          extent = event.selection

          // If no selection, back to initial coordinate. Otherwise, update X axis domain
          if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain(d3.extent(data, function (d) { return d.year; }))
          } else {
            x.domain([x.invert(extent[0]), x.invert(extent[1])])
            areaChart.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
          }

          // Update axis and area position
          xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(5))
          areaChart
            .selectAll("path")
            .transition().duration(1000)
            .attr("d", area)
        }

        // maintain a boolean variable called isClicked
        let isClicked = false;




        // What to do when one group is hovered
        const highlight = function (event, d) {
          // reduce opacity of all groups
          d3.selectAll(".myArea").style("opacity", .1)
          // expect the one that is hovered
          d3.select("." + d).style("opacity", 1)
        }

        // And when it is not hovered anymore
        const noHighlight = function (event, d) {
          d3.selectAll(".myArea").style("opacity", 1)
        }

        const selectClick = function (event, d) {
          if (isClicked) {
            d3.selectAll(".myArea").style("opacity", 1)
            isClicked = false;
          } else {
            d3.selectAll(".myArea").style("opacity", .1)
            d3.select("." + d).style("opacity", 1)
            isClicked = true;
          }

        }

        // Add chart title
        svg.append('text')
          .attr('class', 'chart-title')
          .attr('x', this.width / 2 - 30)
          .attr('y', -this.margin.top / 2 - 25)
          .style('text-anchor', 'middle')
          .style('font-size', '100%')
          .style('font-weight', 'bold')
          .text('Terrorist attacks over the year by type of attack (hover to highlight)');



        //////////
        // LEGEND //
        //////////

        // Add one dot in the legend for each name.
        const size = 15
        svg.selectAll("myrect")
          .data(keys)
          .join("rect")
          .attr("x", 300)
          .attr("y", function (d, i) { return i * (size + 10) - 50 }) // 100 is where the first dot appears. 25 is the distance between dots
          .attr("width", size)
          .attr("height", size)
          .style("fill", function (d) { return color(d) })
          .on("mouseover", highlight)
          .on("mouseleave", noHighlight)
        // .on("click", selectClick)

        // Add one dot in the legend for each name.
        svg.selectAll("mylabels")
          .data(keys)
          .join("text")
          .attr("x", 300 + size * 1.5)
          .attr("y", function (d, i) { return i * (size + 10) + (size / 2) - 50 }) // 100 is where the first dot appears. 25 is the distance between dots
          .style("fill", function (d) { return color(d) })
          .style("font-size", '100%')
          .text(function (d) { return d })
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle")
          .on("mouseover", highlight)
          .on("mouseleave", noHighlight)
        // .on("click", selectClick)

      })
    }
  }
};
</script>
<style scoped>
#area {
  position: relative;
}

.area-container {
  position: relative;
  width: 100%;
  /* Set width to 100% to fill the entire chart area */
  height: 100%;
  /* Set height to 100% to fill the entire chart area */
  /* Add other styling properties for the chart container if needed */
}
</style>
