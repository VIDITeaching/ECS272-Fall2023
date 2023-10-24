<script lang="ts">
import * as d3 from "d3";
import * as d3Sankey from 'd3-sankey';
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Graph, ComponentSize, Margin } from '../types';

// music & mental health survey data
// https://www.kaggle.com/datasets/catherinerasgaitis/mxmh-survey-results
const data = await d3.csv('../../data/mxmh_survey_results.csv');

let sankeyData = {"nodes": [], "links": []}

// processing data for chart
data.forEach(d => {
    let source = d['Fav genre']
    let target = d['Anxiety']
    let value = d['Hours per day']
    sankeyData.nodes.push({ "name": source })
    sankeyData.nodes.push({ "name": target })
    sankeyData.links.push({ "source": source, "target": target, "value": +value })
})

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
            // sankey diagram: https://observablehq.com/@d3/sankey-component
            let chartContainer = d3.select('#sankey-svg')

            const format = d3.format(",.0f")
        
            const sankey = d3Sankey.sankey()
                .nodeWidth(15)
                .nodePadding(10)
                .extent([[this.margin.left, this.margin.top], [this.size.width - this.margin.right, this.size.height - this.margin.bottom]])

            const path = sankey.links()
            console.log(sankeyData)
            const graph = sankey(sankeyData)

            const colors = d3.scaleOrdinal(d3.schemeBlues)

            // links
            const link = chartContainer.append('g')
                .selectAll('links')
                .data(graph.links)
                .join('path')
                    .attr('class', 'link')
                    .attr('d', d3Sankey.sankeyLinkHorizontal())
                    .attr('stroke-width', (d) => d.width)
            
            // link titles
            link.append('title')
                .text((d) => d.source.name + ' -> ' + d.target.name + '\n' + format(d.value))

            // nodes
            const node = chartContainer.append('g')
                .attr('x', (d) => d.x0)
                .attr('y', (d) => d.y0)
                .attr('height', (d) => d.y1 - d.y0)
                .attr('width', sankey.nodeWidth())
                .style('fill', function(d) {
                    return d.color = colors(d.name.replace(/ .*/, ""))
                })
                
            
            const title = chartContainer.append('g')
                .append('text')
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height + this.margin.top})`)
                .attr('dy', '0.5rem') 
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Focus View')
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

