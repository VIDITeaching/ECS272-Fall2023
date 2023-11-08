<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/ds_salaries.json';
// import Data from '../../data/test.json';

import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Dot, ComponentSize, Margin } from '../types';
// A "extends" B means A inherits the properties and methods from B.

interface JobInfo extends Dot{
    experience_level: string;
    salary_in_usd: number;
    company_size:string;
    remote_ratio:number;
}

export default {
    data() {
        // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
        return {
            newdata: [] as JobInfo[],
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 50, right: 50, top: 5, bottom: 60} as Margin,
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
        this.newdata = Data.data.filter((d) => (d.company_location == ('US')) &&
                                               (d.employee_residence == ('US'))&&
                                               (d.salary_currency == ('USD'))&&                                                 
                                               (d.employment_type==('FT'))&&
                                               (d.work_year==(2023)));
    },
    methods: {
        onResize() {  // record the updated size of the target element
            let target = this.$refs.lineContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        
        initChart() {
            let lineContainer = d3.select('#line-svg')
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

            var color = d3.scaleOrdinal(['#fde725','#35b779','#31688e','#440154']).domain(['EN','MI','SE','EX'])
            
            var y = {}
            y[key[0]] = yLevel
            y[key[1]] = ySalary
            y[key[2]] = ySize

            function path(d) {
                return d3.line()(key.map(function(p) { return [xScale(p), y[p](d[p])+50]; }));
            }
            let lines = lineContainer.append('g')
                .selectAll("myPath")
                .data(this.newdata)
                .enter().append("path")
                .attr("d",  path)
                .style("fill", "none")
                .style("stroke", 
                function(d){return color(d.experience_level)})
                .style("opacity", 0.7)
                .style('stroke-width', '0.8px')
            let yAxis1 = lineContainer.append("g").attr("transform", "translate(" + xScale(key[0]) + ",50)")
            .call(d3.axisLeft(yLevel))
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -15)
            .text(key[0])
            .style("fill", "black")
            .style('font-size', '.9rem')

            const yAxis2 = lineContainer.append("g")
            .attr("transform", "translate(" + xScale(key[1]) + ",50)")
            .call(d3.axisLeft(ySalary))

            const highlight = yAxis2.selectAll("text")
                                  .style('font-weight', 'bold')

            const y2title = yAxis2
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -15)
            .text(key[1])
            .style("fill", "black")
            .style('font-size', '.9rem')

            let yAxis3 = lineContainer.append("g")
            .attr("transform", "translate(" + xScale(key[2]) + ",50)")
            .call(d3.axisRight(ySize))
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -15)
            .text(key[2])
            .style("fill", "black")
            .style('font-size', '.9rem')

            const title = lineContainer.append('g')
            .append('text') 
            .attr('transform', `translate(${this.size.width / 2}, ${this.size.height-this.margin.top})`)
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('font-size', '1rem')
            .text('Fig. 2 Full Time Data Science Job Salaries of US in 2023') 
           

            
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#line-svg').selectAll('*').remove() 
                this.initChart()
            }
        },
        
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
    <div class="chart-container-line" ref="lineContainer">
        <svg id="line-svg" width="100%" height="100%" >
        </svg>

    </div>
</template>

<style >
.chart-container-line{
    height: 100%;
}
</style>

