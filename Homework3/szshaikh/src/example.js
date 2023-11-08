import * as d3 from 'd3';
import Data from '../data/mentalH.json';
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

const margin = { left: 40, right: 0, top: 20, bottom: 10 }
var size = { width: 0, height: 0 }

function groupBy(objectArray, property) {
  return objectArray.reduce(function (acc, obj) {
      let key = obj[property];
      if (key !== undefined && key !== '') {
          if (!acc[key]) {
              acc[key] = [];
          }
          acc[key].push(obj);
      }
      return acc;
  }, {});
}

  const groupedData = groupBy(Data, "Primary streaming service");
  
  // Count the length of each group
  const counts = Object.keys(groupedData).map(key => {
    return {
      streamingService: key,
      count: groupedData[key].length
    };
  });
  counts.sort((a, b) => b.count - a.count);
  console.log("Counts:", counts);

const onResize = (targets) => {
  targets.forEach(target => {
      if (target.target.getAttribute('id') !== 'bar-container') return;
      size = { width: target.contentRect.width, height: target.contentRect.height }
      if (!isEmpty(size) && !isEmpty(counts)) { // Update this line
          d3.select('#bar-svg').selectAll('*').remove();
          initChart();
      }
  });
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

// function initChart() {
//   const totalWidth = 450; // Total width of the SVG container
//   const totalHeight = 300;
//   const margin = { top: 10, right: 10, bottom: 30, left: 10 };
//   const width = totalWidth - margin.left - margin.right;
//   const height = totalHeight - margin.top - margin.bottom;

//   const svg = d3.select('#bar-svg')
//     .attr('width', totalWidth)
//     .attr('height', totalHeight);

//   const radius = Math.min(width, height) / 2;

//   const pie = d3.pie()
//     .sort(null)
//     .value(d => d.count);

//   const arc = d3.arc()
//     .outerRadius(radius - 10)
//     .innerRadius(0);

//     const color = d3.scaleOrdinal()
//     .domain(counts.map(d => d.streamingService))
//     .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), counts.length).reverse());


//     const g = svg.append('g')
//     .attr('transform', `translate(${margin.left + radius},${totalHeight / 2})`);
  

//   const arcs = g.selectAll('.arc')
//     .data(pie(counts))
//     .enter().append('g')
//     .attr('class', 'arc');

//   arcs.append('path')
//     .attr('d', arc)
//     .style('fill', d => color(d.data.streamingService));

//   arcs.append('text')
//     .attr('transform', d => `translate(${arc.centroid(d)})`)
//     .attr('dy', '0.35em')
//     .style('text-anchor', 'middle')
//     .style('font-size', '10px')
//     .text(d => `${d.data.count}`); // Displaying count inside each section

//   // Legend
//   const legend = svg.selectAll('.legend')
//     .data(counts)
//     .enter().append('g')
//     .attr('class', 'legend')
//     .attr('transform', (d, i) => `translate(0,${i * 20})`);

//   legend.append('rect')
//     .attr('x', totalWidth - 18)
//     .attr('width', 18)
//     .attr('height', 18)
//     .style('fill', d => color(d.streamingService));

//   legend.append('text')
//     .attr('x', totalWidth - 24)
//     .attr('y', 9)
//     .attr('dy', '.35em')
//     .style('text-anchor', 'end')
//     .style('font-size', '10px')
//     .text(d => `${d.streamingService}`);

//     svg.append('text')
//     .attr('x', totalWidth / 2)
//     .attr('y', margin.top + 5) // Adjust the y position to move the title closer to the top margin
//     .attr('text-anchor', 'middle')
//     .style('font-size', '1em')
//     .text('Streaming Service Preferences');


//   return svg.node();
// }

function initChart() {
  const totalWidth = 450; // Total width of the SVG container
  const totalHeight = 300;
  const margin = { top: 10, right: 10, bottom: 30, left: 10 };
  const width = totalWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom;

  const svg = d3.select('#bar-svg')
    .attr('width', totalWidth)
    .attr('height', totalHeight);

  const radius = Math.min(width, height) / 2;

  const pie = d3.pie()
    .sort(null)
    .value(d => d.count);

  const arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

  const color = d3.scaleOrdinal()
    .domain(counts.map(d => d.streamingService))
    .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), counts.length).reverse());

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left + radius},${totalHeight / 2})`);

  const arcs = g.selectAll('.arc')
    .data(pie(counts))
    .enter().append('g')
    .attr('class', 'arc')
    .style('cursor', 'pointer')
    .on('mouseover', function (event, d) {
      d3.select(this)
        .transition()
        .duration(250)
        .attr('transform', `translate(${arc.centroid(d)}) scale(1.1)`)
        .attr('stroke', 'black')
        .attr('stroke-width', 0.5);

      // Display count
      d3.select(this).select('text')
        .text(`${d.data.streamingService}: ${d.data.count}`)
        .attr('dy', '0.5em');
    })
    .on('mouseout', function () {
      d3.select(this)
        .transition()
        .duration(250)
        .attr('transform', 'translate(0,0)')
        .attr('stroke', 'none');

      // Reset count display
      d3.select(this).select('text')
        .text(d => `${d.data.count}`)
        .attr('dy', '0.35em');
    });

  arcs.append('path')
    .attr('d', arc)
    .style('fill', d => color(d.data.streamingService))
    .attr('stroke', 'white');

  arcs.append('text')
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('dy', '0.35em')
    .style('text-anchor', 'middle')
    .style('font-size', '10px')
    .text(d => `${d.data.count}`); // Displaying count inside each section

  // Legend
  const legend = svg.selectAll('.legend')
    .data(counts)
    .enter().append('g')
    .attr('class', 'legend')
    .attr('transform', (d, i) => `translate(0,${i * 20})`);

  legend.append('rect')
    .attr('x', totalWidth - 18)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', d => color(d.streamingService));

  legend.append('text')
    .attr('x', totalWidth - 24)
    .attr('y', 9)
    .attr('dy', '.35em')
    .style('text-anchor', 'end')
    .style('font-size', '10px')
    .text(d => `${d.streamingService}`);

  svg.append('text')
    .attr('x', totalWidth / 2)
    .attr('y', margin.top + 5) // Adjust the y position to move the title closer to the top margin
    .attr('text-anchor', 'middle')
    .style('font-size', '1em')
    .text('Streaming Service Preferences');

  return svg.node();
}

