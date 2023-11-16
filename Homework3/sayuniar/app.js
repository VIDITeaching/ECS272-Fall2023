import { DetailBot, mountDetailBot, resetDetailBot } from './src/detailbot';
import { DetailTop, mountDetailTop, resetDetailTop } from './src/detailtop';
import { mountOverview, Overview, resetOverview } from './src/overview';
import './style.css';
import * as d3 from 'd3';
import axios from 'axios';

document.querySelector('#app').innerHTML = `
  <div id='main-container'>
    ${Overview()}
    ${DetailTop()}
    ${DetailBot()}
  </div>
`

const main = async () => {
  
  let data = d3.csvParse((await axios.get('./data/mxmh_survey_results.csv')).data, d3.autoType)

  let context = {}

  const reset = () => {
    console.log(context)
    resetOverview()
    resetDetailTop()
    resetDetailBot()
    context.keepsame = null
  }

  context.reset = reset

  mountOverview(data, context)
  mountDetailTop(data, context)
  mountDetailBot(data, context)
}

main()