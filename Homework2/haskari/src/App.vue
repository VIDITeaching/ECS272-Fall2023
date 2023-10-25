<script lang="ts">

import pie from './components/pie.vue';
import radar from './components/radar.vue';
import scatter from './components/scatter.vue';

export default {
  components: {
    pie,
    radar,
    scatter
  }
}
</script>

<!--This is using the grid component from Vuetify to do layout design-->
<template>
  <div class="is-flex">
    <div class="area1">
      <pie></pie>
    </div>
    <div class="area2">
      <radar></radar>
    </div>
  </div>
  <div class="is-flex">
    <div class="area3">
      <scatter></scatter>
    </div>
  </div>
</template>

<style scoped>

.is-flex {
  display: flex;
  width: 100%;
}

.area1, .area2, .area3 {
  flex-basis: 100%;
  margin: 0 auto;
  text-align: center;
}

</style>
