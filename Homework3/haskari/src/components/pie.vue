<script lang="ts">
import * as d3 from "d3";



export default {
  methods: {
    plot: function (data_pie) {
      // set the dimensions and margins of the graph
      // set the dimensions and margins of the graph
      const width = 900;
      const height = Math.min(width, 350);

      console.log(data_pie);

      // const decadesSum: Record<string, number> = { '1990s': 33, '2000s': 34, '2010s': 33 };

      // const data_pie: { key: string; value: number }[] = Object.entries(decadesSum).map(([key, value]) => ({ key, value }));

      // Create the color scale.
      const color = d3.scaleOrdinal()
        .domain(data_pie.map(d => d.category))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data_pie.length).reverse())

      // Create the pie layout and arc generator.
      const pie = d3.pie()
        .sort(null)
        .value(d => d.value);

      const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(width, height) / 2 - 1);

      const labelRadius = arc.outerRadius()() * 0.8;

      // A separate arc generator for labels.
      const arcLabel = d3.arc()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius);

      const arcs = pie(data_pie);

      // Create the SVG container.
      const svg = d3.select("#plot1")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 15px sans-serif;");

      // Add a sector path for each value.
      svg.append("g")
        .attr("stroke", "white")
        .selectAll()
        .data(arcs)
        .join("path")
        .attr("fill", d => color(d.data.category))
        .attr("d", arc)
        .style('opacity', 0.75)
        .attr('stroke-width', '2')
        .on('mousemove', function (e, d) {
          const event = d3.pointer(e);
          console.log(event);
          info.attr('transform', `translate(${event[0] + 10}, ${event[1] + 10})`);
          info.select('text').text(`${d.data.category}: ${(d.data.value * 100).toLocaleString("en-US")}%`);
          info.style('opacity', 1);

          const elem = d3.select(this);
          elem.style('opacity', 1);
          elem.attr('stroke', 'black');
        })
        .on('mouseout', function (e, d) {
          const elem = d3.select(this);
          elem.style('opacity', 0.75);
          elem.attr('stroke', 'none');
          info.style('opacity', 0);
        })
        .append("title")
        .text(d => `${d.data.category}: ${(d.data.value * 100).toLocaleString("en-US")}`);

      // Create a new arc generator to place a label close to the edge.
      // The label shows the value if there is enough room.
      svg.append("g")
        .attr("text-anchor", "middle")
        .selectAll()
        .data(arcs)
        .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .call(text => text.append("tspan")
          .attr("y", "-0.4em")
          .attr("font-weight", "bold")
          .text(d => d.data.category));
        // .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
        //   .attr("x", 0)
        //   .attr("y", "0.7em")
        //   .attr("fill-opacity", 0.7)
        //   .text(d => `${(d.value * 100).toFixed(1)}%`));

      const info = svg.append("g").style('opacity', 0);
      info.append('rect')
        .attr('width', 100)
        .attr('height', 50)
        .attr('fill', 'white')
        .attr('stroke', 'blue');
      info.append('text')
        .attr('width', 100)
        .attr('height', 50)
        .attr('x', 50)
        .attr('y', 25)
        .style('font-size', '1.25em')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text('test');
    },
  },
  
  mounted: async function () {
    const dataJson = await fetch('../../data/pie_data.json');
    const data = await dataJson.json();
    this.plot(data.data);
  }
}


</script>


  
<template>
  <div class="container">
    <h3>Pie Plot of 2023 Salaries by Experience Level</h3>
    <svg id="plot1"></svg>
    <p>
      SE= Senior, EX= Executive, MI= Middle, EN= Entry
    </p>
  </div>

  
</template>


<style scoped>
p{font-size: 0.7em;}
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
</style>
  
  