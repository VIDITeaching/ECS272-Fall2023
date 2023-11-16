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
        .style("opacity", 0.75);

    svg.selectAll('allPolylines')
        .data(prep_data)
        .enter()
        .append('polyline')
        .attr("stroke", "black")
        .style("fill", "none")
        .attr("stroke-width", 1)
        .attr('points', function (d) {
            if (d.data.ratio < 0.04) {
                return;
            }
            var posA = arc.centroid(d) // line insertion in the slice
            var posB = arc.centroid(d) // line break: we use the other arc generator that has been built only for that
            var posC = arc.centroid(d); // Label position = almost the same as posB
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
            posC[0] = radius * 1 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
            return [posA, posB, posC]
        })

    svg.selectAll('g')
        .data(prep_data)
        .enter()
        .append('text')
        .text(d => d.data.ratio < 0.04 ? '' : `${d.data.type}`)
        .attr('transform', function (d) {
            var pos = arc.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = radius * 1.1 * (midangle < Math.PI ? 1 : -1);
            pos[1] += 5;
            return 'translate(' + pos + ')';
        })
        .style('text-anchor', function (d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
        })
        .attr("fill", d => type_colors[d.data.type]);


    svg.selectAll('g')
        .data(prep_data)
        .enter()
        .append('text')
        .text(d => d.data.ratio < 0.04 ? '' : `${(d.data.ratio * 100).toFixed(2)}%`)
        .attr('transform', function (d) {
            var pos = arc.centroid(d);
            pos[1] -= 5;
            return 'translate(' + pos + ')';
        })
        .style("font-size", "0.8em")
        .style('text-anchor', function (d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
        })
        .attr("fill", 'black');



    svg.append("text")
        .text("Gen " + generation.value)
        .style("font-size", "2em")
        .attr("text-anchor", "middle");

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
        <svg id="overview"></svg>
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
