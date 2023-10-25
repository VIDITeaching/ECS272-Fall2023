import * as d3 from "d3";
import { isEmpty, debounce } from "lodash";

const legendData = ["United States of America", "Rest of the World"];
const margin = { left: 40, right: 20, top: 50, bottom: 60 };
let size = { width: 0, height: 0 };

const onResize = (targets) => {
  targets.forEach((target) => {
    if (target.target.getAttribute("id") !== "legend-container") return;
    size = {
      width: target.contentRect.width,
      height: target.contentRect.height,
    };
    if (!isEmpty(size) && !isEmpty(legendData)) {
      d3.select("#legend-svg").selectAll("*").remove();
      initChart();
    }
  });
};

const chartObserver = new ResizeObserver(debounce(onResize, 100));

export const LegendChart = () =>
  `<div class='chart-container flex-column' id='legend-container'>
        <h5>Common Legend</h5>
        <svg id='legend-svg' width='100%' height='100%'>
        </svg>
    </div>`;

export function mountLegendChart() {
  let legendContainer = document.querySelector("#legend-container");
  chartObserver.observe(legendContainer);
}

function initChart() {
  const color = d3
    .scaleOrdinal()
    .domain(legendData)
    .range(["#3978B6", "#BDD1EA"]);

  const svg = d3.select("#legend-svg");
  const l = 100;
  svg
    .selectAll("mydots")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", 100)
    .attr("y", function (d, i) {
      return 100 + i * (l + 5);
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", l)
    .attr("height", l)
    .style("fill", function (d) {
      return color(d);
    });

  // Add one dot in the legend for each name.
  svg
    .selectAll("mylabels")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", 100 + l * 1.2)
    .attr("y", function (d, i) {
      return 100 + i * (l + 5) + l / 2;
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function (d) {
      return color(d);
    })
    .text(function (d) {
      return d;
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");
}
