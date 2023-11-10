import * as d3 from 'd3';  // Import the d3 library for data visualization.
import Data from '../data/Data_Engineer_average_salary.json';  // Import the JSON data file.
import axios from 'axios';  // Import the axios library for making HTTP requests.
import { isEmpty, debounce } from 'lodash';  // Import specific functions from lodash.

// Define margins for the chart.
const margin = { left: 60, right: 20, top: 30, bottom: 80 }; // Increased bottom margin for x-axis labels

// Initialize size and data variables.
var size = { width: 0, height: 0 };
var data = Data.data;

// Define a function to handle resizing of the chart.
const onResize = (targets) => {
    targets.forEach((target) => {
        // Check if the target element has the id 'line-container'.
        if (target.target.getAttribute('id') !== 'line-container') return;
        // Update the size variable with the new dimensions of the target element.
        size = { width: target.contentRect.width, height: target.contentRect.height };
        // Check if both size and data are not empty, then reinitialize the chart.
        if (!isEmpty(size) && !isEmpty(data)) {
            initChart();  // Call the function to initialize the chart.
        }
    });
};

// Create a ResizeObserver that calls the onResize function with a debounce of 100 milliseconds.
const chartObserver = new ResizeObserver(debounce(onResize, 100));

// Define the LineChart component.
export const LineChart = () => (
    `<div class='chart-container d-flex' id='line-container'>
        <svg id='line-svg' width='100%' height='100%'>
            <g id="line-chart"></g>
        </svg>
    </div>`
);

// Define a function to mount the LineChart component.
export function mountLineChart() {

    let lineContainer = document.querySelector('#line-container');
    chartObserver.observe(lineContainer);  // Observe the LineChart component for resizing.
}

// Define a function to initialize the chart.
function initChart() {
    let chartContainer = d3.select('#line-chart');  // Select the chart container.

    // Extract experience levels and average salaries from the data.
    let experienceLevels = data.map((d) => d.experience_level);
    let averageSalaries = data.map((d) => d.average_salary);

    // Create an xScale for the experience levels using the scaleBand function.
    let xScale = d3
        .scaleBand()
        .domain(experienceLevels)
        .range([margin.left, size.width - margin.right])
        .padding(1);

    // Create a yScale for the average salaries using the scaleLinear function.
    let yScale = d3
        .scaleLinear()
        .domain([0, d3.max(averageSalaries)])
        .nice()
        .range([size.height - margin.bottom, margin.top]);

    // Create a line generator function.
    let line = d3
        .line()
        .x((d) => xScale(d.experience_level))
        .y((d) => yScale(d.average_salary));

    // Append a path element for the line chart.
    chartContainer
        .append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue');

    // Append a group element for the x-axis and call the axisBottom function.
    chartContainer
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${size.height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    // Append a group element for the y-axis and call the axisLeft function.
    chartContainer
        .append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Append a label for the x-axis.
    chartContainer
        .append('text')
        .attr('class', 'x-label')
        .attr('transform', `translate(${size.width / 2}, ${margin.bottom + 240})`)
        .attr('dy', '2.5em')
        .style('text-anchor', 'middle')
        .text('Experience Level')
        .style('font-size', '.9rem');

    // Append a label for the y-axis.
    chartContainer
        .append('text')
        .attr('class', 'y-label')
        .attr('transform', `translate(${10}, ${size.height / 2}) rotate(-90)`)
        .text('Average Salary')
        .style('font-size', '.9rem');

    // Append a title for the chart.
    chartContainer
        .append('text')
        .attr('class', 'chart-title')
        .attr('transform', `translate(${size.width / 2}, ${margin.top})`)
        .style('text-anchor', 'middle')
        .style('font-size', '.9rem')
        .text('Average Salaries for Data Engineers at Different Experience Levels');
}
