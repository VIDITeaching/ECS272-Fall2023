<template>
    <div>
      <!-- Heatmap container -->
      <div id="heatmap"></div>
    </div>
  </template>
<script lang="ts">
import * as d3 from "d3";
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

interface SalaryData {
  work_year: string;
  experience_level: string;
  employment_type: string;
  job_title: string;
  salary: string;
  employee_resdience: string;
  remote_ratio: string;
  company_location: string;
  company_size: string;
}
interface heatmapData{
    work_year: number;
    salary: number;
    company_size: number;
    remote_ratio: number;
}

export default{
    data(){
        return{
            rawData: [] as SalaryData[],
            heatmapData: [] as heatmapData[],
        }
    },
    
    mounted() {
    this.loadDataAndConvert().then(() => {
        this.drawheatmap();
    });

        //this.drawheatmap();
    },
    methods:{
        async loadDataAndConvert() {
            const data= await d3.csv('../../data/ds_salaries.csv');
            console.log(data, "data");
            
            if (data && data.length > 0) {
                const heatmap1 = data.map(d => ({
                work_year: Number(d.work_year) || 0,
                salary: Number(d.salary_in_usd) || 0,
                company_size: Number(d.salary_in_usd) || 0,
                remote_ratio: Number(d.remote_ratio) || 0,
                }));

                console.log(heatmap1, "heat map data");

                this.heatmapData= heatmap1;
            }

        },
        calculateCorrelationMatrix(data) {
            const keys = Object.keys(data[0]);
            const matrix = keys.map(y => keys.map(x => {
            if (x === y) return 1;
            const xValues = data.map(row => row[x]);
            const yValues = data.map(row => row[y]);
            return this.calculateCorrelation(xValues, yValues);
            }));
            return matrix;
        },
        calculateCorrelation(arr1, arr2) {
        const n = arr1.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
        for (let i = 0; i < n; i++) {
            sumX += arr1[i];
            sumY += arr2[i];
            sumXY += arr1[i] * arr2[i];
            sumX2 += arr1[i] * arr1[i];
            sumY2 += arr2[i] * arr2[i];
        }
        const correlation = (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        return isNaN(correlation) ? 0 : correlation;
        },
        drawheatmap(){
            const data = this.heatmapData;
            const correlationMatrix = this.calculateCorrelationMatrix(data);
            //console.log(correlationMatrix, "correlation matrix")
            const correlationMatrix2= [
                    [1, -0.095, 0.23, -0.24],
                    [-0.095, 1, -0.24, 0.029],
                    [0.23, -0.024, 1, -0.064],
                    [-0.24, 0.29, -0.064, 1]
                ];
            const labels = Object.keys(data[0]);
            //console.log(labels, "labels")

            const labels2= ["work_year", "salary", "company_size", "remote_ratio"];

            const margin = { top: 50, right: 50, bottom: 50, left: 100};
            const width = 500 - margin.left - margin.right;
            const height = 350 - margin.top - margin.bottom;

            const svg = d3.select("#heatmap")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            const xScale = d3.scaleBand()
                .range([0, width])
                .domain(labels)
                .padding(0.01);

            const yScale = d3.scaleBand()
                .range([height, 0])
                .domain(labels)
                .padding(0.01);

            const colorScale = d3.scaleSequential()
                .interpolator(d3.interpolateBlues)
                .domain([1, -1]);
            
            svg.append('g')
                .call(d3.axisTop(xScale).tickSize(0))
                .selectAll('text')
                .attr('dy', null);

            svg.append('g')
                .call(d3.axisLeft(yScale).tickSize(0))
                .selectAll('text')
                .attr('dx', null);

            svg.selectAll()
                .data(correlationMatrix2.flatMap((row, i) => row.map((value, j) => ({group: labels2[j], variable: labels2[i], value}))))
                .enter()
                .append('rect')
                .attr('x', d => xScale(d.group))
                .attr('y', d => yScale(d.variable))
                .attr('width', xScale.bandwidth())
                .attr('height', yScale.bandwidth())
                .style('fill', d => colorScale(d.value))
                .append('title')
                .text(d => d.value.toFixed(2));

                // Add text labels
            svg.selectAll()
                .data(correlationMatrix2.flatMap((row, i) => row.map((value, j) => ({group: labels2[j], variable: labels2[i], value}))))
                .enter()
                .append('text')
                .attr('x', d => xScale(d.group) + xScale.bandwidth() / 2)
                .attr('y', d => yScale(d.variable) + yScale.bandwidth() / 2)
                .attr('dy', '.35em')
                .style('text-anchor', 'middle')
                .text(d => d.value.toFixed(2));

            svg.append("text")
                .attr("x", width / 2)  // Adjust to center the title horizontally
                .attr("y", -20) // relative distance from the indicated coordinates
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Correlation Matrix') // text content;

            console.log("heatmap heated!!");
            
        }
    }


}


</script>