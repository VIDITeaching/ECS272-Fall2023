<script setup lang="ts">

import * as d3 from 'd3';

import { pokemonStore } from '../stores/pokemon';
import { storeToRefs } from 'pinia';

// get store refs
const { generation, type, type_colors, pokemon } = storeToRefs(pokemonStore());

// methods 
function preprocess() {
    let data = pokemon.value;

    if (!data || data.length == 0) {
        return null;
    }

    if (generation.value > 0) {
        data = data.filter(x => parseInt(x.Generation) == generation.value);
    }

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

    if (data == null) {
        setTimeout(plot, 100);
        return;
    }

    // get svg object
    const svg = d3.select('#overview');

    // clear old
    svg.selectAll('*').remove();

    // get dimensions
    const margin = 4;
    const width = svg.node().clientWidth - margin;
    const height = svg.node().clientHeight - margin;
    const radius = Math.min(width, height) / 2;

    // set dimensions
    svg.attr('viewBox', `-${radius * 1.25} -${radius} ${width / 2} ${height + margin}`);

    // create color scale
    const colorScale = d3.scaleOrdinal()
        .domain(data)
        .range(data.map(x => type_colors.value[x.type]))

    // create pie
    const pie = d3.pie()
        .value(d => d.ratio);

    // prep data
    const prep_data = pie(data.map(x => x));

    // arc generator
    const arc = d3.arc()
        .innerRadius(radius * 0.8)
        .outerRadius(radius);

    svg.selectAll('g')
        .data(prep_data)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => colorScale(d.data.type))
        .attr("stroke", "black")
        .style('cursor', 'pointer')
        .style("stroke-width", function(d) {
            return d.data.type == type.value ? '1.5px': '0px';
        })
        .on('click', function(e, d) {
            if (d.data.type == type.value) {
                type.value = null;
            } else {
                type.value = d.data.type;
            }
        })
        .on('mousemove', function (e, d) {
            const mouse = d3.pointer(e);
            // create path
            hover.selectAll('tspan').remove();
            hover.append('tspan').text(d.data.type).attr("x", mouse[0] + 20).attr("y", mouse[1]);
            hover.append('tspan').text((d.data.ratio * 100).toFixed(1) + '%').attr("x", mouse[0] + 20).attr("y", mouse[1] + 15);
            hover.style('visibility', 'visible');
            d3.select(this).style('stroke-width', '1.5px');
        })
        .on('mouseout', function (e, d) {
            if (d.data.type != type.value) {
                d3.select(this).style('stroke-width', '0px');
            }
            hover.style('visibility', 'hidden');
        });

    // middle text
    svg.append("text")
        .text(generation.value > 0 ? "Gen " + generation.value : "All Gens")
        .style("font-size", "125%")
        .attr("text-anchor", "middle");

    // info element on hover
    const hover = svg
        .append('text')
        .text('')
        .style('font-size', '100%')
        .style('visibility', 'hidden');
}

plot();
window.addEventListener('resize', plot);

</script>

<template>
    <div class="pie-container">
        <div class="flex-row generation-slider">
            <v-slider v-model="generation" :min="0" :max="6" :step="1" thumb-label
                :on-update:model-value="plot()"></v-slider>
        </div>
        <svg id="overview"></svg>
        <p>Interactions: Hover to see percentage. Slide to filter by gen. Click to filter by type.</p>
    </div>
</template>

<style scoped>

.pie-container {
    width: 80%;
    height: 60%;
    margin: 0 auto;
}

.generation-slider > *:first-child {
    width: 5%;
}

svg {
    width: 100%;
    height: 100%;
}

</style>
