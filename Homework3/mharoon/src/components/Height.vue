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
const pokemon: Pokemon[] = [];
let pokemon_list = ref(pokemon);
let selected = ref({});

// watchers
watch([pokemon_list], plot, { deep: true });

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

function add(pokemon: Pokemon) {
    if (pokemon) {
        pokemon_list.value.push(pokemon);
        selected.value = {};
    }
}

function remove(ind: number) {
    pokemon_list.value.splice(ind, 1);
}

function plot() {

    if (pokemon_list.value.length < 1) {
        return;
    }

    const type_colors = store.type_colors;

    // get svg object
    const svg = d3.select('#bar');

    // get dimensions
    const margin = 60;
    const width = svg.node().clientWidth - margin;
    const height = svg.node().clientHeight - margin;

    // set dimensions
    svg.attr('viewBox', `-${margin} -${margin} ${width} ${height + 100}`).call(zoom);

    // get data
    const pokemon = pokemon_list.value;
    const data = pokemon.map(p => parseFloat(p.Height_m));

    // clear out old plots
    svg.selectAll('g').remove();

    // create xscale
    const xScale = d3.scaleLinear()
        .domain([0, Math.min(data.length, 5)])
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


    bars
        .join("rect")
        .attr("x", (d, ind) => xScale(ind))
        .attr("width", 25)
        .attr("y", (d) => yScale(d))
        .attr("height", d => yScale(0) - yScale(d))
        .attr("transform", "translate(60,0)")
        .attr("opacity", 0.75)
        .attr("fill", (d, ind) => type_colors[pokemon_list.value[ind].Type_1]);

    bars.enter()
        .append('image')
        .attr("x", (d, ind) => xScale(ind))
        .attr("y", (d, ind) => yScale(d))
        .attr("width", d => yScale(0) - yScale(d) + 100)
        .attr("height", d => yScale(0) - yScale(d))
        .attr("transform", d => `translate(20,0)`)
        .attr("xlink:href", (d, ind) => `https://haroon96.github.io/Pokemon/${formatNumber(pokemon[ind].Number)}.png`);

    bars.enter()
        .append('text')
        .attr("x", (d, ind) => xScale(ind))
        .attr("y", (d, ind) => yScale(d))
        .attr("width", d => yScale(0) - yScale(d))
        .attr("height", d => yScale(0) - yScale(d))
        .attr("transform", "translate(100,-30)")
        .text((d, ind) => `${pokemon_list.value[ind].Name}`)
        .attr("fill", (d, ind) => type_colors[pokemon_list.value[ind].Type_1]);


    bars.enter()
        .append('text')
        .attr("x", (d, ind) => xScale(ind))
        .attr("y", (d, ind) => yScale(d))
        .attr("width", d => yScale(0) - yScale(d))
        .attr("height", d => yScale(0) - yScale(d))
        .attr("transform", "translate(100,-10)")
        .attr("fill", (d, ind) => type_colors[pokemon_list.value[ind].Type_1])
        .style("font-size", "0.9em")
        .text((d, ind) => `${pokemon_list.value[ind].Height_m}m`);


    function zoom(svg) {
        const extent = [[margin, margin], [width - margin, height - margin]];

        svg.call(d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent(extent)
            .extent(extent)
            .on("zoom", zoomed));

        function zoomed(event) {
            xScale.range([margin, width - margin].map(d => event.transform.applyX(d)));
            svg.selectAll(".bars rect").attr("x", (d, ind) => xScale(ind)).attr("width", xScale.bandwidth());
            // svg.selectAll(".x-axis").call(xAxis);
        }
    }

}

</script>

<template>
    <div v-if="store.pokemon.length > 0">
        <div class="search">
            <Search @on-select="(pk) => add(pk)"></Search>
        </div>
        <div>
            <ul class="pokemon-list">
                <li v-for="pk, ind in pokemon_list">
                    <v-btn size="small" @click="remove(ind)" variant="outlined" class="remove-button"
                        prepend-icon="mdi-minus-circle">{{ pk.Name
                        }}</v-btn>
                </li>
            </ul>
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
    max-width: 1920px;
    min-width: 300px;
    height: 400px;
}

.pokemon-list {
    list-style: none;
    display: flex;
}

.pokemon-list li {
    margin-left: 8px;
}

.remove-button:hover {
    background: red;
}
</style>
