<script lang="ts">
import * as d3 from "d3";
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Bar, ComponentSize, Margin } from '../types';
interface CategoricalBar extends Bar{
    category: string;
}

export default {
    data() {
        return {
            bars: [] as CategoricalBar[],
            size: { width: 2000, height: 200  } as ComponentSize,
            margin: { left: 120, right: 60, top: 40, bottom: 60 } as Margin,
        }
    },
    computed: {
        rerender() {
            return (!isEmpty(this.bars)) && this.size
        }
    },
    created() {
        d3.csv('../../data/ds_salaries.csv').then(data => {
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
        }
        });

    },
    methods: {
        onResize() {
            let target = this.$refs.barContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth , height: target.clientHeight };
        },
        initChart() {
            let chartContainer = d3.select('#bar-svg')
                                    .attr('width', 2000)
                                    .attr('height', 600);

            let xExtents = d3.extent(this.bars.map((d: CategoricalBar) => d.value as number)) as [number, number]
            
            // Get the top 10 categories from the sorted data
            const topCategories = this.bars.map(item => item.category);

            let yCategories: string[] = topCategories;

            let yScale = d3.scaleBand()
                .rangeRound([40, this.size.height - this.margin.bottom])
                .domain(this.bars.map((d) => d.category))
                .padding(0.2) // spacing between the categories
                const xMaxValue= 500000;

                let xScale = d3.scaleLinear()
                .range([0, this.size.width - this.margin.left - this.margin.right]) //bottom side to the top side on the screen
                .domain([0, xMaxValue]) 
                
            // Check out https://observablehq.com/@d3/margin-convention?collection=@d3/d3-axis for more details

            const yAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(yScale))

            yAxis.selectAll("text")
            .style("font-size", "6.8px");  

            const xAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, ${this.size.height - this.margin.bottom + 1})`)
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
            
            const bars = chartContainer.append('g')
                .selectAll('rect')
                .data<CategoricalBar>(this.bars) 
                .join('rect')
                .attr('x',120)
                .attr('y', (d: CategoricalBar) => yScale(d.category) as number)
                .attr('width', (d: CategoricalBar) => xScale(d.value))
                .attr('height',  yScale.bandwidth())
                .attr('fill', (d: CategoricalBar, i: number) => customColors[i % customColors.length])

            // For transform, check out https://www.tutorialspoint.com/d3js/d3js_svg_transformation.htm, but essentially we are adjusting the positions of the selected elements.
            const title = chartContainer.append('g')
                .append('text') 
                .attr('transform', `translate(${this.size.width / 2}, ${this.margin.top / 2})`)
                .attr('dy', '0.5rem') 
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Top 10 job titles with highest mean Salary') 
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
        </svg>
    </div>
</template>

<style scoped>
.chart-container{
    height: 100%;
}
</style>