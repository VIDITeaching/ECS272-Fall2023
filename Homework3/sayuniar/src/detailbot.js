import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';
import { groupBy } from './utils';

const margin = { left: 50, right: 40, top: 50, bottom: 100 }
let size = { width: 0, height: 0 }
let gdata, gcontext
let gstacked = false

export const resetDetailBot = () => {
    if (gcontext.keepsame == "detailbot") return
    d3.select('#detailbot-svg').selectAll('*').remove()
    //console.log(size, bars)
    initChart()
}

const onResize = (targets) => {
    targets.forEach(target => {
        if (target.target.getAttribute('id') !== 'detailbot') return;
        size = { width: target.contentRect.width, height: target.contentRect.height }
        if (!isEmpty(size) && !isEmpty(gdata)) {
            resetDetailBot()
        }
    })
}
const chartObserver = new ResizeObserver(debounce(onResize, 100))

function processData(_data) {
    let data = groupBy(_data, "Fav genre")
    let formattedData = []

    Object.keys(data).forEach(d => {

        let processedObj = {
            favGenre: d,
        }

        for (let val of ["Anxiety", "Depression", "Insomnia", "OCD"]) {
            let initialValue = 0
            let cum = data[d].reduce((acc, curvalue) => acc + curvalue[val], initialValue)
            let average = cum / data[d].length
            processedObj[val] = average
        }

        formattedData.push(processedObj)
    })

    return formattedData
}

export const DetailBot = () => (`
    <div class='viewcard' id='detailbot'>
    <h2>Average Mental Health By Genre</h2>
    <svg id='detailbot-svg' width='100%' height='100%'>
    </svg>
    <div id="bar-stacked">
    <input type="checkbox" id="stacked" name="stacked"/>
    <label for="stacked">Stacked</label>
    </div>
    </div>
`)

let x, y, gy, yAxis

function getY(curObj, ind) {
    if (ind >= gdata.length * 3)
        return y(curObj["OCD"])
    if (ind >= gdata.length * 2)
        return y(curObj["Insomnia"]) + y(curObj["OCD"]) - y(0)
    if (ind >= gdata.length * 1)
        return y(curObj["Depression"]) + y(curObj["Insomnia"]) + y(curObj["OCD"]) - y(0) * 2
    
    return y(curObj["Anxiety"]) + y(curObj["Depression"]) + y(curObj["Insomnia"]) + y(curObj["OCD"]) - y(0) * 3
}

function getHeight(curObj, ind) {
    if (ind >= gdata.length * 3)
        return y(0) - y(curObj["OCD"])
    if (ind >= gdata.length * 2)
        return y(0) - y(curObj["Insomnia"])
    if (ind >= gdata.length * 1)
        return y(0) - y(curObj["Depression"])
    
    return y(0) - y(curObj["Anxiety"])
}

function getX(curObj, ind) {
    if (ind >= gdata.length * 3)
        return x(curObj.favGenre) + 15
    if (ind >= gdata.length * 2)
        return x(curObj.favGenre) + 10
    if (ind >= gdata.length * 1)
        return x(curObj.favGenre) + 5
    
    return x(curObj.favGenre)
}

function getY2(curObj, ind) {
    if (ind >= gdata.length * 3)
        return y(curObj["OCD"])
    if (ind >= gdata.length * 2)
        return y(curObj["Insomnia"])
    if (ind >= gdata.length * 1)
        return y(curObj["Depression"])
    
    return y(curObj["Anxiety"])
}

export function mountDetailBot(_data, _context) {
    gdata = processData(_data)
    gcontext = _context
    let barContainer = document.querySelector('#detailbot')
    chartObserver.observe(barContainer)

    document.querySelector('#bar-stacked').addEventListener('change', ev => {
        gstacked = ev.target.checked
        if (gcontext.keepsame == "detailbot") return
        // d3.select('#detailbot-svg').selectAll('*').remove()
        //console.log(size, bars)
        // initChart()
        y.domain([0, gstacked ? 40 : 10])


        const barrect = d3
            .selectAll(".barrect")

        if (gstacked) {

            gy.transition()
                .duration(200)
                .call(yAxis, y)

            barrect
                .transition()
                .duration(200)
                .attr('y', getY)
                .attr('height', getHeight)
            barrect
                .transition()
                .duration(200)
                .delay(300)
                .attr('x', (d) => x(d.favGenre))

        }
        else {

            gy.transition()
                .delay(300)
                .duration(200)
                .call(yAxis, y)
            barrect
                .transition()
                .duration(200)
                .attr('x', getX)
            barrect
                .transition()
                .duration(200)
                .delay(300)
                .attr('y', getY2)
                .attr('height', getHeight)
            
        }
    })
}

function initChart() {

    let dd = document.querySelector('#bar-stacked').style
    dd.left = `${(size.width - margin.left - margin.right) / 2}px`
    dd.top = `${size.height - margin.bottom + 70}px`

    const svg = d3.select("#detailbot-svg")

    x = d3.scaleBand()
        .domain(gdata.map(d => d.favGenre))
        .rangeRound([margin.left, size.width - margin.right])
        .padding(0.1);
    y = d3.scaleLinear()
        .domain([0, gstacked ? 40 : 10])
        .range([size.height - margin.bottom, margin.top])
    const color = d3.scaleOrdinal()
        .domain(["Anxiety", "Depression", "Insomnia", "OCD"])
        .range(["coral", "steelblue", "darkgreen", "darkviolet"])

    let bars = svg.selectAll("rect").data(gdata).enter()

    if (gstacked) {
        bars.append("rect")
            .attr("class", "barrect")
            .attr('x', (d) => x(d.favGenre))
            .attr('y', (d) => y(d["Anxiety"]) + y(d["Depression"]) + y(d["Insomnia"]) + y(d["OCD"]) - y(0) * 3)
            .attr("height", (d) => y(0) - y(d["Anxiety"]))
            .attr("width", x.bandwidth() / 3)
            .attr("fill", d => color("Anxiety"))
            .attr("opacity", d => (!gcontext.genre || gcontext.genre == d.favGenre) ? 1 : 0.1)

        bars.append("rect")
            .attr("class", "barrect")
            .attr('x', (d) => x(d.favGenre))
            .attr('y', (d) => y(d["Depression"]) + y(d["Insomnia"]) + y(d["OCD"]) - y(0) * 2)
            .attr("height", (d) => y(0) - y(d["Depression"]))
            .attr("width", x.bandwidth() / 3)
            .attr("fill", d => color("Depression"))
            .attr("opacity", d => (!gcontext.genre || gcontext.genre == d.favGenre) ? 1 : 0.1)

        bars.append("rect")
            .attr("class", "barrect")
            .attr('x', (d) => x(d.favGenre))
            .attr('y', (d) => y(d["Insomnia"]) + y(d["OCD"]) - y(0))
            .attr("height", (d) => y(0) - y(d["Insomnia"]))
            .attr("width", x.bandwidth() / 3)
            .attr("fill", d => color("Insomnia"))
            .attr("opacity", d => (!gcontext.genre || gcontext.genre == d.favGenre) ? 1 : 0.1)

        bars.append("rect")
            .attr("class", "barrect")
            .attr('x', (d) => x(d.favGenre))
            .attr('y', (d) => y(d["OCD"]))
            .attr("height", (d) => y(0) - y(d["OCD"]))
            .attr("width", x.bandwidth() / 3)
            .attr("fill", d => color("OCD"))
            .attr("opacity", d => (!gcontext.genre || gcontext.genre == d.favGenre) ? 1 : 0.1)
    }
    else {
        bars.append("rect")
            .attr("class", "barrect")
            .attr('x', (d) => x(d.favGenre))
            .attr('y', (d) => y(d["Anxiety"]))
            .attr("height", (d) => y(0) - y(d["Anxiety"]))
            .attr("width", x.bandwidth() / 3)
            .attr("fill", d => color("Anxiety"))
            .attr("opacity", d => (!gcontext.genre || gcontext.genre == d.favGenre) ? 1 : 0.1)

        bars.append("rect")
            .attr("class", "barrect")
            .attr('x', (d) => x(d.favGenre) + 5)
            .attr('y', (d) => y(d["Depression"]))
            .attr("height", (d) => y(0) - y(d["Depression"]))
            .attr("width", x.bandwidth() / 3)
            .attr("fill", d => color("Depression"))
            .attr("opacity", d => (!gcontext.genre || gcontext.genre == d.favGenre) ? 1 : 0.1)

        bars.append("rect")
            .attr("class", "barrect")
            .attr('x', (d) => x(d.favGenre) + 10)
            .attr('y', (d) => y(d["Insomnia"]))
            .attr("height", (d) => y(0) - y(d["Insomnia"]))
            .attr("width", x.bandwidth() / 3)
            .attr("fill", d => color("Insomnia"))
            .attr("opacity", d => (!gcontext.genre || gcontext.genre == d.favGenre) ? 1 : 0.1)

        bars.append("rect")
            .attr("class", "barrect")
            .attr('x', (d) => x(d.favGenre) + 15)
            .attr('y', (d) => y(d["OCD"]))
            .attr("height", (d) => y(0) - y(d["OCD"]))
            .attr("width", x.bandwidth() / 3)
            .attr("fill", d => color("OCD"))
            .attr("opacity", d => (!gcontext.genre || gcontext.genre == d.favGenre) ? 1 : 0.1)
    }

    const xAxis = g => g
        .attr("transform", `translate(0,${size.height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))

    svg.append("g")
        .call(xAxis)
        .call(g =>
            g.select(".tick:last-of-type text")
                .clone()
                .attr("text-anchor", "middle")
                .attr("x", -(size.width - margin.left - margin.right) / 2)
                .attr("y", 20)
                .attr("font-weight", "bold")
                .text("Fav Genre")
        );

    gy = svg.append("g")
        .call(yAxis)
        .call(g =>
            g
                .select(".tick:first-of-type text")
                .clone()
                .attr("transform", `rotate(-90)`)
                .attr("text-anchor", "middle")
                .attr("x", (size.height - margin.top - margin.bottom) / 2)
                .attr("y", -30)
                .attr("font-weight", "bold")
                .text("Rank")
        );

    const legend = svg.append("g")
        .attr("transform", `translate(${size.width / 4},${size.height - margin.bottom + 60})`)

    let offset = 0
    for (let val of ["Anxiety", "Depression", "Insomnia", "OCD"]) {

        let key = legend.append("g")
            .attr("transform", `translate(${offset},0)`)

        key.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("x", -12)
            .attr("y", -10)
            .attr("fill", color(val))
        // .text("Anxiety")

        key.append("text")
            .text(val)
            .attr("font-size", 10)

        offset += 100

    }
}