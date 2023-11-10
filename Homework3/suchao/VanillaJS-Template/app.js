import { mountBarChart, BarChart } from './src/barChart';
import { mountChart, Chart } from './src/pieBarChart';
import { ParallelCoordinatesPlot, mountParallelCoordinatesPlot } from './src/parallelCoordiantesChart';
import './style.css';

document.querySelector('#app').innerHTML = `
  <div id='main-container' class='d-flex'>
    <div class='left-panel'>
      <div class='top-half'>
        <div class='middle-center'>
          ${BarChart()}
        </div>
      </div>
      <div class='bottom-half'>
        <div class='middle-center'>
          ${Chart()}
        </div>
      </div>
    </div>
    <div class='right-panel'>
      ${ParallelCoordinatesPlot()}
    </div>
  </div>
`;

mountBarChart();
mountChart();
mountParallelCoordinatesPlot();