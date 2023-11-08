import { mountBarChart, BarChart } from './src/Example';
import { Notes } from './src/notes';
import createSankeyDiagram from './src/sankey.js';
import './style.css';
import Data from './data/mentalH.json';


const filteredData = Data.filter(entry => entry['Music effects'] !== "");
const keys = [
  "Music effects",
  "Anxiety",
  "Fav genre",
];
function createGraph(filteredData, keys) {
  const data = filteredData;
  let index = -1;
  const nodes = [];
  const nodeByKey = new Map();
  const indexByKey = new Map();
  const links = [];

  for (const k of keys) {
    for (const d of data) {
      const key = JSON.stringify([k, d[k]]);
      if (nodeByKey.has(key)) continue;
      const node = { name: d[k] };
      nodes.push(node);
      nodeByKey.set(key, node);
      indexByKey.set(key, ++index);
    }
  }

  for (let i = 1; i < keys.length; ++i) {
    const a = keys[i - 1];
    const b = keys[i];
    const prefix = keys.slice(0, i + 1);
    const linkByKey = new Map();
    for (const d of data) {
      const names = prefix.map(k => d[k]);
      const key = JSON.stringify(names);
      const value = d.value || 1;
      let link = linkByKey.get(key);
      if (link) {
        link.value += value;
        continue;
      }
      link = {
        source: indexByKey.get(JSON.stringify([a, d[a]])),
        target: indexByKey.get(JSON.stringify([b, d[b]])),
        names,
        value
      };
      links.push(link);
      linkByKey.set(key, link);
    }
  }

  return { nodes, links };
}
const graph = createGraph(filteredData, keys);

// You can manage your layout through CSS, or this template also has materialize library supported.
// Materialize: https://materializecss.com/getting-started.html

document.querySelector('#app').innerHTML = `
  <div id='main-container' class='d-flex flex-column flex-nowrap'>
  <h5> Information Visualization Study on  Music and Mental Health Survey</h5>
    <div class="split left">
      <div class="centered">
        <div id='sankey-container'></div> 
        <p>This Sankey diagram analyzes how favorite music genres affect anxiety levels and mood enhancement. Mapping diverse musical choices, it reveals pathways connecting genres to mental well-being, offering insights into anxiety alleviation and mood enhancement. Discover the profound influence of music on emotional states.</p>
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



const sankeyContainer = document.querySelector('#sankey-container');
sankeyContainer.appendChild(createSankeyDiagram(graph));

mountBarChart();

