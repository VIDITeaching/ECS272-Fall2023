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
          <Example class="scatter"/>
          <div class="scatterText " >
              Fig1. <br>
              From the scatter plot we found out that most of the Data Scientists work in company in the US,
              and their salary fall between 50,000 and 300,000. Also, Data Scients with high salary also works in the US.
          </div>
        </v-col>
        <v-col cols="6">
            <v-row>
              <v-col cols="12" style="height: 46vh;">
                  <JobInfo class="parallel"/>
                  <div class="parallelText " >
                      Fig2. <br>
                      We only choose the Data Scientists who work in 2023 US with full time employment and discover the 
                      relationship between experience level, salary, and company size. From the parallel coordinate chart 
                      we can see that most of the companies are in medium size. 
                      For the companies in large size, we highlight them in red color, we found out that 
                      there are no Data Scientists in the highest level(executor).
                  </div>
              </v-col>
              <v-col cols="12" style="height: 53vh;">
                  <JobTitle class="donut"/>
                  <div class="donutText " >
                      Fig3. <br>
                      From the above choosing data, we continuouslly focus on Data Scientists in large company and 
                      observe the count of their job title. We can see from the donut chart, there are the most 
                      applied scientist and data engineer.
                  </div>
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

.scatterText{
  display:none;
}
.scatter:hover + .scatterText{
  display: block;
  position: absolute;
  width:45vh;
  height:20vh;
  top: 30vh;
  left: 53vh;
  text-align: justify;
  padding: 10px;
  border: 1px solid black;
  border-radius: 15px;
  background-color: #f6e8c3;
  font-size: 12px;
}
.parallelText{
  display:none;
}
.parallel:hover + .parallelText{
  display: block;
  position: absolute;
  width:45vh;
  height:31vh;
  top: 25vh;
  left: 53vh;
  text-align: justify;
  padding: 10px;
  border: 1px solid black;
  border-radius: 15px;
  background-color: #f6e8c3;
  font-size: 12px;
}
.donutText{
  display:none;
}
.donut:hover + .donutText{
  display: block;
  position: absolute;
  width:45vh;
  height:20vh;
  top: 30vh;
  left: 53vh;
  text-align: justify;
  padding: 10px;
  border: 1px solid black;
  border-radius: 15px;
  background-color: #f6e8c3;
  font-size: 12px;
}
</style>
