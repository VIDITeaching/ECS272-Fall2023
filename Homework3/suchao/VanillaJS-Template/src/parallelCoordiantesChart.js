import * as d3 from 'd3';
import Data from '../data/data_with_index.json';
import { debounce, isEmpty } from 'lodash';

const margin = { top: 40, right: 20, bottom: 40, left: 0 };
let size = { width: 0, height: 0 };
const data = Data;

const Primary_streaming_service_index_set = [125, 126, 127, 128, 129, 130];
const primary_streaming_service_set = ["Apple Music", "No streaming service.", "Other streaming service", "Pandora", "Spotify", "YouTube Music"];
const colorScale = d3.scaleOrdinal().domain(Primary_streaming_service_index_set).range(["red", "blue", "green", "brown", "orange", "grey"]); // Define a color scale

const onResize = (targets) => {
  targets.forEach(target => {
    if (target.target.getAttribute('id') !== 'parallel-coordinates-container') return;
    size = { width: target.contentRect.width, height: target.contentRect.height };
    if (!isEmpty(size) && !isEmpty(data)) {
      d3.select('#parallel-coordinates-svg').selectAll('*').remove();
      initParallelCoordinates();
    }
  });
};

const chartObserver = new ResizeObserver(debounce(onResize, 100));

export const ParallelCoordinatesPlot = () => (
  `<div class='PCchart-container d-flex' id='parallel-coordinates-container'>
    <svg id='parallel-coordinates-svg' width='100%' height='100%'>
    </svg>
    <div id='legend-container'></div>
  </div>`
);

export function mountParallelCoordinatesPlot() {
  const container = document.querySelector('#parallel-coordinates-container');
  chartObserver.observe(container);
}

function initParallelCoordinates() {
  const chartContainer = d3.select('#parallel-coordinates-svg');

  // append the svg object to the body of the page
  chartContainer
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
  const dimensions = ['Age', 'While_working', 'Hours_per_day', 'Fav_genre_index', 'Primary_streaming_service_index'];

  // For each dimension, I build a linear scale. I store all in a y object
  const y = {}
  for (const i in dimensions) {
    const name = dimensions[i]
    y[name] = d3.scaleLinear()
      .domain(d3.extent(data, function (d) { return +d[name]; }))
      .range([size.height - margin.bottom, margin.top])
  }

  // Build the X scale -> it finds the best position for each Y axis
  const x = d3.scalePoint()
    .range([0, size.width])
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
    .style("stroke", (d, i) => {
      const primaryStreamingServiceIndex = d['Primary_streaming_service_index'];
      return colorScale(primaryStreamingServiceIndex);
    })
    .style("opacity", 0.5);

  // Draw the axis:
  chartContainer.selectAll("myAxis")
    .data(dimensions).enter()
    .append("g")
    .attr("transform", function (d) { return "translate(" + x(d) + "," + 0 + ")"; })
    .each(function (d) {
      const tickValues = getTickValuesForDimension(d);
      const tickFormat = getTickFormatForDimension(d);

      d3.select(this)
        .call(d3.axisLeft().scale(y[d])
          .tickValues(tickValues)
          .tickFormat((d, i) => tickFormat[i])
        )
    })
    // Add axis title
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function (d) { return d; })
    .style("fill", "black");

  dimensions.forEach((dimension, i) => {
    chartContainer.append("text")
      .attr("transform", `translate(${x(dimension)}, ${size.height - 25})`) // Adjust the position as needed
      .style("text-anchor", "middle")
      .text(dimension)
      .style("font-size", '.55rem')
      .style("fill", "black");
  });

  const title = chartContainer.append('g')  // Add a title to the chart.
    .append('text')
    .attr('transform', `translate(${size.width / 2}, ${margin.top - 25})`)
    .attr('dy', '0.5rem')
    .style('text-anchor', 'middle')
    .style('font-size', '.68rem')
    .text('Overview of dataset in terms of Age, While_working, Hours_per_day, Fav_genre_index, and Primary_streaming_service_index');
  // Draw the axis and labels
  dimensions.forEach((dimension, i) => {
    chartContainer.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${x(dimension)}, 0)`)
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -15)
      .text(dimension)
      .style("fill", "black");
  });

  const brushes = dimensions.map((dimension) => {
    return d3.brushY()
      .extent([[-10, 0], [10, size.height]])
      .on("brush end", brushed);
  });

  // Initialize the x-scale domain
  x.domain(dimensions);

  // Append the brushes to the chart
  const brushGroup = chartContainer.selectAll(".brush")
    .data(brushes)
    .enter()
    .append("g")
    .attr("class", "brush")
    .attr("transform", (d, i) => `translate(${x(dimensions[i])},0)`)
    .each(function (d) {
      d3.select(this).call(d);
    });

  // Function to handle brushing
  function brushed(event) {
    const selectedData = [];
    chartContainer.selectAll("path")
      .style("display", function (d) {
        const isVisible = dimensions.every((dimension, i) => {
          const extent = d3.brushSelection(brushGroup.nodes()[i]);
          if (!extent) return true;
          const yScale = y[dimension];
          const yValue = yScale(d[dimension]);
          return extent[0] <= yValue && yValue <= extent[1];
        });
        if (isVisible) {
          selectedData.push(d);
          return null; // Keep the path visible
        } else {
          return "none"; // Hide the path
        }
      });
  }

  // Create a color legend scale
  const colorLegendScale = d3.scaleOrdinal()
    .domain(primary_streaming_service_set)
    .range(primary_streaming_service_set.map((primary_streaming_service_set, i) => colorScale(i)));

  // Create a legend SVG element
  const legendSvg = chartContainer.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${size.width - margin.right - 85}, ${margin.top})`);

  // Create colored rectangles and labels in the legend
  const legendRectSize = 8;
  const legendSpacing = 1;

  const legendRects = legendSvg.selectAll('.legend-rect')
    .data(primary_streaming_service_set)
    .enter().append('rect')
    .attr('class', 'legend-rect')
    .attr('x', 0)
    .attr('y', (d, i) => i * (legendRectSize + legendSpacing))
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', d => colorLegendScale(d));

  const legendLabels = legendSvg.selectAll('.legend-label')
    .data(primary_streaming_service_set)
    .enter().append('text')
    .attr('class', 'legend-label')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', (d, i) => i * (legendRectSize + legendSpacing) + legendRectSize / 2)
    .style('font-size', '.52rem')
    .attr('dy', '0.35em')
    .text(d => d);
}

// Function to get tick values for a specific dimension
function getTickValuesForDimension(dimension) {
  switch (dimension) {
    case 'Age':
      return [10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 46, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58, 59, 60, 61, 63, 64, 65, 67, 68, 69, 70, 71, 72, 73, 74, 80, 89];
    case 'Primary_streaming_service_index':
      return [125, 126, 127, 128, 129, 130];
    case 'While_working':
      return [151, 152];
    case 'Hours_per_day':
      return [0, 0.1, 0.25, 0.5, 0.7, 1, 1.5, 2, 2.5, 3, 4, 4.5, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 24]
    case 'Fav_genre_index':
      return [131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146]
    default:
      return [];
  }
}

// Function to get tick format for a specific dimension
function getTickFormatForDimension(dimension) {
  switch (dimension) {
    case 'Age':
      return [10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 46, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58, 59, 60, 61, 63, 64, 65, 67, 68, 69, 70, 71, 72, 73, 74, 80, 89];
    case 'Primary_streaming_service_index':
      return ["Apple Music", "No streaming service", "Other", "Pandora", "Spotify", "YouTube Music"];
    case 'While_working':
      return ["Yes", "No"];
    case 'Hours_per_day':
      return [0, 0.1, 0.25, 0.5, 0.7, 1, 1.5, 2, 2.5, 3, 4, 4.5, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 24]
    case 'Fav_genre_index':
      return ["Classical", "Country", "EDM", "Folk", "Gospel", "Hip hop", "Jazz", "K pop", "Latin", "Lofi", "Metal", "Pop", "R&B", "Rap", "Rock", "Video game music"]
    default:
      return [];
  }
}
