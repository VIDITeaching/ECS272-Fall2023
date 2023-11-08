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
const workingGrouped = groupBy(data, "While working")
const anxietyGrouped = groupBy(data, "Anxiety")
const depressionGrouped = groupBy(data, "Depression")
const musicEffectGrouped = groupBy(data, "Music effects")

let sankeyData = {"nodes": [], "links": []}

// nodes
Object.keys(genreGrouped).forEach(g => {
    if (g != "") sankeyData.nodes.push({ "name": g })
})
Object.keys(musicEffectGrouped).forEach(g => {
    if (g != "") sankeyData.nodes.push({ "name": 'Music effect on mental health - '+g })
})
sankeyData.nodes.push({ "name": 'Listen while working? Yes' })
sankeyData.nodes.push({ "name": 'Listen while working? No' })

sankeyData.nodes.push({ "name": 'Anxiety Level 0-3' })
sankeyData.nodes.push({ "name": 'Anxiety Level 4-7' })
sankeyData.nodes.push({ "name": 'Anxiety Level 8-10' })

sankeyData.nodes.push({ "name": "Depression Level 0-3" })
sankeyData.nodes.push({ "name": "Depression Level 4-7"})
sankeyData.nodes.push({ "name": "Depression Level 8-10"})

function levels(value) {
    if (parseInt(value) <= 3) return '0-3'
    if (parseInt(value) > 3 && value < 8) return '4-7'
    if (parseInt(value) <= 10 && value >= 8) return '8-10'
}

// processing data for chart
// fav genre -> working with music
data.forEach(d => {
    // fav genre -> working with music
    let genre = d['Fav genre'] as string
    let working = d['While working'] as string
    let genreWorking = genreGrouped[genre].length

    // working -> anxiety level
    let anxiety = d['Anxiety'] as string
    let workingAnxiety = workingGrouped[working].length

    // anxiety -> depression level
    let depression = d['Depression'] as string
    let aDepValue = anxietyGrouped[anxiety].length

    // depression level -> music helping ?
    let musicEffect = d['Music effects']
    let depEffectValue = depressionGrouped[depression].length

    if (!isEmpty(working) && !isEmpty(musicEffect)) {
        // links
        sankeyData.links.push({ "source": genre, "target": 'Listen while working? ' + working, "value": +genreWorking })

        if (anxiety <= 3 && anxiety >= 0) {
            sankeyData.links.push({ "source": 'Listen while working? ' + working, "target": 'Anxiety Level 0-3', "value": +workingAnxiety })
        } else if (anxiety <= 7 && anxiety > 3) {
            sankeyData.links.push({ "source": 'Listen while working? ' + working, "target": 'Anxiety Level 4-7', "value": +workingAnxiety })
        } else if (anxiety <= 10 && anxiety > 7) {
            sankeyData.links.push({ "source": 'Listen while working? ' + working, "target": 'Anxiety Level 8-10', "value": +workingAnxiety })
        }

        if (depression <= 3 && depression >= 0) {
            sankeyData.links.push({ "source": 'Anxiety Level '+levels(anxiety), "target": 'Depression Level 0-3', "value": +aDepValue })
        } else if (depression <= 7 && depression > 3) {
            sankeyData.links.push({ "source": 'Anxiety Level '+levels(anxiety), "target": 'Depression Level 4-7', "value": +aDepValue })
        } else if (depression <= 10 && depression > 7) {
            sankeyData.links.push({ "source": 'Anxiety Level '+levels(anxiety), "target": 'Depression Level 8-10', "value": +aDepValue })
        }
        
        sankeyData.links.push({ "source": 'Depression Level '+levels(depression), "target": 'Music effect on mental health - ' + musicEffect, "value": +depEffectValue })
    }
})


// anxiety -> depression level 0-5 and 6-10
// depression -> music helps

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
            size: { width: 940, height: 260 } as ComponentSize,
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
                    .style('opacity', '0.5')    
            
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

