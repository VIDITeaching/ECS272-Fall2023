import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { createPinia } from "pinia";

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { md3 } from 'vuetify/blueprints'


const vuetify = createVuetify({
    components,
    directives,
    blueprint: md3,
})
  
const app = createApp(App);
app.use(vuetify)
app.use(createPinia())
app.mount('#app')
