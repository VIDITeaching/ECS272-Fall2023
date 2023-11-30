import * as d3 from "d3";
import { unroll } from "./utils";
import { isEmpty, debounce } from "lodash";

const margin = { top: 10, right: 20, bottom: 30, left: 50 };
let size = { width: 0, height: 0 };

function getBubbleData(data) {
  const bubbleMap = d3.rollup(
    data,
    (v) => d3.mean(v, (d) => d.salary_in_usd),
    (d) => (d.company_location === "US" ? "US" : "ROW"),
    (d) => d.work_year.toString(),
    (d) => d.remote_ratio
  );
  const bubbleData = unroll(bubbleMap, ["fill", "x", "z"], "y");
  return bubbleData.slice(0, 50);
}
let bubbleData;
await d3
  .csv(
    "https://gist.githubusercontent.com/AlKun25/9273150f538429294d860a9c6c22fd6f/raw/8072c6f90e65a96e01eee56fc83cc1dae7f9bcf6/ds_salaries.csv"
  )
  .then(function (data) {
    bubbleData = getBubbleData(data);
  });

console.log(bubbleData);

const onResize = (targets) => {
  targets.forEach((target) => {
    if (target.target.getAttribute("id") !== "bubble-container") return;
    size = {
      width: target.contentRect.width,
      height: target.contentRect.height,
    };
    if (!isEmpty(size) && !isEmpty(bubbleData)) {
      d3.select("#bubble-svg").selectAll("*").remove();
      initBubbleChart();
    }
  });
};

const chartObserver = new ResizeObserver(debounce(onResize, 100));

export const BubbleChart = () =>
  `<div class='chart-container flex-column' id='bubble-container'>
      <h4>Comparison of avg salary to remote ratio across years</h4>
      <svg id='bubble-svg' width='100%' height='100%'>
      </svg>
  </div>`;

export function mountBubbleChart() {
  let bubbleContainer = document.querySelector("#bubble-container");
  chartObserver.observe(bubbleContainer);
}

function initBubbleChart() {
  const svg = d3
    .select("#bubble-svg")
    // .append("svg")
    .attr("width", size.width + margin.left + margin.right)
    .attr("height", size.height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const yExtents = d3.extent(bubbleData, (d) => d.y);

  const xCategories = [...new Set(bubbleData.map((d) => d.x))];

  const zExtents = d3.extent(bubbleData, (d) => d.z);

  // Add X axis
  const xScale = d3
    .scaleBand()
    .rangeRound([margin.left, size.width - margin.right])
    .domain(xCategories)
    .paddingInner(1)
    .paddingOuter(0.5);

  svg
    .append("g")
    .attr("transform", `translate(0, ${size.height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  // Add Y axis
  const yScale = d3
    .scaleLinear()
    .domain([0, yExtents[1]])
    .range([size.height - margin.bottom, margin.top]);

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale));

  // Add a scale for bubble size
  const zScale = d3.scaleLinear().domain([0, zExtents[1]]).range([4, 10]);

  // Add a scale for bubble color
  const myColor = d3
    .scaleOrdinal()
    .domain(["US", "ROW"])
    .range(["#3978B6", "#BDD1EA"]);

  // -1- Create a tooltip div that is hidden by default:
  const tooltip = d3
    .select("#bubble-container")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    // .style("background-color", "black")
    // .style("border-radius", "5px")
    // .style("padding", "10px")
    .style("color", "black");

  // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
  const showTooltip = function (event, d) {
    tooltip.transition().duration(100);
    tooltip
      .style("opacity", 1)
      .html("Country:" + d.fill + "<br>Remote:" + d.z)
      // .html("Avg. salary: " + d.z)
      .style("left", event.x / 2 + "rem")
      .style("top", event.y / 2 + "rem");
  };
  const moveTooltip = function (event, d) {
    tooltip
      .style("left", event.x / 2 + "px")
      .style("top", event.y / 2 + 30 + "px");
  };
  const hideTooltip = function (event, d) {
    tooltip.transition().duration(200).style("opacity", 0);
  };

  // Add dots
  const jitterWidth = size.width * 0.1;
  svg
    .append("g")
    .selectAll("dot")
    .data(bubbleData)
    .join("circle")
    .attr("class", "bubbles")
    .attr(
      "cx",
      (d) => xScale(d.x) - jitterWidth / 2 + Math.random() * jitterWidth
    )
    .attr("cy", (d) => yScale(d.y))
    .attr("r", (d) => zScale(d.z))
    .style("fill", (d) => (d.fill == "US" ? myColor("US") : myColor("ROW")))
    // -3- Trigger the functions
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip);
}
