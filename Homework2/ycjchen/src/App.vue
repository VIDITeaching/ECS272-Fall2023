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
              From the scatter plot we found out that the United States(US), India(IN), United Kindom(GB), Franch(FR), Spain(ES), Germany(DE) and Canada(CA)  
              have the most number of Data Scientists. Among all, the US has the most Data Scientists
              and the largest salary range. Their salaries generally fall between 50,000(USD) to 30,0000(USD). 
          </div>
        </v-col>
        <v-col cols="6">
            <v-row>
              <v-col cols="12" style="height: 46vh;">
                  <JobInfo class="parallel"/>
                  <div class="parallelText " >
                      Fig2. <br>
                      We only choose the Data Scientists who work in 2023 US with full time employment and discover the 
                      relationship between experience level( EN: entry level, MI: middile level, SE: senior level, EX: executor level), salary, and company size(S:small, M:medium, L:large). 
                      From the parallel coordinate chart we can see that Data Scientists in the EX level do not have the highest salaries. 
                      SE level has larger salary range, from lower than 50,000(USD) to almost 45,0000(USD).
                      For the companies in large and small size, there are no Data Scientists in the EX level.
                  </div>
              </v-col>
              <v-col cols="12" style="height: 53vh;">
                  <JobTitle class="donut"/>
                  <div class="donutText " >
                      Fig3. <br>
                      From the above choosing data, we continuouslly focus on Data Scientists with salary &gt 30,0000(USD) and 
                      observe the count of their job title. We can see from the donut chart, there are the most 
                      Machine Learning Engineer, Data Engineer and Data Scientist.
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
  width:50vh;
  height:25vh;
  top: 60vh;
  left: 70vh;
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
  width:50vh;
  height:37vh;
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
  height:23vh;
  top: 60vh;
  left: 65vh;
  text-align: justify;
  padding: 10px;
  border: 1px solid black;
  border-radius: 15px;
  background-color: #f6e8c3;
  font-size: 12px;
}
</style>
