<script lang="ts">

import Notes from './components/Notes.vue'
import Spider from './components/Spider.vue'
import Bar from './components/Bar.vue'
import Line from './components/Line.vue'
/*
import ExampleWithLegend from './components/ExampleWithLegend.vue';
import ExampleWithInteractions from './components/ExampleWithInteractions.vue';*/

export default {
  data() {
    return {
      filter: []
    };
  },
  components: {
    Notes,
    Spider,
    Bar,
    Line,
    /*
    ExampleWithLegend,
    ExampleWithInteractions*/
  },
  methods: {
    updateSpider(filter) {
      console.log(filter);
      this.filter = filter;
    }
  }
}
</script>

<!--This is using the grid component from Vuetify to do layout design-->
<template>
  <v-container id="main-container" class="d-flex flex-nowrap" fluid>
    <v-row>
      <v-col cols="30">
        <!-- {{names}} -->
        <Spider :filter="filter" />
      </v-col>
    </v-row>
    <v-row class="d-flex flex-column  flex-nowrap">
      <v-col cols="15">
        <Line @updateSpider="updateSpider" />
      </v-col>
      <v-col cols="15">
        <Bar />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
#main-container{
  height: 100%;
}
</style>
