<script lang="ts">

import pie from './components/pie.vue';
import radar from './components/radar.vue';
import box from './components/box.vue';

export default {
  components: {
    pie,
    radar,
    box
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
      <box></box>
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
