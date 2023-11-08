import { updateBubbleChart } from "./bubblechart";
import { updateSunburstChart } from "./sunburst";

export function updateCharts(key) {
  updateBubbleChart(key);
  updateSunburstChart(key);
}