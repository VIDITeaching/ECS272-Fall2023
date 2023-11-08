<script lang="ts">

// import Notes from './components/Notes.vue'
import BarPlot from './components/BarPlot.vue'
import StreamGraph from './components/StreamGraph.vue'
import AreaChart from './components/AreaChart.vue'
/*
import Example from './components/Example.vue'
import ExampleWithLegend from './components/ExampleWithLegend.vue';
import ExampleWithInteractions from './components/ExampleWithInteractions.vue';
*/

export default {
  components: {
    BarPlot,
    StreamGraph,
    AreaChart
  }
};

</script>

<!--This is using the grid component from Vuetify to do layout design-->
<template>
  <v-container id="main-container" class="d-flex flex-column flex-nowrap" fluid>
    <v-row no-gutters>
      <v-col class="barplot-col" cols="6">
        <BarPlot />
      </v-col>
      <v-col class="worldmap-col" cols="3.8">
        <AreaChart />
      </v-col>
    </v-row>
    <v-row class="streamgraph-row" rows="5">
      <v-col cols="9.8">
        <StreamGraph />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
#main-container {
  height: 100vh;
}

.barplot-col,
.worldmap-col,
.streamgraph-col {
  height: 60vh;
  width: 100vw;
  margin: 0.5rem;
  border: 3px dotted black;
}

.streamgraph-row {
  height: 33vh;
  width: 100vw - 50;
  margin: 0.5rem;
  border: 3px dotted;
}
</style>