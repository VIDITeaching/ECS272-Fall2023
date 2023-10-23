<script lang="ts">
import { useExampleStore } from '../stores/exampleStore';
import { mapState } from 'pinia'

//NOTE: you can disregard any composition API syntax if you stick with optionAPI (which I recommmend)
//If you want to understad how the store works here, make sure you load the <ExampleWithInteractionns> component to check the expected channges

export default {
  /*setup() {
    const store = useExampleStore()
    // This is the state read from store
    // This is showing how the store update from one component will also be reflected in other components
    watch(store, (state) => { 
      console.log(state.size)
    })
    // Setting up the local state
    const count = ref(0)
    return {
      count // This is the local state of this component
    }
  },*/
  //This is the equivalent code (data, computed, and watch) to the setup() above, but in options API
  data() {
    return {
      count: 0
    }
  },
  computed: {
    ...mapState(useExampleStore, ['size']) // Traditional way to map the store state to the local state
  },
  watch:{ // This is only effective when you load with <ExampleWithInteractionns> component
    size(){
      console.log(this.size)
    }
  },
  props: {
    msg: String, // This is the props passed down from the parent component
  },
}
</script>

<!-- The following is showcasing how to use UI components from Vuetify-->
<template>
  <h3 class="ma-2">{{ msg }}</h3>

  <v-divider class="pt-1 pb-1"/>

  <v-card class="ma-2 pa-4">
    <p class="pb-1">
      Edit
      <code>components/Notes.vue</code> to try different UI components from Vuetify
    </p>

    <v-card-text>
      This template uses Vuetify 3, a UI library based on Google's Material Design that can help you design the layout and populate template components in a consistent design.<br />
    </v-card-text>

    <v-btn @click="count++" elevation="2">
      Have clicked this {{ count }} times
    </v-btn>
  </v-card>

</template>

<style scoped>
</style>
