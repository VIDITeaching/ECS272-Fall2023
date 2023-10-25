import { mountBarChart, BarChart } from './src/barChart';
import { mountLineChart, LineChart } from './src/linechart';
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
          ${LineChart()}
        </div>
      </div>
    </div>
    <div class='right-panel'>
      <div class='middle-center'>
        ${ParallelCoordinatesPlot()}
      </div>
    </div>
  </div>
`;

mountBarChart();
mountLineChart();
mountParallelCoordinatesPlot();