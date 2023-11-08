import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';

const data = await d3.csv("./data/mxmh_survey_results.csv")
console.log(data)

var size = { width: 0, height: 0 }

const onResize = (targets) => {
  targets.forEach(target => {
      if (target.target.getAttribute('id') !== 'line-container') return;
        size = { width: target.contentRect.width, height: target.contentRect.height }
        if (!isEmpty(size) && !isEmpty(data)) {
            d3.select('#parallel-svg').selectAll('*').remove()
           //console.log(size, bars)
          initChart()
      }
  })
}
const chartObserver = new ResizeObserver(debounce(onResize, 100))

export const parallelChart = () => ( // equivalent to <template> in Vue
    `<div class='parallel d-flex' id='line-container'>
        <svg id='parallel-svg' width='100%' height='100%'>
        </svg>
    </div>`
)

export function mountParallelChart() { // registering this element to watch its size change
    let barContainer = document.querySelector('#line-container')
    chartObserver.observe(barContainer)
}

let mxmh_data = data.map(d => {
  return {
    'Anxiety (scale of 0 to 10)': +d["Anxiety"],
    'Hours listening to music': +d["Hours per day"], 
    'Depression (scale of 0 to 10)': +d["Depression"], 
  };
})

console.log(mxmh_data)

let keys = Object.keys(mxmh_data[0])

function initChart() {

  // Specify the chart’s dimensions.
  const width = size.width;
  const height = size.height;
  const marginTop = 20;
  const marginRight = 10;
  const marginBottom = 20;
  const marginLeft = 10;

  // Create an horizontal (*x*) scale for each key.
  const x = new Map(Array.from(keys, key => [key, d3.scaleLinear(d3.extent(mxmh_data, d => d[key]), [marginLeft, width - marginRight])]));
  console.log(keys.map(each => d3.extent(mxmh_data, d => d[each])))

  // Create the vertical (*y*) scale.
  const y = d3.scalePoint(keys, [marginTop, height - marginBottom]);

  // Create the color scale.
  //const color = d3.scaleLinear([0, 100], ["steelblue", "red"])
  const color = d3.color("steelblue")
  

  // Create the SVG container.\
  let svg = d3.select('#parallel-svg')
  //const svg = d3.create("svg")
  //    .attr("viewBox", [0, 0, width, height])
  //    .attr("width", width)
  //    .attr("height", height)
  //    .attr("style", "max-width: 100%; height: auto;");

  // Append the lines.
  const line = d3.line()
    .defined(([, value]) => value != null)
    .x(([key, value]) => x.get(key)(value))
    .y(([key]) => y(key));

  svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.4)
    .selectAll("path")
    .data(mxmh_data.slice()) //.sort((a, b) => d3.ascending(a[keyz], b[keyz])))
    .join("path")
      .attr("stroke", d => "steelblue")
      .attr("d", d => line(d3.cross(keys, [d], (key, d) => [key, d[key]])))
    .append("title")
      .text(d => d.name);

  // Append the axis for each key.
  svg.append("g")
    .selectAll("g")
    .data(keys)
    .join("g")
      .attr("transform", d => `translate(0,${y(d)})`)
      .each(function(d) {
        console.log(x.get(d).domain(), d)
        d3.select(this).call(d3.axisBottom(x.get(d))); })
      .call(g => g.append("text")
        .attr("x", marginLeft)
        .attr("y", -6)
        .attr("text-anchor", "start")
        .attr("fill", "currentColor")
        .text(d => d))
      .call(g => g.selectAll("text")
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke-width", 5)
        .attr("stroke-linejoin", "round")
        .attr("stroke", "white"));

  svg.append("text")
    .attr("class", "title")
    .attr("text-anchor", "end")
    .attr("x", (800))
    .attr("y", 15)
    .text("Hours of music listened to, corresponding with anxiety and depression");


}