import * as d3 from 'd3';  // Import the d3 library for data visualization.
import Data from '../data/average_remote_ratio.json';  // Import data from a JSON file.
import axios from 'axios';  // Import the axios library for making HTTP requests.
import { isEmpty, debounce } from 'lodash';  // Import utility functions from lodash.

const margin = { left: 35, right: 20, top: 30, bottom: 75 };  // Define margin for the chart.
var size = { width: 0, height: 0 };  // Initialize the size object for the chart.
var bars = Data.data;  // Store the data from the imported JSON file in the 'bars' variable.

const onResize = (targets) => {  // Define a function to handle resizing of the chart.
    targets.forEach(target => {
        if (target.target.getAttribute('id') !== 'bar-container') return;
        size = { width: target.contentRect.width, height: target.contentRect.height };
        if (!isEmpty(size) && !isEmpty(bars)) {
            d3.select('#bar-svg').selectAll('*').remove();  // Remove existing chart elements.
            initChart();  // Reinitialize the chart.
        }
    });
};

const chartObserver = new ResizeObserver(debounce(onResize, 100));  // Create a ResizeObserver to monitor the chart's container element.

export const BarChart = () => (  // Define a React component for the bar chart.
    `<div class='chart-container d-flex' id='bar-container'>
        <svg id='bar-svg' width='100%' height='100%'>
        </svg>
    </div>`
);

export function mountBarChart() {  // Define a function to mount the bar chart.
    let barContainer = document.querySelector('#bar-container');
    chartObserver.observe(barContainer);  // Start observing the chart's container for resizing.
}

function initChart() {  // Define a function to initialize the chart.
    let chartContainer = d3.select('#bar-svg');  // Select the SVG element to draw the chart inside.

    let yExtents = d3.extent(bars.map((d) => d.job_title_average_remote_ratio));  // Calculate the y-axis extent.
    let xCategories = [...new Set(bars.map((d) => d.job_title))];  // Extract unique job titles.

    let colorScale = d3.scaleOrdinal()  // Create a color scale for different job titles.
        .domain(xCategories)
        .range(d3.schemeCategory10);

    let xScale = d3.scaleBand()  // Create an x-axis scale for the job titles.
        .range([margin.left, size.width - margin.right])
        .domain(xCategories)
        .padding(0.1);

    let yScale = d3.scaleLinear()  // Create a linear y-axis scale for average salaries.
        .range([size.height - margin.bottom, margin.top])
        .domain([0, yExtents[1]]);

    const xAxis = chartContainer.append('g')  // Create the x-axis and style it.
        .attr('transform', `translate(0, ${size.height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(-45) translate(-10, -10)')
        .attr('font-size', '.5rem');

    const yAxis = chartContainer.append('g')  // Create the y-axis and style it.
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    const yLabel = chartContainer.append('g')  // Create a label for the y-axis.
        .attr('transform', `translate(${10}, ${size.height / 2}) rotate(-90)`)
        .append('text')
        .text('Average Remote Ratio')
        .style('font-size', '.8rem');

    const xLabel = chartContainer.append('g')  // Create a label for the x-axis.
        .attr('transform', `translate(${size.width / 2 - margin.left}, ${size.height - margin.top - 5})`)
        .append('text')
        .text('Job Title')
        .style('font-size', '.8rem');

    const barEles = chartContainer.append('g')  // Create and style the bar chart elements.
        .selectAll('rect')
        .data(bars)
        .join('rect')
        .attr('x', (d) => xScale(d.job_title))
        .attr('y', (d) => yScale(d.job_title_average_remote_ratio))
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => Math.abs(yScale(0) - yScale(d.job_title_average_remote_ratio)))
        .attr('fill', (d) => colorScale(d.job_title));

    const title = chartContainer.append('g')  // Add a title to the chart.
        .append('text')
        .attr('transform', `translate(${size.width / 2}, ${margin.top - 15})`)
        .attr('dy', '0.5rem')
        .style('text-anchor', 'middle')
        .style('font-size', '.9rem')
        .text('Overview of 71 average remote ratio by occupation');
}
