<script lang="ts">
import * as d3 from "d3";
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Bar, ComponentSize, Margin } from '../types';
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
            size: { width: 2000, height: 200  } as ComponentSize,
            margin: { left: 120, right: 60, top: 40, bottom: 60 } as Margin,
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
        d3.csv('../../data/ds_salaries.csv').then(data => {
            //console.log(data);
            if (!isEmpty(data)) {
                //Grouping the CSV data by 'job title'
                const groupedData = d3.group(data, d => d.job_title);
                 // Calculate the mean salary for each group and sort them in descending order
                const sortedData = Array.from(groupedData, ([category, values]) => ({
                category: category || '',
                value: d3.mean(values, d => typeof d.salary_in_usd !== 'undefined' ? +d.salary_in_usd : 0),
                })).sort((a, b) => {
            // Check if 'value' is defined for both 'a' and 'b'
            if (typeof a.value !== 'undefined' && typeof b.value !== 'undefined') {
                return b.value - a.value; // Sort in descending order
            }
            return 0; // Return 0 if 'value' is undefined for either 'a' or 'b'
        });
        
        // Plotting the top 10 job titles
        this.bars = sortedData.slice(0, 10);
        //console.log(this.bars, "actual Chart Data")
        }
        });

    },
    methods: {
        onResize() {  // record the updated size of the target element
            let target = this.$refs.barContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth , height: target.clientHeight };
        },
        initChart() {
            // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
            let chartContainer = d3.select('#bar-svg')
                                    .attr('width', 2000)
                                    .attr('height', 600);

            // Here we compute the [min, max] from the data values of the attributes that will be used to represent x- and y-axis.
            let xExtents = d3.extent(this.bars.map((d: CategoricalBar) => d.value as number)) as [number, number]
            
            // Get the top 10 categories from the sorted data
            const topCategories = this.bars.map(item => item.category);
            //console.log(topCategories, "chartData")

            // Update the yCategories array to include only the top 10 categories
            let yCategories: string[] = topCategories;

            // We need a way to map our data to where it should be rendered within the svg (in screen pixels), based on the data value, 
            //      so the extents and the unique values above help us define the limits.
            // Scales are just like mapping functions y = f(x), where x refers to domain, y refers to range. 
            //      In our case, x should be the data, y should be the screen pixels.
            // We have the margin here just to leave some space
            // In viewport (our screen), the leftmost side always refer to 0 in the horizontal coordinates in pixels (x). 
            let yScale = d3.scaleBand()
                .rangeRound([40, this.size.height - this.margin.bottom])
                .domain(this.bars.map((d) => d.category))
                .padding(0.2) // spacing between the categories
                const xMaxValue= 500000;

                let xScale = d3.scaleLinear()
                .range([0, this.size.width - this.margin.left - this.margin.right]) //bottom side to the top side on the screen
                .domain([0, xMaxValue]) 
                // e.g., it is natural to define [0, 100] for the exame score, or [0, <maxVal>] for counts.

            // There are other scales such as scaleOrdinal,
                // whichever is appropriate depends on the data types and the kind of visualizations you're creating.

            // This following part visualizes the axes along with axis labels.
            // Check out https://observablehq.com/@d3/margin-convention?collection=@d3/d3-axis for more details

            const yAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(yScale))

            yAxis.selectAll("text")
            .style("font-size", "6.8px");  // Adjust the value as needed

            const xAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, ${this.size.height - this.margin.bottom + 1})`) // Increase the X-coordinate value
                .call(
                    d3.axisBottom(xScale)
                .tickValues(d3.range(0, xMaxValue + 1, 100000)) // Set tick values at 0, 100000, 200000, etc.
                .tickFormat(d3.format('~s'))// Format tick labels as 100K, 200K, etc. using D3's format)
                );

            const yLabel = chartContainer.append('g')
                .attr('transform', `translate(${10}, ${this.size.height / 2}) rotate(-90)`)
                .append('text')
                .text('Job Title')
                .style('font-size', '.8rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${(this.size.width - this.margin.left - this.margin.right) / 2 + this.margin.left}, ${this.size.height - this.margin.top + 20})`) // Adjust the Y-coordinate value
                .append('text')
                .text('Mean Salary')
                .style('font-size', '.7rem')
            
                const colorScale = d3.scaleOrdinal()

                const customColors = ['#000c13', '#3a3068', '#4e37ba', '#1b587c', '#52a5d6', '#7cadcb', '#089d6d', '#75eec7', '#afeea6', '#e6f598'];
            
            // "g" is grouping element that does nothing but helps avoid DOM looking like a mess
            // We iterate through each <CategoricalBar> element in the array, create a rectangle for each and indicate the coordinates, the rectangle, and the color.
            const bars = chartContainer.append('g')
                .selectAll('rect')
                .data<CategoricalBar>(this.bars) // TypeScript expression. This always expects an array of objects.
                .join('rect')
                .attr('x',120)
                .attr('y', (d: CategoricalBar) => yScale(d.category) as number)
                .attr('width', (d: CategoricalBar) => xScale(d.value))
                .attr('height',  yScale.bandwidth())
                .attr('fill', (d: CategoricalBar, i: number) => customColors[i % customColors.length])

            // For transform, check out https://www.tutorialspoint.com/d3js/d3js_svg_transformation.htm, but essentially we are adjusting the positions of the selected elements.
            const title = chartContainer.append('g')
                .append('text') // adding the text
                .attr('transform', `translate(${this.size.width / 2}, ${this.margin.top / 2})`)
                .attr('dy', '0.5rem') // relative distance from the indicated coordinates
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Top 10 job titles with highest mean Salary') // text content
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
    <!-- <h2>Data Science Job Salaries</h2> -->
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