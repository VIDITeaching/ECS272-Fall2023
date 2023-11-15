<script setup lang="ts">

import { ref, watch } from 'vue';
import * as d3 from 'd3';

// components
import Search from './Search.vue';

// types
import type { Pokemon } from '@/types/Pokemon';

// stores
import { pokemonStore } from '../stores/pokemon';
import { storeToRefs } from 'pinia';
import { fi } from 'vuetify/locale';

// get store refs
const { getPokemon, type_colors } = storeToRefs(pokemonStore());

// initialize data
const pokemon: Pokemon[] = [];
let pokemon_list = ref(pokemon);

// watchers
watch([getPokemon, pokemon_list], plot, { deep: true });
window.addEventListener('resize', plot);

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
    }
}

function remove(ind: number) {
    pokemon_list.value.splice(ind, 1);
}

function plot() {


    // get svg object
    const svg = d3.select('#svg');

    const filtered = pokemon_list.value.filter(x => getPokemon.value.map(i => i.Number).includes(x.Number));

    // clear out old plots
    svg.selectAll('*').remove();

    if (filtered.length < 1) {
        return;
    }

    // get dimensions
    const margin = 60;
    const width = svg.node().clientWidth - margin;
    const panWidth = filtered.length * (svg.node().clientWidth / 4);
    const height = svg.node().clientHeight - margin;

    // set dimensions
    svg.attr('width', width);
    svg.attr('viewBox', `0 -${margin} ${width - margin} ${height + 100}`);
    svg.attr('viewBox', `0 -${margin} ${width - margin} ${height + 100}`);

    // get data
    const pokemon = filtered;
    const data = pokemon.map(p => parseFloat(p.Height_m));

    // create xscale
    const xScale = d3.scaleLinear()
        .domain([0, Math.min(data.length, 5)])
        .range([0, panWidth]);

    // create yscale
    const yScale = d3.scaleLinear()
        .domain([0, Math.max(...data)])
        .range([height, 0]);

    // append new heights
    const panArea = svg.append('g');
    const bars = panArea.selectAll()
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
        .attr("fill", (d, ind) => type_colors.value[filtered[ind].Type_1]);

    // pokemon image
    bars.enter()
        .append('image')
        .attr("x", (d, ind) => xScale(ind))
        .attr("y", (d, ind) => yScale(d))
        .attr("width", d => yScale(0) - yScale(d) + 100)
        .attr("height", d => yScale(0) - yScale(d))
        .attr("transform", d => `translate(20,0)`)
        .attr("xlink:href", (d, ind) => `https://haroon96.github.io/Pokemon/${formatNumber(filtered[ind].Number)}.png`);

    // pokemon name
    bars.enter()
        .append('text')
        .attr("x", (d, ind) => xScale(ind))
        .attr("y", (d, ind) => yScale(d))
        .attr("width", d => yScale(0) - yScale(d))
        .attr("height", d => yScale(0) - yScale(d))
        .attr("transform", "translate(100,-30)")
        .text((d, ind) => `${filtered[ind].Name}`)
        .attr("fill", (d, ind) => type_colors.value[filtered[ind].Type_1]);

    // pokemon image
    bars.enter()
        .append('text')
        .attr("x", (d, ind) => xScale(ind))
        .attr("y", (d, ind) => yScale(d))
        .attr("width", d => yScale(0) - yScale(d))
        .attr("height", d => yScale(0) - yScale(d))
        .attr("transform", "translate(100,-10)")
        .attr("fill", (d, ind) => type_colors.value[filtered[ind].Type_1])
        .style("font-size", "0.9em")
        .text((d, ind) => `${filtered[ind].Height_m}m`);

    // white area
    svg.append('rect')
        .style("transform", "rotate(-90deg)")
        .attr("x", -height)
        .attr("y", -200)
        .attr('width', height + 100)
        .attr('height', 200)
        .attr('fill', 'white');

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

    // pan behavior
    function handlePan(e) {
        console.log(e.transform);
        panArea.attr('transform', `translate(${e.transform.x}, 0)`);
    }

    const pan = d3.zoom()
        .translateExtent([[0, 0], [Math.max(width, panWidth * 1.5), 0]])
        .on('zoom', handlePan);

    // pan on xSvg
    svg.call(pan).on('wheel.zoom', null);

}

</script>

<template>
    <div v-if="getPokemon.length > 0" class="height-container">
        <div class="search">
            <Search @on-select="(pk) => add(pk)" :disabled="pokemon_list.length > 6" clear-on-select></Search>
            <div>
                <ul class="pokemon-list" v-if="pokemon_list.length > 0">
                    <li v-for="pk, ind in pokemon_list">
                        <v-btn size="small" @click="remove(ind)" variant="outlined" class="remove-button"
                            prepend-icon="mdi-minus-circle">{{ pk.Name
                            }}</v-btn>
                    </li>
                </ul>
            </div>
        </div>
        <div class="plot">
            <svg id="svg"></svg>
        </div>
    </div>
    <p>Interaction: Type/drop-down to add pokemon. Click to remove. Pan to left/right.</p>
</template>

<style scoped>
.height-container {
    width: 100%;
    height: 80%;
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

#svg {
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
