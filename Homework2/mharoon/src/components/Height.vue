<script setup lang="ts">

import { ref, watch } from 'vue';
import * as d3 from 'd3';

// components
import Search from './Search.vue';

// types
import type { Pokemon } from '@/types/Pokemon';

// stores
import { pokemonStore } from '../stores/pokemon';
const store = pokemonStore();

// initialize data
let pokemon1 = ref({});
let pokemon2 = ref({});

// watchers
watch([pokemon1, pokemon2], plot);

// methods
function formatNumber(num: string) {
    let numInt = parseInt(num);
    if (numInt < 10) {
        return "00" + num;
    } else if (numInt < 100) {
        return "0" + num;
    }
    return num;
}

function plot() {

    if (!(pokemon1.value && pokemon2.value)) {
        return;
    }

    const type_colors = store.type_colors;

    let pok1: Pokemon = pokemon1.value;
    let pok2: Pokemon = pokemon2.value;

    // get svg object
    const svg = d3.select('#bar');

    // get dimensions
    const margin = 60;
    const width = svg.node().clientWidth - margin;
    const height = svg.node().clientHeight - margin;

    // set dimensions
    svg.attr('viewBox', `-60 -50 ${width + 100} ${height + 100}`)

    // get data
    const pokemon = [pok1, pok2];
    const data = [parseFloat(pok1.Height_m), parseFloat(pok2.Height_m)];

    // clear out old plots
    svg.selectAll('g').remove();

    // create xscale
    const xScale = d3.scaleLinear()
        .domain([0, 2])
        .range([0, width]);

    // create yscale
    const yScale = d3.scaleLinear()
        .domain([0, Math.max(...data)])
        .range([height, 0])


    // append x axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickValues([]));

    // append y axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .style("transform", "rotate(-90deg)")
        .attr("x", -height / 2 - 20)
        .attr("y", -40)
        .text("Height (m)");

    // append new heights
    const bars = svg.append("g")
        .attr("fill", "steelblue")
        .selectAll()
        .data(data);

    bars.enter()
        .append('image')
        .attr("x", (d, ind) => xScale(ind))
        .attr("y", (d, ind) => yScale(d))
        .style("width", "100%")
        .style("height", d => yScale(0) - yScale(d))
        .attr("width", d => 300)
        .attr("height", d => yScale(0) - yScale(d))
        .attr("transform", "translate(-400,0)")
        .attr("xlink:href", (d, ind) => `https://haroon96.github.io/Pokemon/${formatNumber(pokemon[ind].Number)}.png`);

    bars.enter()
        .append('text')
        .attr("x", (d, ind) => xScale(ind))
        .attr("y", (d, ind) => yScale(d))
        .attr("width", d => yScale(0) - yScale(d))
        .attr("height", d => yScale(0) - yScale(d))
        .attr("transform", "translate(100,0)")
        .text((d, ind) => `${pokemon[ind].Name}`)
        .attr("fill", (d, ind) => type_colors[pokemon[ind].Type_1]);


    bars.enter()
        .append('text')
        .attr("x", (d, ind) => xScale(ind))
        .attr("y", (d, ind) => yScale(d))
        .attr("width", d => yScale(0) - yScale(d))
        .attr("height", d => yScale(0) - yScale(d))
        .attr("transform", "translate(100,20)")
        .attr("fill", (d, ind) => type_colors[pokemon[ind].Type_1])
        .style("font-size", "0.9em")
        .text((d, ind) => `${pokemon[ind].Height_m}m`);

    bars
        .join("rect")
        .attr("x", (d, ind) => xScale(ind))
        .attr("width", 25)
        .attr("y", (d) => yScale(d))
        .attr("height", d => yScale(0) - yScale(d))
        .attr("transform", "translate(60,0)")
        .attr("opacity", 0.75)
        .attr("fill", (d, ind) => type_colors[pokemon[ind].Type_1]);

}


</script>

<template>
    <div v-if="store.pokemon.length > 0">
        <div class="search">
            <Search @on-select="(pk) => pokemon1 = pk" randomize></Search>
            <Search @on-select="(pk) => pokemon2 = pk" randomize></Search>
        </div>
        <div class="container">
            <svg id="bar"></svg>
        </div>
    </div>
</template>

<style scoped>
.search {
    display: flex;
    justify-content: space-between;
}

.search>*:first-child {
    margin-right: 8px;
}

.container {
    width: 100%;
}

.img-container {
    margin: 0 auto;
    text-align: center;
}

.img-container img {
    width: 256px;
}

svg {
    width: 100%;
    max-width: 1280px;
    min-width: 300px;
    height: 400px;
}
</style>
