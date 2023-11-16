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
    <span class="size-3">Click or hover over genres. Brush over axes.</span>
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

let clicked = false, selected_genre

function initChart() {

    const svg = d3.select("#overview-svg")

    const color = () => "#800000"
    // d3.scaleOrdinal()
    //     .domain(["Latin", "Rock", "Video game music", "Jazz", "R&B", "K pop", "Country", "EDM", "Hip hop", "Pop", "Rap", "Classical", "Metal", "Folk", "Lofi", "Gospel"])
    //     .range(["#2f4f4f", "#800000", "#006400", "#b8860b", "#00008b", "#ff0000", "#00ced1", "#7cfc00", "#00fa9a", "#0000ff", "#ff00ff", "#1e90ff", "#ffff54", "#dda0dd", "#ff1493", "#ffe4b5"])

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

    let selected = []

    const highlight = function (event, d) {

        selected_genre = d["Fav genre"]
        ppath.each(function(pd) {

            if ((selected.length == 0 || selected.includes(pd)) && (!selected_genre || pd["Fav genre"] == selected_genre)) {
                d3.select(this)
                    .raise()
                    // .transition().duration(200)
                    .style("stroke", color(pd["Fav genre"]))
                    .style("opacity", "1")
            }
            else if (pd["Fav genre"] == selected_genre) {
                d3.select(this)
                    // .transition().duration(200)
                    .style("stroke", color(pd["Fav genre"]))
                    .style("opacity", "0.05")
            }
            else {
                d3.select(this)
                // .transition().duration(200)
                .lower()
                .style("stroke", "lightgrey")
                .style("opacity", "0.5")
            }
        });
        d3.selectAll(".leg-item")
            // .transition().duration(200)
            .style("opacity", "0.3")
        d3.selectAll(".leg-" + escapeCSS(selected_genre))
            // .transition().duration(200)
            .style("opacity", "1")

        gcontext.genre = selected_genre
        gcontext.keepsame = "overview"
        gcontext.reset()
    }

    const doNotHighlight = function (event, d) {
        selected_genre = null
        ppath.each(function(pd) {

            if ((selected.length == 0 || selected.includes(pd)) && (!selected_genre || pd["Fav genre"] == selected_genre)) {
                d3.select(this)
                    .raise()
                    // .transition().duration(200)
                    .style("stroke", color(pd["Fav genre"]))
                    .style("opacity", "1")
            }
            else if (pd["Fav genre"] == selected_genre) {
                d3.select(this)
                    // .transition().duration(200)
                    .style("stroke", color(pd["Fav genre"]))
                    .style("opacity", "0.05")
            }
            else {
                d3.select(this)
                // .transition().duration(200)
                .lower()
                .style("stroke", "lightgrey")
                .style("opacity", "0.5")
            }
        });
        d3.selectAll(".leg-item")
            // .transition().duration(200)
            .style("opacity", "1")

        gcontext.genre = selected_genre
        gcontext.keepsame = "overview"
        gcontext.reset()
    }

    function path(d) {
        return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
    }

    let ppath = svg
        .selectAll("myPath")
        .data(gdata)
        .join("path")
        .attr("class", function (d) { return "line " + escapeCSS(d["Fav genre"]) }) 
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", function (d) { return (color(d["Fav genre"])) })
        .style("opacity", 0.5)
        .on("mouseover", (e, d) => !clicked && highlight(e, d))
        // .on("click", (e, d) => (clicked = true) && highlight(e, d))
        .on("mouseleave", (e, d) => !clicked && doNotHighlight(e, d))

    let axes = svg.selectAll("myAxis")
        .data(dimensions).enter()
        .append("g")
        .attr("class", "axis")
        .attr("transform", function (d) { return `translate(${x(d)})` })
        .each(function (d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
    axes
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
            .attr("cursor", "pointer")
            .on("mouseover", evt => !clicked && highlight(evt, { "Fav genre": val }))
            .on("click", evt => {
                if (clicked != val) {
                    highlight(evt, { "Fav genre": val })
                    clicked = val
                }
                else {
                    doNotHighlight(evt, { "Fav genre": val })
                    clicked = ""
                }
                // clicked = !clicked
            })
            .on("mouseleave", evt => !clicked && doNotHighlight(evt, { "Fav genre": val }))

        key.append("title")
            .text(val)
    
        // key.append("rect")
        //     .attr("width", 10)
        //     .attr("height", 10)
        //     .attr("x", -12)
        //     .attr("y", -10)
        //     .attr("fill", color(val))
    
        key.append("text")
            .text(shorten(val))
            .attr("class", "size-3 ov-leg-text")

        offset += 30

    }

    // Create the brush behavior.
    const deselectedColor = "#ddd";
    const brushWidth = 50;
    const brush = d3.brushY()
        .extent([
          [-(brushWidth / 2), margin.top],
          [brushWidth / 2, size.height - margin.bottom]
        ])
        .on("start brush end", brushed);
  
    axes.call(brush);
  
    const selections = new Map();
    // const myX = new Map(Array.from(dimensions, key => [key, d3.scaleLinear(d3.extent(data, d => d[key]), [marginLeft, width - marginRight])]));
  
    function brushed({selection}, key) {
      if (selection === null) selections.delete(key);
      else selections.set(key, selection.map(y[key].invert));
        console.log(selections)


        ppath.each(function (d) {
            //   console.log(d[key])
            let active = Array.from(selections).every(([key, [max, min]]) => d[key] >= min && d[key] <= max);
            // let hov_active = active && (selected_genre.length == 0 || d["Fav genre"] == selected_genre)
            // d3.select(this).style("opacity", active ? 1 : 0.15).style("stroke", hov_active ? color(d["Fav genre"]) : "lightgrey");
            if (active) {
                if (!selected.includes(d))
                    selected.push(d);
            }
            else {
                const index = selected.indexOf(d);
                if (index > -1) {
                    selected.splice(index, 1);
                }
            }

            if (active && (!selected_genre || d["Fav genre"] == selected_genre)) {
                d3.select(this)
                    .raise()
                    // .transition().duration(200)
                    .style("stroke", color(d["Fav genre"]))
                    .style("opacity", "1")
            }
            else if (d["Fav genre"] == selected_genre) {
                d3.select(this)
                    // .transition().duration(200)
                    .style("stroke", color(d["Fav genre"]))
                    .style("opacity", "0.05")
            }
            else {
                d3.select(this)
                // .transition().duration(200)
                .lower()
                .style("stroke", "lightgrey")
                .style("opacity", "0.5")
            }
        });
    }
}