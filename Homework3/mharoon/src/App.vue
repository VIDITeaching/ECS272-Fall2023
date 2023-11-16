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
    <div class="flex-row top">
      <div class="widget1">
        <h1>Overview</h1>
        <Overview></Overview>
      </div>
      <div class="widget2">
        <h1>Stats</h1>
        <Stats></Stats>
      </div>
    </div>
    <div class="flex-row bottom">
      <div class="widget3">
        <h1>Height Compare</h1>
        <Height></Height>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.container > div.top {
  height: 50%;
}

.container > div.bottom {
  height: 50%;
}

.widget1,
.widget2,
.widget3 {
  flex-basis: 100%;
  padding: 8px;
  text-align: center;
  border-radius: 12px;
  margin: 2px;
}

.widget3,
.widget2,
.widget1 {
  background: white;
  color: black;
}

</style>
