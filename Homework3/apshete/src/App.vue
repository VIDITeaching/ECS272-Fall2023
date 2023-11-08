<script lang="ts">

import Visualization1 from './components/Visualization1.vue'
//import visualization2 from './components/visualization-2.vue';
import visualization3 from './components/visualization3.vue';
import visualization4 from './components/visualization4.vue';
import sankey from './components/sankey.vue';
import DChart from './components/3dChart.vue';
import textbox from './components/textbox.vue';


export default {
  components: {
    Visualization1,
    // visualization2,
    visualization3,
    //visualization4, 
    DChart, 
    sankey, 
    textbox
     
}
}
</script>

<!--This is using the grid component from Vuetify to do layout design-->
<template>
  <v-container id="main-container" class="d-flex flex-column flex-nowrap" fluid>
    <v-row no-gutters fill-height>
      <v-col cols="5">
        <sankey/>
      </v-col>
      <v-col >
        <visualization3 />
      </v-col>
      <textbox/>
    </v-row>
    <v-row no-gutters fill-height class="my-custom-row" gutter="-100">
      <v-col cols="5">
        <Visualization1 />
      </v-col>
      <v-col >
        <DChart />
      </v-col>
    </v-row>
  </v-container>
  
</template>

<style scoped>
#main-container{
  height: 100%;
}
.my-custom-row {
  margin-top: -70px !important; /* Reduce space at the top */
  margin-bottom: -8px !important; /* Reduce space at the bottom */
}
</style>
