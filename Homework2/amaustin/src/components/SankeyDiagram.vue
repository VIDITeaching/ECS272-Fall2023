<script lang="ts">
import * as d3 from "d3";
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Pie, Bar, ComponentSize, Margin } from '../types';

// music & mental health survey data
// https://www.kaggle.com/datasets/catherinerasgaitis/mxmh-survey-results
const data = await d3.csv('../../data/mxmh_survey_results.csv');

// processing data for pie chart
const ageGroups = groupBy(data, "Age");
let ageData = [];
Object.keys(ageGroups).forEach(a => {
    if (!isNaN(parseInt(a))) {
        let dataObj = {
            age: a,
            count: ageGroups[a].length
        }
        ageData.push(dataObj);
    }
})

function groupBy(arr, property) {
    return arr.reduce(function (acc, obj) {
        let key = obj[property]
        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(obj)
            return acc
        }, 
    {})
}

interface CategoricalPie extends Pie{
    age: string;
}

export default {
    data() {
        return {
            sections: [] as CategoricalPie[],
            size: { width: 780, height: 300 } as ComponentSize,
            margin: {left: 40, right: 40, top: 15, bottom: 40} as Margin
        }
    },
    computed: {
        rerender() {
            return (!isEmpty(this.sections)) && this.size
        }
    },
    created() { 
        if (isEmpty(data)) return;
        this.sections = ageData;
    },
    methods: {
        onResize() {
            let target = this.$refs.sankeyContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        initChart() {
            let chartContainer = d3.select('#sankey-svg')
        
            let yExtents = d3.extent(this.sections.map((d: CategoricalPie) => d.count as number)) as [number, number]
            let xCategories: string[] = [ ...new Set(this.sections.map((d: CategoricalPie) => d.age as string))]

            
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
                .text('Value')
                .style('font-size', '.8rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width / 2 - this.margin.left}, ${this.size.height - this.margin.top + 10})`)
                .append('text')
                .text('Categories')
                .style('font-size', '.8rem')
            
            const bars = chartContainer.append('g')
                .selectAll('rect')
                .data<CategoricalPie>(this.sections)
                .join('rect')
                .attr('x', (d: CategoricalPie) => xScale(d.age) as number)
                .attr('y', (d: CategoricalPie) => yScale(d.count) as number)
                .attr('width', xScale.bandwidth())
                .attr('height', (d: CategoricalPie) => Math.abs(yScale(0) - yScale(d.count))) 
                .attr('fill', 'teal')

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
                d3.select('#sankey-svg').selectAll('*').remove()
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
        <svg id="sankey-svg" width="100%" height="100%">
        </svg>
    </div>
</template>

<style scoped>
.chart-container{
    height: 100%;
}
</style>

