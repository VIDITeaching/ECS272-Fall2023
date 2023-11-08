<script lang="ts">

import Bar from './components/Bar.vue'
import Pie from './components/Pie.vue'
import Parallel from './components/Parallel.vue'

export default {
  data() {
    return {
      updateBar: null,
    };
  },
  provide() {
    return {
      setUpdateBar: () => this.updateBar,
    };
  },
  components: {
    Bar,
    Pie,
    Parallel,
  }
}
</script>

<!--This is using the grid component from Vuetify to do layout design-->
<template>
  <v-container id="main-container" class="d-flex flex-column flex-nowrap" fluid>
    <v-row no-gutters>
      <v-col>
        <Parallel />
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="6">
        <Bar />
      </v-col>
      <v-col cols="6">
        <Pie />
      </v-col>
    </v-row>
    
  </v-container>

</template>

<style scoped>
#main-container{
  height: 100%;
}
</style>
./useEventEmitter.js