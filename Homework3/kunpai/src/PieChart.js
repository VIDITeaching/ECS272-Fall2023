import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';
import { readCSV } from './CSV-Reader';

var size = { width: 0, height: 0 }

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

const data = await readCSV();
const postData = preprocess(data);

const onResize = (targets) => {
    targets.forEach(target => {
        if (target.target.getAttribute('id') !== 'pie-container') return;
        size = { width: target.contentRect.width, height: target.contentRect.height }
        if (!isEmpty(size) && !isEmpty(data)) {
            d3.select('#pie-svg').selectAll('*').remove()
            createPieChart(postData)
        }
    })
}
const chartObserver = new ResizeObserver(debounce(onResize, 100))

export const PieChart = () => (
    `<div class='pie-chart-container d-flex' id='pie-container'>
        <svg id='pie-svg' width='100%' height='100%'>
        </svg>
    </div>`
)

export function mountPieChart() {
    let pieContainer = document.querySelector('#pie-container')
    chartObserver.observe(pieContainer)
}

function createPieChart(data) {
    const width = size.width;
    const height = size.height;
    const chartTitle = "Pokémon Distribution by Type";
    const rescaleDiff = 40;

    const svg = d3.select("#pie-svg")
        .attr("width", width)
        .attr("height", height);

    const pieGroup = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeSet3);

    const pie = d3.pie()
        .value(d => d[Object.keys(d)[0]]);

    const pieData = pie(data);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(width, height) / 2 - rescaleDiff);

    const slices = pieGroup.selectAll(".slice")
        .data(pieData)
        .enter()
        .append("g")
        .attr("class", "slice");

    slices.append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(i));

    const labelDistance = Math.min(width, height) / 2 - rescaleDiff/1.2;

    slices.append("text")
        .attr("transform", d => {
            const pos = arc.centroid(d);
            const midAngle = Math.atan2(pos[1], pos[0]);
            const x = Math.cos(midAngle) * labelDistance;
            const y = Math.sin(midAngle) * labelDistance;
            return `translate(${x},${y})`;
        })
        .attr("dy", "0.35em")
        .attr("text-anchor", d => {
            return (d.startAngle + d.endAngle) / 2 > Math.PI ? "end" : "start";
        })
        .text(d => Object.keys(d.data)[0]);

    slices.append("text")
        .attr("transform", d => {
            const pos = arc.centroid(d);
            const midAngle = Math.atan2(pos[1], pos[0]);
            const x = Math.cos(midAngle) * (labelDistance - rescaleDiff);
            const y = Math.sin(midAngle) * (labelDistance - rescaleDiff);
            return `translate(${x},${y})`;
        })
        .attr("dy", "0.35em")
        .style("font-size", "11px")
        .attr("text-anchor", "middle")
        .text(d => {
            const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
            return `${percentage.toFixed(1)}%`;
        });

    const legend = svg.selectAll(".legend")
        .data(pieData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width - 200},${i * 20})`);

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", (d, i) => color(i));

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(d => Object.keys(d.data)[0]);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text(chartTitle);
}