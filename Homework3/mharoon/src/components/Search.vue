<script setup lang="ts">

import { pokemonStore } from '../stores/pokemon';
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia';

const emit = defineEmits(['onSelect']);
const props = defineProps(['randomize', 'disabled', 'clearOnSelect']);

// load store
const { generation, type, getPokemon } = storeToRefs(pokemonStore());

// selected pokemon
let pokemon = ref(null);

if (props.clearOnSelect == '') {
  watch(pokemon, () => {
    setTimeout(() => {
      pokemon.value = null;
    }, 100);
  });
}

if (props.randomize == '') {
  watch([generation, type], randomize);
  randomize();
}

function randomize() {
    const n = getPokemon.value.length;
    pokemon.value = getPokemon.value[Math.floor(Math.random() * n)];
}

</script>

<template>
    <v-autocomplete
                v-model="pokemon"
                search="search"
                :items="getPokemon"
                label="Pokemon"
                :item-title="'Name'"
                full-width
                solo
                hide-no-data
                density="comfortable"
                auto-select-first
                no-data-text="No Pokemon found!"
                return-object
                :disabled="disabled"
                :on-update:model-value="$emit('onSelect', pokemon)"
              >
              

              <template v-slot:item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item?.raw?.Name"
                  :subtitle="item?.raw?.Type_1"
                ></v-list-item>
              </template>

              </v-autocomplete>
</template>

<style scoped>

</style>
