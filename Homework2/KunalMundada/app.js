// import { mountBarChart, BarChart } from './src/example';
import { mountConnectMap, ConnectMap } from './src/connectMap';
import { mountSunburstChart, SunburstChart } from './src/sunburst';
import { mountBubbleChart, BubbleChart } from "./src/bubblechart";
import './style.css';
import { LegendChart, mountLegendChart } from './src/legend';

// You can manage your layout through CSS, or this template also has materialize library supported.
// Materialize: https://materializecss.com/getting-started.html

document.querySelector('#app').innerHTML = `
  <div id='main-container' class='d-flex flex-row flex-nowrap'>
  <div id='left-container' class='d-flex flex-column flex-nowrap'>
  ${ConnectMap()}
  ${LegendChart}
  </div>
  <div id='right-container' class='d-flex flex-column flex-nowrap'>
  ${BubbleChart()}
  ${SunburstChart()}
  </div>
  </div>
`

mountConnectMap();
mountLegendChart();
mountBubbleChart();
mountSunburstChart(); 