<script setup lang="ts">

import { ref, watch } from 'vue';
import * as d3 from 'd3';

// components
import Search from './Search.vue';

// types
import type { Pokemon } from '@/types/Pokemon';
import { pokemonStore } from '@/stores/pokemon';

// initialize data
let pokemon: Pokemon = ref({});
const store = pokemonStore();


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

    if (!pokemon.value) {
        return;
    }

    const pok: Pokemon = pokemon.value;

    let data = [pok.HP, pok.Sp_Def, pok.Sp_Atk, pok.Speed, pok.Defense, pok.Attack];
    let features = ["HP", "Sp_Def", "Sp_Atk", "Speed", "Defense", "Attack"];

    // get svg object
    const svg = d3.select('#stats');

    // get dimensions
    const margin = 20;
    const width = svg.node().clientWidth - margin;
    const height = svg.node().clientHeight - margin;

    svg.attr("width", width);
    svg.attr("height", height);
    // set dimensions
    svg.attr('viewBox', `0 -130 ${width} ${height + 250}`)

    // clear old
    svg.selectAll('*').remove();

    // draw circles
    let radialScale = d3.scaleLinear()
        .domain([0, 255])
        .range([100, 100 + height / 2]);
    let ticks = [0, 150, 255];

    svg.selectAll("circle")
        .data(ticks)
        .join(enter => enter.append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("fill", "none")
            .attr("stroke", "#333")
            .attr("r", d => radialScale(d))
        );


    function angleToCoordinate(angle, value) {
        let x = Math.cos(angle) * radialScale(value);
        let y = Math.sin(angle) * radialScale(value);
        return { "x": width / 2 + x, "y": height / 2 - y };
    }

    let featureData = features.map((f, i) => {
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        return {
            "name": f,
            "angle": angle,
            "line_coord": angleToCoordinate(angle, 255),
            "label_coord": angleToCoordinate(angle, 260)
        };
    });

    // draw axis line
    svg.selectAll("line")
        .data(featureData)
        .join(enter => enter.append("line")
            .attr("x1", width / 2)
            .attr("y1", height / 2)
            .attr("x2", d => d.line_coord.x)
            .attr("y2", d => d.line_coord.y)
            .attr("stroke", "black")
        );

    // draw axis label
    svg.selectAll(".axislabel")
        .data(featureData)
        .join(enter => enter.append("text")
            .attr("x", d => d.label_coord.x)
            .attr("y", d => d.label_coord.y)
            .style("font-size", "1.5em")
            .style("text-anchor", d => {
                return d.name.startsWith('Sp_') ? 'end' : 'start';
            })
            .text(d => d.name)
        );



    svg.selectAll(".ticklabel")
        .data(ticks)
        .join(enter => enter.append("text")
            .attr("class", "ticklabel")
            .attr("x", width / 2 - 5)
            .attr("y", d => height / 2 - radialScale(d) + 15)
            .text(d => d.toString())
        );

    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    function getPathCoordinates(d) {
        let coordinates = [];
        for (var i = 0; i < features.length; i++) {
            let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
            coordinates.push(angleToCoordinate(angle, data[i]));
        }
        return coordinates;
    }

    svg.selectAll("path")
        .data([data])
        .join(enter => enter.append("path")
            .datum(d => getPathCoordinates(d))
            .attr("d", line)
            .attr("stroke-width", 3)
            .attr("stroke", store.type_colors[pok.Type_1])
            .attr("fill", store.type_colors[pok.Type_1])
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.5)
        );

    svg.append('image')
        .attr("x", 100)
        .attr("y", margin * 2)
        .attr("width", width * 0.75)
        .attr("height", height * 0.75)
        .attr("xlink:href", `https://haroon96.github.io/Pokemon/${formatNumber(pokemon.value.Number)}.png`);


}

watch(pokemon, plot);

</script>

<template>
    <div v-if="store.pokemon.length > 0">
        <Search @on-select="(pk) => pokemon = pk" randomize></Search>
        <div class="stats-list" v-if="pokemon">
            <ul>
                <li>{{ pokemon.Number }} - {{ pokemon.Name }}</li>
                <li>Gen {{ pokemon.Generation }}</li>
                <li :style="{ 'background-color': store.type_colors[pokemon.Type_1] }" class="type">{{ pokemon.Type_1 }}
                </li>
                <li :style="{ 'background-color': store.type_colors[pokemon.Type_2] }" class="type" v-if="pokemon.Type_2">{{
                    pokemon.Type_2 }}</li>
            </ul>
        </div>
        <svg id="stats"></svg>
    </div>
</template>

<style scoped>
#stats {
    width: 80%;
    height: 400px;
}

ul {
    margin: 0;
    padding: 0;
}

.type {
    border-radius: 4px;
    padding: 2px;
}

.stats-list {
    position: relative;
}

.stats-list ul {
    position: absolute;
    left: 0;
    top: 0;
    list-style: none;
}
</style>
