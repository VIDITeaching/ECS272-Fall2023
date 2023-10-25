<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/mxmh_survey_results.json';
import { isEmpty, debounce } from 'lodash';

import { Point, ComponentSize, Margin } from '../types';

// Computed property: https://vuejs.org/guide/essentials/computed.html
// Lifecycle in vue.js: https://vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram

export default {
    data() {
        // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
        return {
            points: [] as Point[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 40, right: 20, top: 20, bottom: 60} as Margin,
        }
    },
    computed: {
        // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
        rerender() {
            return (!isEmpty(this.points)) && this.size
        }
    },
    // Anything in here will only be executed once.
    // Refer to the lifecycle in Vue.js for more details, mentioned at the very top of this file.
    created() {
        if (isEmpty(Data)) return;
        this.points = Data.map((d) => {
            return {
                posX: d["BPM"],
                posY: d["OCD"]
            };
        });
    },
    methods: {
        onResize() {  // record the updated size of the target element
            let target = this.$refs.scatterContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        initChart() {
            // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
            let svg = d3.select('#scatter-svg');

            svg.append('text')
                .style('text-anchor', 'middle')
                .text('BPM of Favorite Genre vs. Self-Rated OCD')
                .attr('x', this.size.width / 2)
                .attr('y', this.margin.top * 1.5)
                .style("font-size", "20px");

            let x = d3.scaleLinear()
                .domain(d3.extent(this.points, (d) => d.posX))
                .range([this.margin.left, this.size.width - this.margin.right * 3]);

            let y = d3.scaleLinear()
                .domain(d3.extent(this.points, (d) => d.posY))
                .range([this.size.height - this.margin.bottom, this.margin.top * 3]);

            // This following part visualizes the axes along with axis labels.
            // Check out https://observablehq.com/@d3/margin-convention?collection=@d3/d3-axis for more details
            svg.append('g')
                .attr('transform', `translate(0, ${this.size.height - this.margin.bottom})`)
                .call(d3.axisBottom(x))

            svg.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(y))

            svg.append('g')
                .attr('transform', `translate(${this.margin.left / 2}, ${this.size.height / 2}) rotate(-90)`)
                .append('text')
                .text('OCD')
                .style('font-size', '15px')

            svg.append('g')
                .attr('transform', `translate(${this.size.width / 2 - this.margin.left}, ${this.size.height - this.margin.top - 5})`)
                .append('text')
                .text('BPM')
                .style('font-size', '15px')
            
            svg.append('g')
                .selectAll("dot")
                .data(this.points)
                .enter()
                .append("circle")
                .attr("cx", (d) => x(d.posX) )
                .attr("cy", (d) => y(d.posY) )
                .attr("r", 6)
                .style("fill", (d) => (d.posY == 10) ? "rgb(197, 54, 54)" : "#0071B7")
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
    <div class="chart-container d-flex" ref="scatterContainer">
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

