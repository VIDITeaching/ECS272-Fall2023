import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';
import { readCSV } from './CSV-Reader';

var size = { width: 0, height: 0 }

// data is like [{ Grass : 118}, etc...] to signify Type and the count
const preprocess = function preProcessData(data) {
    console.log(data);
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

    console.log(result);

    return result;
};

const data = await readCSV();
const postData = preprocess(data);

const onResize = (targets) => {
    targets.forEach(target => {
        if (target.target.getAttribute('id') !== 'bar-chart-container') return;
        size = { width: target.contentRect.width, height: target.contentRect.height }
        if (!isEmpty(size) && !isEmpty(data)) {
            d3.select('#bar-svg').selectAll('*').remove()
            createBarChart(postData)
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

function createBarChart(data) {
    const width = size.width;
    const height = size.height;
    const margin = { top: 50, right: 20, bottom: 40, left: 40 };

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


    bars.on('mouseover', function (event, d) {
        const value = Object.values(d)[0];
        const xPosition = x(Object.keys(d)[0]) + x.bandwidth() / 2;
        const yPosition = y(value) - 10;

        svg.append('text')
            .attr('id', 'tooltip')
            .attr('x', xPosition)
            .attr('y', yPosition)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text(value);
    })
    .on('mouseout', function () {
        svg.select('#tooltip').remove();
    });

    svg.append('g')
        .call(xAxis);

    svg.append('g')
        .call(yAxis);


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

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - margin.bottom + 35)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .text('Pokémon Types');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(height / 2))
        .attr('y', margin.left - 27)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .text('Number of Pokémon');
}
