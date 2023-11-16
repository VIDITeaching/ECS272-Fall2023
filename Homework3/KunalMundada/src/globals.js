import * as d3 from "d3";
import { updateBubbleChart } from "./bubblechart";
import { updateSunburstChart } from "./sunburst";


export function updateCharts(key) {
  updateBubbleChart(key);
  updateSunburstChart(key);
}

// export const mapColorScheme = d3
//   .scaleSequentialLog()
//   .domain(d3.extent(data, (d) => d.market_size))
//   .nice()
//   .interpolator(d3.interpolateBlues);

export const mapColorScheme = d3
  .scaleThreshold()
  .domain([10000, 100000, 1000000, 10000000])
  .range(["#F2B279", "#F2CCB6", "#F2E4DC", "#0D0D0D"])
  // .range(["#0D0D0D", "#F2E4DC", "#F2CCB6", "#F2B279"])
  .unknown("#EBEBF2"); // #EBEBF2 or #FEFFFE

export function bubbleColorScheme (country) {
  return d3.scaleOrdinal().domain([country, "ROW"]).range(["#F2B279", "#0D0D0D"]);
}

export function sunburstColorScheme(data) {
  return d3.scaleOrdinal(
    d3.quantize(d3.interpolateBlues, data.children.length + 1).reverse()
  );
}
