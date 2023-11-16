<script setup lang="ts">

// components
import Stats from './components/Stats.vue';
import Height from './components/Height.vue';
import Overview from './components/Overview.vue';


// stores
import { pokemonStore } from './stores/pokemon';
pokemonStore().loadPokedex();

</script>

<template>
  <div class="container">
    <div class="flex-row">
      <div class="widget1">
        <h1>Types by Generation</h1>
        <Overview></Overview>
      </div>
      <div class="widget2">
        <h1>Stats</h1>
        <Stats></Stats>
      </div>
    </div>
    <div class="flex-row">
      <div class="widget3">
        <h1>Height Compare</h1>
        <Height></Height>
      </div>
    </div>
  </div>
</template>

<style scoped>
.widget1,
.widget2,
.widget3 {
  flex-basis: 100%;
  padding: 8px;
  text-align: center;
  border-radius: 12px;
  margin: 8px 12px;
}

.widget3,
.widget2,
.widget1 {
  background: white;
  color: black;
}

</style>
