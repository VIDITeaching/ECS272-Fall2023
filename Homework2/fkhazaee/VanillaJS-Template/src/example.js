import * as d3 from 'd3';
import Data from '../data/demo.json';
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

const margin = { left: 40, right: 20, top: 20, bottom: 60 }
var size = { width: 0, height: 0 }
var bars = Data.data;

const onResize = (targets) => {
    targets.forEach(target => {
        if (target.target.getAttribute('id') !== 'bar-container') return;
        size = { width: target.contentRect.width, height: target.contentRect.height }
        if (!isEmpty(size) && !isEmpty(bars)) {
            d3.select('#bar-svg').selectAll('*').remove()
            //console.log(size, bars)
            initChart()
        }
    })
}
const chartObserver = new ResizeObserver(debounce(onResize, 100))

export const BarChart = () => ( // equivalent to <template> in Vue
    `<div class='chart-container d-flex' id='bar-container'>
        <svg id='bar-svg' width='100%' height='100%'>
        </svg>
    </div>`
)

export function mountBarChart() { // registering this element to watch its size change
    let barContainer = document.querySelector('#bar-container')
    chartObserver.observe(barContainer)
}

// Identical to initChart() in Vue template, except no Typescript expression.
function initChart() {
    // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
    let chartContainer = d3.select('#bar-svg')

    // Here we compute the [min, max] from the data values of the attributes that will be used to represent x- and y-axis.
    let yExtents = d3.extent(bars.map((d) => d.value))
    // This is to get the unique categories from the data using Set, then store in an array.
    let xCategories = [...new Set(bars.map((d) => d.category))]
    
    // We need a way to map our data to where it should be rendered within the svg (in screen pixels), based on the data value, 
    //      so the extents and the unique values above help us define the limits.
    // Scales are just like mapping functions y = f(x), where x refers to domain, y refers to range. 
    //      In our case, x should be the data, y should be the screen pixels.
    // We have the margin here just to leave some space
    // In viewport (our screen), the leftmost side always refer to 0 in the horizontal coordinates in pixels (x). 
    let xScale = d3.scaleBand()
        .rangeRound([margin.left, size.width - margin.right])
        .domain(xCategories)
        .padding(0.1) // spacing between the categories

    // In viewport (our screen), the topmost side always refer to 0 in the vertical coordinates in pixels (y). 
    let yScale = d3.scaleLinear()
        .range([size.height - margin.bottom, margin.top]) //bottom side to the top side on the screen
        .domain([0, yExtents[1]]) // This is based on your data, but if there is a natural value range for your data attribute, you should follow
        // e.g., it is natural to define [0, 100] for the exame score, or [0, <maxVal>] for counts.

    // There are other scales such as scaleOrdinal,
    // whichever is appropriate depends on the data types and the kind of visualizations you're creating.

    // This following part visualizes the axes along with axis labels.
    // Check out https://observablehq.com/@d3/margin-convention?collection=@d3/d3-axis for more details
    const xAxis = chartContainer.append('g')
        .attr('transform', `translate(0, ${size.height - margin.bottom})`)
        .call(d3.axisBottom(xScale))

    const yAxis = chartContainer.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale))

    const yLabel = chartContainer.append('g')
        .attr('transform', `translate(${10}, ${size.height / 2}) rotate(-90)`)
        .append('text')
        .text('Value')
        .style('font-size', '.8rem')

    const xLabel = chartContainer.append('g')
        .attr('transform', `translate(${size.width / 2 - margin.left}, ${size.height - margin.top - 5})`)
        .append('text')
        .text('Categories')
        .style('font-size', '.8rem')
    
    // "g" is grouping element that does nothing but helps avoid DOM looking like a mess
    // We iterate through each <CategoricalBar> element in the array, create a rectangle for each and indicate the coordinates, the rectangle, and the color.
    const barEles = chartContainer.append('g')
        .selectAll('rect')
        .data(bars) // TypeScript expression. This always expects an array of objects.
        .join('rect')
        // specify the left-top coordinate of the rectangle
        .attr('x', (d) => xScale(d.category))
        .attr('y', (d) => yScale(d.value))
        // specify the size of the rectangle
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => Math.abs(yScale(0) - yScale(d.value))) // this substraction is reversed so the result is non-negative
        .attr('fill', 'teal')

    // For transform, check out https://www.tutorialspoint.com/d3js/d3js_svg_transformation.htm, but essentially we are adjusting the positions of the selected elements.
    const title = chartContainer.append('g')
        .append('text') // adding the text
        .attr('transform', `translate(${size.width / 2}, ${size.height - margin.top + 5})`)
        .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text('Distribution of Demo Data') // text content

}


