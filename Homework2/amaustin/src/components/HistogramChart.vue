<script lang="ts">
import * as d3 from "d3";
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Bar, ComponentSize, Margin } from '../types';

interface CategoricalBar extends Bar{
    age: number
}

// music & mental health survey data
// https://www.kaggle.com/datasets/catherinerasgaitis/mxmh-survey-results
const csvData = await d3.csv('../../data/mxmh_survey_results.csv');

let processedData = []
Object.values(csvData).forEach(p => {
    if (!isNaN(parseInt(p.Age))) {
        let dataObj = {
            age: p.Age,
            value: p['Hours per day']
        }
        processedData.push(dataObj)
    }
})

export default {
    data() {
        return {
            bars: [] as CategoricalBar[],
            size: { width: 530, height: 340 } as ComponentSize,
            margin: {left: 40, right: 40, top: 15, bottom: 40} as Margin
        }
    },
    computed: {
        rerender() {
            return (!isEmpty(this.bars)) && this.size
        }
    },
    created() { 
        if (isEmpty(csvData)) return;
        this.bars = processedData;
    },
    methods: {
        onResize() {
            let target = this.$refs.sankeyContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        initChart() {
            // histogram: https://gist.github.com/d3noob/a30f746eddb9f150bfd9872982f52a4a
            let chartContainer = d3.select('#hist-svg')

            // scaling range of the data
            let xDomain = d3.extent(this.bars.map((d) => d.age as number ))

            let x = d3.scaleLinear()
                .rangeRound([this.margin.left, this.size.width])
                .domain(xDomain)

            let y = d3.scaleLinear()
                .range([this.size.height - this.margin.bottom, this.margin.top]) 
                .domain([0, 285]) // FIX ME

            // adding axis and labels
            const xAxis = chartContainer.append('g')
                .attr('transform', `translate(0, ${this.size.height - this.margin.bottom})`)
                .call(d3.axisBottom(x).ticks(16))
            
            // const yAxis = chartContainer.append('g')
            //     .attr('transform', `translate(${this.margin.left}, 0)`)
            //     .call(d3.axisLeft(y))

            // const yLabel = chartContainer.append('g')
            //     .attr('transform', `translate(${10}, ${this.size.height / 2 + this.margin.bottom}) rotate(-90)`)
            //     .append('text')
            //     .text('Value')
            //     .style('font-size', '.8rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top + 10})`)
                .append('text')
                .text('Age')
                .style('font-size', '.8rem')

            const histogram = d3.bin()
                .value(d => d.age)
                .domain(x.domain())
                .thresholds(x.ticks(16))

            let bins = histogram(processedData)

            // TODO: color bars based on hours per day, add legend
            // adding histogram bars
            const bars = chartContainer.append('g')
                .selectAll('rect')    
                .data(bins)
                .join('rect')
                .attr('transform', function(d) {
                    return `translate(${x(d.x0)}, ${y(d.length)})`
                })
                .attr('width', d => x(d.x1) - x(d.x0) - 1)
                .attr('height', d => d.length)
                .attr('fill', 'teal')

            const labels = chartContainer.append('g')
                .selectAll('allLabels')
                .data(bins)
                .join('text')
                    .attr('transform', function(d) {
                        return `translate(${x(d.x0) + x(d.x1 - d.x0) / 2}, ${y(d.length) - 8})`
                    })
                    .style('font-size', '12px')
                    .text((d) => d.length)
                

            // chart title
            const title = chartContainer.append('g')
                .append('text')
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height + this.margin.top})`)
                .attr('dy', '0.5rem') 
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Distribution of Participant Ages')
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#hist-svg').selectAll('*').remove()
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
    <div class="chart-container d-flex" ref="secondaryContainer">
        <svg id="hist-svg" width="100%" height="100%">
        </svg>
    </div>
</template>

<style scoped>
.chart-container{
    height: 100%;
}
</style>

