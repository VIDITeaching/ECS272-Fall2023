<script lang="ts">

import Notes from './components/Notes.vue'
import Example from './components/Example.vue'
import JobInfo from './components/Category.vue'
import JobTitle from './components/JobTitle.vue'
// import { createVuetify } from 'vuetify'
/*
import ExampleWithLegend from './components/ExampleWithLegend.vue';
import ExampleWithInteractions from './components/ExampleWithInteractions.vue';*/

export default {
  data() {
      return {

      }
    },
  components: {
    Notes,
    Example,
    JobInfo,
    JobTitle,
    /*
    ExampleWithLegend,
    ExampleWithInteractions*/
  }
}


</script>

<!--This is using the grid component from Vuetify to do layout design-->
<template>
  <v-container id="main-container" class="d-flex flex-column flex-nowrap" fluid>
    <v-row style="height:100vh"> <!-- no-gutters -->
        <v-col cols="6">
          <Example />
        </v-col>
        <v-col cols="6">
            <v-row>
              <v-col cols="12" style="height: 46vh;">
                  <JobInfo/>
              </v-col>
              <v-col cols="12" style="height: 53vh;">
                  <JobTitle/>
              </v-col>
            </v-row>
        </v-col>
    </v-row>
    <!-- <v-row no-gutters>
      <v-col>
        <Notes />
      </v-col>
    </v-row> -->
  </v-container>
</template>

<style>
#main-container{
  height: 100%;
}

</style>
