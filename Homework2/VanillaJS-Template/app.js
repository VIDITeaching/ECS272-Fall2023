import { mountBarChart, BarChart } from './src/Example'
import { Notes, mountCounter } from './src/notes';
import './style.css'


document.querySelector('#app').innerHTML = `
  <div id='main-container' class='d-flex flex-column flex-nowrap'>
    ${BarChart()}
    ${Notes()}
  </div>
`

mountBarChart();
mountCounter(document.querySelector('#counter-button'));