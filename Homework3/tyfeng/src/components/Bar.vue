<script lang="ts">
import * as d3 from "d3";
import { isEmpty, debounce } from 'lodash';
import { state } from '../state';
import { useEventEmitter } from '../useEventEmitter';

const emitter = useEventEmitter();

interface JobBar {
    salary_in_usd: number;
    company_size: string;
    remote_ratio: number;
    count: number;
}


export default {
    data() {
        return {
            bars: [] as JobBar[],
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
                parsedData = parsedData.filter((d) => d.salary_in_usd >= min && d.salary_in_usd <= max);

            } else {
                // Handle the case where 'salaryRange' is not an array
                console.log('The salary range is not defined.');
            }

            const groupedData = d3.group(parsedData, (d: any) => d.company_size);

            const aggregatedData = Array.from(groupedData, ([key, value]) => ({
                company_size: key,
                // count of data points in each company size
                count: value.length,
                // salary_in_usd: d3.mean(value, d => d.salary_in_usd),
            }));

            this.bars = aggregatedData.map((d: any) => {
                    return {
                        company_size: d.company_size,
                        count: d.count
                    }
                }) as JobBar[];
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

            let sortedBars = [...this.bars].sort((a, b) => b.count - a.count);

            // Extract the company_size values from the sorted bars for the xScale's domain
            let sortedCategories = sortedBars.map(d => d.company_size);

            let xScale = d3.scaleBand()
                .rangeRound([this.margin.left, this.size.width - this.margin.right])
                .domain(sortedCategories) // Use the sorted categories
                .padding(0.1);

            let yExtents = d3.extent(this.bars.map((d: JobBar) => d.count)) as [number, number]

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
                .text('Number of jobs')
                .style('font-size', '.8rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width / 2 - this.margin.left}, ${this.size.height - this.margin.top - 5})`)
                .append('text')
                .text('Company Size')
                .style('font-size', '.8rem')
            
            const color = d3
                .scaleOrdinal(["#1E90FF", "#FF8C00", "#32CD32"])
                .domain(["L", "M", "S"]);

            const tooltip = d3.select("#tooltip");

            // map d.company_size to Large, Medium, Small
            const sizeMapping: { [key: string]: string } = {
                'S': 'Small',
                'M': 'Medium',
                'L': 'Large'
            };

            const bars = chartContainer.append('g')
                .selectAll('rect')
                .data<JobBar>(this.bars)
                .join('rect')
                .attr('x', (d: JobBar) => xScale(d.company_size) as number)
                .attr('y', (d: JobBar) => yScale(d.count) as number)
                .attr('width', xScale.bandwidth())
                .attr('height', (d: JobBar) => Math.abs(yScale(0) - yScale(d.count))) 
                .attr('fill', (d: JobBar) => color(d.company_size) as string)
                .on("mouseover", (event, d) => {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`Company Size: ${sizeMapping[d.company_size]} <br> Data Count: ${d.count}`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            const title = chartContainer.append('g')
            .append('text') 
            .attr('transform', `translate(${this.size.width / 2}, ${this.margin.top / 2})`)
            .attr('dy', '10px') 
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text('Number of Data Science Jobs by Company Size');
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
    <div id="tooltip" class="tooltip" style="opacity:0;">
        <p>Count: <span id="tooltip-value"></span></p>
    </div>
</template>

<style scoped>
.chart-container{
    height: 100%;
}
.tooltip {
    position: absolute;
    text-align: center;
    width: 100px;
    height: 50px;
    padding: 2px;
    font: 12px sans-serif;
    background: lightsteelblue;
    border: 0px;
    border-radius: 8px;
    pointer-events: none;
}

/* Hide the tooltip when not in use */
.tooltip {
    opacity: 0;
}
</style>