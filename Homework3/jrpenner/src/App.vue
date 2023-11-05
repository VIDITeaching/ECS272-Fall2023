<script lang="ts">

import Notes from './components/Notes.vue'
import Bar from './components/Bar.vue'
import Overview from './components/Overview.vue'
import Scatter from './components/Scatter.vue'

export default {
  components: {
    Notes,
    Bar,
    Overview,
    Scatter
  }
}
</script>

<!--This is using the grid component from Vuetify to do layout design-->
<template>
  <v-container id="main-container" class="d-flex flex-column flex-nowrap" fluid>
    <v-row>
      <v-col>
        <Overview />
      </v-col>
      <v-col>
        <Scatter />
      </v-col>
      <v-col>
        <Bar />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
#main-container{
  height: 100%;
  width: 100%;
  background-color: whitesmoke;
}
</style>
