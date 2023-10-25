<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/mxmh_survey_results.json';
import { isEmpty, debounce } from 'lodash';

import { ComponentSize, Margin } from '../types';

// Computed property: https://vuejs.org/guide/essentials/computed.html
// Lifecycle in vue.js: https://vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram

export default {
    data() {
        return {
            data: [],
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 40, right: 20, top: 20, bottom: 60} as Margin,
        }
    },
    computed: {
        // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
        rerender() {
            return (!isEmpty(this.data)) && this.size
        }
    },
    // Anything in here will only be executed once.
    // Refer to the lifecycle in Vue.js for more details, mentioned at the very top of this file.
    created() {
        if (isEmpty(Data)) return;
        Data.forEach((item) => {
            const ocd = Math.floor(item['OCD']);
            const effect = item['Music effects'];

            // Find the object in the result array with the matching 'ocd' value
            const existingItem = this.data.find((obj) => obj.ocd === ocd);

            if (existingItem) {
                // If the object already exists, increment the count for the corresponding effect
                existingItem[effect] = (existingItem[effect] || 0) + 1;
            } else {
                // If the object doesn't exist, create a new object and initialize the counts
                const newItem = { ocd, [effect]: 1 };
                this.data.push(newItem);
            }
        });

    },
    methods: {
        onResize() {  // record the updated size of the target element
            let target = this.$refs.barContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        initChart() {
            let svg = d3.select('#bar-svg');

            let yExtents = [0, 220];
            const subgroups = ["Improve", "No effect", "Worsen"];
            const dataArray = Object.keys(this.data).map((key) => this.data[key])
                .sort((a, b) => +a.ocd - +b.ocd);
            
            let x = d3.scaleBand()
                .domain(dataArray.map((d) => d.ocd))
                .range([this.margin.left, this.size.width - this.margin.right])
                .padding(0.1)

            let y = d3.scaleLinear()
                .range([this.size.height - this.margin.bottom, this.margin.top * 3])
                .domain(yExtents);

            const xAxis = svg.append('g')
                .attr('transform', `translate(0, ${this.size.height - this.margin.bottom})`)
                .call(d3.axisBottom(x))

            const yAxis = svg.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(y).ticks(10).tickSize(-(this.size.width - this.margin.right) + this.margin.left))
                .selectAll('.tick line')
                .style("stroke", "lightgray")

            const yLabel = svg.append('g')
                .attr('transform', `translate(${this.margin.right / 2}, ${this.size.height / 2 + this.margin.top}) rotate(-90)`)
                .append('text')
                .text('Number of Participants')
                .style('font-size', '15px')

            const xLabel = svg.append('g')
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top - 5})`)
                .append('text')
                .text('OCD')
                .style('font-size', '15px')

            let color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(['teal','lightgray','darkred'])

            const stackedData = d3.stack()
                .keys(subgroups)
                (this.data);
            
            svg.append("g")
                .selectAll("g")
                // Enter in the stack data = loop key per key = group per group
                .data(stackedData)
                .enter().append("g")
                .attr("fill", (d) => color(d.key))
                .selectAll("rect")
                // enter a second time = loop subgroup per subgroup to add all rectangles
                .data(function(d) { return d; })
                .enter().append("rect")
                    .attr("x", (d) => x(d.data.ocd))
                    .attr("y", (d) => y(d[1]))
                    .attr("height", (d) => y(d[0]) - y(d[1]))
                    .attr("width",x.bandwidth())

            svg.append('text')
                .style('text-anchor', 'middle')
                .text('Effect of Music on Mental Health by OCD Rating')
                .attr('x', this.size.width / 2)
                .attr('y', this.margin.top * 1.5)
                .style("font-size", "20px");

            const legendWidth = 600; // Adjust as needed
            const legendHeight = 20;

            const legend = svg.append("g")
                .attr("class", "legend")
                .attr('width', legendWidth)
                .attr('height', legendHeight)
                .append('g')
                .attr('transform', `translate(${this.margin.left * 6}, ${this.margin.top * 6})`);

            const legendRectSize = 18;
            const legendSpacing = 4;

            const legendItem = legend.selectAll('.legend-item')
                .data(subgroups)
                .enter()
                .append('g')
                .attr('class', 'legend-item')
                .attr('transform', (d, i) => `translate(0, ${i * (legendRectSize + legendSpacing)})`);

            legendItem.append('rect')
                .attr('width', legendRectSize)
                .attr('height', legendRectSize)
                .style('fill', (d) => color(d)) // Use your color scale

            legendItem.append('text')
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', (d, i) => (legendRectSize - legendSpacing))
                .text((d) => d);
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

