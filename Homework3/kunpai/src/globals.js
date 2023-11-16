import { updateBarChart } from "./BarChart";
import { updateHeatMap } from "./HeatMap";

export function updateCharts(key, clicked, selectedYValue = null) {
    updateHeatMap(key, selectedYValue);
    updateBarChart(key, clicked);
}


