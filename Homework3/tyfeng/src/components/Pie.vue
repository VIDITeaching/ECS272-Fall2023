<template>
    <div class="chart-container-donut" ref="donutContainer">
        <svg id="donut-svg" width="100%" height="100%">
        </svg>
    </div>
    <div id="tooltip" class="tooltip" style="opacity:0;">
        <p>Count: <span id="tooltip-value"></span></p>
    </div>
</template>

<script lang="ts">
import * as d3 from "d3";
import { isEmpty, debounce } from 'lodash';
import { ComponentSize, Margin } from '../types';
import { state } from '../state';
import { useEventEmitter } from '../useEventEmitter';

const emitter = useEventEmitter();


interface Job {
    salary_in_usd: number;
    company_size: string;
    remote_ratio: number;
    count: number;
}


export default {
    data() {
        return {
            chartData: [] as Job[],
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 50, right: 50, top: 50, bottom: 50} as Margin,
            remoteRatioOrder: [100, 50, 0] as number[], 
        }
    },
    computed: {
        rerender() {
            return (!isEmpty(this.chartData)) && this.size
        },
    },
    async created() {
        this.updateChart();
    },
    methods: {
        async updateChart() {
            const rawData = await d3.csv("../../data/ds_salaries.csv");
            let parsedData = rawData.map(d => ({
                salary_in_usd: Number(d.salary_in_usd ?? 0),
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

            const groupedData = d3.group(parsedData, (d: any) => d.remote_ratio);

            const aggregatedData = Array.from(groupedData, ([key, value]) => ({
                remote_ratio: key,
                // count of data points in each company size
                count: value.length,
                // salary_in_usd: d3.mean(value, d => d.salary_in_usd),
            }));

            this.chartData = aggregatedData
                .map((d: any) => ({
                    remote_ratio: d.remote_ratio,
                    count: d.count
                }))
                .sort((a, b) => {
                    // Use indexOf the predefined order for sorting
                    let orderA = this.remoteRatioOrder.indexOf(a.remote_ratio);
                    let orderB = this.remoteRatioOrder.indexOf(b.remote_ratio);
                    return orderA - orderB;
                }) as Job[];

            d3.select('#donut-svg').selectAll('*').remove();
            this.initChart();
        },
        onResize() {  
            let target = this.$refs.donutContainer as HTMLElement;
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight, brushWidth: 30 };
        },
        initChart() {
            let donutContainer = d3.select('#donut-svg');

            const radius = Math.min(this.size.width - this.margin.left - this.margin.right, 
                                    this.size.height - this.margin.top - this.margin.bottom) / 2;
            
            const pie = d3.pie<{ remote_ratio: string; count: number }>()
                  .sort(null) // Disable the built-in sort
                  .value(d => d.count);

            const arcs = pie(this.chartData as any);

            const arc = d3.arc()
                          .innerRadius(radius * 0.6)
                          .outerRadius(radius);

            const group = donutContainer.append('g')
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height / 2})`);

            const colorScale = d3
                .scaleOrdinal(["#3503fc", "#ad03fc", "#fc03b1"])
                .domain(["0", "50", "100"]);

            const tooltip = d3.select("#tooltip");
            group.selectAll('path')
                .data(arcs)
                .join('path')
                .attr('d', d => arc(d as any) as string)
                .attr('fill', (d, i) => colorScale(d.data.remote_ratio as string) as string)
                .on("mouseover", (event, d) => {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`Remote Ratio: ${d.data.remote_ratio}% <br> Count: ${d.data.count}`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                }); 

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
            .text(d => `${d.data.remote_ratio} (${d.data.count})`);

            const title = donutContainer.append('g')
                .append('text') 
                .attr('transform', `translate(${this.size.width / 2}, ${this.margin.top / 2})`)
                .attr('dy', '0px') 
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Number of data science jobs by remote ratio');
            
            // add color legends for each key value
            const legendGroup = d3.select('#donut-svg')
            .append('g')
            .attr('x', 0)
            .attr('y', 8)
            .attr('class', 'legend')
            .attr('transform', 'translate(' + (this.size.width - this.margin.right) + ',' + this.margin.top + ')');

            // Add legend title
            legendGroup.append('text')
            .text('Remote Ratio')
            .attr('x', -80)
            .attr('y', 8)
            .style('font-weight', 'bold')
            .style('text-anchor', 'start');

            // Create a legend item for each color
            const legendItems = legendGroup.selectAll('.legend-item')
            .data(colorScale.domain().slice(0,3))
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => 'translate(0,' + (i * 20) + ')');

            // Create color swatches
            legendItems.append('rect')
            .attr('x', -70)
            .attr('y', 40)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', colorScale);

            // Create text labels
            legendItems.append('text')
            .attr('x', -40)
            .attr('y', 52)
            .text(d => d + "%")
            .style('text-anchor', 'start');

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
        window.addEventListener('resize', debounce(this.onResize, 100));
        this.onResize();
        emitter.$on('update-chart', this.updateChart);

    },
    beforeDestroy() {
       window.removeEventListener('resize', this.onResize);
       emitter.$off('update-chart', this.updateChart);
    }
}
</script>

<style scoped>
.chart-container-donut {
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