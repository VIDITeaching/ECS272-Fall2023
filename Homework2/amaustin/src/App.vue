<script lang="ts">

import DonutChart from './components/DonutChart.vue'
import HistogramChart from './components/HistogramChart.vue'
import SankeyDiagram from './components/SankeyDiagram.vue'

export default {
  components: {
    DonutChart,
    HistogramChart,
    SankeyDiagram
  }
}
</script>

<template>
  <v-container id="main-container" class="d-flex flex-column flex-nowrap" fluid>
    <v-row>
      <v-col>
      <SankeyDiagram />
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <HistogramChart />
      </v-col>
      <v-col>
        <DonutChart />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
#main-container{
  height: 100%;
}
</style>
