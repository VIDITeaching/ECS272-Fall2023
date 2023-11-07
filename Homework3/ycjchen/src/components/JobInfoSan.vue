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
                            .nodeWidth(5)
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
            const color = d3.scaleOrdinal(d3.schemeGnBu[4]).domain(['EN','MI','SE','EX'])
            let alllinks = lineContainer.append("g")
                        .attr("transform", d => `translate(10,20)`)
                        .attr("fill", "none")
                        .selectAll("g")
                        .data(links)
                        .join("path")
                        .attr("class","links")
                        .attr("d", d3SsankeyLinkHorizontal())
                        .attr("stroke",d => color(d.names[0]))
                        .attr("stroke-width", d => d.width)
                        .style("mix-blend-mode", "multiply")
                        .append("title")
                        .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);
            
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
                        .attr("fill","#2a2727")
                        .append("title")
                        .text(d => `${d.name}\n${d.value.toLocaleString()}`);
            let self = this
            const selection = d3.selectAll("rect.othernodes")
                                        .on('mouseover',function(){
                                            d3.select(this)
                                            .style("fill", "#A9A9A9")
                                            ;})
                                        .on('mouseout',function(){
                                            d3.select(this)
                                            .style("fill", "#2a2727");
                                        })
            const selectionSalary = d3.selectAll("rect.nodes")
                                        .on('mouseover',function(){
                                            d3.select(this)
                                            .style("fill", "red");})
                                        .on('mouseout',function(){
                                            d3.select(this)
                                            .style("fill", "#2a2727");
                                        })
                                        .on('click', function(e,d){
                                            const str = `${d.name} (USD) in ${self.country}`
                                            self.eventBusSalary.emit('salarymsg',str)
                                        })
                                    
                                    
                                      
            
            // var color = d3.scaleOrdinal(['#FFE366','#64D19E','#578FB5','#3e4989']).domain(['EN','MI','SE','EX'])
            
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
                .style("fill", function(d) { return color(d); })
                .attr('stroke', 'black') 
                .attr('stroke-width', 1) ;

            legend_rect
                .append("text")
                .attr("x", 15) // Adjust the x position to move text to the right of the rect
                .attr("y", 8) // Adjust the y position to center the text vertically
                .text(function(d) { return d; });
                        
        },
        no_chosen(){
            const box = d3.select('#line-svg').append('g')
                .append("rect")
                .attr("x", this.margin.top )
                .attr("y", this.margin.top)
                .attr("width", this.size.width-this.margin.right+20)
                .attr("height", this.size.height-this.margin.bottom+20 )
                .style("fill", " #E6E3DB")
            d3.select('#line-svg').append('g')
                .append("text")
                .attr("x", 20) // X-coordinate of the text
                .attr("y", 90) // Y-coordinate of the first line
                // .style('font-weight', 'bold')
                .style('font-size', '1.2rem')
                .style("line-height", "1.2") // Line height for spacing
                .selectAll("tspan") // Create multiple <tspan> elements for each line
                .data([
                'There is a switch at the upper left corner in Fig. 1. If you turn the switch to the left, you will',
                "see a scatter plot displayed. If it is turned right, a box plot will be displayed. You can select",
                "the country you are interested in from the y-axis. Then Fig. 2 will pop up a parallel set plot",
                "showing the correspondence between salary range, experience level and remote ratio for",
                "the data scientists in the country you select. Hover your mouse over the nodes and links in",
                "Fig. 2, the detailed information of the correspondence under the mouse will pop up. Zoom",
                "and pan your mouse to the region interesting you in Fig. 2, you will see the region displayed",
                "in a higher resolution."
                ])
                .enter()
                .append("tspan")
                .text((d) => d)
                .attr("x", this.margin.left+10) // X-coordinate for each line
                .attr("dy", "1.5em"); // Adjust the vertical spacing between lines
             

        },

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
            <p class="title">Fig. 2 Data Scientist Job Salaries with corresponding experience level and remote ratio in {{ country }}</p> 
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

