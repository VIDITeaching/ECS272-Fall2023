import * as d3 from 'd3';
import { isEmpty, debounce, _ } from 'lodash';

let full_data = await d3.csv("./data/mxmh_survey_results.csv")
//console.log(full_data)

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
    `<div class='bar flex-column flex-grow d-flex' id='mybar-container'>
      <div class= 'd-flex'>
        <button id = "Users">Users</button>
        <button id = "Depression">Depression</button>
        <button id = "Anxiety">Anxiety</button>
        <button id = "Insomnia">Insomnia</button>
        <button id = "OCD">OCD</button>
      </div>
      <div class= 'd-flex flex-grow'>
        <svg id='bar-svg' width='100%' height='100%'>
        </svg>
      </div>
    </div>`
)

export function myMountBarChart() { // registering this element to watch its size change
    let barContainer = document.querySelector('#mybar-container')
    chartObserver.observe(barContainer)
}

let data = full_data.map(d => {
    return {
      StreamingService: d["Primary streaming service"],
      Anxiety: d["Anxiety"],
      Depression: d["Depression"],
      Insomnia: d["Insomnia"],
      OCD: d["OCD"],
    };
})

//update function


// Identical to initChart() in Vue template, except no Typescript expression.
function initChart() {
        const margin = ({top: 20, right: 20, bottom: 150, left: 40});
        const width = size.width;
        const height = size.height;


        function update(data) {

          console.log(data)

          var u = svg.selectAll("rect")
            .data(data)
        
          u
            .join("rect")
            .transition()
            .duration(1000)
              .attr("x", d => x(d.StreamingService))
              .attr("y", d=> y(d.count))
              .attr("width", x.bandwidth())
              .attr("height", d => y(0) - y(d.count))
              .attr("fill", "maroon")
        }
      
        // calculate counts
        let counts = Array.from(d3.rollup(data, v => v.length, d => d.StreamingService), ([key, value]) => ({StreamingService: key, count: value}));
        counts = counts.slice(0, 6)   
        
        console.log(counts)

        //depression
        let depression_counts = Array.from(d3.rollup(data, v => v.length, d => d.StreamingService, d=> d.Depression), ([key, value]) => ({StreamingService: key, count: value}));
        depression_counts = depression_counts.slice(0, 6) 

        let dep_counts = _.cloneDeep(counts);
        for (let key in depression_counts) {
          dep_counts[key].count = counts[key].count - depression_counts[key].count.get("0")
        }
        //console.log(dep_counts)
        //dep_counts[1].count = 11
        //

        //Anxiety
        let anxiety_counts = Array.from(d3.rollup(data, v => v.length, d => d.StreamingService, d=> d.Anxiety), ([key, value]) => ({StreamingService: key, count: value}));
        anxiety_counts = anxiety_counts.slice(0, 6) 

        let anx_counts = _.cloneDeep(counts);
        for (let key in anxiety_counts) {
          anx_counts[key].count = counts[key].count - anxiety_counts[key].count.get("0")
        }
        anx_counts[1].count = 11
        //console.log(anx_counts)
        //

        //Insomnia
        let insomnia_counts = Array.from(d3.rollup(data, v => v.length, d => d.StreamingService, d=> d.Insomnia), ([key, value]) => ({StreamingService: key, count: value}));
        insomnia_counts = insomnia_counts.slice(0, 6) 

        let ins_counts = _.cloneDeep(counts);
        for (let key in insomnia_counts) {
          ins_counts[key].count = counts[key].count - insomnia_counts[key].count.get("0")
        }
        //console.log(ins_counts)
        //

        //OCD
        let ocd_counts = Array.from(d3.rollup(data, v => v.length, d => d.StreamingService, d=> d.OCD), ([key, value]) => ({StreamingService: key, count: value}));
        ocd_counts = ocd_counts.slice(0, 6) 

        let o_counts = _.cloneDeep(counts);
        for (let key in ocd_counts) {
          o_counts[key].count = counts[key].count - ocd_counts[key].count.get("0")
        }
        //console.log(o_counts)
        //

        const x = d3.scaleBand()
          .domain(counts.map(d => d.StreamingService))
          .range([margin.left, width - margin.right])
          .padding(0.5);
      
        const y = d3.scaleLinear()
          .domain([0, d3.max(counts, d => d.count)]).nice()
          .range([height - margin.bottom, margin.top]);
      
        let svg = d3.select('#bar-svg')  
        //const svg = d3.create("svg")
        //  .attr("viewBox", [0, 0, width, height]);

      
        svg.append("g")
          .attr("fill", "maroon")
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
            .text("People by Streaming Service");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 4)
            .attr("x", -75)
            .attr("dy", ".55em")
            .attr("transform", "rotate(-90)")
            .text("Number of people");

  
   d3.select("#Users").on("click", () => update(counts)) 
   d3.select("#Depression").on("click", () => update(dep_counts))
   d3.select("#Anxiety").on("click", () => update(anx_counts))        
   d3.select("#Insomnia").on("click", () => update(ins_counts)) 
   d3.select("#OCD").on("click", () => update(o_counts)) 
}