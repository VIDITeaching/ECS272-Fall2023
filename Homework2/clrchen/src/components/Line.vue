<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/data.json'; /* Example of reading in data directly from file */
import { isEmpty, debounce } from 'lodash';

import { Bar, ComponentSize, Margin } from '../types';

interface CategoricalBar extends Bar{
    category: string;
}

export default {
    data() {
        return {
            lines: [] as CategoricalBar[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 40, right: 20, top: 20, bottom: 60} as Margin,
        }
    },
    computed: {
        // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
        rerender() {
            return (!isEmpty(this.lines)) && this.size
        }
    },
    created() {
        function groupBy(objectArray, property) {
            return objectArray.reduce(function (acc, obj) {
                let key = obj[property]
                if (!acc[key]) {
                acc[key] = []
                }
                acc[key].push(obj)
                return acc
            }, {})
        }
        let styles = groupBy(Data, "Body_Style");
        let quatityByBodyStyle = [];
        Object.keys(styles).forEach(d => {
            let num = styles[d].length
            let processedObj = {
                category: d,
                value: num
                }
            quatityByBodyStyle.push(processedObj);
        });
            quatityByBodyStyle.sort(function(a, b){
            if(a.average < b.average) { return -1; }
            if(a.average > b.average) { return 1; }
            return 0;
        })
        this.lines = quatityByBodyStyle;
    },
    methods: {
        onResize() {  // record the updated size of the target element
            let target = this.$refs.lineContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        initChart() {
            // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
            let chartContainer = d3.select('#line-svg')

            // Here we compute the [min, max] from the data values of the attributes that will be used to represent x- and y-axis.
            let yExtents = d3.extent(this.lines.map((d: CategoricalBar) => d.value as number)) as [number, number]
            // This is to get the unique categories from the data using Set, then store in an array.
            let xCategories: string[] | unknown[] = [ ...new Set(this.lines.map((d: CategoricalBar) => d.category as string))]

           let xScale = d3.scaleBand()
                .rangeRound([this.margin.left, this.size.width - this.margin.right])
                .domain(xCategories as string[])
                .padding(0.1) // spacing between the categories

            let yScale = d3.scaleLinear()
                .range([this.size.height - this.margin.bottom, this.margin.top]) //bottom side to the top side on the screen
                .domain([0, 160]) // This is based on your data, but if there is a natural value range for your data attribute, you should follow
            
            const xAxis = chartContainer.append('g')
                .attr('transform', `translate(0, ${this.size.height - this.margin.bottom})`)
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("transform", `rotate(-35)`)

            const yAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(yScale))

            const yLabel = chartContainer.append('g')
                .attr('transform', `translate(${10}, ${this.size.height / 2}) rotate(-90)`)
                .append('text')
                .text('Quantity')
                .style('font-size', '.8rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width / 2 - this.margin.left}, ${this.size.height - 5})`)
                .append('text')
                .text('Body Style')
                .style('font-size', '.8rem')
            
            // "g" is grouping element that does nothing but helps avoid DOM looking like a mess
            // We iterate through each <CategoricalBar> element in the array, create a rectangle for each and indicate the coordinates, the rectangle, and the color.
            const colors = chartContainer.append("linearGradient")
                .attr("id", "line-gradient")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", 0)
                .attr("y1", yScale(0))
                .attr("x2", 0)
                .attr("y2", yScale(100))
                .selectAll("stop")
                    .data([
                    {offset: "0%", color: "#CECEFF"},
                    {offset: "100%", color: "#C1FFE4"}
                    ])
                .enter()
                .append("stop")
                .attr("offset", function(d) { return d.offset; })
                .attr("stop-color", function(d) { return d.color; });

            const lines = chartContainer.append("path")
                .datum(this.lines)
                .attr("d", d3.line()
                    .x(d => xScale(d.category))
                    .y(d => yScale(d.value))
                )
                .attr("stroke", "url(#line-gradient)" )
                .attr("fill", "none")
                .attr("stroke-width", 4)


            // For transform, check out https://www.tutorialspoint.com/d3js/d3js_svg_transformation.htm, but essentially we are adjusting the positions of the selected elements.
            const title = chartContainer.append('g')
                .append('text') // adding the text
                .attr('transform', `translate(${this.size.width - this.margin.left * 3}, ${this.margin.top + 5})`)
                .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Pokemon') // text content
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#line-svg').selectAll('*').remove() // Clean all the elements in the chart
                this.initChart()
            }
        }
    },
    // The following are general setup for resize events.
    mounted() {
        window.addEventListener('resize', debounce(this.onResize, 100)) 
        this.onResize()
    },
    beforeDestroy() {
       window.removeEventListener('resize', this.onResize)
    }
}

</script>

<!-- "ref" registers a reference to the HTML element so that we can access it via the reference in Vue.  -->
<!-- We use flex (d-flex) to arrange the layout-->
<template>
    <div class="chart-container-line d-flex" ref="lineContainer">
        <svg id="line-svg" width="100%" height="40vh">
            <!-- all the visual elements we create in initChart() will be inserted here in DOM-->
        </svg>
    </div>
</template>

<style scoped>
.chart-container-line{
    height: 40vh;
}
</style>

