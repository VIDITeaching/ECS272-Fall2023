<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/average_remote_ratio.json';
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Line, ComponentSize, Margin } from '../types';
// A "extends" B means A inherits the properties and methods from B.
interface jobTitleBar extends Line{
    job_title: string;
}


// Computed property: https://vuejs.org/guide/essentials/computed.html
// Lifecycle in vue.js: https://vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram

export default {
    data() {
        // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
        return {
            bars: [] as jobTitleBar[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
            size: { width: 10, height: 0 } as ComponentSize,
            margin: {left: 60, right: 0, top: 10, bottom: 100} as Margin,
        }
    },
    computed: {
        // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
        rerender() {
            return (!isEmpty(this.bars)) && this.size
        }
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
        console.log(Data);
        if (isEmpty(Data)) return;
        this.bars = Data.data;
    },
    methods: {
        onResize() {  // record the updated size of the target element
            let target = this.$refs.barContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
        },
        initChart() {
            // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
            let chartContainer = d3.select('#bar-svg')

            // Here we compute the [min, max] from the data values of the attributes that will be used to represent x- and y-axis.
            let yExtents = d3.extent(this.bars.map((d: jobTitleBar) => d.job_title_average_remote_ratio as number)) as [number, number]
            // This is to get the unique categories from the data using Set, then store in an array.
            let xCategories: string[] = [ ...new Set(this.bars.map((d: jobTitleBar) => d.job_title as string))]

            // We need a way to map our data to where it should be rendered within the svg (in screen pixels), based on the data value, 
            //      so the extents and the unique values above help us define the limits.
            // Scales are just like mapping functions y = f(x), where x refers to domain, y refers to range. 
            //      In our case, x should be the data, y should be the screen pixels.
            // We have the margin here just to leave some space
            // In viewport (our screen), the leftmost side always refer to 0 in the horizontal coordinates in pixels (x). 
            var svg = d3.select('#rotate')
                .append('svg')
                    .attr("width", 1000)
                    .attr("height", 300)
            
            let xScale = d3.scaleBand()
                .rangeRound([this.margin.left, this.size.width - this.margin.right])
                .domain(xCategories)
                .padding(0.2) // spacing between the categories

            // In viewport (our screen), the topmost side always refer to 0 in the vertical coordinates in pixels (y). 
            let yScale = d3.scaleLinear()
                .range([this.size.height - this.margin.bottom, this.margin.top]) //bottom side to the top side on the screen
                .domain([0, yExtents[1]]) // This is based on your data, but if there is a natural value range for your data attribute, you should follow
                // e.g., it is natural to define [0, 100] for the exame score, or [0, <maxVal>] for counts.

            // There are other scales such as scaleOrdinal,
                // whichever is appropriate depends on the data types and the kind of visualizations you're creating.

            // This following part visualizes the axes along with axis labels.
            // Check out https://observablehq.com/@d3/margin-convention?collection=@d3/d3-axis for more details
            const xAxis = chartContainer.append('g')
                .attr('transform', `translate(0, ${this.size.height - this.margin.bottom})`)
                .call(d3.axisBottom(xScale))

            const yAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(yScale))

            const yLabel = chartContainer.append('g')
                .attr('transform', `translate(${10}, ${this.size.height / 2}) rotate(-90)`)
                .append('text')
                .text('Average Salary')
                .style('font-size', '.8rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width / 2 - this.margin.left}, ${this.size.height - this.margin.top - 5})`)
                .append('text')
                .text('Job Title')
                .style('font-size', '.8rem')
            
            // "g" is grouping element that does nothing but helps avoid DOM looking like a mess
            // We iterate through each <CategoricalBar> element in the array, create a rectangle for each and indicate the coordinates, the rectangle, and the color.
            const bars = chartContainer.append('g')
                .selectAll('rect')
                .data<jobTitleBar>(this.bars) // TypeScript expression. This always expects an array of objects.
                .join('rect')
                // specify the left-top coordinate of the rectangle
                .attr('x', (d: jobTitleBar) => xScale(d.job_title) as number)
                .attr('y', (d: jobTitleBar) => yScale(d.job_title_average_remote_ratio) as number)
                // specify the size of the rectangle
                .attr('width', xScale.bandwidth())
                .attr('height', (d: jobTitleBar) => Math.abs(yScale(0) - yScale(d.job_title_average_remote_ratio))) // this substraction is reversed so the result is non-negative
                .attr('fill', 'teal')

            d3.svg.append("g")
                .attr
            // For transform, check out https://www.tutorialspoint.com/d3js/d3js_svg_transformation.htm, but essentially we are adjusting the positions of the selected elements.
            const title = chartContainer.append('g')
                .append('text') // adding the text
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top + 5})`)
                .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text('Bar Chart about Average Salary') // text content
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#bar-svg').selectAll('*').remove() // Clean all the elements in the chart
                this.initChart()
            }
        }
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