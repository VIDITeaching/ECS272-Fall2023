<script lang="ts">

import Notes from './components/Notes.vue'
import BarPlot from './components/BarPlot.vue'
import RadialPlot from './components/RadialPlot.vue'
import ScatterPlot from './components/ScatterPlot.vue'
/*
import Example from './components/Example.vue'
import ExampleWithLegend from './components/ExampleWithLegend.vue';
import ExampleWithInteractions from './components/ExampleWithInteractions.vue';
*/

export default {
  components: {
    Notes,
    BarPlot,
    RadialPlot,
    ScatterPlot
    /*
    Example,
    ExampleWithLegend,
    ExampleWithInteractions
    */
  },
  data() {
    return { generation:-1, reset:-1 }
  }
};

</script>

<!--This is using the grid component from Vuetify to do layout design-->
<template>
  <v-container id="main-container" class="d-flex flex-column flex-nowrap" fluid>
    <v-row class="flex-nowrap">
      <v-col class="barplot-col" cols="8">
        <BarPlot @gen-select="g => { generation = g; console.log('gen', generation) }" @reset-select="r => { reset = r; console.log('res', reset) }" />
      </v-col>
      <v-col class="starplot-col" cols="3.7">
        <RadialPlot :gen="generation" :res="reset" />
      </v-col>
    </v-row>
    <v-row class="flex-nowrap">
      <v-col class="scatterplot-col" cols="7.5">
        <ScatterPlot :gen="generation" :res="reset" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
#main-container {
  width: 100vw;
  height: 100vh;
}

.barplot-col,
.starplot-col,
.scatterplot-col {
  height: 60vh;
  width: 100vw;
  margin: 0.5rem;
  border: 2px solid black;
}
</style>