<script lang="ts">
import * as d3 from "d3";
// import Data from '../../data/demo.json'; /* Example of reading in data directly from file */
import Data from '../../data/ds_salaries.json';
// import Data from '../../data/test.json';

import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Dot, ComponentSize, Margin } from '../types';
// A "extends" B means A inherits the properties and methods from B.
interface CategoricalDot extends Dot{
    company_location: string;
    work_year: number;
}

// Computed property: https://vuejs.org/guide/essentials/computed.html
// Lifecycle in vue.js: https://vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram

export default {
    data() {
        // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
        return {
            dots: [] as CategoricalDot[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 40, right: 40, top: 10, bottom: 50} as Margin,
            tickLabels: {
                0: '2020',
                1: '2021',
                2: '2022',
                3: '2023',
            },
            SliderValue:0,
        }
    },
    computed: {
        // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
        rerender() {
            return (!isEmpty(this.dots)) && this.size
        },
        // UpdateSliderValue(){
        //     let range = this.SliderValue;
        //     // console.log(this.dots)
        //     return (this.dots).filter((d) => d.work_year === (this.tickLabels[range]));
        //     // console.log(this.tickLabels[range])
        //     // console.log(filteredData)
        //     // this.dots = filteredData
        //     // console.log(this.tickLabels[range])
        // },
    
    },
    // Anything in here will only be executed once.
    // Refer to the lifecycle in Vue.js for more details, mentioned at the very top of this file.
    created() {
        // fetch the data via GET request when we init this component. 
        // In axios anything we send back in the response are always bound to the "data" property.
        /*
        axios.get(`<some-API-endpoint>`)
            .then(resp => { 
                this.bars = resp.data; // resp.data contains the content, with the format specified by the API you use.
                return true;
            })
            .catch(error => console.log(error));
        */
        // console.log(Data);
        if (isEmpty(Data)) return;
        this.dots = Data.data;
        // console.log(this.dots)
    },
    methods: {
        onResize() {  // record the updated size of the target element
            let target = this.$refs.dotContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        // UpdateChart(){
        //     this.dots = this.UpdateSliderValue();
        //     console.log(this.dots)
        // },
        // UpdateSliderValue(){
        //     let range = this.SliderValue;
        //     // console.log(this.dots)
        //     const filteredData = (this.dots).filter((d) => d.work_year == 2020);  //this.tickLabels[range]
        //     console.log(filteredData)
        //     return filteredData;
        //     // console.log(this.tickLabels[range])
        //     // console.log(filteredData)
        //     // this.dots = filteredData
        //     // console.log(this.tickLabels[range])
        // },
        initChart() {
            // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
            let chartContainer = d3.select('#dot-svg')
            
            // Here we compute the [min, max] from the data values of the attributes that will be used to represent x- and y-axis.
            let xExtents = d3.extent(this.dots.map((d: CategoricalDot) => d.salary_in_usd as number)) as [number, number]
            // console.log(yExtents)
            // This is to get the unique categories from the data using Set, then store in an array.
            let yCategories: string[] = [ ...new Set(this.dots.map((d: CategoricalDot) => d.company_location as string))].sort()
            // console.log(yCategories)

            // We need a way to map our data to where it should be rendered within the svg (in screen pixels), based on the data value, 
            //      so the extents and the unique values above help us define the limits.
            // Scales are just like mapping functions y = f(x), where x refers to domain, y refers to range. 
            //      In our case, x should be the data, y should be the screen pixels.
            // We have the margin here just to leave some space
            // In viewport (our screen), the leftmost side always refer to 0 in the horizontal coordinates in pixels (x). 
            let yScale = d3.scalePoint()
                .range([this.size.height - this.margin.bottom, this.margin.top])
                .domain(yCategories)
            // In viewport (our screen), the topmost side always refer to 0 in the vertical coordinates in pixels (y). 
            let xScale = d3.scaleLinear()
                .range([this.margin.left, this.size.width - this.margin.right+20]) //bottom side to the top side on the screen
                .domain([0, xExtents[1]]) // This is based on your data, but if there is a natural value range for your data attribute, you should follow
                // e.g., it is natural to define [0, 100] for the exame score, or [0, <maxVal>] for counts.

            // There are other scales such as scaleOrdinal,
                // whichever is appropriate depends on the data types and the kind of visualizations you're creating.

            // This following part visualizes the axes along with axis labels.
            // Check out https://observablehq.com/@d3/margin-convention?collection=@d3/d3-axis for more details
            const xAxis = chartContainer.append('g')
                .attr('transform', `translate(0, ${this.size.height - this.margin.bottom})`)
                .call(d3.axisBottom(xScale))
                .style("font-size", "8px")

            
            // chartContainer.selectAll(".xAxis text")
            //     .data<CategoricalDot>(this.dots)
            
                

            const yAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(yScale))
                .style("font-size", "8px")
            
            const highlight = yAxis.selectAll("text")                 
                                .data(yCategories)
                                .style('fill', function (d) { if(d == ('US')||
                                                                 d == ('CA')||
                                                                 d == ('DE')||
                                                                 d == ('ES')||
                                                                 d == ('FR')||
                                                                 d == ('GB')||
                                                                 d == ('IN')){
                                                                    return 'red';
                                                                 }
                                                              
                                        
                                                              else{return "black"};})
            const yLabel = chartContainer.append('g')
                .attr('transform', `translate(${10}, ${this.size.height / 2}) rotate(-90)`)
                .append('text')
                .text('Company location')
                .style('font-size', '.9rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width - this.margin.left -40}, ${this.size.height - this.margin.top-10})`)
                .append('text')
                .text('Salary(USD)')
                .style('font-size', '.9rem')
            // "g" is grouping element that does nothing but helps avoid DOM looking like a mess
            // We iterate through each <CategoricalBar> element in the array, create a rectangle for each and indicate the coordinates, the rectangle, and the color.
            const dots = chartContainer.append('g')
                .selectAll('circle')
                .data<CategoricalDot>(this.dots) // TypeScript expression. This always expects an array of objects.
                .enter()
                .append('circle')
                // specify the left-top coordinate of the rectangle
                .attr('cx', (d: CategoricalDot) => xScale(d.salary_in_usd) as number)
                .attr('cy', (d: CategoricalDot) => yScale(d.company_location) as string)
                // specify the size of the rectangle
                .attr("stroke",function (d) { if(d.company_location == 'US'||
                                                 d.company_location == 'CA'||
                                                 d.company_location == 'DE'||
                                                 d.company_location == 'ES'||
                                                 d.company_location == 'FR'||
                                                 d.company_location == 'GB'||
                                                 d.company_location == 'IN'){
                                                 return '#454545'; //light black
                                            }
                                            else{return "#8C8C8C"};})
                .attr('fill','none')
                .attr("r",2.5)
            // console.log(xScale.ticks())
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
            // For transform, check out https://www.tutorialspoint.com/d3js/d3js_svg_transformation.htm, but essentially we are adjusting the positions of the selected elements.
            const title = chartContainer.append('g')
                .append('text') // adding the text
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top})`)
                // .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
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
        // SliderValue:{
        //     handler: 'UpdateChart',
        //     immediate: true,
        // }
        
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
        <!-- <v-slider v-model = "SliderValue" class="yearslider" id="year-slider" @input = "UpdateChart"
            :ticks="tickLabels"
            :max="3"
            :thumb-size="13"
            step="1"
            color="grey"
            thumb-color="grey"
            show-ticks="always"
            tick-size="5"
        ></v-slider> -->
    </div>
</template>

<style >
.chart-container{
    height: 100%;
    /* display: flex; */
    /* display: flex;
    position:relative; */
}


.v-slider.v-input--horizontal{
    position:absolute;
    width:45vh;
    /* margin: left 35%;; */
    /* margin-left:10vh; */
}
</style>

