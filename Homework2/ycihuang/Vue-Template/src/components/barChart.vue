<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/demo.json'; /* Example of reading in data directly from file */
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Bar, ComponentSize, Margin } from '../types';
// A "extends" B means A inherits the properties and methods from B.
interface CategoricalBar extends Bar{
    category: string;
}
interface weight_height{
    type: string,
    height: number,
    weight: number, 
    len: number
}
const dataPokemon = await d3.csv('../../data/pokemon_alopez247.csv')


// Computed property: https://vuejs.org/guide/essentials/computed.html
// Lifecycle in vue.js: https://vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram

export default {
    data() {
        // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
        return {
            bars: [] as CategoricalBar[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 40, right: 20, top: 20, bottom: 60} as Margin,
        }
    },
    computed: {
        // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
        rerender() {
            return (!isEmpty(this.bars)) && this.size
        }
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
        console.log(Data);
        if (isEmpty(Data)) return;
        this.bars = Data.data;
    },
    methods: {
        onResize() {  // record the updated size of the target element
            let target = this.$refs.barContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        initChart() {
            // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
            let chartContainer = d3.select('#bar-svg')

            // Here we compute the [min, max] from the data values of the attributes that will be used to represent x- and y-axis.
            // let yExtents = d3.extent(this.bars.map((d: CategoricalBar) => d.value as number)) as [number, number]
            // This is to get the unique categories from the data using Set, then store in an array.
            let xCategories: string[] = [ ...new Set(this.bars.map((d: CategoricalBar) => d.category as string))]
            //@ts-ignore
            function compare(a, b) {
                if (a.Total < b.Total) {
                    return 1
                }
                if (a.Total > b.Total) {
                    return -1
                } 
                return 0
            }
            dataPokemon.sort(compare)

            let type_group = dataPokemon.reduce((acc, current) => {
                let key = current.Type_1 as String
                //@ts-ignore
                if (acc[key] == null)       
                    //@ts-ignore      
                    acc[key] = [current]
                else             
                    //@ts-ignore
                    acc[key].push(current)
                return acc
            }, {})
            console.log(Object.keys(type_group))
            let tgroup = [] as weight_height[]
            for (let key of Object.keys(type_group)) {
                //@ts-ignore
                let len = type_group[key].length
                console.log(len)
                let sum_height = 0
                let sum_weight = 0
                //@ts-ignore
                type_group[key].forEach(d => {
                    sum_height += Number(d['Height_m'])
                    sum_weight += Number(d['Weight_kg']) 
                })

                let temp = {
                    type: key,
                    height: sum_height / len,
                    weight: sum_weight / len, 
                    len: len
                }
                tgroup.push(temp)
            }
            console.log(tgroup)

            let yExtents = d3.extent(tgroup.map((d: weight_height) => d.len as number)) as [number, number]
            let xExtents = d3.extent(tgroup.map((d: weight_height) => d.weight as number)) as [number, number]
            console.log(xExtents, yExtents)
            // let color = [] as Prop[];
            // Object.keys(color_sum).forEach(d => {
            //     const prop = {
            //         prop: d, 
            //         value: Number(color_sum[d])
            //     }
            //     color.push(prop)
            // })

            // We need a way to map our data to where it should be rendered within the svg (in screen pixels), based on the data value, 
            //      so the extents and the unique values above help us define the limits.
            // Scales are just like mapping functions y = f(x), where x refers to domain, y refers to range. 
            //      In our case, x should be the data, y should be the screen pixels.
            // We have the margin here just to leave some space
            // In viewport (our screen), the leftmost side always refer to 0 in the horizontal coordinates in pixels (x). 
            let xScale = d3.scaleBand()
                .rangeRound([this.margin.left, this.size.width - this.margin.right])
                .domain(Object.keys(type_group))
                .padding(0.1) // spacing between the categories

            // In viewport (our screen), the topmost side always refer to 0 in the vertical coordinates in pixels (y). 
            let yScale = d3.scaleLinear()
                .range([this.size.height - this.margin.bottom, this.margin.top]) //bottom side to the top side on the screen
                .domain([0, yExtents[1]]) // This is based on your data, but if there is a natural value range for your data attribute, you should follow
                // e.g., it is natural to define [0, 100] for the exame score, or [0, <maxVal>] for counts.

            // There are other scales such as scaleOrdinal,
                // whichever is appropriate depends on the data types and the kind of visualizations you're creating.

            // This following part visualizes the axes along with axis labels.
            // Check out https://observablehq.com/@d3/margin-convention?collection=@d3/d3-axis for more details
            const xAxis = chartContainer.append('g')
                .attr('transform', `translate(0, ${this.size.height - this.margin.bottom})`)
                .call(d3.axisBottom(xScale))

            const yAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(yScale))

            const yLabel = chartContainer.append('g')
                .attr('transform', `translate(${10}, ${this.size.height / 2}) rotate(-90)`)
                .append('text')
                .text('number of species')
                .style('font-size', '.8rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width / 2 - this.margin.left}, ${this.size.height - this.margin.top - 5})`)
                .append('text')
                .text('Type_1')
                .style('font-size', '.8rem')
            
            // // "g" is grouping element that does nothing but helps avoid DOM looking like a mess
            // // We iterate through each <CategoricalBar> element in the array, create a rectangle for each and indicate the coordinates, the rectangle, and the color.
            let colorI = 0
            const bars = chartContainer.append('g')
                .selectAll('rect')
                .data<weight_height>(tgroup) // TypeScript expression. This always expects an array of objects.
                .join('rect')
                // specify the left-top coordinate of the rectangle
                .attr('x', (d: weight_height) => xScale(d.type) as number)
                .attr('y', (d: weight_height) => yScale(d.len) as number)
                // specify the size of the rectangle
                .attr('width', xScale.bandwidth())
                .attr('height', (d: weight_height) => Math.abs(yScale(0) - yScale(d.len))) // this substraction is reversed so the result is non-negative
                .attr('fill', (d: weight_height) => {
                    if (d.len > 50) {
                        let color = d3.schemeCategory10[colorI]
                        colorI += 1
                        return color
                    }
                    else {
                        return "black"
                    }
                })
                .attr("opacity", 0.5)
                // const bars = chartContainer.append('g')
            //     .selectAll('points')
            //     .data<weight_height>(tgroup) // TypeScript expression. This always expects an array of objects.
            //     .join('circle')
            //     .attr('fill', (d, i) => d3.schemeCategory10[i])
            //     .attr('opacity', 0.5)
            //     // specify the left-top coordinate of the rectangle
            //     .attr('cx', (d: weight_height) => xScale(d.weight) as number)
            //     .attr('cy', (d: weight_height) => yScale(d.height) as number)
            //     .attr('r', this.size.width / 150)
            //     // specify the size of the rectangle
            //     // .attr('width', xScale.bandwidth())
            //     // .attr('height', (d: CategoricalBar) => Math.abs(yScale(0) - yScale(d.value))) // this substraction is reversed so the result is non-negative
            // chartContainer.selectAll("allText")
            // .data<weight_height>(tgroup)
            // .enter()
            // .append("text")
            // .attr("transform", (d: weight_height, i: number) => "translate(" + (xScale(d.weight)) + ","+ (yScale(d.height)) +")")
            // .text((d:weight_height) => d.type)
            // .attr("text-anchor", "end")

            // For transform, check out https://www.tutorialspoint.com/d3js/d3js_svg_transformation.htm, but essentially we are adjusting the positions of the selected elements.
            const title = chartContainer.append('g')
                .append('text') // adding the text
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top + 5})`)
                .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Number of Pokemon of different Type_1 group') // text content
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#bar-svg').selectAll('*').remove() // Clean all the elements in the chart
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
    <div class="chart-container d-flex" ref="barContainer">
        <svg id="bar-svg" width="100%" height="100%">
            <!-- all the visual elements we create in initChart() will be inserted here in DOM-->
        </svg>
    </div>
</template>

<style scoped>
.chart-container{
    height: 100%;
}
</style>

