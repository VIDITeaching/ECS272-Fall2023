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

  const path = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.4)
    .selectAll("path")
    .data(mxmh_data.slice()) //.sort((a, b) => d3.ascending(a[keyz], b[keyz])))
    .join("path")
      .attr("stroke", d => "steelblue")
      .attr("d", d => line(d3.cross(keys, [d], (key, d) => [key, d[key]])))
    .call(path => path.append("title"))
      .text(d => d.name);

  // Append the axis for each key.
  const axes = svg.append("g")
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
    .attr("x", (900))
    .attr("y", 15)
    .text("Hours of music listened to, corresponding with anxiety and depression (Brushable)");

  const deselectedColor = "#ddd";
  const brushHeight = 50;
  const brush = d3.brushX()
        .extent([ // Determine how wide/tall a brush can be
          [marginLeft, -(brushHeight / 2)],
          [width - marginRight, brushHeight / 2]
        ])
        .on("start brush end", brushed); // actually performing actions
  
  axes.call(brush); // They deliberately called on the axes, which has to do with the event functions.
    //axes refer to the selection where they are actually drawing out the axes.
  
  
  const selections = new Map(); // dictionary structure in python
  
  function brushed({selection}, key) { // in d3, event functions often are in this form, i.e., function(event, d), where event refers to the mouse event and d is the data associated with the element
      // By calling brush on axes, the brush is now bound to the data, "keys". So each key would be the elements in the variable "keys", which helps you identify which axis is brushed.
      if (selection === null) selections.delete(key);
      // Here, the "x" is a dictionary object, where the key refers to the element in "keys", and the value refers to the corresponding axis scale. 
      // So x.get(key) retrieves the axis scale, where scale.invert() takes the screen pixels and inverts them back to the data range. selection.map(scale.invert) === selection.map(pixel => scale.invert(pixel))
      // selections = {key1: [brushedDataRange], key2: [brushedDataRange], ...}
      else selections.set(key, selection.map(x.get(key).invert));
      const selected = [];
      //console.log(selections, key); // you can check this
      path.each(function(d) { // path is keeping the collection of the line elements
        //active is a boolean, true when the values of a line all fall into the brushed ranges.
        const active = Array.from(selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max);
        // this is performing highlight and dehighlight stuff
        //console.log(active)
        //console.log(d3.select(this))
        d3.select(this).style("stroke", active ? "steelblue" : deselectedColor); //active ? color(d[keyz]) : deselectedColor
        if (active) {
          d3.select(this).raise();
          selected.push(d);
        }
      });
      svg.property("value", selected).dispatch("input");
    }
}