<script lang="ts">

import Visualization1 from './components/Visualization1.vue'
import visualization2 from './components/visualization-2.vue';
import visualization3 from './components/visualization3.vue';
import visualization4 from './components/visualization4.vue';


export default {
  components: {
    Visualization1,
    visualization2,
    visualization3,
    visualization4
     
}
}
</script>

<!--This is using the grid component from Vuetify to do layout design-->
<template>
  <v-container id="main-container" class="d-flex flex-column flex-nowrap" fluid>
    <v-row no-gutters fill-height>
      <v-col cols="5">
        <visualization2/>
      </v-col>
      <v-col >
        <visualization3 />
      </v-col>
    </v-row>
    <v-row no-gutters fill-height>
      <v-col cols="5">
        <Visualization1 />
      </v-col>
      <v-col >
        <visualization4 />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
#main-container{
  height: 100%;
}
</style>
