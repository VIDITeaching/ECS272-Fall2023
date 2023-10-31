<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/ds_salaries.json';

import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Dot, ComponentSize, Margin } from '../types';
// A "extends" B means A inherits the properties and methods from B.
interface CategoricalDot extends Dot{
    company_location: string;
    work_year: number;
    experience_level: string;
    company_size:string;
}

// Computed property: https://vuejs.org/guide/essentials/computed.html
// Lifecycle in vue.js: https://vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram

export default {
    data() {
        // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
        return {
            dots: [] as CategoricalDot[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 40, right: 40, top: 25, bottom: 35} as Margin,
            tickLabels: {
                0: '2020',
                1: '2021',
                2: '2022',
                3: '2023',
            },
            // tickLabels: {
            //     0: 'EN',
            //     1: 'MI',
            //     2: 'SE',
            //     3: 'EX',
            // },
            
            SliderValue:0,
        }
    },
    computed: {
        // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
        rerender() {
            
            // console.log(this.dots)
            // console.log(this.tickLabels[range])
            return (!isEmpty(this.dots)) && this.size 
        },
        updateChart(){ //will update the chart if slider value is change
            d3.select('#dot-svg').selectAll('circle').remove() //clean the dot we draw with last selection
            // console.log(this.SliderValue)
            let range = this.SliderValue
            // console.log(this.tickLabels[range])
            let chosen_year = this.tickLabels[range]
            let certain_year_data = this.dots.filter((d)=> (d.work_year== (chosen_year)))
            let others = this.dots.filter((d)=> (d.work_year != (chosen_year)))
            
            let chartContainer = d3.select('#dot-svg')
            let xExtents = d3.extent(this.dots.map((d: CategoricalDot) => d.salary_in_usd as number)) as [number, number]
            let yCategories: string[] = [ ...new Set(this.dots.map((d: CategoricalDot) => d.company_location as string))].sort()

            
            let yScale = d3.scalePoint()
                .range([this.size.height - this.margin.bottom, this.margin.top])
                .domain(yCategories)
            
            let xScale = d3.scaleLinear()
                .range([this.margin.left, this.size.width - this.margin.right+20]) 
                .domain([0, xExtents[1]]) 
            const dots_grey = chartContainer.append('g')
                .selectAll('circle')
                .data<CategoricalDot>(others)
                .enter()  
                .append('circle')
                .attr('cx', (d: CategoricalDot) => xScale(d.salary_in_usd) as number)
                .attr('cy', (d: CategoricalDot) => yScale(d.company_location) as string)
                .attr("stroke","#BDBDBD")
                .attr('fill','none')
                .attr("r",2.5)

            const dots_chosen = chartContainer.append('g')
                .selectAll('circle')
                .data<CategoricalDot>(certain_year_data) 
                .enter()  
                .append('circle')
                .attr('cx', (d: CategoricalDot) => xScale(d.salary_in_usd) as number)
                .attr('cy', (d: CategoricalDot) => yScale(d.company_location) as string)
                .attr("stroke","black")
                .attr('fill','none')
                .attr("r",0)
                .transition()
                .duration(300)
                .attr("r",2.5)
            
        }

        
    
    },
    // Anything in here will only be executed once.
    // Refer to the lifecycle in Vue.js for more details, mentioned at the very top of this file.
    created() {
        
        if (isEmpty(Data)) return;
        this.dots = Data.data;
    },
    methods: {
        onResize() {  // record the updated size of the target element
            let target = this.$refs.dotContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
            
        },
        
        initChart() {
            let chartContainer = d3.select('#dot-svg')
            
            let xExtents = d3.extent(this.dots.map((d: CategoricalDot) => d.salary_in_usd as number)) as [number, number]
            let yCategories: string[] = [ ...new Set(this.dots.map((d: CategoricalDot) => d.company_location as string))].sort()

            
            let yScale = d3.scalePoint()
                .range([this.size.height - this.margin.bottom, this.margin.top])
                .domain(yCategories)
            
            let xScale = d3.scaleLinear()
                .range([this.margin.left, this.size.width - this.margin.right+20]) 
                .domain([0, xExtents[1]]) 
           
            const xAxis = chartContainer.append('g')
                .attr('transform', `translate(0, ${this.size.height - this.margin.bottom})`)
                .call(d3.axisBottom(xScale))
                .style("font-size", "8px")                

            const yAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(yScale))
                .style("font-size", "8px")
            
            const highlight = yAxis.selectAll("text")                 
                                .data(yCategories)
                                .style('fill', "black")
            const yLabel = chartContainer.append('g')
                .attr('transform', `translate(${10}, ${this.size.height / 2}) rotate(-90)`)
                .append('text')
                .text('Company location')
                .style('font-size', '.9rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width - this.margin.left -40}, ${this.size.height -6})`)
                .append('text')
                .text('Salary(USD)')
                .style('font-size', '.9rem')
           
            // const dots = chartContainer.append('g')
            //     .selectAll('circle')
            //     .data<CategoricalDot>(this.dots) // TypeScript expression. This always expects an array of objects.
            //     .enter()
            //     .append('circle')
            //     .attr('cx', (d: CategoricalDot) => xScale(d.salary_in_usd) as number)
            //     .attr('cy', (d: CategoricalDot) => yScale(d.company_location) as string)
            //     .attr("stroke",function (d) { return "#8C8C8C"})
            //     .attr('fill','none')
            //     .attr("r",2.5)
            const grid = chartContainer.append('g')
                .selectAll('line')
                .data(xScale.ticks())
                .enter()
                .append('line')
                .attr('x1', d => {return xScale(d)})
                .attr('x2', d => xScale(d))
                .attr('y1', this.margin.top)
                .attr('y2', this.size.height - this.margin.bottom)
                .style('stroke','lightgrey')
                .style('opacity',0.3)
            const grid2 = chartContainer.append('g')
            .selectAll('line')
            .data(yCategories)
            .enter()
            .append('line')
            .attr('x1', this.margin.left)
            .attr('x2', this.size.width-this.margin.right+20)
            .attr('y1', d=> yScale(d))
            .attr('y2', d=> yScale(d))
            .style('stroke','lightgrey')
            .style('opacity',0.3)
            const title = chartContainer.append('g')
                .append('text') // adding the text
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - 3})`)
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .style('font-size', '1rem')
                .text('Fig.1 Data Scientist Salaries in different Countries') // text content
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#dot-svg').selectAll('*').remove() // Clean all the elements in the chart
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
    <div class="chart-container" ref="dotContainer">
        <svg id="dot-svg" width="100%" height="100%">
            <!-- all the visual elements we create in initChart() will be inserted here in DOM-->
        </svg>
        <v-slider v-model = "SliderValue" class="yearslider" id="year-slider" @input="updateChart" 
            :ticks="tickLabels"
            :max="3"
            :thumb-size="15"
            step="1"
            color="blue"
            thumb-color="blue"
            label="work year"
            show-ticks="always"
            tick-size="5"
        ></v-slider>
    </div>
</template>

<style >
.chart-container{
    height: 100%;
}


.yearslider{
    display: absolute;
    bottom:57.5rem;
    left:18rem;
}
.v-slider.v-input--horizontal{
    position:absolute;
    width:43vh;
}
</style>

