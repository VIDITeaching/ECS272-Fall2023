import * as d3 from 'd3';
import Data from '../data/Genre_count.json';
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

const margin = { left: 45, right: 0, top: 20, bottom: 85 };
var size = { width: 0, height: 0 };
var bars = Data.data;

// Define a color scale
// const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const onResize = (targets) => {
  targets.forEach(target => {
    if (target.target.getAttribute('id') !== 'bar-container') return;
    size = { width: target.contentRect.width, height: target.contentRect.height };
    if (!isEmpty(size) && !isEmpty(bars)) {
      d3.select('#bar-svg').selectAll('*').remove();
      initChart();
    }
  });
};

const chartObserver = new ResizeObserver(debounce(onResize, 100));

export const BarChart = () => (
  `<div class='chart-container d-flex' id='bar-container'>
      <svg id='bar-svg' width='100%' height='100%'>
      </svg>
  </div>`
);

export function mountBarChart() {
  let barContainer = document.querySelector('#bar-container');
  chartObserver.observe(barContainer);
}

function initChart() {
  let xCategories = [...new Set(bars.map((d) => d.Fav_genre))];
  // Create the horizontal scale and its axis generator.
  const x = d3.scaleBand()
    .domain(xCategories)
    .range([margin.left, size.width - margin.right])
    .padding(0.1);

  const xAxis = d3.axisBottom(x).tickSizeOuter(0);

  // Create the vertical scale.
  const y = d3.scaleLinear()
    .domain([0, d3.max(bars, d => d.count_genre)]).nice()
    .range([size.height - margin.bottom, margin.top]);

  // Create the SVG container and call the zoom behavior.
  const svg = d3.select('#bar-svg')
    .attr('width', size.width)
    .attr('height', size.height)
    .call(zoom);


  const title = svg.append('g')  // Add a title to the chart.
    .append('text')
    .attr('transform', `translate(${size.width / 2}, ${margin.top - 15})`)
    .attr('dy', '0.5rem')
    .style('text-anchor', 'middle')
    .style('font-size', '.9rem')
    .text('Overview of the number of people who like different music genres');

  // Append the bars with different colors.
  svg.append('g')
    .attr('class', 'bars')
    .selectAll('rect')
    .data(bars)
    .join('rect')
    .attr('x', d => x(d.Fav_genre))
    .attr('y', d => y(d.count_genre))
    .attr('height', d => y(0) - y(d.count_genre))
    .attr('width', x.bandwidth())
    .attr('fill', 'steelblue'); 

  // Append the axes.
  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${size.height - margin.bottom})`)
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-0.5em')
    .attr('dy', '-0.2em')
    .attr('transform', 'rotate(-45)');

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

  function zoom(svg) {
    const extent = [[margin.left, margin.top], [size.width - margin.right, size.height - margin.top]];

    svg.call(d3.zoom()
      .scaleExtent([1, 8])
      .translateExtent(extent)
      .extent(extent)
      .on('zoom', zoomed));

    function zoomed(event) {
      x.range([margin.left, size.width - margin.right].map(d => event.transform.applyX(d)));
      svg.selectAll('.bars rect').attr('x', d => x(d.Fav_genre)).attr('width', x.bandwidth());
      svg.selectAll('.x-axis').call(xAxis);
    }
  }
}
