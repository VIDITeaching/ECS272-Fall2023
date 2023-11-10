import * as d3 from 'd3';
import Data from '../data/streaming_service.json';
import { isEmpty, debounce } from 'lodash';

const margin = { left: 45, right: 20, top: 20, bottom: 75 };
var size = { width: 0, height: 0 };
var data = Data.data;

// Define a color scale for both charts
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const onResize = (targets) => {
    targets.forEach(target => {
        if (target.target.getAttribute('id') !== 'chart-container') return;
        size = { width: target.contentRect.width, height: target.contentRect.height };
        if (!isEmpty(size) && !isEmpty(data)) {
            d3.select('#chart-svg').selectAll('*').remove();
            if (isBarChartVisible) {
                initBarChart();
            } else {
                initPieChart();
            }
        }
    });
};

const chartObserver = new ResizeObserver(debounce(onResize, 100));

export const Chart = () => (
    `<div class='chart-wrapper'>
        <button id='switch-button'>Switch Chart</button>
        <div class='chart-container' id='chart-container'>
            <svg id='chart-svg' width='100%' height='100%'></svg>
        </div>
    </div>`
);

export function mountChart() {
    let chartContainer = document.querySelector('#chart-container');
    chartObserver.observe(chartContainer);

    const switchButton = document.querySelector('#switch-button');
    switchButton.addEventListener('click', toggleChart);

    initPieChart();
}

let isBarChartVisible = false;

function toggleChart() {
    const chartContainer = d3.select('#chart-container');
    const chartSvg = d3.select('#chart-svg');

    if (isBarChartVisible) {
        // Switch to the pie chart
        chartSvg.selectAll('*').remove();
        initPieChart();
    } else {
        // Switch to the bar chart
        chartSvg.selectAll('*').remove();
        initBarChart();
    }

    isBarChartVisible = !isBarChartVisible;
}

// Define a function to initialize the Bar Chart
function initBarChart() {
    let xCategories = [...new Set(data.map((d) => d.Primary_streaming_service))];

    // Create the horizontal scale and its axis generator.
    const x = d3.scaleBand()
        .domain(xCategories)
        .range([margin.left, size.width - margin.right])
        .padding(0.1);

    const xAxis = d3.axisBottom(x).tickSizeOuter(0);

    // Create the vertical scale.
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)]).nice()
        .range([size.height - margin.bottom, margin.top]);

    // Create the SVG container and call the zoom behavior.
    const svg = d3.select('#chart-svg')
        .attr('width', size.width)
        .attr('height', size.height);

    const title = svg.append('g')
        .append('text')
        .attr('transform', `translate(${size.width / 2}, ${margin.top - 15})`)
        .attr('dy', '0.5rem')
        .style('text-anchor', 'middle')
        .style('font-size', '.9rem')
        .text('Overview of the number of respondents in different streaming services');

    // Append the bars with different colors.
    const bars = svg.append('g')
        .attr('class', 'bars')
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => x(d.Primary_streaming_service))
        .attr('y', y(0))
        .attr('height', 0)
        .attr('width', x.bandwidth())
        .attr('fill', (d, i) => colorScale(i));

    // Transition to update the bar chart
    bars.transition()
        .duration(1000)
        .attr('y', d => y(d.count))
        .attr('height', d => size.height - margin.bottom - y(d.count));

    // Append the axes.
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${size.height - margin.bottom})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-0.1em')
        .attr('dy', '0.3em')
        .attr('transform', 'rotate(-10)');

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select('.domain').remove());

    svg.append('g')
        .attr('transform', `translate(${10}, ${size.height / 2}) rotate(-90)`)
        .append('text')
        .text('Count')
        .style('font-size', '.8rem');

    svg.append('g')
        .attr('transform', `translate(${size.width / 2 - margin.left}, ${size.height - margin.top - 5})`)
        .append('text')
        .text('Genre Name')
        .style('font-size', '.8rem');

    // Create a color legend scale
    const colorLegendScale = d3.scaleOrdinal()
        .domain(xCategories)
        .range(xCategories.map((category, i) => colorScale(i)));

    // Create a legend SVG element
    const legendSvg = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${size.width - margin.right - 120}, ${margin.top})`);

    // Create colored rectangles and labels in the legend
    const legendRectSize = 12;
    const legendSpacing = 1;

    const legendRects = legendSvg.selectAll('.legend-rect')
        .data(xCategories)
        .enter().append('rect')
        .attr('class', 'legend-rect')
        .attr('x', 0)
        .attr('y', (d, i) => i * (legendRectSize + legendSpacing))
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', d => colorLegendScale(d));

    const legendLabels = legendSvg.selectAll('.legend-label')
        .data(xCategories)
        .enter().append('text')
        .attr('class', 'legend-label')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', (d, i) => i * (legendRectSize + legendSpacing) + legendRectSize / 2)
        .style('font-size', '.5rem')
        .attr('dy', '0.35em')
        .text(d => d);
}

// Define a function to initialize the Pie Chart
function initPieChart() {
    const pieContainer = d3.select('#chart-svg');

    // Define your pie chart data and layout here
    const pieData = d3.pie().value(d => d.count)(data);
    const arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(size.width, size.height) / 2 - 35);

    const pieGroup = pieContainer.append('g')
        .attr('transform', `translate(${size.width / 2}, ${size.height / 2})`);

    const sliceLabels = pieGroup.selectAll('.slice-labels')
        .data(pieData)
        .enter()
        .append('g')
        .attr('class', 'slice-labels');

    const title = pieContainer.append('g')
        .append('text')
        .attr('transform', `translate(${size.width / 2}, ${margin.top - 15})`)
        .attr('dy', '0.5rem')
        .style('text-anchor', 'middle')
        .style('font-size', '.9rem')
        .text("Overview of the percentage of differnent respondent's primary streaming services");

    // Append pie chart slices and animate transitions
    const paths = sliceLabels.append('path')
        .attr('d', arcGenerator)
        .attr('fill', (d, i) => colorScale(i));

    // Add percentages to the slices
    paths.each(function (d) {
        const slice = d3.select(this);
        const [x, y] = arcGenerator.centroid(d);
        const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100; // Calculate percentage

        // Display percentage text on the slice
        sliceLabels.append('text')
            .attr('class', 'percentage-label')
            .attr('text-anchor', 'middle')
            .attr('x', x)
            .attr('y', y - 10) // Adjust the vertical position of the text
            .text(`${percentage.toFixed(1)}%`)
            .style('font-size', '.8rem');
    });

    paths.on('mouseover', function (event, d) {
        d3.select(this)
            .transition()
            .duration(100)
            .attr('d', arcGenerator.innerRadius(0).outerRadius(Math.min(size.width, size.height) / 2 - 28));
    });

    // Add tooltips on hover
    sliceLabels.on('mouseover', function (event, d) {
        const [x, y] = arcGenerator.centroid(d);

        // Display tooltip with Primary_streaming_service and count
        sliceLabels.append('text')
            .attr('class', 'tooltip')
            .attr('text-anchor', 'middle')
            .attr('x', x)
            .attr('y', y + 20) // Adjust the vertical position of the text
            .text(`${d.data.Primary_streaming_service}: ${d.data.count}`)
            .style('font-size', '.8rem')
            .attr('fill', 'white');
    });

    // Remove tooltips on mouseout
    sliceLabels.on('mouseout', function () {
        // Remove tooltip
        sliceLabels.select('.tooltip').remove();
    });

    paths.on('mouseout', function (event, d) {
        d3.select(this)
            .transition()
            .duration(100)
            .attr('d', arcGenerator.innerRadius(0).outerRadius(Math.min(size.width, size.height) / 2 - 35));
    });

    // Animate transitions
    paths.transition()
        .duration(1000)
        .attrTween('d', function (d) {
            const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function (t) {
                return arcGenerator(interpolate(t));
            };
        });

    // Create a color legend scale
    const colorLegendScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Primary_streaming_service))
        .range(data.map((d, i) => colorScale(i)));

    // Create a legend SVG element
    const legendSvg = pieContainer.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${size.width - margin.right - 120}, ${margin.top})`);

    // Create colored rectangles and labels in the legend
    const legendRectSize = 12;
    const legendSpacing = 1;

    const legendRects = legendSvg.selectAll('.legend-rect')
        .data(data.map(d => d.Primary_streaming_service))
        .enter().append('rect')
        .attr('class', 'legend-rect')
        .attr('x', 0)
        .attr('y', (d, i) => i * (legendRectSize + legendSpacing))
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', d => colorLegendScale(d));

    const legendLabels = legendSvg.selectAll('.legend-label')
        .data(data.map(d => d.Primary_streaming_service))
        .enter().append('text')
        .attr('class', 'legend-label')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', (d, i) => i * (legendRectSize + legendSpacing) + legendRectSize / 2)
        .style('font-size', '.5rem')
        .attr('dy', '0.35em')
        .text(d => d);
}
