<script setup lang="ts">

import { computed } from 'vue';
import { pokemonStore } from '../stores/pokemon';
import { ref } from 'vue'

const emit = defineEmits(['onSelect']);
const props = defineProps(['randomize']);

// load store
const store = computed(() => pokemonStore());

let pokemon = ref(null);
if (props.randomize == '') {
  const n = store.value.pokemon.length;
  pokemon.value = store.value.pokemon[Math.floor(Math.random() * n)];
}

</script>

<template>
    <v-autocomplete
                v-model="pokemon"
                search="search"
                :items="store.pokemon"
                label="Pokemon"
                :item-title="'Name'"
                full-width
                solo
                hide-no-data
                density="comfortable"
                auto-select-first
                no-data-text="No Pokemon found!"
                return-object
                :on-update:model-value="$emit('onSelect', pokemon)"
              ></v-autocomplete>
</template>

<style scoped>

</style>
