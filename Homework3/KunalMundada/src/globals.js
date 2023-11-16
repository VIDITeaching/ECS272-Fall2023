import * as d3 from "d3";
import { updateBubbleChart } from "./bubblechart";
import { updateSunburstChart } from "./sunburst";


export function updateCharts(key) {
  console.log("updateCharts:" + key);
  updateBubbleChart(key[0], key[1]);
  updateSunburstChart(key[0]);
}

// export const mapColorScheme = d3
//   .scaleSequentialLog()
//   .domain(d3.extent(data, (d) => d.market_size))
//   .nice()
//   .interpolator(d3.interpolateBlues);

export const mapColorScheme = d3
  .scaleThreshold()
  .domain([10000, 100000, 1000000, 10000000])
  // .range(["#F2CCB6", "#F2B279","darkOrange", "#0D0D0D"])
  .range(["#F2E4DC", "#F2CCB6", "#F2B279", "#0D0D0D"])
  // .range(["#F2B279", "#F2CCB6", "#F2E4DC", "#0D0D0D"])
  // .range(["#0D0D0D", "#F2E4DC", "#F2CCB6", "#F2B279"])
  .unknown("#EBEBF2"); // #EBEBF2 or #FEFFFE

export function bubbleColorScheme (country, map_color="#F2B279") {
  return d3.scaleOrdinal().domain([country, "ROW"]).range([map_color, "#EBEBF2"]);
}

export function sunburstColorScheme(data) {
  // return d3.scaleOrdinal(
  //   d3.quantize(d3.interpolateBlues, data.children.length + 1).reverse()
  // );
  return d3
    .scaleOrdinal()
    .domain(["Small", "Medium", "Large"])
    .range(["#F2CCB6", "#F2B279", "#0D0D0D"]);
}
