import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';

let full_data = await d3.csv("./data/mxmh_survey_results.csv")
console.log(full_data)

var size = { width: 0, height: 0 }

const onResize = (targets) => {
    targets.forEach(target => {
        if (target.target.getAttribute('id') !== 'mybar-container') return;
          size = { width: target.contentRect.width, height: target.contentRect.height }
          if (!isEmpty(size) && !isEmpty(full_data)) {
            d3.select('#bar-svg').selectAll('*').remove()
   //         //console.log(size, bars)
            initChart()
        }
    })
  }
const chartObserver = new ResizeObserver(debounce(onResize, 100))

export const myBarChart = () => ( // equivalent to <template> in Vue
    `<div class='bar d-flex' id='mybar-container'>
        <svg id='bar-svg' width='100%' height='100%'>
        </svg>
    </div>`
)

export function myMountBarChart() { // registering this element to watch its size change
    let barContainer = document.querySelector('#mybar-container')
    chartObserver.observe(barContainer)
}

let data = full_data.map(d => {
    return {
      StreamingService: d["Primary streaming service"],
    };
})

// Identical to initChart() in Vue template, except no Typescript expression.
function initChart() {
        const margin = ({top: 20, right: 20, bottom: 150, left: 40});
        const width = size.width;
        const height = size.height;
      
        // calculate counts
        let counts = Array.from(d3.rollup(data, v => v.length, d => d.StreamingService), ([key, value]) => ({StreamingService: key, count: value}));
        counts = counts.slice(0, 6)

        const x = d3.scaleBand()
          .domain(counts.map(d => d.StreamingService))
          .range([margin.left, width - margin.right])
          .padding(0.3);
      
        const y = d3.scaleLinear()
          .domain([0, d3.max(counts, d => d.count)]).nice()
          .range([height - margin.bottom, margin.top]);
      
        let svg = d3.select('#bar-svg')  
        //const svg = d3.create("svg")
        //  .attr("viewBox", [0, 0, width, height]);
      
        svg.append("g")
          .attr("fill", "red")
          .selectAll("rect")
          .data(counts)
          .join("rect")
            .attr("x", d => x(d.StreamingService))
            .attr("y", d => y(d.count))
            .attr("height", d => y(0) - y(d.count))
            .attr("width", x.bandwidth());
      
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .selectAll("text")  
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)") 
            .style("text-anchor", "end")
            .attr("font-size", "10px")
          
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .attr("font-size", "10px")

        svg.append("text")
            .attr("class", "title")
            .attr("text-anchor", "end")
            .attr("x", width-200)
            .attr("y", 15)
            .text("Users per streaming service");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 4)
            .attr("x", -75)
            .attr("dy", ".55em")
            .attr("transform", "rotate(-90)")
            .text("# of users");

  
        
}