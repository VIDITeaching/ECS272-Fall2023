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
    const xSvg = d3.select('#xSvg');
    const ySvg = d3.select('#ySvg');

    // get dimensions
    const margin = 60;
    const width = xSvg.node().clientWidth - margin;
    const panWidth = pokemon_list.value.length * (xSvg.node().clientWidth / 3);
    const height = ySvg.node().clientHeight - margin;

    // set dimensions
    xSvg.attr('width', width);
    xSvg.attr('viewBox', `0 -${margin} ${width - margin} ${height + 100}`);
    ySvg.attr('viewBox', `0 -${margin} ${width - margin} ${height + 100}`);

    // get data
    const pokemon = pokemon_list.value;
    const data = pokemon.map(p => parseFloat(p.Height_m));

    // clear out old plots
    xSvg.selectAll('g').remove();
    ySvg.selectAll('g').remove();

    // create xscale
    const xScale = d3.scaleLinear()
        .domain([0, Math.min(data.length, 5)])
        .range([0, panWidth]);

    // create yscale
    const yScale = d3.scaleLinear()
        .domain([0, Math.max(...data)])
        .range([height, 0]);

    // append x axis
    xSvg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickValues([]));

    // append y axis
    ySvg.append("g")
        .call(d3.axisLeft(yScale));

    ySvg.append("text")
        .style("transform", "rotate(-90deg)")
        .attr("x", -height / 2 - 20)
        .attr("y", -40)
        .text("Height (m)");

    // append new heights
    const bars = xSvg.append("g")
        .selectAll()
        .data(data);

    // bar height
    bars
        .join("rect")
        .attr("x", (d, ind) => xScale(ind))
        .attr("width", 25)
        .attr("y", (d) => yScale(d))
        .attr("height", d => yScale(0) - yScale(d))
        .attr("transform", "translate(60,0)")
        .attr("opacity", 0.75)
        .attr("fill", (d, ind) => type_colors[pokemon_list.value[ind].Type_1]);

    // pokemon image
    bars.enter()
        .append('image')
        .attr("x", (d, ind) => xScale(ind))
        .attr("y", (d, ind) => yScale(d))
        .attr("width", d => yScale(0) - yScale(d) + 100)
        .attr("height", d => yScale(0) - yScale(d))
        .attr("transform", d => `translate(20,0)`)
        .attr("xlink:href", (d, ind) => `https://haroon96.github.io/Pokemon/${formatNumber(pokemon[ind].Number)}.png`);

    // pokemon name
    bars.enter()
        .append('text')
        .attr("x", (d, ind) => xScale(ind))
        .attr("y", (d, ind) => yScale(d))
        .attr("width", d => yScale(0) - yScale(d))
        .attr("height", d => yScale(0) - yScale(d))
        .attr("transform", "translate(100,-30)")
        .text((d, ind) => `${pokemon_list.value[ind].Name}`)
        .attr("fill", (d, ind) => type_colors[pokemon_list.value[ind].Type_1]);

    // pokemon image
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

    // pan behavior
    function handlePan(e) {
        console.log(e.transform);
        xSvg.select('g:last-child').attr('transform', `translate(${e.transform.x}, 0)`);
    }

    const pan = d3.zoom()
        .translateExtent([[0, 0], [Math.max(width, panWidth * 1.5), 0]])
        .on('zoom', handlePan);

    // pan on xSvg
    xSvg.call(pan).on('wheel.zoom', null);

}

</script>

<template>
    <div v-if="store.pokemon.length > 0" class="height-container">
        <div class="search">
            <Search @on-select="(pk) => add(pk)" :disabled="pokemon_list.length > 8"></Search>
            <p>Interaction: Various Pokemon can be added and removed from the plot.</p>
            <div>
                <ul class="pokemon-list">
                    <li v-for="pk, ind in pokemon_list">
                        <v-btn size="small" @click="remove(ind)" variant="outlined" class="remove-button"
                            prepend-icon="mdi-minus-circle">{{ pk.Name
                            }}</v-btn>
                    </li>
                </ul>
            </div>
        </div>
        <div class="plot">
            <svg id="ySvg"></svg>
            <svg id="xSvg"></svg>
        </div>
    </div>
</template>

<style scoped>
.height-container {
    width: 100%;
    height: 90%;
    margin: 0 auto;
    display: flex;
}

.search {
    width: 300px;
}

.search>*:first-child {
    margin-right: 8px;
}

.plot {
    width: calc(100% - 300px);
    height: 100%;
    position: relative;
}

#xSvg, #ySvg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}

.pokemon-list {
    max-height: 300px;
    width: 100%;
    overflow-x: scroll;
    text-align: left;
    background-color: #eee;
    padding: 4px;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
}

.pokemon-list li {
    margin-left: 8px;
}

.remove-button:hover {
    background: red;
}
</style>
