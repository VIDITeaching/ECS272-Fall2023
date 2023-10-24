<script lang="ts">
import * as d3 from "d3";
import * as d3Sankey from 'd3-sankey';
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Graph, ComponentSize, Margin } from '../types';

// music & mental health survey data
// https://www.kaggle.com/datasets/catherinerasgaitis/mxmh-survey-results
const data = await d3.csv('../../data/mxmh_survey_results.csv');
const genreGrouped = groupBy(data, "Fav genre")

let sankeyData = {"nodes": [], "links": []}

// processing data for chart
// fav genre -> working with music
data.forEach(d => {
    let source = d['Fav genre'] as string
    let target = d['While working']
    let value = genreGrouped[source].length
    if (!isEmpty(target)) {
        sankeyData.nodes.push({ "name": source })
        sankeyData.nodes.push({ "name": 'Listen while working? ' + target })
        sankeyData.links.push({ "source": source, "target": 'Listen while working? ' + target, "value": +value })
    }
})

sankeyData.nodes = Array.from(d3.group(sankeyData.nodes, d => d.name), ([value]) => value)

sankeyData.links.forEach(function (d, i) {
    sankeyData.links[i].source = sankeyData.nodes.indexOf(sankeyData.links[i].source);
    sankeyData.links[i].target = sankeyData.nodes.indexOf(sankeyData.links[i].target);
})

sankeyData.nodes.forEach(function (d, i) {
    sankeyData.nodes[i] = { "name": d };
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
            nodes: [] as Graph[],
            size: { width: 700, height: 400 } as ComponentSize,
            margin: {left: 40, right: 40, top: 15, bottom: 40} as Margin
        }
    },
    computed: {
        rerender() {
            return (!isEmpty(this.nodes)) && this.size
        }
    },
    created() { 
        if (isEmpty(data)) return;
        this.nodes = sankeyData;
    },
    methods: {
        onResize() {
            let target = this.$refs.sankeyContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        initChart() {
            // references: 
            // https://github.com/d3/d3-sankey
            // https://observablehq.com/@d3/sankey-component
            let chartContainer = d3.select('#sankey-svg')

            const format = d3.format(",.0f")
        
            const sankey = d3Sankey.sankey()
                .nodeWidth(15)
                .nodePadding(10)
                .extent([[this.margin.left, this.margin.top], [this.size.width - this.margin.right, this.size.height - this.margin.bottom]])

            const path = sankey.links()
            const graph = sankey(sankeyData)

            const colors = d3.scaleOrdinal(d3.schemeTableau10);

            // nodes
            const node = chartContainer.append('g')
                .attr('stroke', 'currentColor')
                .selectAll('rect')
                .data(graph.nodes)
                .join('rect')
                    .attr('x', (d) => d.x0)
                    .attr('y', (d) => d.y0)
                    .attr('height', (d) => d.y1 - d.y0)
                    .attr('width', (d) => d.x1 - d.x0)
                    .attr('fill', ({index: i}) => colors(sankeyData.nodes[i]))
            
            // node titles
            const nodeTitles = chartContainer.append('g')
                .selectAll('nodeTitles')
                .data(graph.nodes)
                .join('text')
                    .attr('transform', function(d) { return `translate(${d.x1 + 10}, ${d.y0 - ((d.y0 - d.y1) / 2)})` })
                    .style('font-size', '12px')
                    .text((d) => d.name)

            // links
            const link = chartContainer.append('g')
                .attr('fill', 'none')
                .attr('stroke', '#000')
                .attr('stroke-opacity', 0.2)
                .selectAll('.link')
                .data(graph.links)
                .join('path')
                    .attr('class', 'link')
                    .attr('d', d3Sankey.sankeyLinkHorizontal())
                    .attr('stroke-width', (d) => d.width)
                    .style('mix-blend-mode', 'multiply')
            
            // chart title
            const title = chartContainer.append('g')
                .append('text')
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height + this.margin.top})`)
                .attr('dy', '0.5rem') 
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .style('font-family', 'monospace')
                .style('font-size', '18')
                .text('Context View of Survey Responses')
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

