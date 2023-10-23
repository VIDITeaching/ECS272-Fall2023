<script lang="ts">
import * as d3 from "d3";
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Point, ComponentSize, Margin } from '../types';

// music & mental health survey data
// https://www.kaggle.com/datasets/catherinerasgaitis/mxmh-survey-results
const csvData = await d3.csv('../../data/mxmh_survey_results.csv');

let processedData = []
Object.values(csvData).forEach(p => {
    if (!isNaN(p.Age)) {
        let dataObj = {
        posX: p.Age,
        posY: p['Hours per day']
    }
    processedData.push(dataObj)
    }
})

export default {
    data() {
        return {
            points: [] as Point[],
            size: { width: 500, height: 260 } as ComponentSize,
            margin: {left: 40, right: 40, top: 15, bottom: 40} as Margin
        }
    },
    computed: {
        rerender() {
            return (!isEmpty(this.points)) && this.size
        }
    },
    created() { 
        if (isEmpty(csvData)) return;
        this.points = processedData;
    },
    methods: {
        onResize() {
            let target = this.$refs.sankeyContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        initChart() {
            // scatter plot: https://gist.github.com/d3noob/3aa3bbe05ee97b35af660c25ee27213b
            let chartContainer = d3.select('#scatter-svg')

            // scaling range of the data
            let xDomain = d3.extent(this.points.map((d) => d.posX as number )) as [number, number]
            let yDomain =  d3.extent(this.points.map((d) => d.posY as number)) as [number, number]

            let xScale = d3.scaleLinear()
                .rangeRound([this.margin.left, this.size.width - this.margin.right])
                .domain(xDomain)

            let yScale = d3.scaleLinear()
                .range([this.size.height - this.margin.bottom, this.margin.top]) 
                .domain([0, yDomain[1]])

            // adding axis and labels
            const xAxis = chartContainer.append('g')
                .attr('transform', `translate(0, ${this.size.height - this.margin.bottom})`)
                .call(d3.axisBottom(xScale).ticks(10))
            
            const yAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(yScale))

            const yLabel = chartContainer.append('g')
                .attr('transform', `translate(${10}, ${this.size.height / 2 + this.margin.bottom}) rotate(-90)`)
                .append('text')
                .text('Hours per day')
                .style('font-size', '.8rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width / 2 - this.margin.left}, ${this.size.height - this.margin.top + 10})`)
                .append('text')
                .text('Age')
                .style('font-size', '.8rem')

            // adding scatterplot
            // TODO: color data points and add legend
            const scatter = chartContainer.append('g')
                .selectAll('dot')
                .data(this.points)
                .join('circle')
                    .attr('r', 2)
                    .attr('cx', d => xScale(d.posX))
                    .attr('cy', d => yScale(d.posY))

            // chart title
            const title = chartContainer.append('g')
                .append('text')
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height + this.margin.top})`)
                .attr('dy', '0.5rem') 
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Distribution of Participant Ages & Listening Hours')
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#scatter-svg').selectAll('*').remove()
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
        <svg id="scatter-svg" width="100%" height="100%">
        </svg>
    </div>
</template>

<style scoped>
.chart-container{
    height: 100%;
}
</style>

