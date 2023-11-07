<script setup lang="ts">

import * as d3 from 'd3';

import { pokemonStore } from '../stores/pokemon';
import { ref } from 'vue';


let generation = ref(1);

// methods 
function preprocess() {
    let data = pokemonStore().pokemon;

    if (!data || data.length == 0) {
        return null;
    }

    data = data.filter(x => x.Generation == generation.value.toString());

    let types = data.map(x => x.Type_1)
        .filter(x => x != '')
        .concat(data.map(x => x.Type_2).filter(x => x != ''));

    let total = types.length;
    let counts: Record<string, number> = {};
    for (let type of types) {
        if (!(type in counts)) {
            counts[type] = 0;
        }
        counts[type] += 1;
    }

    let ratios = [];
    for (let type in counts) {
        ratios.push({ type, ratio: counts[type] / total });
    }

    return ratios;
}

function plot() {

    // get preprocessed data
    const data = preprocess();
    const type_colors = pokemonStore().type_colors;

    if (data == null) {
        setTimeout(plot, 100);
        return;
    }

    // get svg object
    const svg = d3.select('#overview');

    // clear old
    svg.selectAll('*').remove();

    // get dimensions
    const margin = 60;
    const width = svg.node().clientWidth - margin;
    const height = svg.node().clientHeight - margin;
    const radius = Math.min(width, height) / 2;

    // set dimensions
    svg.attr('viewBox', `-${radius * 1.5} -${radius} ${width + 10} ${height}`);

    // create color scale
    const colorScale = d3.scaleOrdinal()
        .domain(data)
        .range(data.map(x => type_colors[x.type]))

    // create pie
    const pie = d3.pie()
        .value(d => d.ratio);

    // prep data
    const prep_data = pie(data.map(x => x));

    // arc generator
    const arc = d3.arc()
        .innerRadius(radius - 40)         // This is the size of the donut hole
        .outerRadius(radius);

    svg.selectAll('g')
        .data(prep_data)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => colorScale(d.data.type))
        .attr("stroke", "black")
        .style("stroke-width", "0px")
        .style("opacity", 0.75)
        .on('mousemove', function (e, d) {
            const mouse = d3.pointer(e);
            // create path
            hover.selectAll('tspan').remove();
            hover.append('tspan').text(d.data.type).attr("x", mouse[0] + 5).attr("y", mouse[1] + 5);
            hover.append('tspan').text((d.data.ratio * 100).toFixed(1) + '%').attr("x", mouse[0] + 5).attr("y", mouse[1] + 25);
            hover.style('opacity', 1);
            d3.select(this).style('opacity', 1);
        })
        .on('mouseout', function (e, d) {
            d3.select(this).style('opacity', 0.75);
            hover.style('opacity', 0);
        });

    // middle text
    svg.append("text")
        .text("Gen " + generation.value)
        .style("font-size", "2em")
        .attr("text-anchor", "middle");

    // info element on hover
    const hover = svg
        .append('text')
        .text('')
        .style('opacity', 0);
}

plot();

</script>

<template>
    <div class="container">
        <div class="flex-row generation-slider">
            <span>Generation</span> &nbsp;&nbsp;&nbsp;
            <v-slider v-model="generation" :min="1" :max="6" :step="1" thumb-label
                :on-update:model-value="plot()"></v-slider>
        </div>
        <p>Interaction: Slider controls Pokemon generation.</p>
        <svg id="overview"></svg>
        <p>Interaction: Individual slices have a hover event that shows the values.</p>
    </div>
</template>

<style scoped>
.generation-slider>span {
    margin-top: 3px;
}

svg {
    width: 80%;
    max-width: 900px;
    min-width: 300px;
    height: 400px;
}
</style>
