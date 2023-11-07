<script lang="ts">
import * as d3 from "d3";
import Notes from './components/Notes.vue'
import Example from './components/Example.vue'
import Star from './components/starChart.vue'
import Bar from './components/barChart.vue'
import Scatter from './components/scatterChart.vue'
/*
import ExampleWithLegend from './components/ExampleWithLegend.vue';
import ExampleWithInteractions from './components/ExampleWithInteractions.vue';*/

export default {
  components: {
    Notes,
    Example,
    Star, 
    Bar, 
    Scatter
    /*
    ExampleWithLegend,
    ExampleWithInteractions,*/
  }
}

</script>

<!--This is using the grid component from Vuetify to do layout design-->
<template>
  <v-container id="main-container" class="d-flex flex-column flex-nowrap" fluid>
    <v-btn id = "but">
      Erase and try the legend underneath
    </v-btn>
    <v-row no-gutters>
      <v-col>
        <Bar /> 
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <Star /> 
      </v-col>
      <v-col>
        <Scatter /> 
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
#main-container{
  height: 100%;
}
</style>
