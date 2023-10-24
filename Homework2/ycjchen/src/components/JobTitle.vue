<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/ds_salaries.json';
// import Data from '../../data/test.json';

import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Dot, ComponentSize, Margin } from '../types';
// A "extends" B means A inherits the properties and methods from B.

interface Title extends Dot{
    salary_in_usd: number;
    job_title: string
}


export default {
    data() {
        // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
        return {
            // dots: [] as Title[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
            newdataC: [] as Title[],
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 50, right: 50, top: 0, bottom: 5} as Margin,
        }
    },
    computed: {
        // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
        rerender() {
            return (!isEmpty(this.newdataC)) && this.size
        },

    
    },
    // Anything in here will only be executed once.
    // Refer to the lifecycle in Vue.js for more details, mentioned at the very top of this file.
    created() {
        if (isEmpty(Data)) return;
        // this.dots = Data.data;
        this.newdataC = Data.data.filter((d) => (d.company_location == ('US')) &&
                                               (d.employee_residence == ('US'))&&
                                               (d.salary_currency == ('USD'))&&                                                 
                                               (d.employment_type==('FT'))&&
                                               (d.work_year==(2023))&&
                                               (d.salary_in_usd > (300000)));
        // console.log(this.dots)
        console.log(this.newdataC)
    },
    methods: {
        onResize() {  // record the updated size of the target element
            let target = this.$refs.donutContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        
        initChart() {
            // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
            let donutContainer = d3.select('#donut-svg')
            let yTitle: string[] = [ ...new Set(this.newdataC.map((d: Title) => d.job_title as string))]
            let count = {};
            this.newdataC.map((d: Title) => count[d.job_title] = 1 + (count[d.job_title] || 0));
            console.log(yTitle);
            // Getting the keys of JavaScript Object. 
            let Modified_Object = Object.keys(count)  
              
                // Sort and calling a method on 
                // keys on sorted fashion. 
                .sort().reduce(function(Obj, key) {  
                        
                    // Adding the key-value pair to the 
                    // new object in sorted keys manner 
                    Obj[key] = count[key];  
                    return Obj;  
            }, {}); 
            // console.log(Object.entries(count));a
            // console.log(count)
            var color = d3.scaleOrdinal()
                          .domain(yTitle)
                          .range(['#4e79a7',
                                '#59a14f',
                                '#9c755f',
                                '#f28e2b',
                                '#edc948',
                                '#e15759',
                                '#b07aa1',
                                '#bab0ac',
                                '#ff9da7',
                                '#76b7b2',
                                '#016651',
                                '#b30000',
                                '#542788']);
            
            // Compute the position of each group on the pie:
            var pie = d3.pie()
                        .sort(null) // Do not sort group by size
                        .value(function(d) {return d[1]; })
            var data_ready = pie(Object.entries(count))
            var radius = Math.min(this.size.width, this.size.height) / 2.1
            // The arc generator
            var arc = d3.arc()
            .innerRadius(radius * 0.5)         // This is the size of the donut hole
            .outerRadius(radius * 0.8)

            // Another arc that won't be drawn. Just for labels positioning
            var outerArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9)

            let donut = donutContainer.append('g')
            .attr('transform', 'translate(' + this.size.width/2 +  ',' + this.size.height/2 +')')
            .selectAll('allSlices')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function(d){ return(color(d.data[0])); })
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 0.9)

            let polylines = donutContainer.append('g')
            .attr('transform', 'translate(' + this.size.width/2 +  ',' + this.size.height/2 +')')
            .selectAll('allPolylines')
            .data(data_ready)
            .enter()
            .append('polyline')
                .attr("stroke", "black")
                .style("fill", "none")
                .attr("stroke-width", 1)
                .attr('points', function(d) {
                var posA = arc.centroid(d) // line insertion in the slice
                var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
                var posC = outerArc.centroid(d); // Label position = almost the same as posB
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                posC[0] = radius * 0.95 * (midangle < Math.PI ? 1:-1); // multiply by 1 or -1 to put it on the right or on the left
                // posC[1] = posC[1] + (midangle < Math.PI+0.5 ? 5 : 0);
                // posC[1] = posC[1] + (midangle < Math.PI ? 0 : 5);
                // posB[1] = posB[1] + (midangle < Math.PI ? 0 : 5);
                return [posA, posB, posC]
                })

            let labels = donutContainer.append('g')
            .attr('transform', 'translate(' + this.size.width/2 +  ',' + this.size.height/2 +')')
            .selectAll('allLabels')
            .data(data_ready)
            .enter()
            .append('text')
                .text( function(d) { return d.data[0]+': '+d.data[1] } )
                .attr('transform', function(d) {
                    var pos = outerArc.centroid(d);
                    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                    pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                    // pos[1] = pos[1] + (midangle < Math.PI ? 8 : 0);
                    // pos[1] += 20;
                    return 'translate(' + pos  + ')';
                })
                .style('text-anchor', function(d) {
                    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                    return (midangle < Math.PI ? 'start' : 'end')
                })
                .style('font-size', '.9rem')
                const title = donutContainer.append('g')
                    .append('text') // adding the text
                    .attr('transform', `translate(${this.size.width / 2}, ${this.size.height-this.margin.bottom})`)
                    // .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
                    .style('text-anchor', 'middle')
                    .style('font-weight', 'bold')
                    .style('font-size', '1rem')
                    .text('Fig. 3 The Job Titles of the Data Scientist of US in 2023 with salary > 300,000 USD') // text content

            
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#donut-svg').selectAll('*').remove() // Clean all the elements in the chart
                this.initChart()
            }
        },
        
    },
    
    // The following are general setup for resize events.
    mounted() {
        window.addEventListener('resize', debounce(this.onResize, 100)) 
        this.onResize()
    },
    beforeDestroy() {
       window.removeEventListener('resize', this.onResize)
    }
}

</script>

<!-- "ref" registers a reference to the HTML element so that we can access it via the reference in Vue.  -->
<!-- We use flex (d-flex) to arrange the layout-->
<template>
    <div class="chart-container-donut" ref="donutContainer">
        <svg id="donut-svg" width="100%" height="100%" >
            <!-- all the visual elements we create in initChart() will be inserted here in DOM-->
        </svg>

    </div>
</template>

<style >
.chart-container-donut{
    height: 100%;
}



</style>

