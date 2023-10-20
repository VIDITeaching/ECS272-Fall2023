import { defineStore } from 'pinia';
// import { parse } from 'csv-parse/sync';
import * as d3 from 'd3';
import type { Pokemon } from '@/types/Pokemon';

export const pokemonStore = defineStore('pokemon', {
  state: () => {
    const pokemon: Array<Pokemon> = [];
    return { pokemon };
  },
  actions: {
    async loadPokedex() {
      this.pokemon = await d3.csv('../data/pokemon.csv');
    }
  }
})
