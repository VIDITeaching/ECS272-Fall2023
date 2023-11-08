import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';

const margin = { left: 50, right: 40, top: 50, bottom: 90 }
let size = { width: 0, height: 0 }
let gdata, gcontext
let gmode = "Hours per day"

export const resetDetailTop = () => {
    if (gcontext.keepsame == "detailtop") return
    d3.select('#detailtop-svg').selectAll('*').remove()
    //console.log(size, bars)
    initChart()

}

const onResize = (targets) => {
    targets.forEach(target => {
        if (target.target.getAttribute('id') !== 'detailtop') return;
        size = { width: target.contentRect.width, height: target.contentRect.height }
        if (!isEmpty(size) && !isEmpty(gdata)) {
            resetDetailTop()
        }
    })
}
const chartObserver = new ResizeObserver(debounce(onResize, 100))

export const DetailTop = () => (`
    <div class='viewcard' id='detailtop'>
    <h2>Mental Health Rankings</h2>
    <svg id='detailtop-svg' width='100%' height='100%'>
    </svg>
    <select id="scat-param" name="scat-param">
      <option value="Hours per day">Hours per day</option>
      <option value="BPM">BPM</option>
      <option value="Age">Age</option>
    </select>
    </div>
`)

export function mountDetailTop(_data, _context) {
    gdata = _data.filter(d => d["Hours per day"] && d["BPM"] < 250 && d["BPM"] > 0)
    gcontext = _context
    let barContainer = document.querySelector('#detailtop')
    chartObserver.observe(barContainer)

    document.querySelector('#scat-param').addEventListener('change', ev => {
        gmode = ev.target.value
        resetDetailTop()
    })
}

function initChart() {    
    
    let dd = document.querySelector('#scat-param').style
        dd.left = `${(size.width - margin.left - margin.right) / 2}px`
        dd.top = `${size.height - margin.bottom + 30}px`
    
    const svg = d3.select("#detailtop-svg")

    const x = d3.scaleLinear()
        .domain(d3.extent(gdata, d => d[gmode]))
        .range([margin.left, size.width - margin.right]);
    const y = d3.scaleLinear()
        .domain([0, 10])
        .range([size.height - margin.bottom, margin.top])
    const color = d3.scaleOrdinal()
        .domain(["Anxiety", "Depression", "Insomnia", "OCD"])
        .range(["coral", "steelblue", "darkgreen", "darkviolet"])

    const circs = svg.selectAll("circle").data(gdata).enter()

    circs.append("circle")
        .attr('cx', (d) => x(d[gmode]))
        .attr('cy', (d) => y(d["Anxiety"]))
        .attr("r", (d) => 5)
        .attr("fill", d => color("Anxiety"))
        .attr("opacity", d => (!gcontext.genre || gcontext.genre == d["Fav genre"]) ? 1 : 0)

    circs.append("circle")
        .attr('cx', (d) => x(d[gmode]))
        .attr('cy', (d) => y(d["Depression"]))
        .attr("r", (d) => 5)
        .attr("fill", d => color("Depression"))
        .attr("opacity", d => (!gcontext.genre || gcontext.genre == d["Fav genre"]) ? 1 : 0)

    circs.append("circle")
        .attr('cx', (d) => x(d[gmode]))
        .attr('cy', (d) => y(d["Insomnia"]))
        .attr("r", (d) => 5)
        .attr("fill", d => color("Insomnia"))
        .attr("opacity", d => (!gcontext.genre || gcontext.genre == d["Fav genre"]) ? 1 : 0)

    circs.append("circle")
        .attr('cx', (d) => x(d[gmode]))
        .attr('cy', (d) => y(d["OCD"]))
        .attr("r", (d) => 5)
        .attr("fill", d => color("OCD"))
        .attr("opacity", d => (!gcontext.genre || gcontext.genre == d["Fav genre"]) ? 1 : 0)

    const xAxis = g => g
        .attr("transform", `translate(0,${size.height - margin.bottom})`)
        .call(d3.axisBottom(x))

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))

    svg.append("g")
        .call(xAxis)
        // .call(g =>
        //     g.select(".tick:last-of-type text")
        //         .clone()
        //         .attr("text-anchor", "middle")
        //         .attr("x", -(size.width - margin.left - margin.right) / 2)
        //         .attr("y", 20)
        //         .attr("font-weight", "bold")
        //         .text("Hours per day")
        // );

    svg.append("g")
        .call(yAxis)
        .call(g =>
            g
                .select(".tick:last-of-type text")
                .clone()
                .attr("transform", `rotate(-90)`)
                .attr("text-anchor", "middle")
                .attr("x", -(size.height - margin.top - margin.bottom) / 2)
                .attr("y", -30)
                .attr("font-weight", "bold")
                .text("Rank")
        );

    const legend = svg.append("g")
        .attr("transform", `translate(${size.width / 4},${size.height - margin.bottom + 65})`)

    let offset = 0
    for (let val of ["Anxiety", "Depression", "Insomnia", "OCD"]) {

        let key = legend.append("g")
            .attr("transform", `translate(${offset},0)`)
    
        key.append("circle")
            // .attr("width", 10)
            .attr("r", 5)
            .attr("cx", -6)
            .attr("cy", -5)
            .attr("fill", color(val))
        // .text("Anxiety")
    
        key.append("text")
            .text(val)
            .attr("font-size", 10)

        offset += 100

    }
}