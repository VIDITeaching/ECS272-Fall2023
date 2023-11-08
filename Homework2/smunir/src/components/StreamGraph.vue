<template>
    <div id="streamgraph"></div>
</template>

<script>
import * as d3 from 'd3';

export default {
    mounted() {

        // set the dimensions and margins of the graph
        // const margin = { top: 20, right: 30, bottom: 0, left: 10 },
        //     width = 460 - margin.left - margin.right,
        //     height = 400 - margin.top - margin.bottom;

        // Your D3.js code to create the scatter plot using processed data
        const margin = { top: 2, right: 20, bottom: 2, left: 50 };
        const width = 1980 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        const svg = d3.select("#streamgraph")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                `translate(${margin.left}, ${margin.top})`);

        // Parse the Data
        d3.csv("../../data/countries.csv").then(function (data) {

            // List of groups = header of the csv files
            const keys = data.columns.slice(1)

            console.log(keys)

            // Add X axis
            const x = d3.scaleLinear()
                .domain(d3.extent(data, function (d) { return d.year; }))
                .range([0, 2017]);
            svg.append("g")
                .attr("transform", `translate(0, ${height * 0.8})`)
                .call(d3.axisBottom(x).tickSize(-height * .7).tickValues([1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010]))
                .select(".domain").remove()
            // Customization
            svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

            // Add X axis label:
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", width / 2)
                .attr("y", height)
                .text("Time (year)");

            // Add Y axis
            const y = d3.scaleLinear()
                .domain([-5000, 5000])
                .range([height, 0]);

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
                .attr('x', width / 2)
                .attr('y', -margin.top / 2 + 20)
                .style('text-anchor', 'middle')
                .style('font-size', '18px')
                .style('font-weight', 'bold')
                .text('Stream graph of terrorist attacks in top 10 most affected countries (hover to highlight)');

            // create a tooltip
            const Tooltip = svg
                .append("text")
                .attr("x", width / 2)
                .attr("y", 60)
                .style("opacity", 0)
                .style("font-size", 20)

            // Three function that change the tooltip when user hover / move / leave a cell
            const mouseover = function (event, d) {
                Tooltip.style("opacity", 1)
                // place tooltip at the right position
                // Tooltip.attr("x", event.x)
                //     .attr("y", event.y)
                d3.selectAll(".myArea").style("opacity", .2)
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 1)
            }
            const mousemove = function (event, d, i) {
                // get the data from the hovered year
                Tooltip.text(d.key)
            }
            const mouseleave = function (event, d) {
                Tooltip.style("opacity", 0)
                d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
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
                .attr("class", "myArea")
                .style("fill", function (d) { return color(d.key); })
                .attr("d", area)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)



        });
    }
};
</script>

<style scoped>
/* Add your scoped CSS styles here */
</style>
