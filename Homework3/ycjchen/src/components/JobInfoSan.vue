<script lang="ts">
import * as d3 from "d3";
import { sankey as d3Sankey, sankeyLinkHorizontal as d3SsankeyLinkHorizontal } from 'd3-sankey';
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
    cat_salary:string;
}

export default {
    inject: ['eventBus','eventBusSalary'],
    data() {
        // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
        return {
            newdata: [] as JobInfo[],
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 50, right: 50, top: 10, bottom: 30} as Margin,
            country: 'your interested country',
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
        initSan(){
            d3.select('#line-svg').selectAll('*').remove()
            let lineContainer = d3.select('#line-svg').append("g")
                                    .call(d3.zoom().on("zoom", function (e) {
                                        lineContainer.attr("transform", e.transform)
                                    }))
            // Define the salary categories and their corresponding ranges
            const salaryCategories = [
            { range: [0, 50000], category: "0-50k" },
            { range: [50000, 100000], category: "50-100k" },
            { range: [100000, 150000], category: "100-150k" },
            { range: [150000, 200000], category: "150-200k" },
            { range: [200000, 250000], category: "200-250k" },
            { range: [250000, 300000], category: "250-300k" },
            { range: [300000, 450000], category: ">300k" },
            ];
            
            this.newdata.forEach((item) => {
                const salary = item.salary_in_usd;
                const category = salaryCategories.find((cat) => salary >= cat.range[0] && salary < cat.range[1]);
                item.cat_salary = category ? category.category : "Unknown";
            });
            const updatedData = this.newdata.map((d) => ({
                    ...d,
                    remote_ratio: d.remote_ratio.toString()
            }));
            // Define possible values for each property
            const experienceLevels = ["EX","SE","MI","EN"];
            const catSalaries = [">300k","250-300k", "200-250k","150-200k","100-150k","50-100k","0-50k"]; 
            const remoteRatios = ["100", "50", "0"];

            // Iterate over the combinations and count occurrences
            // console.log(this.newdata);
            const result=[]
            experienceLevels.forEach((experienceLevel) => {
                catSalaries.forEach((catSalary) => {
                    remoteRatios.forEach((remoteRatio) => {
                        const count = updatedData.filter((item) =>
                            item.experience_level === experienceLevel &&
                            item.cat_salary === catSalary &&
                            item.remote_ratio === remoteRatio
                        ).length;
                        // console.log(count)

                    result.push({
                        "experience-level": experienceLevel,
                        "cat_salary": catSalary,
                        "remote-ratio": remoteRatio,
                        "value": count,
                    });
                    });
                });
            });

            // console.log(result);
            
            const keys = ["experience-level","cat_salary","remote-ratio"]
            let index = -1;
            const Nodes = [];
            const nodeByKey = new d3.InternMap([], JSON.stringify);;
            const indexByKey = new d3.InternMap([], JSON.stringify);;
            const Links = [];

            for (const k of keys) {
                for (const d of result) {
                const key = [k, d[k]];
                if (nodeByKey.has(key)) continue;
                const node = {name: d[k]};
                Nodes.push(node);
                nodeByKey.set(key, node);
                indexByKey.set(key, ++index);
                }
            }

            for (let i = 1; i < keys.length; ++i) {
                const a = keys[i - 1];
                const b = keys[i];
                const prefix = keys.slice(0, i + 1);
                const linkByKey = new d3.InternMap([], JSON.stringify);
                for (const d of result) {
                const names = prefix.map(k => d[k]);
                const value = d.value || 0;
                let link = linkByKey.get(names);
                if (link) { link.value += value; continue; }
                link = {
                    source: indexByKey.get([a, d[a]]),
                    target: indexByKey.get([b, d[b]]),
                    names,
                    value
                };
                Links.push(link);
                linkByKey.set(names, link);
                }
            }
            
            const sankey = d3Sankey()
                            .nodeSort(null)
                            .linkSort(null)
                            .nodeWidth(3)
                            .nodePadding(15)
                            .extent([[0, 0], [this.size.width-this.margin.right, this.size.height-this.margin.bottom]])

            const {nodes, links} = sankey({
                nodes: Nodes.map(d => Object.create(d)),
                links: Links.map(d => Object.create(d))
            });
            // console.log({nodes, links})
            let axislabel1 = lineContainer.append("g")
                            .append('text')
                            .attr("transform", d => `translate(${this.margin.left-10},${this.margin.top})`)
                            .style('text-anchor', 'middle')
                            .style('font-size', '1rem')
                            .text('experience level') // text content
            let axislabel2 = lineContainer.append("g")
                            .append('text')
                            .attr("transform", d => `translate(${this.size.width / 2},${this.margin.top})`)
                            .style('text-anchor', 'middle')
                            .style('font-size', '1rem')
                            .text('salary (USD)') // text content
            let axislabel3 = lineContainer.append("g")
                            .append('text')
                            .attr("transform", d => `translate(${this.size.width-this.margin.right},${this.margin.top})`)
                            .style('text-anchor', 'middle')
                            .style('font-size', '1rem')
                            .text('remote ratio (%)') // text content
                
            let allnodes = lineContainer.append("g")
                        .attr("transform", d => `translate(10,20)`)
                        .selectAll("rect")
                        .data(nodes)
                        .join("rect")
                        .attr("class",function(d){
                                                    if(!experienceLevels.includes(d.name) && !remoteRatios.includes(d.name)){
                                                        return "nodes"
                                                    }
                                                    else{
                                                        return "othernodes"
                                                 }})
                        .attr("x", d => d.x0)
                        .attr("y", d => d.y0)
                        .attr("height", d => d.y1 - d.y0)
                        .attr("width", d => d.x1 - d.x0 +2)
                        .attr("fill","dark grey")
                        .append("title")
                        .text(d => `${d.name}\n${d.value.toLocaleString()}`);
            let self = this
            const selection = d3.selectAll("rect.nodes")
                                        .on('click', function(e,d){
                                            const str = `${self.country} with ${d.name}`
                                            self.eventBusSalary.emit('salarymsg',str)
                                        })
                                    
                                    
                                      
            const color = d3.scaleOrdinal(d3.schemeGnBu[4]).domain(['EN','MI','SE','EX'])
            // var color = d3.scaleOrdinal(['#FFE366','#64D19E','#578FB5','#3e4989']).domain(['EN','MI','SE','EX'])
            let alllinks = lineContainer.append("g")
                        .attr("transform", d => `translate(10,20)`)
                        .attr("fill", "none")
                        .selectAll("g")
                        .data(links)
                        .join("path")
                        .attr("d", d3SsankeyLinkHorizontal())
                        .attr("stroke",d => color(d.names[0]))
                        .attr("stroke-width", d => d.width)
                        .style("mix-blend-mode", "multiply")
                        .append("title")
                        .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);
            let labels = lineContainer.append("g")
                        .attr("transform", d => `translate(10,20)`)
                        .style("font", "10px sans-serif")
                        .selectAll("text")
                        .data(nodes)
                        .join("text")
                        .attr("x", d => d.x0 < this.size.width / 2 ? d.x1 + 6 : d.x0 - 6)
                        .attr("y", d => (d.y1 + d.y0) / 2)
                        .attr("dy", "0.35em")
                        .attr("text-anchor", d => d.x0 < this.size.width / 2 ? "start" : "end")
                        .text(d => d.name)
            let legend_rect = lineContainer.selectAll("mydots")
                            .data(experienceLevels)
                            .enter()
                            .append("g") // Create a container <g> for both rect and text
                            .attr("class", "legend-item")
                            .attr("transform", function(d, i) { return "translate(" + (400 + i * 35) + "," + 300 + ")"; });

            legend_rect
                .append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", function(d) { return color(d); });

            legend_rect
                .append("text")
                .attr("x", 15) // Adjust the x position to move text to the right of the rect
                .attr("y", 8) // Adjust the y position to center the text vertically
                .text(function(d) { return d; });
            // let legend_rect = lineContainer.selectAll("mydots")
            //             .data(experienceLevels)
            //             .enter()
            //             .append("rect")
            //             .attr("x", function(d,i){ return 450+i*15})//this.size.width-this.margin.right*2
            //             .attr("y", this.size.height-this.margin.bottom)
            //             .attr("width",10)
            //             .attr("height",10) 
            //             .style("fill", function(d){ return color(d)})
            // legend_rect.selectAll('rect').append('g')
            //             .data(experienceLevels)
            //             .enter()
            //             .append("text")
            //             .text(d=>d)
                        
        },
        no_chosen(){
            const box = d3.select('#line-svg').append('g')
                .append("rect")
                .attr("x", this.margin.top )
                .attr("y", this.margin.top)
                .attr("width", this.size.width-this.margin.right)
                .attr("height", this.size.height-this.margin.bottom+20 )
                .style("fill", " #E6E3DB")
            d3.select('#line-svg').append('g')
                .append('text')
                .attr('transform', `translate(${(this.size.width)/ 4.3}, ${this.margin.top+20+(this.size.height-this.margin.bottom)/2})`)
                .style('font-weight', 'bold')
                .style('font-size', '1rem')
                .text('choose the country from the y-axis of the scatter plot first')
             

        },
        initChart() {
            d3.select('#line-svg').selectAll('*').remove()
            let lineContainer = d3.select('#line-svg')
            let key:string[] = ['experience_level','salary_in_usd']
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
            // let ySize = d3.scalePoint()
            //              .domain(['100','50','0'])
            //             .range([this.margin.top ,this.size.height-this.margin.bottom])
            
            let xScale = d3.scalePoint()
                  .range([this.margin.left, this.size.width-this.margin.right])
                  .padding(0.01)
                  .domain(key);

            var color = d3.scaleOrdinal(['#FFBF00','#35b779','#31688e','#6A1B78']).domain(['EN','MI','SE','EX'])
            
            var y = {}
            y[key[0]] = yLevel
            
            y[key[1]] = ySalary
            
            // y[key[2]] = ySize
            
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
                this.no_chosen()
            }
        },
        country: function(value){
            
            this.newdata = Data.data.filter((d) => (d.company_location == value))
                       
            this.initSan()
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
        <div class="titlebox" >
            <p class="title">Fig. 2 Data Science Job Salaries with their experience level and remote ratio  in {{ country }}</p> 
            <!-- -->
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

