<template>
    <div id="streamgraph" class="streamgraph">
        <div class="stream-container" ref="streamContainer">
        </div>
    </div>
</template>

<script>
import * as d3 from 'd3';

export default {
    mounted() {

        let target = d3.select("#streamgraph").node();
        if (target === undefined) return;
        this.size = { width: target.clientWidth, height: target.clientHeight };
        this.margin = { top: 20, right: 0, bottom: 0, left: 10 };
        this.width = this.size.width - 20;
        this.height = this.size.height - 20;
        this.initializeStreamChart();
        // set the dimensions and margins of the graph
        // const margin = { top: 20, right: 30, bottom: 0, left: 10 },
        //     width = 460 - margin.left - margin.right,
        //     height = 400 - margin.top - margin.bottom;

        // Your D3.js code to create the scatter plot using processed data
        // const margin = { top: 2, right: 20, bottom: 2, left: 50 };
        // const width = 1980 - margin.left - margin.right;
        // const height = 400 - margin.top - margin.bottom;

    },
    methods: {
        initializeStreamChart() {
            this.margin = { top: 20, right: 10, bottom: 0, left: 10 };
            // width = this.width;
            // height = this.height;

            // append the svg object to the body of the page
            const svg = d3.select("#streamgraph")
                .append("svg")
                .attr("class", "svgPlot")
                .attr("viewBox", `-10 0 ${this.width + 20} ${this.height + 20}`)
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
                .style('position', 'absolute')
                .style('top', 0)
                .style('left', 0)
                .append("g")
                .attr("transform",
                    `translate(${this.margin.left}, ${this.margin.top})`);

            // Parse the Data
            d3.csv("../../data/countries.csv").then(data => {

                // List of groups = header of the csv files
                const keys = data.columns.slice(1)

                console.log(keys)

                // Add X axis
                const x = d3.scaleLinear()
                    .domain(d3.extent(data, function (d) { return d.year; }))
                    .range([0, this.width]);
                svg.append("g")
                    .attr("transform", `translate(0, ${this.height * 0.8})`).style("font-size", "15px")
                    .call(d3.axisBottom(x).ticks(10))
                    .select(".domain").remove()
                // Customization
                svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

                // Add X axis label:
                svg.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", this.width / 2)
                    .attr("y", this.height - 40)
                    .text("Time (year)").style("font-size", "20px");

                // Add Y axis
                const y = d3.scaleLinear()
                    .domain([-5000, 5000])
                    .range([this.height, 0]);

                // Add Y axis label:
                svg.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", 0)
                    .attr("y", 30)
                    .text("Number of attacks")
                    .attr("text-anchor", "start")

                // color palette
                const color = d3.scaleOrdinal()
                    .domain(keys)
                    .range(d3.schemeTableau10);

                //stack the data?
                const stackedData = d3.stack()
                    .offset(d3.stackOffsetSilhouette)
                    .keys(keys)
                    (data)



                // Add chart title
                svg.append('text')
                    .attr('class', 'chart-title')
                    .attr('x', this.width / 2)
                    .attr('y', -this.margin.top / 2 + 20)
                    .style('text-anchor', 'middle')
                    .style('font-size', '18px')
                    .style('font-weight', 'bold')
                    .text('Stream graph of terrorist attacks in top 10 most affected countries (hover to highlight)');

                // // create a tooltip
                // const Tooltip = svg
                //     .append("text")
                //     .attr("x", width / 2)
                //     .attr("y", 60)
                //     .style("opacity", 0)
                //     .style("font-size", 20)

                // Three function that change the tooltip when user hover / move / leave a cell
                const mouseover = function (event, d) {
                    // Tooltip.style("opacity", 1)
                    // place tooltip at the right position
                    // Tooltip.attr("x", event.x)
                    //     .attr("y", event.y)
                    d3.selectAll(".myStream").style("opacity", .2)
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
                    d3.selectAll(".myStream").style("opacity", 1).style("stroke", "none")
                }

                // Area generator
                const area = d3.area()
                    .x(function (d) { return x(d.data.year); })
                    .y0(function (d) { return y(d[0]); })
                    .y1(function (d) { return y(d[1]); })

                // Show the areas
                svg
                    .selectAll("mylayers")
                    .data(stackedData)
                    .join("path")
                    .attr("class", "myStream")
                    .style("fill", function (d) { return color(d.key); })
                    .attr("d", area)
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)


                // Add legend
                const legend = svg.append('g')
                    .attr('class', 'legend')
                    .attr('transform', `translate(${this.width / 2 - 80},${this.margin.bottom / 2 + 20})`); // Center the legend at the top of the plot

                legend.selectAll('rect')
                    .data(keys)
                    .enter()
                    .append('rect')
                    .attr('x', (d, i) => i * 85 - 400)
                    .attr('y', 10)
                    .attr('width', 15)
                    .attr('height', 15)
                    .attr('fill', d => color(d));


                legend.selectAll('text')
                    .data(keys)
                    .enter()
                    .append('text')
                    .attr('x', (d, i) => i * 85 - 380)
                    .attr('y', 20)
                    .text(d => `${d}`)
                    .style('font-size', '10px') // Font size of legend items
                    .style("fill", function (d) { return color(d) })
                    .attr('text-anchor', 'left');


            });

        }
    }

};
</script>

<style scoped>
.streamgraph {
    position: relative;
    height: 100%;
}


.stream-container {
    position: relative;
    width: 100%;
    /* Set width to 100% to fill the entire chart area */
    height: 100%;
    /* Set height to 100% to fill the entire chart area */
    /* Add other styling properties for the chart container if needed */
}
</style>
