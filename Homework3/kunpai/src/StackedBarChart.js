import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';
import { readCSV } from './CSV-Reader';

var size = { width: 0, height: 0 }

const preprocess = function preProcessData(data) {
    const typeCounts = {};

    data.forEach(function (d) {
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
        const typeObj = { Type: key, Count: typeCountInfo.count };
        const bodyStyles = [];
        for (const styleKey in typeCountInfo.bodyStyles) {
            bodyStyles.push({ Body_Style: styleKey, Count: typeCountInfo.bodyStyles[styleKey] });
        }
        typeObj.Body_Styles = bodyStyles;

        result.push(typeObj);
    }

    return result;
}

const data = await readCSV();
const postData = preprocess(data);

const onResize = (targets) => {
    targets.forEach(target => {
        if (target.target.getAttribute('id') !== 'stacked-bar-chart-container') return;
        size = { width: target.contentRect.width, height: target.contentRect.height }
        if (!isEmpty(size) && !isEmpty(data)) {
            d3.select('#stacked-bar-svg').selectAll('*').remove()
            createStackedBarChart(postData)
        }
    })
}
const chartObserver = new ResizeObserver(debounce(onResize, 100))

export const StackedBarChart = () => (
    `<div class='stacked-bar-chart-container d-flex' id='stacked-bar-chart-container'>
        <svg id='stacked-bar-svg' width='100%' height='100%'>
        </svg>
    </div>`
)

export function mountStackedBarChart() {
    let stackedChartContainer = document.querySelector('#stacked-bar-chart-container')
    chartObserver.observe(stackedChartContainer)
}

export function createStackedBarChart(data, selectedType) {
    const width = size.width;
    const height = size.height;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select("#bar-svg")
                  .attr("width", width)
                  .attr("height", height);

    const chart = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Type))
        .range([0, innerWidth])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Count)])
        .nice()
        .range([innerHeight, 0]);

    const customColorScale = d3.scaleOrdinal()
        .domain(data.flatMap(d => d.Body_Styles.map(bs => bs.Body_Style)))
        .range([
            "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
            "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
            "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
            "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5"
        ]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.flatMap(d => d.Body_Styles.map(bs => bs.Body_Style)))
        .range(d3.schemeSet3);

    chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale));

    chart.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(5));

    const bars = chart.selectAll(".bar")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("transform", d => `translate(${xScale(d.Type)}, 0)`);

    bars.selectAll(".sub-bar")
        .data(d => d.Body_Styles)
        .enter()
        .append("rect")
        .attr("class", "sub-bar")
        .attr("x", d => 0)
        .attr("y", d => yScale(d.Count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => innerHeight - yScale(d.Count))
        .style("fill", d => customColorScale(d.Body_Style));

    chart.append("text")
        .attr("class", "x-label")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .text("Pokemon Types");

    chart.append("text")
        .attr("class", "y-label")
        .attr("x", -margin.left - 175 )
        .attr("y", height/2 -275)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Count");

    chart.append("text")
        .attr("class", "chart-title")
        .attr("x", innerWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .text("Pokémon Types and Body Styles")
        .style("font-weight", "bold")
        .style("font-size", "20px");

    const legend = chart.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${innerWidth - 200}, 0)`);

    const legendItems = legend.selectAll(".legend-item")
        .data(colorScale.domain())
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", customColorScale);

    legendItems.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text(d => {
          const words = d.split('_');
          return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        });

}

export function updateStackedBarChart(selectedType) {
    createStackedBarChart(postData, selectedType);
}
