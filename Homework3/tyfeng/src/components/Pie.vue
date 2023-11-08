<template>
    <div class="chart-container-donut" ref="donutContainer">
        <svg id="donut-svg" width="100%" height="100%">
        </svg>
    </div>
</template>

<script lang="ts">
import * as d3 from "d3";
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';
import { ComponentSize, Margin } from '../types';
import { schemeCategory10 } from 'd3-scale-chromatic';

interface JobTitle {
    salary_in_usd: number;
    job_title: string | undefined;
}

interface Job {
    salary_in_usd: number;
    company_size: string;
    remote_ratio: number;
}


export default {
    data() {
        return {
            chartData: [] as JobTitle[],
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 50, right: 50, top: 50, bottom: 50} as Margin,
        }
    },
    computed: {
        rerender() {
            return (!isEmpty(this.chartData)) && this.size
        },
    },
    async created() {
        const rawData = await d3.csv("../../data/ds_salaries.csv");
        let parsedData = rawData.map(d => ({
            job_title: d.job_title,
            salary_in_usd: Number(d.salary_in_usd ?? 0),
        }));
        console.log(rawData[0]);
        this.chartData = parsedData.filter((d) => d.salary_in_usd > 250000);
    },
    methods: {
        onResize() {  
            let target = this.$refs.donutContainer as HTMLElement;
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight, brushWidth: 30 };
        },
        initChart() {
            let donutContainer = d3.select('#donut-svg');

            const radius = Math.min(this.size.width - this.margin.left - this.margin.right, 
                                    this.size.height - this.margin.top - this.margin.bottom) / 2;

            // Count the occurrences of each job title
            const groupedData = this.chartData.reduce((acc, cur) => {
            const jobTitle = cur.job_title || "Other"; // Use a default value "Other" if job_title is undefined
            if (acc[jobTitle]) {
                acc[jobTitle]++;
            } else {
                acc[jobTitle] = 1;
            }
            return acc;
            }, {} as Record<string, number>);

            const uniqueChartData = Object.entries(groupedData).map(([jobTitle, count]) => ({
            job_title: jobTitle,
            count: count
            }));

            const sortedData = uniqueChartData.sort((a, b) => b.count - a.count);

            const topJobs = sortedData.slice(0, 8);

            const otherCount = sortedData.slice(8).reduce((acc, cur) => acc + cur.count, 0);

            const updatedChartData = [...topJobs, { job_title: "Other", count: otherCount }];

            const pie = d3.pie<{ job_title: string; count: number }>()
                        .value(d => d.count);

            const arcs = pie(updatedChartData);

            const arc = d3.arc()
                          .innerRadius(radius * 0.6)
                          .outerRadius(radius);

            const group = donutContainer.append('g')
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height / 2})`);

            const colorScale = d3.scaleOrdinal()
                .domain(updatedChartData.map(d => d.job_title))
                .range(schemeCategory10);

            group.selectAll('path')
                .data(arcs)
                .join('path')
                .attr('d', d => arc(d as any) as string)
                .attr('fill', (d, i) => colorScale(d.data.job_title) as string); 

            const arcLabel = d3.arc()
                            .innerRadius(radius * 1.1)
                            .outerRadius(radius * 1.1);

            // Add labels
            group.selectAll('text')
            .data(arcs)
            .join('text')
            .attr('transform', d => `translate(${arcLabel.centroid(d as any)})`) 
            .attr('dy', '0.5em')
            .attr('fill', 'black')
            .attr('text-anchor', 'middle')
            .style('font-size', '0.8rem')
            .text(d => `${d.data.job_title} (${d.data.count})`);

            const title = donutContainer.append('g')
                .append('text') 
                .attr('transform', `translate(${this.size.width / 2}, ${this.margin.top / 2})`)
                .attr('dy', '0px') 
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Data Science jobs with 250k+ USD salaries');
        }
    }, 
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#donut-svg').selectAll('*').remove()
                this.initChart()
            }
        },
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

<style scoped>
.chart-container-donut {
    height: 100%;
}
</style>