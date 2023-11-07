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
    Type_1: string,
    height: number,
    weight: number, 
    len: number, 
    Total: number
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
            margin: {left: 40, right: 60, top: 60, bottom: 80} as Margin,
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
            let chartContainer = d3.select('#bar-svg').append("g")

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
            let main_type = [] as string[]
            let tgroup = [] as weight_height[]
            for (let key of Object.keys(type_group)) {
                //@ts-ignore
                let len = type_group[key].length
                let sum_height = 0
                let sum_weight = 0
                let sum_total = 0
                //@ts-ignore
                type_group[key].forEach(d => {
                    sum_height += parseFloat(d['Height_m'])
                    sum_weight += parseFloat(d['Weight_kg']) 
                    sum_total += Number(d["Total"])
                })
                
                let temp = {
                    Type_1: key,
                    Height_m: sum_height / len,
                    Weight_kg: sum_weight / len, 
                    Total: sum_total / len,
                    len: len
                }
                if (len > 50) {
                    main_type.push(key)
                }
                tgroup.push(temp)

            }
            console.log(type_group[main_type[0]])
            for (let key of main_type) {
                console.log(type_group[key])
            }
            let dimensions = ["Height_m", "Weight_kg", "Total"]
            
            let mainPokemon = []
            for (let i in dataPokemon) {
                let pokemon = dataPokemon[i]
                if (main_type.includes(pokemon.Type_1 as string)) {
                    mainPokemon.push(pokemon)
                }
            }
            let yExtents = []
            for (let i in dimensions) {
                let name = dimensions[i]
                let temp = d3.extent(mainPokemon.map((d) => parseFloat(d[name] as string) as number)) as [number, number]
                yExtents.push(temp)
            }
            console.log(yExtents)
            // let yExtents = d3.extent(type_group.map((d) => d.len as number)) as [number, number]
            // let xExtents = d3.extent(tgroup.map((d: weight_height) => d.weight as number)) as [number, number]
            // console.log(xExtents, yExtents)
            

            let y = {}
            for (let i in dimensions) {
                let name = dimensions[i]
                y[name] = d3.scaleLinear()
                .domain( yExtents[i] ) // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
                .range([this.size.height - this.margin.bottom, this.margin.top])
            }

            let x = d3.scalePoint()
            .range([this.margin.left, this.size.width - 2 * this.margin.right])
            .domain(dimensions);
            
            function color(type: string) {
                let colorI = main_type.indexOf(type)
                return d3.schemeCategory10[colorI]
            }
            
            chartContainer.selectAll("myAxis")
            // For each dimension of the dataset I add a 'g' element:
            .data(dimensions).enter()
            .append("g")
            .attr("class", "axis")
            // I translate this element to its right position on the x axis
            .attr("transform", function(d) { return `translate(${x(d)})`})
            // And I build the axis with the call function
            .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
            // Add axis title
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", 50)
            .text(function(d) { return d; })
            .style("fill", "black")
            
            // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
            
            function path(d) {
                return d3.line()(dimensions.map((p) => [x(p), y[p](d[p])] ));
            }
            chartContainer.selectAll("myPath")
            .data(mainPokemon)
                .join("path")
                .attr("class", (d) => d["Type_1"]) // group name as the class
                .attr("d",  path)
                .style("fill", "none" )
                .style("stroke", d => color(d["Type_1"]))
                .style("opacity", 0.5)


            chartContainer.selectAll("myLegend")
                .data(main_type)
                .join('g')
                    .append("text")
                    .attr('x', (d,i) => 30 + i*60)
                    .attr('y', 30)
                    .text(d => d)
                    .style("fill", d => color(d))
                    .style("font-size", 15)
                    .style("opacity", 0.8)
                    .on("click", function(event,d){
                    // is the element currently visible ?
                    let currentOpacity = d3.selectAll("." + d).style("opacity")
                    // Change the opacity: from 0 to 1 or from 1 to 0
                    d3.selectAll("." + d).transition().style("opacity", currentOpacity > 0 ? 0:0.5)

                    })
            
            d3.select("#but").on("click", (event) => {
                console.log("event")
                d3.selectAll(".Normal").transition().style("opacity", 0)
                d3.selectAll(".Water").transition().style("opacity", 0)
                d3.selectAll(".Grass").transition().style("opacity", 0)
                d3.selectAll(".Bug").transition().style("opacity", 0)
            })        
            // For transform, check out https://www.tutorialspoint.com/d3js/d3js_svg_transformation.htm, but essentially we are adjusting the positions of the selected elements.
            const title = chartContainer.append('g')
                .append('text') // adding the text
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top})`)
                .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Properties of Major Pokemon Groups') // text content
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

