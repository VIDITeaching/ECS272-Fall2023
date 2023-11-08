//import { mountBarChart, BarChart } from './src/Example'
import { Notes, mountCounter } from './src/notes';
import { parallelChart, mountParallelChart} from './src/parallelLines';
import { myBarChart, myMountBarChart } from './src/barChart';
import './style.css'
import { mountScatterChart, scatterChart } from './src/scatter';

// You can manage your layout through CSS, or this template also has materialize library supported.
// Materialize: https://materializecss.com/getting-started.html

document.querySelector('#app').innerHTML = `
  <div id='main-container' class='d-flex flex-column flex-nowrap'>
    ${parallelChart()}
    <div class='d-flex flex-row flex-grow'>
      ${myBarChart()}
      ${scatterChart()}
    </div>
  </div>
`

myMountBarChart();
mountParallelChart();
mountScatterChart();
//mountCounter(document.querySelector('#counter-button'));