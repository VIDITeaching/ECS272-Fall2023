<script lang="ts">

import Bar from './components/Bar.vue'
import Pie from './components/Pie.vue'
import Parallel from './components/Parallel.vue'
import Scatter from './components/Scatter.vue'

export default {
  data() {
    return {
      updateBar: null,
      isScatter: false,
    };
  },
  provide() {
    return {
      setUpdateBar: () => this.updateBar,
    };
  },
  components: {
    Bar,
    Pie,
    Parallel,
    Scatter
  }
}
</script>

<!--This is using the grid component from Vuetify to do layout design-->
<template>
  <v-container id="main-container" class="d-flex flex-column flex-nowrap" fluid>
    <v-row no-gutters>
      <v-col>
        <Parallel />
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="6">
        <v-switch v-model="isScatter" label="Toggle Chart Type"></v-switch>
        <Bar v-if="!isScatter" key="bar-chart" />
        <Scatter v-if="isScatter" key="scatter-plot" />
      </v-col>
      <v-col cols="6">
        <Pie />
      </v-col>
    </v-row>
  </v-container>

</template>

<style scoped>
#main-container{
  height: 100%;
}
</style>