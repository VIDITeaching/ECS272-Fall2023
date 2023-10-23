<script lang="ts">

import DonutChart from './components/DonutChart.vue'
import ScatterPlot from './components/ScatterPlot.vue'
import SankeyDiagram from './components/SankeyDiagram.vue'

export default {
  components: {
    DonutChart,
    ScatterPlot,
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
        <ScatterPlot />
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
