import { Title, mountTitle } from './src/PageTitle';
import { PieChart, mountPieChart } from './src/PieChart';
import { StackedBarChart, mountStackedBarChart } from './src/StackedBarChart';
import { BarChart, mountBarChart } from './src/BarChart';
import { StarChart, mountStarChart } from './src/StarChart';
import { HeatMap, mountHeatMap } from './src/HeatMap';
import './style.css'

document.querySelector('#app').innerHTML = `
  ${Title()}
  <div id='main-container' class='d-flex flex-row flex-nowrap' style='height: calc(100vh - 100px); padding: 10px; width: 100vw;'>
    <div style='height: calc(100vh - 100px); width: 50%' class='d-flex flex-column flex-nowrap'>
      ${StarChart()}
    </div>
    <div class='d-flex flex-column flex-nowrap' style='height: calc(100vh - 100px); width: 50%'>
      ${BarChart()}
      ${HeatMap()}
    </div>
  </div>
`
mountStarChart();
mountTitle();
mountBarChart();
mountHeatMap();

