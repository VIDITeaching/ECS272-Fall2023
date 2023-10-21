import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';
import { readCSV } from './CSV-Reader';

var size = { width: 0, height: 0 }

// data is like [["Grass","quadruped",17], ..] to signify Type, Body Style and the count
const preprocess = function preProcessData(data) {
    const typeCounts = {};

    data.forEach(function (d) {
        // Increment the count for Type_1
        if (typeCounts[d.Type_1]) {
            typeCounts[d.Type_1].count++;
            if (typeCounts[d.Type_1].bodyStyles[d.Body_Style]) {
                typeCounts[d.Type_1].bodyStyles[d.Body_Style]++;
            } else {
                typeCounts[d.Type_1].bodyStyles[d.Body_Style] = 1;
            }
        } else {
            typeCounts[d.Type_1] = {
                count: 1,
                bodyStyles: { [d.Body_Style]: 1 }
            };
        }

        // Increment the count for Type_2
        if (d.Type_2 !== "") {
            if (typeCounts[d.Type_2]) {
                typeCounts[d.Type_2].count++;
                if (typeCounts[d.Type_2].bodyStyles[d.Body_Style]) {
                    typeCounts[d.Type_2].bodyStyles[d.Body_Style]++;
                } else {
                    typeCounts[d.Type_2].bodyStyles[d.Body_Style] = 1;
                }
            } else {
                typeCounts[d.Type_2] = {
                    count: 1,
                    bodyStyles: { [d.Body_Style]: 1 }
                };
            }
        }
    });

    const result = [];
    for (const key in typeCounts) {
        const typeCountInfo = typeCounts[key];
        const typeObj = { Type: key };

        const bodyStyles = [];
        for (const styleKey in typeCountInfo.bodyStyles) {
            bodyStyles.push({ Body_Style: styleKey, Count: typeCountInfo.bodyStyles[styleKey] });
        }
        typeObj.Body_Styles = bodyStyles;

        result.push(typeObj);
    }

    const heatMapResults = [];

    for (const element in result) {
        var currType = result[element].Type;
        for (const body in result[element].Body_Styles) {
            heatMapResults.push([currType, result[element].Body_Styles[body].Body_Style, result[element].Body_Styles[body].Count]);
        }
    }

    console.log(heatMapResults);

    return heatMapResults;
}

const data = await readCSV();
const postData = preprocess(data);

const onResize = (targets) => {
    targets.forEach(target => {
        if (target.target.getAttribute('id') !== 'heat-map-container') return;
        size = { width: target.contentRect.width, height: target.contentRect.height }
        if (!isEmpty(size) && !isEmpty(data)) {
            d3.select('#heat-map-svg').selectAll('*').remove()
            createHeatMap(postData);
        }
    })
}

const chartObserver = new ResizeObserver(debounce(onResize, 100))

export const HeatMap = () => (
    `<div class='heat-map-container d-flex' id='heat-map-container'>
        <svg id='heat-map-svg' width='100%' height='100%'>
        </svg>
    </div>`
)

export function mountHeatMap() {
    const container = document.querySelector('#heat-map-container')
    chartObserver.observe(container)
}

function createHeatMap(data) {
    var margin = { top: 50, right: 70, bottom: 50, left: 85 }; // Adjust the left margin
    const width = size.width - margin.left - margin.right;
    const height = size.height - margin.top - margin.bottom;

    const svg = d3.select('#heat-map-svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const pokemonTypes = new Set();
    const bodyStyles = new Set();

    data.forEach(item => {
        pokemonTypes.add(item[0]);
        bodyStyles.add(item[1]);
    });

    var x = d3.scaleBand()
        .range([0, width])
        .domain(Array.from(pokemonTypes))
        .padding(0.01);

    svg.append("g")
        .style("font-size", "8px")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    var y = d3.scaleBand()
        .range([height, 0])
        .domain(Array.from(bodyStyles))
        .padding(0.01);

    svg.append("g")
        .style("font-size", "8px")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).tickFormat(label => label.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')));

    var myColor = d3.scaleLinear()
        .range(["white", "red"])
        .domain([1, 50]);

    svg.selectAll()
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d[0]))
        .attr("x-value", d => d[0])
        .attr("y", d => y(d[1]))
        .attr("y-value", d => d[1])
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => myColor(d[2]))
        .attr("class", d => `cell ${d[0]} ${d[1]}`);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top - 20)
        .style("text-anchor", "middle")
        .text("Pokémon Types");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 14)
        .style("text-anchor", "middle")
        .text("Body Styles");

    var defs = svg.append("defs");

    var linearGradient = defs.append("linearGradient")
        .attr("id", "legendGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

    var legendColors = [1, 10, 20, 30, 40, 50].map(d => myColor(d));

    legendColors.forEach((color, i) => {
        var offset = i / (legendColors.length - 1) * 100;
        linearGradient.append("stop")
            .attr("offset", offset + "%")
            .style("stop-color", color);
    });


    var legend = svg.append("g")
        .attr("transform", `translate(${width + 10}, 0)`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", legendColors.length * 20)
        .style("fill", "url(#legendGradient)")
        .style("stroke", "black");

    legend.selectAll("text")
        .data([1, 10, 20, 30, 40, 50])
        .enter()
        .append("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 14)
        .text(d => d);

    legend.append("text")
        .attr("x", 8)
        .attr("y", -45)
        .style("font-size", "11px")
        .attr("transform", "rotate(90)")
        .text("Number of Pokémon");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", "16px")
        .text("Body Style Distribution by Pokémon Type");
}
