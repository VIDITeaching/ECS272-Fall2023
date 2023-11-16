import { defineStore } from 'pinia';
import * as d3 from 'd3';
import type { Pokemon } from '@/types/Pokemon';

export const pokemonStore = defineStore('pokemon', {
  state: () => {
    const pokemon: Array<Pokemon> = [];
    const type_colors = {
      Normal: "#aa9",
      Fire: "#f42",
      Water: "#39f",
      Electric: "#fc3",
      Grass: "#7c5",
      Ice: "#6cf",
      Fighting: "#b54",
      Poison: "#a59",
      Ground: "#db5",
      Flying: "#89f",
      Psychic: "#f59",
      Bug: "#ab2",
      Rock: "#ba6",
      Ghost: "#66b",
      Dragon: "#76e",
      Dark: "#754",
      Steel: "#aab",
      Fairy: "#e9e",
      Curse: "#698"
    };
    const generation = 0;
    const type = null;
    return { pokemon, type_colors, generation, type };
  },
  actions: {
    async loadPokedex() {
      this.pokemon = await d3.csv('../data/pokemon.csv');
    }
  },
  getters: {
    getPokemon: (state) => {
      let pokemon = state.pokemon;
      if (state.generation > 0) {
        pokemon = pokemon.filter(x => parseInt(x.Generation) == state.generation);
      }
      if (state.type) {
        pokemon = pokemon.filter(x => x.Type_1 == state.type || x.Type_2 == state.type);
      }
      return pokemon;
    }
  }
})
