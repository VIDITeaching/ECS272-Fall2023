import { DetailBot } from './src/detailbot';
import { DetailTop } from './src/detailtop';
import { mountBarChart, BarChart } from './src/Example'
import { Notes, mountCounter } from './src/notes';
import { Overview } from './src/overview';
import './style.css'

document.querySelector('#app').innerHTML = `
  <div id='main-container'>
    ${Overview()}
    ${DetailTop()}
    ${DetailBot()}
  </div>
`

mountBarChart();
mountCounter(document.querySelector('#counter-button'));