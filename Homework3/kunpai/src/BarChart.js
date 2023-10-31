import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';
import { readCSV } from './CSV-Reader';
import { updateCharts } from './globals';
import { updateHeatMap } from "./HeatMap";

var size = { width: 0, height: 0 }

// data is like [{ Grass : 118}, etc...] to signify Type and the count
const preprocess = function preProcessData(data) {
    const counts = {};

    data.forEach(function (d) {
        if (counts[d.Type_1]) {
            counts[d.Type_1]++;
        } else {
            counts[d.Type_1] = 1;
        }

        if (counts[d.Type_2]) {
            counts[d.Type_2]++;
        } else {
            counts[d.Type_2] = 1;
        }
    });

    const result = [];
    for (const key in counts) {
        if (key !== "") {
            result.push({ [key]: counts[key] });
        }
    }

    return result;
};

const stackedBarChartData = function preProcessData(data) {
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
const stackedBarPostData = stackedBarChartData(data);

const onResize = (targets) => {
    targets.forEach(target => {
        if (target.target.getAttribute('id') !== 'bar-chart-container') return;
        size = { width: target.contentRect.width, height: target.contentRect.height }
        if (!isEmpty(size) && !isEmpty(data)) {
            d3.select('#bar-svg').selectAll('*').remove()
            if (currentMode.Chart === 'bar') {
                createBarChart(currentMode.Data)
            } else {
                createStackedBarChart(currentMode.Data)
            }
        }
    })
}
const chartObserver = new ResizeObserver(debounce(onResize, 100))

export const BarChart = () => (
    `<div class='bar-chart-container d-flex' id='bar-chart-container'>
        <svg id='bar-svg' width='100%' height='100%'>
        </svg>
    </div>`
)

export function mountBarChart() {
    let chartContainer = document.querySelector('#bar-chart-container')
    chartObserver.observe(chartContainer)
}

let currentMode = {
    Chart: 'bar',
    Data: postData,
}
const margin = { top: 50, right: 20, bottom: 40, left: 40 };

function createBarChart(data, selectedType, click) {
    d3.select('#bar-svg').selectAll('*').remove()
    const width = size.width;
    const height = size.height;

    const svg = d3.select('#bar-svg')
        .attr('width', width)
        .attr('height', height);

    const x = d3.scaleBand()
        .domain(data.map(d => Object.keys(d)[0]))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Object.values(d)[0])]).nice()
        .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

    const yAxis = g => g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    const bars = svg.append('g')
        .attr('fill', 'steelblue')
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => x(Object.keys(d)[0]))
        .attr('y', d => y(Object.values(d)[0]))
        .attr('height', d => y(0) - y(Object.values(d)[0]))
        .attr('width', x.bandwidth());

    svg.append('g')
        .call(xAxis)
        .attr('class', 'x-axis');

    svg.append('g')
        .call(yAxis)
        .attr('class', 'y-axis');

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Number of Pokémon Per Type');

    const legend = svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
        .selectAll('g')
        .data(['Pokemon'])
        .join('g')
        .attr('transform', (d, i) => `translate(${-margin.right},${margin.top + i * 20})`);

    legend.append('rect')
        .attr('x', width - 19)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', 'steelblue');

    legend.append('text')
        .attr('x', width - 24)
        .attr('y', 7.5)
        .attr('dy', '0.35em')
        .text('Number of Pokémon');

    // Add click event to zoom into a bar and create a stacked bar chart for the clicked bar
    bars.on('click', function (event, d) {
        const clickedBar = d3.select(this);
        clickedBar.transition()
            .attr('opacity', 0)

        const clickedBarData = stackedBarPostData.filter(data => data.Type === Object.keys(d)[0]);
        svg.selectAll('*').remove();
        currentMode.Chart = 'stacked-bar';
        currentMode.Data = clickedBarData;
        createStackedBarChart(clickedBarData);
    });

    if (selectedType && click) {
        const clickedBarData = stackedBarPostData.filter(data => data.Type === selectedType);
        svg.selectAll('*').remove();
        currentMode.Chart = 'stacked-bar';
        currentMode.Data = clickedBarData;
        createStackedBarChart(clickedBarData);
    }

    if (selectedType && !click) {
        const selectedBar = bars.filter(d => Object.keys(d)[0] === selectedType);
        const value = Object.values(selectedBar.data()[0])[0];
        const xPosition = x(Object.keys(selectedBar.data()[0])[0]) + x.bandwidth() / 2;
        const yPosition = y(value) - 10;

        svg.append('text')
            .attr('id', 'tooltip')
            .attr('x', xPosition)
            .attr('y', yPosition)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text(value);
    }
}

function createStackedBarChart(data) {
    selectedBodyStyle = null;
    selectedBar = null;
    const width = size.width;
    const height = size.height;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const selectedXValue = data[0].Type;

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
    let values = {}
    data[0].Body_Styles.forEach(d => {
        values[d.Body_Style] = d.Count
    })
    var subgroups = data.flatMap(d => d.Body_Styles.map(bs => bs.Body_Style));
    var stackedData = d3.stack().keys(subgroups)([values]);

    const bars = chart.selectAll(".bar")
        .data(stackedData, d => d.key)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("fill", function (d) {
            return customColorScale(d.key);
        })
        .attr("data-legend", function (d) {
            return d.key;
        });

    const rects = bars
        .selectAll(".sub-bar")
        .data(d => {
            return [
                {
                    key: d.key,
                    value: d[0]
                }
            ]
        })
        .enter().append("rect")
        .attr("data-legend", d => {
            return d.key;
        })
        .attr("x", d => {
            return xScale(d.key);
        })
        .attr("y", function (d) {
            return yScale(d.value[1]);
        })
        .attr("height", function (d) { return (yScale(d.value[0]) - yScale(d.value[1])); })
        .attr("width", xScale.bandwidth())
        .attr("class", "sub-bar")


    chart.append("text")
        .attr("class", "x-label")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .text("Pokemon Types");

    chart.append("text")
        .attr("class", "y-label")
        .attr("x", -margin.left - 175)
        .attr("y", height / 2 - 275)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Count");

    const legend = chart.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${innerWidth - 100}, 0)`);

    const legendItems = legend.selectAll(".legend-item")
        .data(colorScale.domain())
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        .attr("data-legend", function (d) { return d; });

    legendItems.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", customColorScale);

    legendItems.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("font-size", "9px")
        .text(d => {
            const words = d.split('_');
            return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        });

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Body Styles of Pokémon Per Type');

    eventListeners(svg, selectedXValue, '.legend-item');
    eventListeners(svg, selectedXValue, '.sub-bar');
}

let selectedBodyStyle = null;
let selectedBar = null;
function eventListeners(svg, selectedXValue, className) {
    svg.selectAll(className)
        .on("click", function (event, d) {
            let currentSelected = d3.select(this).attr('data-legend');
            if (selectedBodyStyle === null) {
                selectedBodyStyle = currentSelected;
                selectedBar = d3.selectAll('rect[data-legend="' + currentSelected + '"]');

                // Create a diagonal line pattern and apply it as a fill
                svg.append('defs').append('pattern')
                    .attr('id', 'diagonal-lines')
                    .attr('width', 4)
                    .attr('height', 4)
                    .attr('patternUnits', 'userSpaceOnUse')
                    .append('path')
                    .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
                    .attr('stroke', 'red')
                    .attr('stroke-width', 1);

                selectedBar.style('fill', 'url(#diagonal-lines)');
                selectedBar.attr('stroke', 'black');

                updateHeatMap(selectedXValue, currentSelected);
            } else if (selectedBodyStyle !== currentSelected) {
                selectedBodyStyle = currentSelected;

                selectedBar.style('fill', null);
                selectedBar.attr('stroke', 'none');
                selectedBar = d3.selectAll('rect[data-legend="' + currentSelected + '"]');
                selectedBar.style('fill', 'url(#diagonal-lines)');
                selectedBar.attr('stroke', 'black');

                updateHeatMap(selectedXValue, currentSelected);
            } else {
                selectedBodyStyle = null;
                selectedBar.style('fill', null);
                selectedBar.attr('stroke', 'none');
                selectedBar = null;
                svg.selectAll('#diagonal-lines').remove();

                updateHeatMap(selectedXValue, null);
            }
        }).on('mouseover', function (event, d) {
            let currentSelected = d3.select(this).attr('data-legend');
            if (selectedBodyStyle !== null) return;
            updateCharts(selectedXValue, true, currentSelected);
            let bar = d3.selectAll('rect[data-legend="' + currentSelected + '"]');
            bar.attr('stroke', 'black');
            bar.attr('stroke-width', '2px');
        })
        .on('mouseout', function () {
            let currentSelected = d3.select(this).attr('data-legend');
            if (selectedBodyStyle !== null) return;
            svg.select('#tooltip').remove();
            let bar = d3.selectAll('rect[data-legend="' + currentSelected + '"]');
            bar.attr('stroke', 'none');
        });
}

export function updateBarChart(selectedType, click) {
    createBarChart(postData, selectedType, click);
}
