<script lang="ts">
import * as d3 from "d3";
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Pie, Bar, ComponentSize, Margin } from '../types';

interface CategoricalPie extends Pie{
    category: string;
}

// music & mental health survey data
// https://www.kaggle.com/datasets/catherinerasgaitis/mxmh-survey-results
const data = await d3.csv('../../data/mxmh_survey_results.csv');

// processing data for pie chart
const streamGroups = groupBy(data, "Primary streaming service");
let streamData = [];
let sum = 0;
Object.keys(streamGroups).forEach(a => {
    if (a != "") {
        let platform = ""
        switch (a) {
            case "I do not use a streaming service.":
                platform = "None";
                break;
            case "Other streaming service":
                platform = "Other";
                break;
            default: 
                platform = a;
        }
        let dataObj = {
            category: platform,
            count: streamGroups[a].length
        }
        sum += streamGroups[a].length
        streamData.push(dataObj);
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

export default {
    data() {
        return {
            sections: [] as CategoricalPie[],
            size: { width: 600, height: 260 } as ComponentSize,
            margin: {left: 30, right: 40, top: 15, bottom: 40} as Margin
        }
    },
    computed: {
        rerender() {
            return (!isEmpty(this.sections)) && this.size
        }
    },
    created() { 
        if (isEmpty(data)) return;
        this.sections = streamData;
    },
    methods: {
        onResize() {
            let target = this.$refs.donutContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        initChart() {
            // donut chart: https://d3-graph-gallery.com/graph/donut_label.html
            let chartContainer = d3.select('#donut-svg')

            let radius = Math.min(this.size.width, this.size.height) / 2
            let donutWidth = 75
            const colors = d3.scaleOrdinal(d3.schemeCategory10)
            const format = d3.format(",.1f")
            
            // arc generator
            let arc = d3.arc()
                .innerRadius(radius - donutWidth)
                .outerRadius(radius)

            // arc for labelling
            let outerArc = d3.arc()
                .innerRadius(radius * 0.9)
                .outerRadius(radius * 0.9)

            // angle generator
            const pie = d3.pie()
                .value((d) => d.count)
                .sort(null)
            
            let pieData = pie(streamData)

            // building pie chart
            const path = chartContainer.append('g')
                .selectAll('path')
                .data(pieData)
                .join('path')
                .attr('d', arc)
                .attr('width', this.size.width)
                .attr('height', this.size.height)
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height / 2})`)
                .attr('fill', d => colors(d.data.category))
                .style('stroke-width", "2px"')    
                
            // polylines
            const polyLines = chartContainer.append('g')
                .selectAll('polyLines')
                .data(pieData)
                .join('polyline')
                    .attr('stroke', 'black')
                    .style('fill', 'none')
                    .attr('stroke-width', 1.5)
                    .attr('transform', `translate(${this.size.width / 2}, ${this.size.height / 2})`)
                    .attr('points', function(d) {
                        let posA = arc.centroid(d) // line insertion into the slice
                        let posB = outerArc.centroid(d) // line break 
                        let posC = outerArc.centroid(d) // label position
                        let midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
                        posC[0] = radius * 0.99 * (midAngle < Math.PI ? 1 : -1)
                        return [posA, posB, posC]
                    })
            
            // data labels
            const labels = chartContainer.append('g')
                .selectAll('allLabels')
                .data(pieData)
                .join('text')
                    .attr('transform', function(d) {
                        let pos = outerArc.centroid(d)
                        let midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
                        pos[0] = (radius * 1.04 * (midAngle < Math.PI ? 1 : -1)) + 300
                        pos[1] = pos[1] + 135
                        return `translate(${pos})`
                    })
                    .style('text-anchor', function(d) {
                        let midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
                        return (midAngle < Math.PI ? 'start' : 'end')
                    })
                    .style('font-size', '12px')
                    .text((d) => `${format((d.data.count / sum) * 100)}%  ${d.data.category}`)

            const title = chartContainer.append('g')
                .append('text')
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height + this.margin.top + 10})`)
                .attr('dy', '0.5rem') 
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Primary Streaming Services')
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#donut-svg').selectAll('*').remove()
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
        <svg id="donut-svg" width="100%" height="100%">
        </svg>
    </div>
</template>

<style scoped>
.chart-container{
    height: 100%;
}
</style>

