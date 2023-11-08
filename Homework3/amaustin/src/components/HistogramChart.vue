<script lang="ts">
import * as d3 from "d3";
import { isEmpty, debounce, update } from 'lodash';
import { Bar, ComponentSize, Margin } from '../types';

interface CategoricalBar extends Bar{
    age: number
}

// music & mental health survey data
// https://www.kaggle.com/datasets/catherinerasgaitis/mxmh-survey-results
const csvData = await d3.csv('../../data/mxmh_survey_results.csv');

let processedData = []
csvData.forEach(p => {
    if (!isNaN(parseInt(p.Age))) {
        let dataObj = {
            age: p.Age,
            value: +p['Hours per day']
        }
        processedData.push(dataObj)
    }
})

function getAverage(bin) {
    return bin.reduce((total, next) => total + next.value, 0) / bin.length
}


function updateBars(binwidth, x, y, xAxis, yAxis, bars, legendGroup) {
    let numBins = Math.floor(x.domain()[1]/binwidth)

    const histogram = d3.bin()
        .value(d => d.age)
        .domain(x.domain())
        .thresholds(x.ticks(numBins))

    let new_bins = histogram(processedData)

    const hours = [0, Math.floor(d3.max(new_bins.map(b => getAverage(b))))]

    const colors = d3.scaleSequential(d3.interpolateBlues)
                .domain(hours)

    xAxis
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).ticks(numBins))

    let new_y = d3.scaleLinear()
            .domain([0, d3.max(new_bins, (b) => b.length)])
            .range(y.range())
    
    yAxis
        .transition()
        .duration(1000)
        .call(d3.axisLeft(new_y))

    bars.selectAll('.bars').remove()
    bars
        .data(new_bins)
        .join('rect')
            .transition() 
            .duration(1000)
            .attr('fill', d => (getAverage(d) == 24) ? null : colors(getAverage(d)))
            .attr('pointer-events', 'all')
            .attr('transform', function(d) {
                return `translate(${x(d.x0)}, ${y(d.length)})`
            })
            .attr('width', d => x(d.x1) - x(d.x0) - 1)
            .attr('height', d => 220 - y(d.length))
            .attr('class', 'bars')
    

    // // updating legend tick marks
    // let numColorStops = 5;
    // for (let i = 0; numColorStops + 1; i++) {
    //     const tickX = i * 40;
    //     legendGroup.append("text")
    //         .attr("x", tickX)
    //         .attr("y", 55)
    //         .style('font-size', '12')
    //         .style('font-family', 'monospace')
    //         .text(Math.round(hours[1] / numColorStops) * i);
    // }
}

export default {
    data() {
        return {
            bars: [] as CategoricalBar[],
            size: { width: 500, height: 240 } as ComponentSize,
            margin: {left: 40, right: 25, top: 20, bottom: 20} as Margin,
            binwidth: 5 as number
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

            chartContainer
                .attr('viewBox', [0, 0, this.size.width + 20, this.size.height + this.margin.bottom + this.margin.top])
                .attr('style', 'max-width: 100%; height: auto;')

            // scaling range of the data
            let xDomain = d3.extent(this.bars.map((d) => d.age as number ))

            let x = d3.scaleLinear()
                .range([this.margin.left, this.size.width])
                .domain(xDomain)

            let numBins = Math.floor(x.domain()[1]/this.binwidth)

            const histogram = d3.bin()
                .value(d => d.age)
                .domain(x.domain())
                .thresholds(x.ticks(numBins))

            let bins = histogram(processedData)

            let y = d3.scaleLinear()
                .domain([0, d3.max(bins, (x) => x.length)])
                .range([this.size.height - this.margin.bottom, this.margin.top]) 

            // adding axis and labels
            const xAxis = chartContainer.append('g')
                .attr('transform', `translate(0, ${this.size.height - this.margin.bottom})`)
                .style('font-family', 'monospace')
                .call(d3.axisBottom(x).ticks(numBins))
            
            const yAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .style('font-family', 'monospace')
                .call(d3.axisLeft(y))

            const yLabel = chartContainer.append('g')
                .attr('transform', `translate(0, 10)`)
                .append('text')
                .text('Count')
                .style('font-size', '.8rem')
                .style('font-family', 'monospace')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width - this.margin.right}, ${this.size.height + 15})`)
                .append('text')
                .text('Age')
                .style('font-size', '.8rem')
                .style('font-family', 'monospace')

            let hours = [0.0, Math.floor(d3.max(bins.map(b => getAverage(b))))]
            const colors = d3.scaleSequential(d3.interpolateBlues)
                .domain(hours)

            // adding legend for color scale
            const legendWidth = 200;
            const legendHeight = 20;
            const numColorStops = 5;
            const colorStopWidth = legendWidth / numColorStops
            const tickWidth = legendWidth / numColorStops

            const legend = chartContainer.append('g')
                .attr('class', 'legend')
                .attr('width', legendWidth)
                .attr('height', legendHeight)

            const legendGroup = legend.append('g')
                .attr('transform', `translate(${this.size.width - legendWidth},0)`)
            
            for (let i = 0; i < numColorStops; i++) {
                const colorStopX = i * colorStopWidth;
                legendGroup.append("rect")
                    .attr("x", colorStopX)
                    .attr("y", legendHeight)
                    .attr("width", colorStopWidth)
                    .attr("height", legendHeight)
                    .style("fill", colors(i))
                    .style("stroke", "none");
                }
            
            legendGroup.append('text')
                .attr('x', this.size.width - legendWidth - 250)
                .attr('y', 10)
                .style('font-size', 12)
                .style('font-family', 'monospace')
                .text('Avg listening hours')

            // adding tick marks
            for (let i = 0; i < numColorStops + 1; i++) {
                const tickX = i * tickWidth;
                legendGroup.append("line")
                    .attr("x1", tickX)
                    .attr("x2", tickX)
                    .attr("y1", 45)
                    .attr("y2", legendHeight)
                    .style("stroke", "black");

                    legendGroup.append("text")
                        .attr("x", tickX)
                        .attr("y", legendHeight+35)
                        .style('font-size', '12')
                        .style('font-family', 'monospace')
                        .text(Math.round(hours[1] / numColorStops) * i);
            }

            // adding histogram bars
            const bars = chartContainer.append('g')
                .selectAll('rect')    
                .data(bins)
                .join('rect') 
                .attr('pointer-events', 'all')
                .attr('transform', function(d) {
                    return `translate(${x(d.x0)}, ${y(d.length)})`
                })
                .attr('width', d => x(d.x1) - x(d.x0) - 1)
                .attr('height', d => this.size.height - this.margin.bottom - y(d.length))
                .attr('cursor', 'pointer')
                .attr('fill', d => colors(getAverage(d)))
                .attr('opacity', '0.6')
                .attr('class','bars')
                .on('mouseover', (event, v) => {
                    d3.select(event.currentTarget)
                        .transition()
                        .duration(250)
                        .attr('stroke', 'rgba(100, 100, 100, 0.2)')
                        .attr('stroke-width', 4)
                })
                .on('mouseout', (event, v) => {
                    d3.select(event.currentTarget)
                  		.transition()
                  		.duration(250)
                        .attr('stroke', 'white')
                        .attr('stroke-width', 1)
                })

            // updating the chart on slider change
            d3.select("#slider").on("change", function(d){
                let binwidth = this.value
                updateBars(binwidth, x, y, xAxis, yAxis, bars, legendGroup)
            })

            // chart title
            const title = chartContainer.append('g')
                .append('text')
                .attr('transform', `translate(${(this.size.width) / 2}, ${this.size.height + this.margin.top})`)
                .attr('dy', '0.5rem') 
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .style('font-family', 'monospace')
                .style('font-size', '18')
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
    <!-- https://d3-graph-gallery.com/graph/density_slider.html -->
    <div class="text-caption">Bin size: {{ binwidth }}</div>
    <input
        type="range"
        v-model="binwidth"
        id=slider
        min="1"
        max="20"
        />
    <div class="chart-container d-flex" ref="secondaryContainer">
        <svg id="hist-svg" width="90%" height="100%">
        </svg>
    </div>
</template>

<style scoped>
.chart-container{
    height: 100%;
}
</style>

