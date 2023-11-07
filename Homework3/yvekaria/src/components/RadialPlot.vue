<template>
  <div>
    <h3>
      <br />
      <center>Mean Pokemon Stats</center>
    </h3>
    <div class="dropdown-container">
      <label for="pokemonDropdown">Select Pokemon: </label>
      <div class="dropdown-box">
      <select
        id="pokemonDropdown"
        v-model="selectedPokemon"
        @change="updateRadialPlot"
      >
        <option value="All Pokemons">All Pokemons</option>
        <option v-for="pokemon in pokemonOptions" :value="pokemon">{{ pokemon }}</option>
      </select>
      </div>
    </div>
    <svg id="radial-plot"></svg>
  </div>
</template>


<script lang="ts">
import * as d3 from "d3";
import { watch } from 'vue';

export default {
  data() {
    return {
      selectedPokemon: "All Pokemons",
      pokemonOptions: ["All Pokemons"],
      data: [],
    };
  },
  props: ['gen', 'res'],
  methods: {
    createRadialPlot(data_radar) {
      // const categoryOrder = data_radar.map(x => x.category);
      // const data = data_radar.map(x => x.value);
      function calculateMeanAndMaxValues(datad, generation) {
        const filteredData = datad.filter(entry => entry.Generation == generation);
        const attributes = ['HP', 'Defense', 'Attack', 'Speed', 'Sp. Attack', 'Sp. Defense'];
        const result = attributes.map(attribute => ({
          value: Math.round(filteredData.reduce((sum, entry) => sum + entry[attribute], 0) / filteredData.length),
          maxValue: Math.max(...filteredData.map(entry => entry[attribute])),
          category: attribute,
        }));

        return result;
      };
      
      const localPokemonData = this.pokemonData;
      if (this.gen !== -1) {
        const generationMeanAndMaxValues = localPokemonData.filter(item => item.Generation == this.gen);
        data_radar = calculateMeanAndMaxValues(generationMeanAndMaxValues, this.gen);
      }

      d3.select('#radial-plot').selectAll('*').remove();
      const categoryOrder = ['HP', 'Defense', 'Attack', 'Speed', 'Sp. Attack', 'Sp. Defense'];
      const data_ = categoryOrder.map((category) => data_radar.find((item) => item.category == category));
      const data_values = data_.map(item => item.value);
      const indexes = [1, 3, 2, 4, 6, 5]
      const data = indexes.map(index => {
        const category = categoryOrder[index - 1]; // Adjust index to 0-based
        const item = data_.find(item => item.category === category);
        return item.value;
      });
      
      const margin = { top: 0, right: 50, bottom: 50, left: 0 }; 
      const width = 400 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
      const radius = Math.min(width, height) / 2 - 50;
      const radialAngle = (Math.PI * 2) / data.length;

      const svg = d3
        .select('#radial-plot')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(220,165)`);


      // Draw grey radial axes
      svg
        .selectAll('.axis')
        .data(data)
        .enter()
        .append('line')
        .attr('class', 'axis')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d, i) => Math.cos(i * radialAngle - Math.PI / 2) * radius)
        .attr('y2', (d, i) => Math.sin(i * radialAngle - Math.PI / 2) * radius)
        .attr('stroke', 'black');

      // Draw circular bounding box
      svg
        .append('circle')
        .attr('class', 'bounding-circle')
        .attr('r', radius)
        .attr('stroke', 'black')
        .attr('fill', 'rgba(200, 200, 200, 0.5)'); 

      // const validData = data.filter((d) => isNaN(d));
      // console.log(validData);
      // console.log("categories", categoryOrder)
      // console.log("values", data)
      
      // Draw the radial plot
      const line = d3
        .lineRadial()
        .radius((d) => Math.min((d/256) * radius, radius)) // Ensure the star radial stays inside the boundary
        .angle((d, i) => i * radialAngle - Math.PI / 2.0)
        .curve(d3.curveLinearClosed);

      // Filling the radial bounding box
      svg
        .append('path')
        .datum(data)
        .attr('class', 'radar-chart')
        .attr('d', line)
        .attr('fill', 'blue')
        .attr('opacity', '0.5')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .style("transform", "rotate(90deg)");

      
      const categoryDistance = radius * 1.28; 
      const valueDistance = radius * 1.12;
  
      const categoryLocations = [
        { x: 0, y: -categoryDistance + 5 },  // HP
        { x: categoryDistance * Math.cos(Math.PI / 6) + 5, y: categoryDistance * Math.sin(Math.PI / 6) - 15}, // Def
        { x: categoryDistance * Math.cos(Math.PI / 9) - 15, y: -categoryDistance * Math.sin(Math.PI / 9) - 25}, // At
        { x: 0, y: categoryDistance - 25 }, // Speed
        { x: -categoryDistance * Math.cos(Math.PI / 6), y: -categoryDistance * Math.sin(Math.PI / 6) }, // Sp At
        { x: -categoryDistance * Math.cos(Math.PI / 9) - 5, y: categoryDistance * Math.sin(Math.PI / 9) + 15} // Sp Def
      ];

      svg
        .selectAll('.axis-label')
        .data(categoryOrder)
        .enter()
        .append('text')
        .attr('class', 'axis-label')
        .attr('x', (d, i) => categoryLocations[i].x)
        .attr('y', (d, i) => categoryLocations[i].y)
        .text((d) => `${d}`)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', '0.9em')
        .attr('fill', 'black');

 
      const valueLocations = [
        { x: 0, y: -valueDistance + 4}, // HP
        { x: valueDistance * Math.cos(Math.PI / 6) + 21, y: valueDistance * Math.sin(Math.PI / 6) + 13}, // Def
        { x: valueDistance * Math.cos(Math.PI / 9) + 5, y: -valueDistance * Math.sin(Math.PI / 9) - 15}, // At
        { x: 0, y: valueDistance + 15}, // Speed
        { x: -valueDistance * Math.cos(Math.PI / 6) - 18, y: -valueDistance * Math.sin(Math.PI / 6) + 10}, // Sp At
        { x: -valueDistance * Math.cos(Math.PI / 9) - 26, y: valueDistance * Math.sin(Math.PI / 9) + 40}   // Sp Def
      ];

      svg
        .selectAll('.axis-value')
        .data(data_values)
        .enter()
        .append('text')
        .attr('class', 'axis-value')
        .attr('x', (d, i) => valueLocations[i].x)
        .attr('y', (d, i) => valueLocations[i].y)
        .text((d) => `${d}`)
        .attr('text-anchor', 'middle')
        .style('font-size', '0.8em')
        .attr('alignment-baseline', 'middle')
        .attr('fill', 'blue')
        .attr('opacity', '0.5');

      const textPositions = [{ x: -150, y: 178, text: 'Stats are printed relative to max stat value of 255.' }]
      svg.selectAll('.custom-text')
        .data(textPositions)
        .enter()
        .append('text')
        .attr('class', 'custom-text')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .text(d => d.text)
        .attr('text-anchor', 'start') // Adjust text-anchor as needed ('start', 'middle', or 'end')
        .style('font-size', '14px') // Adjust font size as needed
        .attr('fill', 'black'); // Adjust text color as needed
    },
    updateRadialPlot() {
      if (this.selectedPokemon === "All Pokemons") {
        this.createRadialPlot(this.data);
      } else {
        const selectedPokemonData = this.pokemonData.find((d) => d.Pokemon === this.selectedPokemon);
        if (selectedPokemonData) {
          const stats = ['HP', 'Defense', 'Attack', 'Speed', 'Sp. Attack', 'Sp. Defense'];
          const selectedPokemonStats = stats.map((stat) => {
            return {
              category: stat,
              value: selectedPokemonData[stat] // Accessing the corresponding stat value from selectedPokemonData object
            };
          });
          // const stats = ['HP', 'Defense', 'Attack', 'Speed', 'Sp. Attack', 'Sp. Defense'];
          // const selectedPokemonStats = stats.map((stat) => +selectedPokemonData[stat]);
          // console.log(selectedPokemonStats);
          this.createRadialPlot(selectedPokemonStats);
        }
      }
    },
    async loadPokemonData() {
      const data = await d3.csv('../../data/pokemon_radar_data.csv');
      this.pokemonOptions = [...data.map((d) => d.Pokemon)];
      this.pokemonData = data.map((d) => {
        return {
          "Pokemon": d.Pokemon,
          "Generation": +d.Generation,
          "HP": +d.HP,
          "Attack": +d.Attack,
          "Defense": +d.Defense,
          "Speed": +d.Speed,
          "Sp. Attack": +d.SpAttack,
          "Sp. Defense": +d.SpDefense
        };
      });
    },
    async loadAggregatedData() {
      const jsonData = await fetch('../../data/radar_data.json');
      const data = await jsonData.json();
      this.data = data.data;
    }
  },
  mounted() {
    this.loadPokemonData();
    this.loadAggregatedData().then(() => {
      this.updateRadialPlot();
    });

    this.$watch('gen', () => {
      this.createRadialPlot(this.data);
      this.selectedPokemon = "All Pokemons";
      this.updateRadialPlot();
    });
    this.$watch('res', () => {
      this.createRadialPlot(this.data);
      this.selectedPokemon = "All Pokemons";
      this.updateRadialPlot();
    });
  },
  created() {
    watch(this.gen, () => {
      console.log('test-gen')
    });
    watch(this.res, () => {
      console.log('test-res')
    });
  }
}


</script>


<style scoped>
p{font-size: 0.8em;}
.dropdown-container {
  text-align: center;
  margin-bottom: 10px;
}
.dropdown-box {
  display: inline-block;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-top: 5px;
}
</style>
