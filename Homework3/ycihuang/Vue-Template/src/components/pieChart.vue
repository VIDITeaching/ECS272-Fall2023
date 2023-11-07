<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/demo.json'; /* Example of reading in data directly from file */
import axios from 'axios';

import { isEmpty, debounce } from 'lodash';

import { Bar, ComponentSize, Margin, Prop} from '../types';
const dataPokemon = await d3.csv('../../data/pokemon_alopez247.csv')

// A "extends" B means A inherits the properties and methods from B.
interface CategoricalBar extends Bar{
    category: string;
}

// Computed property: https://vuejs.org/guide/essentials/computed.html
// Lifecycle in vue.js: https://vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram
export default {
    data() {
        // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
        return {
            bars: [] as CategoricalBar[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left:0, right: 0, top:10, bottom: 0} as Margin,
        }
    },
    computed: {
        // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
        rerender() {
            return (!isEmpty(dataPokemon)) && this.size
        }
    },
    // Anything in here will only be executed once.
    // Refer to the lifecycle in Vue.js for more details, mentioned at the very top of this file.
    
    created() {
        // fetch the data via GET request when we init this component. 
        // In axios anything we send back in the response are always bound to the "data" property.
        // axios.get('')
        //     .then(resp => { 
        //         console.log(resp.data)
        //         this.name = resp.data; // resp.data contains the content, with the format specified by the API you use.
        //         return true;
        //     })
        //     .catch(error => console.log(error));
        
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
            // let group = {}               
            let color_sum = dataPokemon.reduce((acc, current) => {
                let key = current.Color as String
                //@ts-ignore
                if (acc[key] == null)       
                    //@ts-ignore      
                    acc[key] = 1
                else             
                    //@ts-ignore
                    acc[key] += 1
                return acc
            }, {})
            let color = [] as Prop[];
            Object.keys(color_sum).forEach(d => {
                const prop = {
                    prop: d, 
                    value: Number(color_sum[d])
                }
                color.push(prop)
            })
            let chartContainer = d3.select('#pie-svg')
            let radius = 0.3 * Number(d3.min([this.size.width, this.size.height]))
            //@ts-ignore
            let pie = d3.pie().padAngle(0.03).value((d) => {return d.value})
            //@ts-ignore
            let arcs = pie(color)

            let arc = d3.arc()
            .innerRadius(radius * 0.4)
            .outerRadius(radius * 0.75)
            
            let outerArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9)

            let outer = d3.arc()
            .innerRadius(radius * 0.93)
            .outerRadius(radius * 0.93)
            
            function colorMap(color: string) {
                return color.toLowerCase()
            }
            
            let group = chartContainer.append("g")
            .attr(`transform`, `translate(${this.size.width / 2}, ${this.size.height/2})`)
            
            const arcPlot = group.selectAll('allSlices')
            .data(arcs)
            .enter()
            .append("path")
            .attr('d', arc)
            .attr('fill', d => colorMap(d.data.prop))
            .style("opacity", 0.7)
            .attr("stroke", "black")

            const line = group.selectAll("allLines")
            .data(arcs)
            .enter()
            .append("polyline")
            .attr("stroke", "black")
            .attr('fill', 'none')
            // .attr('stroke-width', 0.1)
            .attr('points', (d) => {
                let c = outer.centroid(d)
                return[arc.centroid(d), outerArc.centroid(d)]
            })


            const label = group.selectAll("allLabels")
            .data(arcs)
            .enter()
            .append("text")
            .attr(`transform`, (d) => {
                let c = outer.centroid(d)
                return(`translate(${c})`)
            })
            .attr("text-anchor", (d) => {
                let mid = (d.startAngle + d.endAngle) / 2
                return mid < Math.PI?'start':'end'
            })
            //@ts-ignore
            .text(d => d.data.prop + ' ' + d.data.value)

            
            // For transform, check out https://www.tutorialspoint.com/d3js/d3js_svg_transformation.htm, but essentially we are adjusting the positions of the selected elements.
            const title = chartContainer.append('g')
                .append('text') // adding the text
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top})`)
                .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Color Distribution of Pokemon dataset') // text content
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#pie-svg').selectAll('*').remove() // Clean all the elements in the chart
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
        <svg id="pie-svg" width="100%" height="100%">
            <!-- all the visual elements we create in initChart() will be inserted here in DOM-->
        </svg>
    </div>
</template>

<style scoped>
.chart-container{
    height: 100%;
}
</style>