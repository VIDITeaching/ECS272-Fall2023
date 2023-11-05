<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/ds_salaries.json';
import app from '../main.js';
// import Data from '../../data/test.json';

import axios from 'axios';
import { isEmpty, debounce } from 'lodash';
import {ref, watch} from 'vue';
import { Dot, ComponentSize, Margin } from '../types';
// A "extends" B means A inherits the properties and methods from B.

// let country = ref('US');
interface JobInfo extends Dot{
    experience_level: string;
    salary_in_usd: number;
    company_size:string;
    remote_ratio:string;
}

export default {
    inject: ['eventBus'],
    data() {
        // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
        return {
            newdata: [] as JobInfo[],
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 50, right: 50, top: 5, bottom: 60} as Margin,
            country: 'US',
        }
    },
    computed: {
        // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
        rerender() {
            return (!isEmpty(this.newdata)) && this.size
        },
        update_country(){
            this.eventBus.on('countrymsg',(data)=>{this.country = data})
            
            
        },
        

    
    },
    // Anything in here will only be executed once.
    // Refer to the lifecycle in Vue.js for more details, mentioned at the very top of this file.
    created() {
        if (isEmpty(Data)) return;
        this.eventBus.on('countrymsg',(data)=>{this.country = data; })
        this.newdata = Data.data
        
    },
    methods: {
        onResize() {  // record the updated size of the target element
            let target = this.$refs.lineContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        
        initChart() {
            d3.select('#line-svg').selectAll('*').remove()
            let lineContainer = d3.select('#line-svg')
            let key:string[] = ['experience_level','salary_in_usd','remote_ratio']
            const updatedData = this.newdata.map((d) => ({
                    ...d,
                    remote_ratio: d.remote_ratio.toString()
            }));
            let yLevel = d3.scalePoint()
                          .domain(['EX','SE','MI','EN'])
                          .range([this.margin.top ,this.size.height-this.margin.bottom])
            let ySalary = d3.scaleLinear()
                            .domain(d3.extent(this.newdata.map((d: JobInfo) => d.salary_in_usd as number)).reverse() as [number, number])
                            .range([this.margin.top ,this.size.height-this.margin.bottom])
            let ySize = d3.scalePoint()
                         .domain(['100','50','0'])
                        .range([this.margin.top ,this.size.height-this.margin.bottom])
            
            let xScale = d3.scalePoint()
                  .range([this.margin.left, this.size.width-this.margin.right])
                  .padding(0.01)
                  .domain(key);

            var color = d3.scaleOrdinal(['#FFBF00','#35b779','#31688e','#440154']).domain(['EN','MI','SE','EX'])
            
            var y = {}
            y[key[0]] = yLevel
            
            y[key[1]] = ySalary
            
            y[key[2]] = ySize
            
            function path(d) {
                return d3.line()(key.map(function(p) { return [xScale(p), y[p](d[p])+50]; }));
            }
            let lines = lineContainer.append('g')
                .selectAll("myPath")
                .data(updatedData)
                .enter().append("path")
                .attr("d",  path)
                .style("fill", "none")
                .style("stroke", 
                function(d){return color(d.experience_level)})
                .style("opacity", 0.7)
                .style('stroke-width', '1.2px')
            let axes = lineContainer.append("g")
                        .selectAll("g")
                        .data(key)
                        .join("g")
                        .attr("transform", d => `translate(${xScale(d)},50)`)
                        .each(function(d) { d3.select(this).call(d3.axisLeft(y[d])); })
                        .call(g => g.append("text")
                            .attr("x",-5)
                            .attr("y", -15)
                            .attr("text-anchor", "middle")
                            .attr("fill", "black")
                            .style('font-size', '.9rem')
                            .text(d => d))
                        .call(g => g.selectAll("text")
                            .clone(true).lower()
                            .attr("fill", "none")
                            .attr("stroke-width", 2)
                            .attr("stroke-linejoin", "round")
                            .attr("stroke", "white"));
            const yAxis = axes.nodes()
            const yAxis2 = yAxis[1]
            const deselectedColor = "#ddd";
            const brushwidth = 50;
            const brush = d3.brushY()
                            .extent([[-(brushwidth/2), 0], [brushwidth/2, this.size.height-this.margin.bottom]])
                            .on("brush", brushed);

            d3.select(yAxis2).call(brush);
            const selections = new Map();

            function brushed({selection}, key) {
                if (selection === null) selections.delete(key);
                else selections.set(key, selection.map(y[key].invert));
                // console.log(selections)
                const selected = [];
                lines.each(function(d) {
                    // console.log(d)
                    const active = Array.from(selections).every(([key, [max, min]]) => { return (d[key] >= min && d[key] <= max);});
                    d3.select(this).style("stroke", active ? color(d.experience_level) : deselectedColor); 
                    if (active) {
                        d3.select(this).raise();
                        selected.push(d);
                    }
                });
                
            }    
           
            
            

            
        },
        updateChart(){
            d3.select('#line-svg').selectAll('*').remove() //clean the path from the last choice
            let lineContainer = d3.select('#line-svg')
            let key:string[] = ['experience_level','salary_in_usd','remote_ratio']
            let yLevel = d3.scalePoint()
                          .domain(['EN','MI','SE','EX'])
                          .range([this.size.height - this.margin.bottom-25, 0])
            let ySalary = d3.scaleLinear()
                            .domain(d3.extent(this.newdata.map((d: JobInfo) => d.salary_in_usd as number)) as [number, number])
                            .range([this.size.height- this.margin.bottom-25, 0])

            
            const updatedData = this.newdata.map((d) => ({
                    ...d,
                    remote_ratio: d.remote_ratio.toString()
            }));

            
            let ySize = d3.scalePoint()
                         .domain(['0','50','100'])
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
                .data(updatedData)
                .enter().append("path")
                .attr("class",'allpath')
                .attr("d",  path)
                .style("fill", "none")
                .style("stroke", 
                         function(d){return color(d.experience_level);}) //color(d.experience_level);
                .style("opacity", 0.7)
                .style('stroke-width', '0.8px')

            const yAxis1 = lineContainer.append("g")
                .attr("transform", "translate(" + xScale(key[0]) + ",50)")
                .call(d3.axisLeft(yLevel))
                .style('font-size', '.9rem')
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
                // this.initChart()
            }
        },
        country: function(value){
            
            this.newdata = Data.data.filter((d) => (d.company_location == value))
                       
            this.initChart()
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
        <div class="titlebox">
            <p class="title">Fig. 2 Data Science Job Salaries of {{ country }}</p>
        </div>
    </div>
</template>

<style >
.chart-container-line{
    height: 100%;
}

.title{
    font-weight: bold;
    font-size: 1rem;
    text-align: center;
}
</style>

