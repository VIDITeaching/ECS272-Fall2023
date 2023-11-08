<template>
    <div class="chart-container-line" ref="lineContainer">
        <svg id="line-svg" width="100%" height="100%">
        </svg>
    </div>
</template>

<script lang="ts">
import * as d3 from "d3";
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';
import { ComponentSize, Margin } from '../types';
import { state } from '../state';
import { useEventEmitter } from '../useEventEmitter';

const emitter = useEventEmitter();

interface Job {
    salary_in_usd: number;
    company_size: string;
    remote_ratio: number;
}

export default {
    data() {
        return {
            chartData: [] as Job[],
            size: { width: 0, height: 0, brushWidth : 30 } as ComponentSize,
            margin: { left: 50, right: 180, top: 5, bottom: 100 } as Margin,
            keys: [] as string[],
        }
    },
    computed: {
        rerender() {
            return (!isEmpty(this.chartData)) && this.size;
        },
    },
    async created() {
        const rawData = await d3.csv("../../data/ds_salaries.csv");
        let parsedData = rawData.map(d => ({
            salary_in_usd: Number(d.salary_in_usd ?? 0),
            company_size: d.company_size || 'na',
            remote_ratio: Number(d.remote_ratio ?? 0),
        }));
        this.chartData = parsedData.filter(
            (d) => 
            d.salary_in_usd > 0
        );
        this.keys = rawData.columns.slice(1);

    },
    methods: {
        onResize() {
            let target = this.$refs.lineContainer as HTMLElement;
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight, brushWidth: 30 };
        },
        initChart() {
            let lineContainer = d3.select('#line-svg');

            let key: string[] = [ "company_size", "salary_in_usd", "remote_ratio" ];
            
            let ySalary = d3
                .scaleLinear()
                .domain(
                    d3.extent(
                        this.chartData.map((d: Job) => d.salary_in_usd)
                    ) as [number, number]
                )
                .range([this.size.height - this.margin.bottom +25 , 0]);

            let yRemoteRatio = d3
                .scaleLinear()
                .domain(
                    d3.extent(
                        this.chartData.map((d: Job) => d.remote_ratio)
                    ) as [number, number]
                )
                .range([this.size.height - this.margin.bottom + 25, 0]);

            let ySize = d3
                .scalePoint()
                .domain(["S", "M", "L"])
                .range([this.size.height - this.margin.bottom + 25, 0]);

            let xScale = d3
                .scalePoint()
                .range([this.margin.left, this.size.width - this.margin.right])
                .padding(0.01)
                .domain(key);

            var color = d3
                .scaleOrdinal(["#1E90FF", "#FF8C00", "#32CD32"])
                .domain(["L", "M", "S"]);
            
            var deselectedColor = d3
                .scaleOrdinal(["#9FCBFF", "#FFCEA1", "#A2E0A2"])
                .domain(["L", "M", "S"]);

            var y: { [key: string]: d3.ScaleLinear<number, number> | d3.ScalePoint<string> } = {};
            
            y[key[0]] = ySalary;
            y[key[1]] = ySize;
            y[key[2]] = yRemoteRatio;

            function path(d: Job) {
                let pathString = "";
                key.forEach((p, i) => {
                    const xVal = xScale(p);
                    let yVal;
                    switch (p) {
                    case "salary_in_usd":
                        yVal = ySalary(d.salary_in_usd) + 50;
                        break;
                    case "company_size":
                        yVal =  Number(ySize(d.company_size ?? "")) + 50;
                        break;
                    case "remote_ratio":
                        yVal = yRemoteRatio(d.remote_ratio) + 50;
                        break;
                    default:
                        yVal = 0;
                    }

                    pathString += i === 0 ? `M${xVal},${yVal}` : ` L${xVal},${yVal}`;
                });
                return pathString;
            }
            
            
            let lines = lineContainer
                .append("g")
                .selectAll("myPath")
                .data(this.chartData)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", "none")
                .style("stroke", function (d) {
                    return color(d.company_size as string);
                })
                .style("opacity", 0.7)
                .style("stroke-width", "0.8px");

            let yAxis0 = lineContainer
                .append("g")
                .attr("transform", "translate(" + xScale(key[0]) + ",50)")
                .call(d3.axisRight(ySize))
                .append("text")
                .style("text-anchor", "middle")
                .attr("y", -15)
                .text(key[0])
                .style("fill", "black")
                .style("font-size", ".9rem");

            const yAxis1 = lineContainer
                .append("g")
                .attr("transform", "translate(" + xScale(key[1]) + ",50)")
                .call(d3.axisLeft(ySalary));

            const y1title = yAxis1
                .append("text")
                .style("text-anchor", "middle")
                .attr("y", -15)
                .text(key[1])
                .style("fill", "black")
                .style("font-size", ".9rem");

            let yAxis2 = lineContainer
                .append("g")
                .attr("transform", "translate(" + xScale(key[2]) + ",50)")
                .call(d3.axisLeft(yRemoteRatio))
                .append("text")
                .style("text-anchor", "middle")
                .attr("y", -15)
                .text(key[2])
                .style("fill", "black")
                .style("font-size", ".9rem");

            const title = lineContainer
                .append("g")
                .append("text")
                .attr(
                    "transform",
                    `translate(${this.size.width / 2}, ${
                        this.size.height - this.margin.top
                    })`
                )
                .style("text-anchor", "middle")
                .style("font-weight", "bold")
                .style("font-size", "1rem")
                .text("Data science job salaries with respect to company size and remote ratio");
            
            // add color legends for each key value
            const legendGroup = d3.select('#line-svg')
            .append('g')
            .attr('x', 10)
            .attr('y', 8)
            .attr('class', 'legend')
            .attr('transform', 'translate(' + (this.size.width - this.margin.right) + ',' + this.margin.top + ')');

            // Add legend title
            legendGroup.append('text')
            .text('Company Size')
            .attr('x', 10)
            .attr('y', 8)
            .style('font-weight', 'bold')
            .style('text-anchor', 'start');

            // Create a legend item for each color
            const legendItems = legendGroup.selectAll('.legend-item')
            .data(color.domain())
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => 'translate(0,' + (i * 20) + ')');

            // Create color swatches
            legendItems.append('rect')
            .attr('x', 90)
            .attr('y', 40)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', color);

            // Create text labels
            legendItems.append('text')
            .attr('x', 60)
            .attr('y', 52)
            .text(d => d)
            .style('text-anchor', 'start');


            const brush = d3.brushY()
                .extent([[-(this.size.brushWidth/2), 0], [this.size.brushWidth/2, this.size.height-this.margin.bottom]])
                            .on("brush", brushed);

            yAxis1.call(brush);

            const selections = state.selections;

            let that = this;
            function brushed({selection}: {selection: [number, number] | null}) {
                const key = "salary_in_usd";
                if (selection === null) selections.delete(key);
                else {
                    selections.set(key, selection.map(ySalary.invert));
                }
                console.log(selections);
                const selected: Job[] = [];
                lines.each(function(d: Job) {
                    if (key in d) {
                        const active = Array.from(selections).every(([key, [max, min]]) => { return (d.salary_in_usd >= min && d.salary_in_usd <= max);});
                        d3.select(this).style("stroke", active ? color(d.company_size as string) : deselectedColor(d.company_size as string)); 
                        if (active) {
                            d3.select(this).raise();
                            selected.push(d);
                        }
                    }
                });
                lineContainer.property("value", selected).dispatch("input");
                emitter.$emit('update-chart', selected);
            };
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#line-svg').selectAll('*').remove()
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
.chart-container-line {
    height: 100%;
}
</style>