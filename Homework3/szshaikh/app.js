import { mountBarChart, BarChart } from './src/Example';
import { Notes } from './src/notes';
import { createSankeyDiagram, createGraph } from './src/sankey.js';
import './style.css';
import Data from './data/mentalH.json';


// You can manage your layout through CSS, or this template also has materialize library supported.
// Materialize: https://materializecss.com/getting-started.html

document.querySelector('#app').innerHTML = `
  <div id='main-container' class='d-flex flex-column flex-nowrap'>
  <h5> Information Visualization Study on  Music and Mental Health Survey</h5>
    <div class="split left">
      <div class="centered">
        <div id='sankey-container'></div> 
        <p>The dashboard visually analyzes music's impact on mood through three interactive plots: a Sankey diagram revealing the influence of music genres on emotions, a zoomable scatter plot exploring the correlation between depression and music habits, and a pie chart illustrating popular streaming platforms. The color-coded data points in the scatter plot indicate whether individuals listen to music while working, providing comprehensive insights into music's psychological effects.
        </p>
      </div>  
    </div>
    <div class="split right">
      <div class="centered">
        ${BarChart()}
        ${Notes()}
      </div>
    </div>
  </div>
`;

document.addEventListener('DOMContentLoaded', function() {

  const sankeyContainer = document.querySelector('#sankey-container');
  sankeyContainer.appendChild(createSankeyDiagram());

  // Example: Initialize bar chart
  mountBarChart();
});

