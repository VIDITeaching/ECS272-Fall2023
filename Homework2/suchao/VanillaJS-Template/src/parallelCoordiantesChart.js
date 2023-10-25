import * as d3 from 'd3';
import Data from '../data/PCC.json';
import { debounce, isEmpty } from 'lodash';

const margin = { left: 20, right: 20, top: 20, bottom: 80 };
let size = { width: 0, height: 0 };
const data = Data;

const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Define a color scale

const onResize = (entries) => {
  entries.forEach((entry) => {
    if (entry.target.getAttribute('id') !== 'parallel-coordinates-container') return;
    size = { width: entry.contentRect.width, height: entry.contentRect.height };
    if (!isEmpty(size) && !isEmpty(data)) {
      initParallelCoordinates();
    }
  });
};

const chartObserver = new ResizeObserver(debounce(onResize, 100));

export const ParallelCoordinatesPlot = () => (
  `<div class='PCchart-container d-flex' id='parallel-coordinates-container'>
    <svg id='parallel-coordinates-svg' width='100%' height='100%'>
    </svg>
  </div>`
);

export function mountParallelCoordinatesPlot() {
  const container = document.querySelector('#parallel-coordinates-container');
  chartObserver.observe(container);
}

function initParallelCoordinates() {
  const chartContainer = d3.select('#parallel-coordinates-svg');

  var margin = { top: 30, right: 10, bottom: 10, left: 0 },
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  chartContainer
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
  const dimensions = ['remote_ratio', 'salary_in_usd', "work_year"];

  // For each dimension, I build a linear scale. I store all in a y object
  var y = {}
  for (const i in dimensions) {
    const name = dimensions[i]
    y[name] = d3.scaleLinear()
      .domain(d3.extent(data, function (d) { return +d[name]; }))
      .range([height, 0])
  }

  // Build the X scale -> it finds the best position for each Y axis
  const x = d3.scalePoint()
    .range([0, width])
    .padding(1)
    .domain(dimensions);

  // The path function takes a row of the csv as input and returns x and y coordinates of the line to draw for this row.
  function path(d) {
    return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
  }

  // Draw the lines
  chartContainer
    .selectAll("myPath")
    .data(data)
    .enter().append("path")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", (d, i) => colorScale(i)) // Assign colors based on data index
    .style("opacity", 0.5);

  // Draw the axis:
  chartContainer.selectAll("myAxis")
    // For each dimension of the dataset, I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // I translate this element to its right position on the x-axis
    .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    // Add axis title
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function (d) { return d; })
    .style("fill", "black");

  const title = chartContainer.append('g')  // Add a title to the chart.
    .append('text')
    .attr('transform', `translate(${size.width / 2}, ${margin.top - 15})`)
    .attr('dy', '0.5rem')
    .style('text-anchor', 'middle')
    .style('font-size', '.9rem')
    .text('Overview of 71 average remote ratio by occupation');
}
