<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/mxmh_survey_results.json';
import { isEmpty, debounce } from 'lodash';

import { ComponentSize, Margin } from '../types';

// Computed property: https://vuejs.org/guide/essentials/computed.html
// Lifecycle in vue.js: https://vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram

export default {
    data() {
        // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
        return {
            data: {},
            brushAreas: {},
            brush: null,
            color: null,
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 40, right: 20, top: 20, bottom: 60} as Margin,
        }
    },
    computed: {
        // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
        rerender() {
            return (!isEmpty(this.data)) && this.size
        }
    },
    created() {
        this.data = Data.map((d) => {
            return {
                Anxiety: d['Anxiety'],
                Depression: d['Depression'],
                Insomnia: d['Insomnia'],
                OCD: d['OCD'],
                bpm: d['BPM'],
            };
        });
    },
    methods: {
        onResize() {  // record the updated size of the target element
            let target = this.$refs.pcContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        initChart() {
            // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
            let svg = d3.select('#pc-svg')
                .attr("width", this.size.width + this.margin.left + this.margin.right)
                .attr("height", this.size.height + this.margin.top - this.margin.bottom)
                .append("g")
                .attr("transform",
                        `translate(${this.margin.left},${this.margin.top})`);

            svg.append('text')
                .style('text-anchor', 'middle')
                .text('Self-Rated Mental Health Scores')
                .attr('x', this.size.width / 2)
                .attr('y', this.margin.top / 2)
                .style("font-size", "20px");

            let dimensions = Object.keys(Object.values(this.data).at(0)).filter((d) => d !== 'bpm');

            const bpmExtent = d3.extent(this.data, (d) => +d.bpm);
            this.color = d3.scaleSequential(d3.interpolateBlues)
                .domain(bpmExtent);

            let y = {};
            dimensions.forEach( (name) => {
                const yScale = [this.size.height - this.margin.top - this.margin.bottom, this.margin.top * 2];
                y[name] = d3.scaleLinear()
                    .domain(d3.extent(this.data, (d) => +d[name] ))
                    .range(yScale);
                this.brushAreas[name] = yScale;
            });

            let x = d3.scalePoint()
                        .range([-this.margin.left * 2, this.size.width + this.margin.right])
                        .padding(1)
                        .domain(dimensions);
            
            function path(d) {
                return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
            }

            svg.selectAll("myPath")
                .data(this.data)
                .enter().append("path")
                .attr("id", (d, i) => `path-${i}`)
                .attr("d",  (d) => path(d))
                .style("fill", "none")
                .style("stroke", (d) => this.color(d.bpm))
                .style("stroke-width", 2)
                .style("opacity", 0.5);
            
            const debouncedBrushed = debounce(this.brushed, 200);
            const brushWidth = 50;
            this.brush = d3.brushY()
                .extent([
                    [-brushWidth/2, this.margin.top],
                    [brushWidth/2, this.size.height - this.margin.bottom]
                ])
                .on("start brush end", (event, key) => {
                    debouncedBrushed(event, key);
                });

            svg.append("g")
                .selectAll("myAxis")
                .data(dimensions).enter()
                .append("g")
                .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
                .each(function(d) { d3.select(this).call(d3.axisLeft(y[d])); })
                .call(this.brush)
                // Add axis title
                .append("text")
                .style("text-anchor", "middle")
                .attr("y", this.margin.top * 1.5)
                .text(function(d) { return d; })
                .style("fill", "black")
                .style("font-size", "12px");
            
            // Color Bar
            const legendGradient = svg.append('defs').append('linearGradient')
                .attr('id', 'legendGradient')
                .attr('x1', '0%')
                .attr('x2', '0%')
                .attr('y1', '100%')
                .attr('y2', '0%');

            const numStops = 10;
            const colorStops = d3.range(bpmExtent[0], bpmExtent[1], (bpmExtent[1] - bpmExtent[0]) / numStops);

            colorStops.forEach((stop, i) => {
            legendGradient.append('stop')
                .attr('offset', (i * numStops) + '%')
                .attr('stop-color', this.color(stop));
            });

            const legendX = this.size.width * 5 / 6;
            const legendY = this.margin.top * 5;
            const legendWidth = this.margin.left / 2;
            const legendHeight = this.size.height / 1.5;

            svg.append('rect')
                .attr('x', legendX)
                .attr('y', legendY)
                .attr('width', legendWidth)
                .attr('height', legendHeight)
                .style('fill', 'url(#legendGradient)');
            
            const numTicks = 5;

            const tickScale = d3.scaleLinear()
                .domain(bpmExtent)
                .range([legendHeight, 0]);

            for (let i = 0; i < numTicks; i++) {
                const tickValue = bpmExtent[0] + i * (bpmExtent[1] - bpmExtent[0]) / (numTicks - 1);
                const tickY = legendY + tickScale(tickValue);
                
                svg.append('line')
                    .attr('x1', legendX)
                    .attr('x2', legendX + legendWidth)
                    .attr('y1', tickY)
                    .attr('y2', tickY)
                    .style('stroke', 'black');
                
                svg.append('text')
                    .attr('x', legendX + legendWidth + 10)
                    .attr('y', tickY)
                    .attr('dy', '0.35em')
                    .text(d3.format('.1f')(tickValue))
                    .style("font-size", "12px");
            }
            svg.append('text')
                .style('text-anchor', 'middle')
                .text('BPM of Favorite Music Genre')
                .attr('transform', 'translate(' + (legendX + legendWidth * 4) + ',' + (legendY + legendHeight / 2) + ') rotate(90)')
                .style("font-size", "14px");
        },
        brushed(event, key) {
            const deselectedColor = "#ddd"
            this.brushAreas[key] = event.selection;
            const selected = [];
            Object.values(this.data).forEach((d, i) => {
                // Use the same unique ID to select the path element
                const pathElement = d3.select(`#path-${i}`);
                const active = Object.keys(this.brushAreas).every((name) => {
                    const value = d[name];
                    const yScale = [this.size.height - this.margin.top - this.margin.bottom, this.margin.top * 2];
                    const y = d3.scaleLinear()
                        .domain(d3.extent(this.data, (d) => +d[name] ))
                        .range(yScale);
                    return value !== undefined && y(value) >= Math.min(this.brushAreas[name][0], this.brushAreas[name][1]) && y(value) <= Math.max(this.brushAreas[name][0], this.brushAreas[name][1]);
                });
                pathElement.style("stroke", active ? this.color(d.bpm) : deselectedColor);
                if (active) {
                    pathElement.raise();
                    selected.push(d);
                }
            });
            this.$emit('brushed', selected);
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#pc-svg').selectAll('*').remove() // Clean all the elements in the chart
                this.initChart()
            }
        }
    },
    // The following are general setup for resize events.
    mounted() {
        window.addEventListener('resize', debounce(this.onResize, 100)) 
        this.onResize()
        this.initChart()
    },
    beforeDestroy() {
       window.removeEventListener('resize', this.onResize)
    }
}

</script>

<!-- "ref" registers a reference to the HTML element so that we can access it via the reference in Vue.  -->
<!-- We use flex (d-flex) to arrange the layout-->
<template>
    <div class="chart-container d-flex" ref="pcContainer">
        <svg id="pc-svg" width="100%" height="100%">
            <!-- all the visual elements we create in initChart() will be inserted here in DOM-->
        </svg>
    </div>
</template>

<style scoped>
.chart-container{
    height: 100%;
}
</style>

