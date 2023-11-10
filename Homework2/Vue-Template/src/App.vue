<script lang="ts">

import Notes from './components/Notes.vue'
import Example from './components/Example.vue'
import AverageSalary from './components/Bar.vue'
// import Visualization from './components/Visualization.vue';
/*
import ExampleWithLegend from './components/ExampleWithLegend.vue';
import ExampleWithInteractions from './components/ExampleWithInteractions.vue';*/

export default {
  components: {
    Notes,
    AverageSalary,
    Example,
    // Visualization,
    /*
    ExampleWithLegend,
    ExampleWithInteractions*/
  }
}
</script>


<template>
  <div>
      <a-row type="flex">
          <a-col :flex="3" type="flex">
              <a-row :flex="1">
                  <a-card title="The Popularity of Different Jobs' " style="width: 95%">
                      <Example/>
                  </a-card>
              </a-row>
              <br />
              <a-row :flex="1">
                  <a-card title="" style="width: 95%">
                      <AverageSalary/>
                  </a-card>
              </a-row>
          </a-col>
          <a-col :flex="2">
              <a-card title="Overview of Job Salary" style="width: 95%">
                  <Example/> 
              </a-card>
          </a-col>
      </a-row>
      <br />
  </div>
</template>




<!--This is using the grid component from Vuetify to do layout design-->
<!-- <template>
  <div>
    <dashboard-visualization
      v-for="(visualization, index) in visualizations"
      :key="index"
      :data="visualization"
    ></dashboard-visualization>
  </div>
  <v-container id="main-container" class="d-flex flex-column flex-nowrap" fluid>
    <v-row no-gutters>
      <v-col cols="5">
        <AverageSalary />
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <Notes />
      </v-col>
    </v-row>
  </v-container>
</template> -->

<style scoped>
#main-container{
  height: 100%;
}
</style>
