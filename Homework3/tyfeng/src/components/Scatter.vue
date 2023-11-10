<script lang="ts">
import * as d3 from "d3";
import { isEmpty, debounce } from 'lodash';
import { state } from '../state';
import { useEventEmitter } from '../useEventEmitter';

const emitter = useEventEmitter();

interface JobPlot {
    salary_in_usd: number;
    company_size: string;
    count: number;
}

export default {
    data() {
        return {
            plots: [] as JobPlot[],
            size: { width: 0, height: 0 },
            margin: {left: 60, right: 20, top: 30, bottom: 70},
            rScale: null as any,
            yScale: null as d3.ScaleLinear<number, number> | null, 
        }
    },
    computed: {
        rerender() {
            return (!isEmpty(this.plots)) && this.size
        }
    },
    async created() {
        this.updateChart();
    },
    methods: {
        async updateChart() {
            const rawData = await d3.csv("../../data/ds_salaries.csv");
            let parsedData = rawData.map(d => ({
                salary_in_usd: Number(d.salary_in_usd ?? 0),
                company_size: d.company_size || 'na',
            }));
            const salaryRange = state.selections.get('salary_in_usd');
            if (Array.isArray(salaryRange)) {
                // If `salaryRange` is an array, it is safe to iterate over it.
                const [max, min] = salaryRange;
                parsedData = parsedData.filter((d) => d.salary_in_usd >= min && d.salary_in_usd <= max);

            } else {
                // Handle the case where 'salaryRange' is not an array
                console.log('The salary range is not defined.');
            }

            // Group by company_size and calculate average salary
            const groupedData = d3.group(parsedData, d => d.company_size);
            const aggregatedData = Array.from(groupedData, ([key, values]) => ({
                company_size: key,
                salary_in_usd: d3.mean(values, d => d.salary_in_usd) as number,
                count: values.length,
            }));
            this.plots = aggregatedData.sort((a, b) => b.count - a.count);
            const maxCount = d3.max(this.plots, d => d.count) as number;
            this.rScale = d3.scaleSqrt() // scaleSqrt is usually a good choice for area-based visual encodings
                .domain([0, maxCount])
                .range([1, 36]); // Set the range of the radius of the circle points 

            d3.select('#scatter-svg').selectAll('*').remove();
            this.initChart();
        },
        onResize() {  
            let target = this.$refs.barContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        initChart() {
            const self = this; 
            let chartContainer = d3.select<SVGSVGElement, unknown>('#scatter-svg');
            
            const zoom = d3.zoom<SVGSVGElement, unknown>()
                .scaleExtent([0.5, 10])
                .on("zoom", (event: d3.D3ZoomEvent<any, any>) => {
                    zoomed(event);
            });
            
            chartContainer.call(zoom);

            // Add a clip path to contain the items within the chart area
            chartContainer.append("defs")
                .append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", this.size.width)
                .attr("height", this.size.height);
            
            const chartContent = chartContainer.append("g")
                .attr("clip-path", "url(#clip)");
            
            const xAxisGroup = chartContainer
                .append("g")
                .classed("x-axis", true)
                .attr("transform", `translate(0, ${this.size.height - this.margin.bottom})`);

            const yAxisGroup = chartContainer
                .append("g")
                .classed("y-axis", true)
                .attr("transform", `translate(${this.margin.left}, 0)`);

            let sortedCategories = this.plots.map(d => d.company_size);

            let xScale = d3.scalePoint()
                .range([this.margin.left, this.size.width - this.margin.right])
                .domain(sortedCategories)
                .padding(1); 

            let maxSalary = d3.max(this.plots.map(d => d.salary_in_usd).filter((salary): salary is number => salary !== undefined));

            this.yScale = d3.scaleLinear()
                .range([this.size.height - this.margin.bottom, this.margin.top])
                .domain([0, maxSalary as number]).nice();

            const yLabel = chartContainer.append('g')
                .attr('transform', `translate(${10}, ${this.size.height / 2}) rotate(-90)`)
                .append('text')
                .text('Average Salary in USD')
                .style('font-size', '.8rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width / 2 - this.margin.left}, ${this.size.height - this.margin.top - 5})`)
                .append('text')
                .text('Company Size')
                .style('font-size', '.8rem')

            const tooltip = d3.select("#tooltip-scatter");
            const sizeMapping: { [key: string]: string } = {
                'S': 'Small',
                'M': 'Medium',
                'L': 'Large'
            };


            chartContainer
                .append("g")
                .attr("id", "x-axis")
                .attr("transform", `translate(0, ${this.size.height - this.margin.bottom})`)
                .call(d3.axisBottom(xScale));

            chartContainer
                .append("g")
                .attr("id", "y-axis")
                .attr("transform", `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(this.yScale));

            const color = d3.scaleOrdinal(["#1E90FF", "#FF8C00", "#32CD32"])
                .domain(["L", "M", "S"]);

            chartContent.selectAll<SVGCircleElement, JobPlot>("circle")
                .data<JobPlot>(this.plots)
                .enter()
                .append("circle")
                .attr("cx", d => xScale(d.company_size) as number)
                .attr("cy", d => this.yScale ? this.yScale(d.salary_in_usd) as number : 0)
                .attr('r', d => this.rScale ? this.rScale(d.count) : 0)
                .attr("fill", d => color(d.company_size) as string)
                .on("mouseover", (event, d) => {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`Company Size: ${sizeMapping[d.company_size]} <br>Mean Salary: ${Math.ceil(d.salary_in_usd)} <br> Data Count: ${d.count}`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });;

            const title = chartContainer.append('g')
                .append('text') 
                .attr('transform', `translate(${this.size.width / 2}, ${this.margin.top / 2})`)
                .attr('dy', '0px') 
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Average Data Science Job Salary in USD by Company Size');
            
            const note = chartContainer.append('g')
                .append('text') 
                .attr('transform', `translate(${this.size.width / 2}, ${this.margin.bottom / 2})`)
                .attr('dy', '0px') 
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('* size of the circles represents the number of jobs by company size');

            function zoomed(event: d3.D3ZoomEvent<SVGGElement, JobPlot>) {
                // Get the current transform state
                const transform = event.transform;

                // Update the y scale with the zoom transform.
                const new_y = transform.rescaleY(self.yScale as d3.ScaleLinear<number, number>);
            
                // Update the circles and axes with the new scales and visible data points
                chartContent.selectAll<SVGCircleElement, JobPlot>("circle")
                    .data<JobPlot>(self.plots)
                    .join("circle")
                    .attr("cy", d => new_y(d.salary_in_usd))
                    .attr('r', d => {
                        // Adjust the radius based on the zoom scale
                        // The transform.k is the current zoom level (scale factor)
                        const scaledRadius = self.rScale ? self.rScale(d.count) * transform.k : 0;
                        // Add limits to radius to prevent them from becoming too big or too small
                        const minRadius = 1; 
                        const maxRadius = 200;
                        return Math.max(minRadius, Math.min(maxRadius, scaledRadius));
                    })
                    .attr("fill", d => color(d.company_size) as string)
                    .on("mouseover", (event, d) => {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html(`Company Size: ${sizeMapping[d.company_size]} <br>Mean Salary: ${Math.ceil(d.salary_in_usd)} <br> Data Count: ${d.count}`)
                            .style("left", (event.pageX) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", () => {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

                // remove old y-axis
                d3.select('#y-axis').remove();    
                const yAxisGroup = d3.select<SVGGElement, unknown>('.y-axis');

                // Update the axes using the new scale and with a type assertion
                yAxisGroup.call(d3.axisLeft(new_y) as any);

            }
        
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#scatter-svg').selectAll('*').remove() 
                this.initChart()
            }
        }
    },
    mounted() {
        window.addEventListener('resize', debounce(this.onResize, 100));
        emitter.$on('update-chart', this.updateChart);
        this.onResize();
    },
    beforeDestroy() {
       window.removeEventListener('resize', this.onResize);
       emitter.$off('update-chart', this.updateChart);
    }
}
</script>

<template>
    <div class="chart-container d-flex" ref="barContainer">
        <svg id="scatter-svg" width="100%" height="100%">
        </svg>
    </div>
    <div id="tooltip-scatter" class="tooltip-scatter" style="opacity:0;">
        <p>Count: <span id="tooltip-value"></span></p>
    </div>
</template>

<style scoped>
.chart-container{
    height: 100%;
}
.tooltip-scatter {
    position: absolute;
    text-align: center;
    width: 100px;
    height: 80px;
    padding: 2px;
    font: 12px sans-serif;
    background: lightsteelblue;
    border: 0px;
    border-radius: 8px;
    pointer-events: none;
}

/* Hide the tooltip when not in use */
.tooltip-scatter {
    opacity: 0;
}
</style>