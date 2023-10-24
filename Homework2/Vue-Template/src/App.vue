<script lang="ts">

import Notes from './components/Notes.vue'
import Example from './components/Example.vue'
/*
import ExampleWithLegend from './components/ExampleWithLegend.vue';
import ExampleWithInteractions from './components/ExampleWithInteractions.vue';*/

export default {
  components: {
    Notes,
    Example,
    /*
    ExampleWithLegend,
    ExampleWithInteractions*/
  }
}
</script>

<!--This is using the grid component from Vuetify to do layout design-->
<template>
  <v-container id="main-container" class="d-flex flex-column flex-nowrap" fluid>
    <v-row no-gutters>
      <v-col cols="5">
        <Example />
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <Notes />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
#main-container{
  height: 100%;
}
</style>
