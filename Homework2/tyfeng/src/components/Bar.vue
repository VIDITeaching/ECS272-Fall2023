<script lang="ts">
import * as d3 from "d3";
import { isEmpty, debounce } from 'lodash';
import axios from 'axios';
import { Bar, ComponentSize, Margin } from '../types';
// A "extends" B means A inherits the properties and methods from B.
interface CategoricalBar extends Bar{
    category: string;
}

interface SalaryByLocationBar {
    company_location: string;
    salary_in_usd: number;
}

export default {
    data() {
        return {
            bars: [] as SalaryByLocationBar[],
            size: { width: 0, height: 0 },
            margin: {left: 60, right: 20, top: 30, bottom: 70},
        }
    },
    computed: {
        rerender() {
            return (!isEmpty(this.bars)) && this.size
        }
    },
    async created() {
        const rawData = await d3.csv("../../data/ds_salaries.csv");
        console.log(rawData[0]);
        let parsedData = rawData.map(d => ({
            company_location: d.company_location,
            salary_in_usd: Number(d.salary_in_usd ?? 0)
        }));

        const groupedData = d3.group(parsedData, (d: any) => d.company_location);

        const aggregatedData = Array.from(groupedData, ([key, value]) => ({
            company_location: key,
            salary_in_usd: d3.mean(value, d => d.salary_in_usd),
        }));

        const sortedData = aggregatedData.sort((a,b) => Number(b.salary_in_usd) - Number(a.salary_in_usd)).slice(0,10);
        this.bars = sortedData.map((d: any) => {
                return {
                    company_location: d.company_location,
                    salary_in_usd: d.salary_in_usd
                }
            }) as SalaryByLocationBar[];
    },
    methods: {
        onResize() {  
            let target = this.$refs.barContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        initChart() {
            let chartContainer = d3.select('#bar-svg');

            let yExtents = d3.extent(this.bars.map((d: SalaryByLocationBar) => d.salary_in_usd)) as [number, number]
            let xCategories: string[] = [ ...new Set(this.bars.map((d: SalaryByLocationBar) => d.company_location))]

            let xScale = d3.scaleBand()
                .rangeRound([this.margin.left, this.size.width - this.margin.right])
                .domain(xCategories)
                .padding(0.1)

            let yScale = d3.scaleLinear()
                .range([this.size.height - this.margin.bottom, this.margin.top]) 
                .domain([0, yExtents[1]]) 

            const xAxis = chartContainer.append('g')
                .attr('transform', `translate(0, ${this.size.height - this.margin.bottom})`)
                .call(d3.axisBottom(xScale))

            const yAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(yScale))

            const yLabel = chartContainer.append('g')
                .attr('transform', `translate(${10}, ${this.size.height / 2}) rotate(-90)`)
                .append('text')
                .text('Salary in USD')
                .style('font-size', '.8rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width / 2 - this.margin.left}, ${this.size.height - this.margin.top - 5})`)
                .append('text')
                .text('Company Location')
                .style('font-size', '.8rem')
            
            const colorScale = d3.scaleOrdinal()
                .domain(this.bars.map(d => d.company_location))
                .range(d3.schemeCategory10);

            const bars = chartContainer.append('g')
                .selectAll('rect')
                .data<SalaryByLocationBar>(this.bars)
                .join('rect')
                .attr('x', (d: SalaryByLocationBar) => xScale(d.company_location) as number)
                .attr('y', (d: SalaryByLocationBar) => yScale(d.salary_in_usd) as number)
                .attr('width', xScale.bandwidth())
                .attr('height', (d: SalaryByLocationBar) => Math.abs(yScale(0) - yScale(d.salary_in_usd))) 
                .attr('fill', (d: SalaryByLocationBar) => colorScale(d.company_location) as string);

            const title = chartContainer.append('g')
            .append('text') 
            .attr('transform', `translate(${this.size.width / 2}, ${this.margin.top / 2})`)
            .attr('dy', '10px') 
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text('Top 10 countries with the highest average data science salaries');
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#bar-svg').selectAll('*').remove() 
                this.initChart()
            }
        }
    },
    mounted() {
        window.addEventListener('resize', debounce(this.onResize, 100))
        this.onResize()
    },
    beforeDestroy() {
       window.removeEventListener('resize', this.onResize)
    }
}
</script>

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