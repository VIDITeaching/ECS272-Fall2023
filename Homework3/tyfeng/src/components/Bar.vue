<script lang="ts">
import * as d3 from "d3";
import { isEmpty, debounce } from 'lodash';
import axios from 'axios';
import { Bar, ComponentSize, Margin } from '../types';
import { state } from '../state';
import { onMounted, onBeforeUnmount } from 'vue';
import { useEventEmitter } from '../useEventEmitter';

const emitter = useEventEmitter();

interface Job {
    salary_in_usd: number;
    company_size: string;
    remote_ratio: number;
}

interface SalaryByLocationBar {
    company_location: string;
    salary_in_usd: number;
}

export default {
    data() {
        return {
            bars: [] as Job[],
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
        this.updateChart();
    },
    methods: {
        async updateChart() {
            const rawData = await d3.csv("../../data/ds_salaries.csv");
            console.log(rawData[0]);
            let parsedData = rawData.map(d => ({
                salary_in_usd: Number(d.salary_in_usd ?? 0),
                company_size: d.company_size || 'na',
                remote_ratio: Number(d.remote_ratio ?? 0),
            }));

            const salaryRange = state.selections.get('salary_in_usd');
            if (Array.isArray(salaryRange)) {
                // If `salaryRange` is an array, it is safe to iterate over it.
                const [max, min] = salaryRange;
                console.log(`Max: ${max}, Min: ${min}`);
                parsedData = parsedData.filter((d) => d.salary_in_usd >= min && d.salary_in_usd <= max);
                console.log("parsed filtered", parsedData);



            } else {
                // Handle the case where 'salaryRange' is not an array
                console.error('The salary range is not iterable or not defined.');
            }
            
            const groupedData = d3.group(parsedData, (d: any) => d.company_size);

            const aggregatedData = Array.from(groupedData, ([key, value]) => ({
                company_size: key,
                salary_in_usd: d3.mean(value, d => d.salary_in_usd),
            }));

            this.bars = aggregatedData.map((d: any) => {
                    return {
                        company_size: d.company_size,
                        salary_in_usd: d.salary_in_usd
                    }
                }) as Job[];
            d3.select('#bar-svg').selectAll('*').remove();
            this.initChart();
        },
        onResize() {  
            let target = this.$refs.barContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        initChart() {
            let chartContainer = d3.select('#bar-svg');

            let yExtents = d3.extent(this.bars.map((d: Job) => d.salary_in_usd)) as [number, number]
            let xCategories: string[] = [ ...new Set(this.bars.map((d: Job) => d.company_size))]

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
            
            const color = d3
                .scaleOrdinal(["#1E90FF", "#FF8C00", "#32CD32"])
                .domain(["L", "M", "S"]);

            const bars = chartContainer.append('g')
                .selectAll('rect')
                .data<Job>(this.bars)
                .join('rect')
                .attr('x', (d: Job) => xScale(d.company_size) as number)
                .attr('y', (d: Job) => yScale(d.salary_in_usd) as number)
                .attr('width', xScale.bandwidth())
                .attr('height', (d: Job) => Math.abs(yScale(0) - yScale(d.salary_in_usd))) 
                .attr('fill', (d: Job) => color(d.company_size) as string);

            const title = chartContainer.append('g')
            .append('text') 
            .attr('transform', `translate(${this.size.width / 2}, ${this.margin.top / 2})`)
            .attr('dy', '10px') 
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text('Average Salary by Company Size');
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
        window.addEventListener('resize', debounce(this.onResize, 100));
        // Listen for update event
        emitter.$on('update-chart', this.updateChart);
        this.onResize();
    },
    beforeDestroy() {
       window.removeEventListener('resize', this.onResize);
       emitter.$off('update-chart', this.updateChart);
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