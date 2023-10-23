<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/ds_salaries.json';
// import Data from '../../data/test.json';

import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Dot, ComponentSize, Margin, Key } from '../types';
// A "extends" B means A inherits the properties and methods from B.

interface JobInfo extends Dot{
    experience_level: string;
    salary_in_usd: number;
    company_size:string;
    remote_ratio:number;
}
// interface YData {
//   yWorkYear: number[];
//   yLevel: string[];
//   ySalary: [number, number];
//   ySize: string[];
// }
// interface YData {
//   [key: string]: d3.ScaleLinear<number, number> | d3.ScalePoint<string>;
//   yWorkYear: d3.ScaleLinear<number, number>;
//   yLevel: d3.ScalePoint<string>;
//   ySalary: d3.ScaleLinear<number, number>;
//   ySize: d3.ScalePoint<string>;
// }
// Computed property: https://vuejs.org/guide/essentials/computed.html
// Lifecycle in vue.js: https://vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram

export default {
    data() {
        // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
        return {
            // dots: [] as JobInfo[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
            newdata: [] as JobInfo[],
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 50, right: 50, top: 10, bottom: 60} as Margin,
            // keys: ['work_year','experience_level','salary_in_usd','company_size'
            // ] as Array<String>,
        }
    },
    computed: {
        // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
        rerender() {
            return (!isEmpty(this.newdata)) && this.size
        },

    
    },
    // Anything in here will only be executed once.
    // Refer to the lifecycle in Vue.js for more details, mentioned at the very top of this file.
    created() {
        if (isEmpty(Data)) return;
        // this.dots = Data.data;
        this.newdata = Data.data.filter((d) => (d.company_location == ('US')) &&
                                               (d.employee_residence == ('US'))&&
                                               (d.salary_currency == ('USD'))&&                                                 
                                               (d.employment_type==('FT'))&&
                                               (d.work_year==(2023)));
        // console.log(this.dots)
        // console.log(this.newdata)
    },
    methods: {
        onResize() {  // record the updated size of the target element
            let target = this.$refs.lineContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        
        initChart() {
            // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
            let lineContainer = d3.select('#line-svg')
            // console.log(this.dots)
            let key:string[] = ['experience_level','salary_in_usd','company_size']

            

            let yLevel = d3.scalePoint()
                          .domain(['EN','MI','SE','EX'])
                          .range([this.size.height - this.margin.bottom-25, 0])
            let ySalary = d3.scaleLinear()
                            .domain(d3.extent(this.newdata.map((d: JobInfo) => d.salary_in_usd as number)) as [number, number])
                            .range([this.size.height- this.margin.bottom-25, 0])
            let ySize = d3.scalePoint()
                         .domain(['S','M','L'])
                        .range([this.size.height- this.margin.bottom-25, 0])
            
            let xScale = d3.scalePoint()
                  .range([this.margin.left, this.size.width-this.margin.right])
                  .padding(0.01)
                  .domain(key);

            var color = d3.scaleOrdinal(['#fde725','#41ae76','#081d58']).domain(['S','M','L'])
            
            var y = {}
            y[key[0]] = yLevel
            y[key[1]] = ySalary
            y[key[2]] = ySize
            // console.log(y)
            
              // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
            function path(d) {
                return d3.line()(key.map(function(p) { return [xScale(p), y[p](d[p])+50]; }));
            }
            //ordinal color map
            // Draw the lines
            let lines = lineContainer.append('g')
                .selectAll("myPath")
                .data(this.newdata)
                .enter().append("path")
                .attr("d",  path)
                .style("fill", "none")
                .style("stroke", 
                function (d) { if(d.company_size == 'L'){
                                                 return 'red';
                                            }
                                            else{return "#D3D3D3"};})  //function(d){return color(d.company_size)})
                .style("opacity", 0.5)
                .style('stroke-width', '1px')
            let yAxis1 = lineContainer.append("g").attr("transform", "translate(" + xScale(key[0]) + ",50)")
            .call(d3.axisLeft(yLevel))
            // Add axis title
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -15)
            .text(key[0])
            .style("fill", "black")
            .style('font-size', '.9rem')

            let yAxis2 = lineContainer.append("g")
            // I translate this element to its right position on the x axis
            .attr("transform", "translate(" + xScale(key[1]) + ",50)")
            // And I build the axis with the call function
            .call(d3.axisLeft(ySalary))
            // Add axis title
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -15)
            .text(key[1])
            .style("fill", "black")


            let yAxis3 = lineContainer.append("g")
            // I translate this element to its right position on the x axis
            .attr("transform", "translate(" + xScale(key[2]) + ",50)")
            // And I build the axis with the call function
            .call(d3.axisLeft(ySize))
            // Add axis title
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -15)
            .text(key[2])
            .style("fill", "black")

            const title = lineContainer.append('g')
            .append('text') // adding the text
            .attr('transform', `translate(${this.size.width / 2}, ${this.size.height-this.margin.top})`)
            // .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('font-size', '1rem')
            .text('Fig.2 Data Scientist with different Salaries in 2023 US') // text content
           

            
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#line-svg').selectAll('*').remove() // Clean all the elements in the chart
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
    <div class="chart-container-line" ref="lineContainer">
        <svg id="line-svg" width="100%" height="100%" >
            <!-- all the visual elements we create in initChart() will be inserted here in DOM-->
        </svg>

    </div>
</template>

<style >
.chart-container-line{
    height: 100%;
    /* display: flex; */
    /* 
    position:relative; */
}



</style>

