import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';
import { escapeCSS, shorten } from './utils';

const margin = { left: 120, right: 40, top: 100, bottom: 100 }
let size = { width: 0, height: 0 }
let gdata, gcontext

export const resetOverview = () => {
    if (gcontext.keepsame == "overview") return
    d3.select('#overview-svg').selectAll('*').remove()
    //console.log(size, bars)
    initChart()
}

const onResize = (targets) => {
    targets.forEach(target => {
        if (target.target.getAttribute('id') !== 'overview') return;
        size = { width: target.contentRect.width, height: target.contentRect.height }
        if (!isEmpty(size) && !isEmpty(gdata)) {
            resetOverview()
        }
    })
}
const chartObserver = new ResizeObserver(debounce(onResize, 100))

export const Overview = () => (`
    <div class='viewcard' id='overview'>
    <h1>Music & Mental Health</h1>
    <span class="size-3">Hover over genres</span>
    <svg id='overview-svg' width='100%' height='100%'>
    </svg>
    <p>Mental Health Rankings: 0 - I do not experience this; 10 - I experience this regularly, constantly/or to an extreme.</p>
    </div>
`)

export function mountOverview(_data, _context) {
    gdata = _data
    gcontext = _context
    let barContainer = document.querySelector('#overview')
    chartObserver.observe(barContainer)
}

function initChart() {

    const svg = d3.select("#overview-svg")

    const color = d3.scaleOrdinal()
        .domain(["Latin", "Rock", "Video game music", "Jazz", "R&B", "K pop", "Country", "EDM", "Hip hop", "Pop", "Rap", "Classical", "Metal", "Folk", "Lofi", "Gospel"])
        .range(["#2f4f4f", "#800000", "#006400", "#b8860b", "#00008b", "#ff0000", "#00ced1", "#7cfc00", "#00fa9a", "#0000ff", "#ff00ff", "#1e90ff", "#ffff54", "#dda0dd", "#ff1493", "#ffe4b5"])

    const dimensions = ["Age", "Anxiety", "Depression", "Insomnia", "OCD"]

    const y = {}
    for (let i in dimensions) {
        let name = dimensions[i]
        y[name] = d3.scaleLinear()
            .domain(d3.extent(gdata, function(d) { return +d[name]; }))
            .range([size.height - margin.bottom, margin.top])
    }

    const x = d3.scalePoint()
    .range([margin.left, size.width - margin.right])
        .domain(dimensions);

    const highlight = function (event, d) {

        let selected_genre = d["Fav genre"]

        d3.selectAll(".line")
            .transition().duration(200)
            .style("stroke", "lightgrey")
            .style("opacity", "0.05")
        d3.selectAll(".leg-item")
            .transition().duration(200)
            .style("opacity", "0.3")
        d3.selectAll("." + escapeCSS(selected_genre))
            .transition().duration(200)
            .style("stroke", color(selected_genre))
            .style("opacity", "1")
        d3.selectAll(".leg-" + escapeCSS(selected_genre))
            .transition().duration(200)
            .style("opacity", "1")

        gcontext.genre = selected_genre
        gcontext.keepsame = "overview"
        gcontext.reset()
    }

    const doNotHighlight = function (event, d) {
        d3.selectAll(".line")
            .transition().duration(200)
            .style("stroke", function (d) { return (color(d["Fav genre"])) })
            .style("opacity", "1")
            
        d3.selectAll(".leg-item")
            .transition().duration(200)
            .style("opacity", "1")
        gcontext.genre = null
        gcontext.keepsame = "overview"
        gcontext.reset()
    }

    function path(d) {
        return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
    }

    svg
        .selectAll("myPath")
        .data(gdata)
        .join("path")
        .attr("class", function (d) { return "line " + escapeCSS(d["Fav genre"]) }) 
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", function (d) { return (color(d["Fav genre"])) })
        .style("opacity", 0.5)
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight)

    svg.selectAll("myAxis")
        .data(dimensions).enter()
        .append("g")
        .attr("class", "axis")
        .attr("transform", function (d) { return `translate(${x(d)})` })
        .each(function (d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
        .append("text")
        .attr("class", "size-5")
        .style("text-anchor", "middle")
        .attr("y", margin.top - 10)
        .text(d => d)
        // .style("fill", "#ccc")

    const legend = svg.append("g")
        .attr("transform", `translate(${20},${margin.top})`)

    let offset = 0
    for (let val of ["Latin", "Rock", "Video game music", "Jazz", "R&B", "K pop", "Country", "EDM", "Hip hop", "Pop", "Rap", "Classical", "Metal", "Folk", "Lofi", "Gospel"]) {

        let key = legend.append("g")
            .attr("class", "leg-item leg-" + escapeCSS(val))
            .attr("transform", `translate(0, ${offset})`)
            .on("mouseover", evt => highlight(evt, { "Fav genre": val }))
            .on("mouseleave", evt => doNotHighlight(evt, { "Fav genre": val }))

        key.append("title")
            .text(val)
    
        key.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("x", -12)
            .attr("y", -10)
            .attr("fill", color(val))
    
        key.append("text")
            .text(shorten(val))
            .attr("class", "size-3 ov-leg-text")

        offset += 30

    }
}