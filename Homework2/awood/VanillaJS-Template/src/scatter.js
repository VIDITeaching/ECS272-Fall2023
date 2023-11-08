import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';

let data = await d3.csv("./data/mxmh_survey_results.csv")
console.log(data)

var size = { width: 0, height: 0 }

const onResize = (targets) => {
    targets.forEach(target => {
        if (target.target.getAttribute('id') !== 'scatter-container') return;
          size = { width: target.contentRect.width, height: target.contentRect.height }
          if (!isEmpty(size) && !isEmpty(data)) {
            d3.select('#scatter-svg').selectAll('*').remove()
   //         //console.log(size, bars)
            initChart()
        }
    })
  }
const chartObserver = new ResizeObserver(debounce(onResize, 100))

export const scatterChart = () => ( // equivalent to <template> in Vue
    `<div class='bar d-flex' id='scatter-container'>
        <svg id='scatter-svg' width='100%' height='100%'>
        </svg>
    </div>`
)

export function mountScatterChart() { // registering this element to watch its size change
    let barContainer = document.querySelector('#scatter-container')
    chartObserver.observe(barContainer)
}

let scatter1_data = data.map(d => {
    return {
      age: d["Age"],
      classical: d["Frequency [Classical]"]
    };
})

// Identical to initChart() in Vue template, except no Typescript expression.
function initChart() {
    // Specify the chart’s dimensions.
  const width = size.width;
  const height = size.height;
  const marginTop = 25;
  const marginRight = 20;
  const marginBottom = 35;
  const marginLeft = 40;

  // Define the horizontal scale.
  const x = d3.scalePoint()
      .domain(scatter1_data.map(d => d.classical))
      .range([marginLeft, width - marginRight])
      .padding(0.5);

  // Define the vertical scale.
  const y = d3.scaleLinear()
      .domain(d3.extent(scatter1_data, d => d.age)).nice()
      .range([height - marginBottom, marginTop]);

  // Create the container SVG.
  let svg = d3.select('#scatter-svg')

  // Add the axes.
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x));

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y));

  // Append a circle for each data point.
  svg.append("g")
    .selectAll("circle")
    .data(scatter1_data)
    .join("circle")
      .filter(d => d.age)
      .attr("cx", d => x(d.classical))
      .attr("cy", d => y(d.age))
      .attr("fill", "green")
      .attr("r", 3);

  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 4)
    .attr("x", -150)
    .attr("dy", ".55em")
    .attr("transform", "rotate(-90)")
    .text("Age (years)");

  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width-250)
    .attr("y", height - 5)
    .text("Frequency");

  svg.append("text")
    .attr("class", "title")
    .attr("text-anchor", "end")
    .attr("x", width-100)
    .attr("y", 15)
    .text("Age and how often a user listens to classical music");
}