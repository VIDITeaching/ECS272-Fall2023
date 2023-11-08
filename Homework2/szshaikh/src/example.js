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

// first visualization  

function initChart() {
  // Define margins, width, and height
  const margin = { top: 30, right: 30, bottom: 150, left: 60 };
  const totalWidth = 450; // Total width of the SVG container
  const width = 450 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3.select('#bar-svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Define xScale (ordinal scale for streaming services)
  const xScale = d3.scaleBand()
    .rangeRound([0, width])
    .padding(0.1);

  // Define yScale (linear scale for counts)
  const yScale = d3.scaleLinear()
    .range([height, 0]);

  // Define xAxis and yAxis
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.format('.2s'));

  // Set xScale domain based on streamingService names
  xScale.domain(counts.map(d => d.streamingService));
  
  // Set yScale domain from 0 to maximum count value
  yScale.domain([0, d3.max(counts, d => d.count)]);

  // Append x-axis to the SVG
  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis)
    .selectAll('text')
    .attr('transform', 'rotate(45)')
    .style('text-anchor', 'start');

  // Append y-axis to the SVG
  svg.append('g')
    .attr('class', 'y-axis')
    .call(yAxis);

  // Create bars
  svg.selectAll('.bar')
    .data(counts)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.streamingService))
    .attr('y', d => yScale(d.count))
    .attr('width', xScale.bandwidth())
    .attr('height', d => height - yScale(d.count))
    .style('fill', 'teal');

  // X-axis label
  svg.append('text')
    .attr('class', 'x-label')
    .attr('x', width / 2)
    .attr('y', height + margin.top + 50) // Adjust the position as needed
    .style('text-anchor', 'middle')
    .style('font-size', '12px') // Set the font size
    .text('Streaming Services');

    // Y-axis label
  svg.append('text')
    .attr('class', 'y-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -margin.left + 20) // Adjust the position as needed
    .style('text-anchor', 'middle')
    .style('font-size', '12px') // Set the font size
    .text('Count');

    
    svg.append("text")
     .attr("x", width / 2)
     .attr("y", margin.top / 2- 30)
     .attr("text-anchor", "middle")
     .style("font-size", "0.8em")
     .style("font-weight", "bold")
     .text("Streaming Service Preferences and Usage Analysis");
     return svg.node();

}
