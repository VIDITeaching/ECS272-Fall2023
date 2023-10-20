<script setup lang="ts">

import { ref } from 'vue';

// components
import Search from './components/Search.vue';

// types
import type { Pokemon } from '@/types/Pokemon';

// stores
import { pokemonStore } from './stores/pokemon';

// initialize store
const store = pokemonStore();
store.loadPokedex();


// initialize data
let pokemon: Pokemon = ref(null);


// methods
function formatNumber(num) {
  let numInt = parseInt(num);
  if (numInt < 10) {
    return "00" + num;
  } else if (numInt < 100) {
    return "0" + num;
  }
  return num;
}

</script>

<template>
  <Search @on-select="(pk) => pokemon = pk"></Search>
  <div v-if="pokemon">
    <img :src="`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${formatNumber(pokemon.Number)}.png`">
  </div>
</template>

<style scoped>
</style>
