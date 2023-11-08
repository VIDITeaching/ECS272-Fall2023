<script lang="ts">


import JobLocation from './components/JobLocation.vue'
import JobInfoSan from './components/JobInfoSan.vue'
import JobTitle from './components/JobTitle.vue'


export default {
  data() {
      return {

      }
    },
  components: {
    JobLocation,
    JobInfoSan,
    JobTitle,
    
  }
}


</script>

<!--This is using the grid component from Vuetify to do layout design-->
<template>
  <v-container id="main-container" class="d-flex flex-column flex-nowrap" fluid>
    <v-row style="height:100vh"> <!-- no-gutters -->
        <v-col cols="6">
          <JobLocation class="scatter"/>
        </v-col>
        <v-col cols="6">
            <v-row>
              <v-col cols="12" style="height: 55vh;">
                  <JobInfoSan class="parallel"/>
              </v-col>
              <v-col cols="12" style="height: 41vh;">
                  <JobTitle class="donut"/>
              </v-col>
            </v-row>
        </v-col>
    </v-row>
  </v-container>
</template>

<style>
#main-container{
  height: 100%;
}


</style>
