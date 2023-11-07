<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/demo.json'; /* Example of reading in data directly from file */
import axios, { formToJSON } from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Bar, ComponentSize, Margin } from '../types';
const dataPokemon = await d3.csv('../../data/pokemon_alopez247.csv')
// A "extends" B means A inherits the properties and methods from B.
interface CategoricalBar extends Bar{
    category: string;
}
interface ability {
    name: string,
    Type_1: string,
    len: number,
    total: number,
    HP: number, 
    Attack: number, 
    Defense: number, 
    Sp_Atk: number, 
    Sp_Def:number, 
    Speed: number,
}

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
        // console.log(Data);
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

            let typekey = Object.keys(type_group)
            console.log(typekey)
            let topData = [] as ability[]
            for (let i = 0; i < typekey.length; i++) {
                //@ts-ignore
                let key = typekey[i]
                let len = type_group[key].length
                
                if (len > 50) {
                    let temp = { 
                        //@ts-ignore
                        name: type_group[key][0].Name,
                        Type_1: type_group[key][0].Type_1,
                        len: len,
                        total: type_group[key][0].Total, 
                        HP: type_group[key][0].HP, 
                        Attack: type_group[key][0].Attack, 
                        Defense: type_group[key][0].Defense, 
                        Sp_Atk:type_group[key][0].Sp_Atk, 
                        Sp_Def:type_group[key][0].Sp_Def, 
                        Speed: type_group[key][0].Speed,
                    } as ability;
                    topData.push(temp)
                }
                
            }
            console.log(topData.length)
            let num_elements = Object.keys(topData[0]).length - 4
            let chartContainer = d3.select('#star-svg')
            
            let radius = Number(d3.min([this.size.width, this.size.height])) / 3
            let origin = [this.size.width / 2, this.size.height / 2]
            
            let group = chartContainer.append('g').attr(`transform`, `translate(${this.margin.left}, ${this.margin.top})`)
       
         
            let radian = 2 * Math.PI / num_elements

            let keys = ['HP', 'Attack', 'Defense', 'Sp_Atk', 'Sp_Def', 'Speed']
            
            let theta = - Math.PI
            let thetaList = [] as number[]
            for (let i = 0; i < num_elements; i++) {
                thetaList.push(theta)
                theta += radian
            }
            console.log(thetaList)

            const line = group.selectAll("allLines")
            .data(keys)
            .enter()
            .append("polyline")
            .attr("stroke", "grey")
            .attr('fill', 'none')
            .attr('stroke-width', 0.5)
            .attr('points', (d: string, i: number) => {
                let p = [origin[0] + radius * Math.cos(thetaList[i]), origin[1] + radius * Math.sin(thetaList[i])]
                return[origin, p]
            })

            let r = [0, radius / 4, 2 * radius / 4, 3 * radius / 4, radius]
            
            const backPoly = group.selectAll("allBack")
            .data(r)
            .enter()
            .append('polygon')
            .attr("stroke", "grey")
            .attr('fill', 'none')
            .attr('stroke-width', 0.5)
            .attr('points', (d: number) => {
                let point_list = [] 
                for (let j = 0; j < num_elements; j++) {
                    let r = d
                    let x = origin[0] + r * Math.cos(thetaList[j])
                    let y = origin[1] + r * Math.sin(thetaList[j])
                    point_list.push([x, y])
                }
                return point_list
            })

            let rScale = d3.scaleLinear()
                .rangeRound([0, radius])
                .domain([40, 160])
            
            // polygon plot
            const polyPlot = group.selectAll("allPoly")
            .data<ability>(topData)
            .enter()
            .append("polygon")
            .attr("stroke", "black")
            .attr('stroke-width', 0.5)
            .attr('points', (d: ability) => {
                let point_list = [] 
                for (let j = 0; j < num_elements; j++) {
                    let key = keys[j]
                    let r = rScale(d[key])
                    let x = origin[0] + r * Math.cos(thetaList[j])
                    let y = origin[1] + r * Math.sin(thetaList[j])
                    point_list.push([x, y])
                }
                return point_list
            })
            .attr('fill', (d, i) => d3.schemeCategory10[i])
            .attr('opacity', '0.2')

            const grid = group.selectAll("allGrids") 
            .data(r)
            .enter()
            .append("text")
            .attr(`transform`, (d) => {
                let x = origin[0] + d * Math.cos(thetaList[2])
                let y = origin[1] + d * Math.sin(thetaList[2]) + this.size.height / 80
                return `translate(${x}, ${y})`
            })
            .text((d, i) => 40 + 120 * i / 4)
            .attr("text-anchor", "end")

            const category = group.selectAll("cat")
            .data(keys)
            .enter()
            .append("text")
            .attr(`transform`, (d, i) => {
                let x = origin[0] + radius *  Math.cos(thetaList[i])
                let y = origin[1] + radius * Math.sin(thetaList[i])
                return `translate(${x}, ${y})`
            })
            .text((d, i) => d)
            .attr("text-anchor", (d, i) => {
                if ((i > 1) && (i < 5)) {
                    return "begin"
                } else {
                    return "end"
                }
            })

            // pokemon categories label mark
            group.selectAll("allLabels")
            .data(topData)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => (this.margin.left * 1.2 + (i%4) * this.size.width/5 ))
            .attr("cy", (d, i) => (this.margin.top * 0.8 + this.size.height / 50 * (Math.floor(i/4))+1))
            .attr("r", this.size.width / 100)
            .attr('fill', (d, i) => d3.schemeCategory10[i])
            .attr('opacity', '0.2')

            // pokemon name text
            group.selectAll("allText")
            .data(topData)
            .enter()
            .append("text")
            .attr("transform", (d, i) => "translate(" + (this.margin.left * 1.5 + (i%4) * this.size.width/5) + ","+ (this.margin.top + this.size.height / 50 * (Math.floor(i/4))+1) +")")
            .text(d => d.Type_1+': '+ d.name)
            // .style("text-anchor", "begin")
            // .style("font", "5px times")
            // Here we compute the [min, max] from the data values of the attributes that will be used to represent x- and y-axis.
            let yExtents = d3.extent(this.bars.map((d: CategoricalBar) => d.value as number)) as [number, number]
            // This is to get the unique categories from the data using Set, then store in an array.
            let xCategories: string[] = [ ...new Set(this.bars.map((d: CategoricalBar) => d.category as string))]

            // We need a way to map our data to where it should be rendered within the svg (in screen pixels), based on the data value, 
            //      so the extents and the unique values above help us define the limits.
            // Scales are just like mapping functions y = f(x), where x refers to domain, y refers to range. 
            //      In our case, x should be the data, y should be the screen pixels.
            // We have the margin here just to leave some space
            // In viewport (our screen), the leftmost side always refer to 0 in the horizontal coordinates in pixels (x). 


            // There are other scales such as scaleOrdinal,
                // whichever is appropriate depends on the data types and the kind of visualizations you're creating.

            // This following part visualizes the axes along with axis labels.
            // Check out https://observablehq.com/@d3/margin-convention?collection=@d3/d3-axis for more details

            // For transform, check out https://www.tutorialspoint.com/d3js/d3js_svg_transformation.htm, but essentially we are adjusting the positions of the selected elements.
            const title = chartContainer.append('g')
                .append('text') // adding the text
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top + 5})`)
                .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Top Pokemon of Major Type_1 Groups (Type: Pokemon Name)') // text content
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#star-svg').selectAll('*').remove() // Clean all the elements in the chart
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
        <svg id="star-svg" width="100%" height="100%">
            <!-- all the visual elements we create in initChart() will be inserted here in DOM-->
        </svg>
    </div>
</template>

<style scoped>
.chart-container{
    height: 100%;
}
</style>

