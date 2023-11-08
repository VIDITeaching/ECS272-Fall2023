<template>
    <div>
      <!-- Pie Chart container -->
      <div id="Pie Chart"></div>
      <svg ref="svg"></svg>
    </div>
  </template>
<script lang="ts">
import * as d3 from "d3";
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

interface companySize {
    company_size: string;
}
interface pie {
    key: any;
    value: number;
}


export default{
    data(){
        return{
            SizeData: [] as companySize[],
            piechartData: [] as pie[],
        }
    },
    
    
    mounted() {
    this.loadDataAndConvert().then(() => {
        this.processData();
        this.drawPieChart();
    });
    },
    methods:{
        async loadDataAndConvert() {
            const data= await d3.csv('../../data/ds_salaries.csv');
            console.log(data, " pie chart data");

            if (data && data.length > 0) {
                const piechart1 = data.map(d => ({
                company_size: (d.company_size) || '',
                }));
                this.SizeData= piechart1;

                console.log(this.SizeData, "piechart")
            }
        }, 
        processData() {
            const companySizeCounts = d3.rollup(this.SizeData, v => v.length, (d: any) => d.company_size);
            this.piechartData = Array.from(companySizeCounts, ([key, value]) => ({ key, value }));
            console.log(this.piechartData, "data for pie");
        },

        drawPieChart(){
            const margin = { top: 100, right: 50, bottom: 20, left: 100};
            const width = 500;
            const height = 600;
            const radius = Math.min(width, height) / 2 - 80;

            const color = d3.scaleOrdinal(d3.schemePastel1);
            const arc = d3.arc().innerRadius(0).outerRadius(radius);
            const labelArc = d3.arc().innerRadius(radius - 40).outerRadius(radius - 40);
            const pie = d3.pie().value(d => d.value).sort(null);

            const svg = d3.select(this.$refs.svg)
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', `translate(${width / 2}, ${height/2 - 70})`);
            
            const g = svg.selectAll('.arc')
                .data(pie(this.piechartData))
                .enter().append('g')
                .attr('class', 'arc');

            g.append('path')
                .attr('d', arc)
                .style('fill', d => color(d.data.key));

            g.append('text')
                .attr('transform', d => {
                        const [x, y] = labelArc.centroid(d);
                        const angle = (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) - 90;
                        const correctedAngle = angle > 90 || angle < -90 ? angle + 180 : angle; 
                        const isLargeSection = (d.endAngle - d.startAngle) > Math.PI;
                        return `translate(${x}, ${y}) rotate(${correctedAngle})`;
                })
                .attr('dy', '0.5em')
                .attr('text-anchor', 'middle')
                .style('font-size', '15px')
                .text(d => `${d.data.key} (${d3.format('.1%')(d.data.value / d3.sum(this.piechartData, d => d.value))})`);

            svg.append("text")
                .attr("x", 10) 
                .attr("y", -radius- 30) 
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Percentage of Company Sizes')
            
            const labels = this.piechartData.map(d => d.key);


            // Define legend's position and dimensions
            const legendRectSize = 18; // Defines the size of the colored squares
            const legendSpacing = 4;   // Defines the space between squares

            // Create a group for the entire legend
            const legend = svg.selectAll('.legend') 
                .data(color.domain()) 
                .enter()                
                .append('g')           
                .attr('class', 'legend') 
                .attr('transform', function(d, i) {                   
                    const height = legendRectSize + legendSpacing; 
                    const offset = height * color.domain().length / 2; 
                    const horz = -14 * legendRectSize;
                    const vert = i * height - offset;
                    return `translate(${horz},${vert})`;  
                }); 

            // Add a rectangle to each group in the legend
            legend.append('rect')                                    
                .attr('width', legendRectSize)                        
                .attr('height', legendRectSize)                       
                .style('fill', color)                                
                .style('stroke', color);                            

            // Add a label next to each rectangle in the legend
            legend.append('text')                                    
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .attr('font-size', '12px') 
                .text(function(d) { 
                    // Switch based on the data to append the descriptive text
                    switch(d) {
                        case 'L':
                            return 'L - Large';
                        case 'M':
                            return 'M - Mid';
                        case 'S':
                            return 'S - Small';
                        default:
                            return d; 
                    }
                });                     

        }
            
    }
}
</script>