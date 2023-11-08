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
  <div class="main">
    <div class="is-flex top">
      <div class="area1">
        <pie></pie>
      </div>
      <div class="area2">
        <radar></radar>
      </div>
    </div>
    <div class="bottom">
        <box></box>
    </div>
  </div>
</template>

<style scoped>
.main {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.main > .top {
  height: 50%;
}

.main > .bottom {
  height: 45%;
  text-align: center;
  width: 100%;
}
.is-flex {
  display: flex;
  width: 100%;
}

.area1,
.area2,
.area3 {
  flex-basis: 100%;
  margin: 0 auto;
  text-align: center;
}
</style>
