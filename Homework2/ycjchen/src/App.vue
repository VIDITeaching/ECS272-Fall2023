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
            Fig. 1 shows the scatter plot of the data set "Data Science Job Salaries". Because there is 
            only one column (salary) whose data type is metric in the data set, "company location" is 
            used  as the vertical dimension in the plot. From the plot we found that the United States (US), 
            India (IN), United Kindom (GB), France (FR), Spain (ES), Germany (DE) and Canada (CA) are the 
            countries among the ones having the highest number of Data Scientists. Particularly, the US is 
            the country having the highest number of Data Scientists whose salaries distribute within the 
            largest range. For this reason we will focus on the data science 
            job salaries of US in 2023 in Figs. 2 and 3. 
          </div>
        </v-col>
        <v-col cols="6">
            <v-row>
              <v-col cols="12" style="height: 46vh;">
                  <JobInfo class="parallel"/>
                  <div class="parallelText " >
                    Fig. 2 shows the parallel set plot of the full time data scientist job salaries of US in 2023. 
                    In this plot we are interested in the relationship between Experience Level (EN: entry, MI: 
                    middile, SE: senior, EX: executive), Salary and Company Size (S: small, M: medium, L: large). From 
                    the plot we can see that the employees with higher experience level get higher salaries and the 
                    employees in bigger companies get higher salaries than those in smaller companies. It is noticed 
                    that although the employee in the SE level get the highest salaries but in average the employees 
                    in EX level get the highest salary.
                  </div>
              </v-col>
              <v-col cols="12" style="height: 53vh;">
                  <JobTitle class="donut"/>
                  <div class="donutText " >
                    Fig. 3 shows the donut chart of the job titles of the data scientists of US in 2023 with salary &gt 
                    300,000 USD. In this chart we are interested in what job titles are among those who gets highest 
                    salaries. From the plot we can see that Machine Learning Engineer, Data Engineer and Data 
                    Scientist are the job titles among those who get highest salaries.
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
  display: inline;
  position: absolute;
  width:50vh;
  top: 30vh;
  left: 100vh;
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
  display: inline;
  position: absolute;
  width:50vh;
  /* height:37vh; */
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
  display: inline;
  position: absolute;
  width:45vh;
  top: 60vh;
  left: 66vh;
  text-align: justify;
  padding: 10px;
  border: 1px solid black;
  border-radius: 15px;
  background-color: #f6e8c3;
  font-size: 12px;
}
</style>
