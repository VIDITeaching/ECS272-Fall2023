<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/demo.json'; /* Example of reading in data directly from file */
import axios from 'axios';
import { isEmpty, debounce, range } from 'lodash';

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
            margin: {left: 40, right: 40, top: 20, bottom: 60} as Margin,
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
            let chartContainer = d3.select('#scatter-svg')

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
            let main_type = [] as string[]
            let tgroup = [] as weight_height[]
            for (let key of Object.keys(type_group)) {
                //@ts-ignore
                let len = type_group[key].length
                let sum_height = 0
                let sum_weight = 0
                //@ts-ignore
                type_group[key].forEach(d => {
                    sum_height += parseFloat(d['Height_m'])
                    sum_weight += parseFloat(d['Weight_kg']) 
                })
                if (len > 50) {
                    let temp = {
                        type: key,
                        height: sum_height / len,
                        weight: sum_weight / len, 
                        len: len
                    }
                    tgroup.push(temp)
                    main_type.push(key)
                }
                
            }
            let mainPokemon = []
            for (let i in dataPokemon) {
                let pokemon = dataPokemon[i]
                if (main_type.includes(pokemon.Type_1 as string)) {
                    mainPokemon.push(pokemon)
                }
            }
            function color(type: string) {
                let colorI = main_type.indexOf(type)
                return d3.schemeCategory10[colorI]
            }
            

            let yExtents = d3.extent(mainPokemon.map((d) => parseFloat(d["Height_m"]) as number)) as [number, number]
            let xExtents = d3.extent(mainPokemon.map((d) => parseFloat(d["Weight_kg"]) as number)) as [number, number]

            let xScale = d3.scaleLinear()
                .range([this.size.width - this.margin.left, this.margin.left]) //bottom side to the top side on the screen
                .domain([xExtents[1], 0]) // This is based on your data, but if there is a natural value range for your data attribute, you should follow

            // In viewport (our screen), the topmost side always refer to 0 in the vertical coordinates in pixels (y). 
            let yScale = d3.scaleLinear()
                .range([this.size.height - this.margin.bottom, this.margin.top * 3]) //bottom side to the top side on the screen
                .domain([0, yExtents[1]]) // This is based on your data, but if there is a natural value range for your data attribute, you should follow
                // e.g., it is natural to define [0, 100] for the exame score, or [0, <maxVal>] for counts.

            const xAxis = chartContainer.append('g')
                .attr('transform', `translate(0, ${this.size.height - this.margin.bottom})`)
                .call(d3.axisBottom(xScale))

            const yAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(yScale))

            const yLabel = chartContainer.append('g')
                .attr('transform', `translate(${10}, ${this.size.height / 2}) rotate(-90)`)
                .append('text')
                .text('Height (m)')
                .style('font-size', '.8rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width / 2 - this.margin.left}, ${this.size.height - this.margin.top - 5})`)
                .append('text')
                .text('Weight (kg)')
                .style('font-size', '.8rem')
            
            const label = chartContainer.selectAll("myLegend")
                .data(main_type)
                .enter()
                // .append("text")
                .append('text')
                .attr("x", (d, i) => this.margin.left + i * this.size.width/10)
                .attr("y", this.margin.top)
                .text(d => d)
                .style('font-size', '.8rem')
                .style("fill", d => color(d))
                .style("font-size", 12)
                .style("opacity", 0.5)
            const svg = chartContainer.append('g')
            const scatter = svg
                .selectAll('points')
                .data(mainPokemon) // TypeScript expression. This always expects an array of objects.
                .join('circle')
                .attr("class", (d) => d["Type_1"]) // group name as the class
                .attr('fill', (d, i) => color(d["Type_1"]))
                .attr('opacity', 0.5)
                // specify the left-top coordinate of the rectangle
                .attr('cx', (d) => {
                    return xScale(parseFloat(d["Weight_kg"])as number ) as number
                })
                .attr('cy', (d) => yScale(parseFloat(d["Height_m"])) as number)
                .attr('r', this.size.width / 150)
            
            const title = chartContainer.append('g')
                .append('text') // adding the text
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top+5})`)
                .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('weight-height of Major Type_1 Groups') // text content

            //@ts-ignore
            svg.call(d3.brush().on("start brush end", ({selection}) => {
                let value = [];
                if (selection) {
                    const [[x0, y0], [x1, y1]] = selection;
                    value = scatter
                        .style("fill", "gray")
                        .filter(d => x0 <= xScale(d["Weight_kg"]) && xScale(d["Weight_kg"]) < x1
                                && y0 <= yScale(d["Height_m"]) && yScale(d["Height_m"]) < y1)
                        .style("fill", (d) => color(d["Type_1"]))
                        .data();
                    d3.selectAll(".path").style("opacity", 0)
                    for (let i = 0; i < mainPokemon.length;i ++) {
                        
                        if (x0 <= xScale(mainPokemon[i]["Weight_kg"]) && xScale(mainPokemon[i]["Weight_kg"]) < x1
                            && y0 <= yScale(mainPokemon[i]["Height_m"]) && yScale(mainPokemon[i]["Height_m"]) < y1) {
                                d3.selectAll("." + "path" +i.toString()).style("opacity", 1)
                            }
                    }
                        
                    
                } else {
                    scatter.style("fill",d => color(d["Type_1"]));
                    d3.selectAll(".path").style("opacity", 0.5)
                }

                
                // chartContainer.property("value", value).dispatch("input");
            }))


            // "g" is grouping element that does nothing but helps avoid DOM looking like a mess
            // We iterate through each <CategoricalBar> element in the array, create a rectangle for each and indicate the coordinates, the rectangle, and the color.
            
                // specify the size of the rectangle
                // .attr('width', xScale.bandwidth())
                // .attr('height', (d: CategoricalBar) => Math.abs(yScale(0) - yScale(d.value))) // this substraction is reversed so the result is non-negative
            // chartContainer.selectAll("allText")
            //     .data<weight_height>(tgroup)
            //     .enter()
            //     .append("text")
            //     .attr("transform", (d: weight_height, i: number) => "translate(" + (xScale(d.weight) + 10) + ","+ (yScale(d.height)) +")")
            //     .text((d:weight_height) => d.type)
            //     .attr("text-anchor", "begin")

            // For transform, check out https://www.tutorialspoint.com/d3js/d3js_svg_transformation.htm, but essentially we are adjusting the positions of the selected elements.
            
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#scatter-svg').selectAll('*').remove() // Clean all the elements in the chart
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
        <svg id="scatter-svg" width="100%" height="100%">
            <!-- all the visual elements we create in initChart() will be inserted here in DOM-->
        </svg>
    </div>
</template>

<style scoped>
.chart-container{
    height: 100%;
}
</style>

