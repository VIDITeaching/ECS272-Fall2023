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
        const styleList =[...new Set(Data.map(d => d['Body_Style']))];
        return {
            lines: [] as CategoricalBar[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 40, right: 20, top: 20, bottom: 60} as Margin,
            styleList,
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
            let vm = this;
            let chartContainer = d3.select('#line-svg').call(zoom);

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
                .attr("cursor", 'pointer')
                .on("mouseover", function(d){
                    console.log(d, d.textContent);
                    vm.$emit('updateSpider', [this.textContent]);
                })
                .on("mouseout", function(d){ 
                    console.log(d, d.textContent);
                    vm.$emit('updateSpider', []);
                })

            const yAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(yScale))

            const yLabel = chartContainer.append('g')
                .attr('transform', `translate(${10}, ${this.size.height / 2}) rotate(-90)`)
                .append('text')
                .text('Count')
                .style('font-size', '.8rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width / 2 - this.margin.left}, ${this.size.height - 5})`)
                .append('text')
                .text('Body Style')
                .style('font-size', '.8rem')
            
            function zoom(svg) {
                const extent = [[vm.margin.left, vm.margin.top], [vm.size.width - vm.margin.right, vm.size.height - vm.margin.top]];
                console.log('xxx-extent', extent)

                svg.call(d3.zoom()
                    .scaleExtent([1, 5])
                    .translateExtent(extent)
                    .extent(extent)
                    .on("zoom", zoomed));

                function zoomed(event) {
                    console.log('fff', [vm.margin.left, vm.size.width - vm.margin.right].map(d => event.transform.applyX(d)))
                    xScale.range([vm.margin.left, vm.size.width - vm.margin.right].map(d => event.transform.applyX(d)));
                    svg.selectAll(".bars rect").attr("x", d => xScale(d.category)).attr("width", xScale.bandwidth());
                    svg.selectAll(".x-axis").call(x);
                }
            }
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

            const lines = chartContainer
                // .append("path")
                // .datum(this.lines)
                // .attr("d", d3.line()
                //     .x(d => xScale(d.category))
                //     .y(d => yScale(d.value))
                // )
                // // .attr("stroke", "url(#line-gradient)" )
                // .attr("stroke", "#CECEFF" )
                // .attr("fill", "none")
                // .attr("stroke-width", 4)
                .append("g")
                .attr("class", "bars")
                .selectAll("rect")
                .data<CategoricalBar>(this.lines) // TypeScript expression. This always expects an array of objects.
                .join("rect")
                .attr("class", "bar")
                // .on("mouseover", onMouseOver) //Add listener for the mouseover event
                // .on("mouseout", onMouseOut)
                .attr("x", (d: CategoricalBar) => xScale(d.category) as number)
                .attr("y", (d: CategoricalBar) => yScale(d.value) as number)
                .attr("width", xScale.bandwidth())
                .attr("height", (d: CategoricalBar) =>
                Math.abs(yScale(0) - yScale(d.value))
                ) // this substraction is reversed so the result is non-negative
                .attr("fill", d => bodyColor(d.category))
                .attr("opacity", 0.6);

            
            const titleContainer = chartContainer
                .append("g")
                .append("text")
                .attr("class", "title-container-line")

            // add tooltip
            var tooltip = d3.select("div.chart-container-line")
                .append("div")
                .attr("class", "tooltip-line")
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



            const title = titleContainer
                .attr('transform', `translate(${this.size.width / 4}, ${this.margin.top + 5})`)
                .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
                .style('font-weight', 'bold')
                .text('Pokemon: Overview of Count in different Pokemon body styles') // text content
                
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
    position: relative;
}
</style>

