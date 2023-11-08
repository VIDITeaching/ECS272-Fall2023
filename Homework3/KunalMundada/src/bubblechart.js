import * as d3 from "d3";
import Data from "../data/iso_name.json";
import { unroll } from "./utils";
import { isEmpty, debounce } from "lodash";

const margin = { top: 20, right: 35, bottom: 20, left: 25 };
let size = { width: 0, height: 0 };
let country_name = "US";
// const pubsub = new PubSub();

// const country_name = pubsub.subscribe('select_country', (data, topic) => {
//   console.log("Bubble:");
//   console.log(data);
//   return data.country;
// });
function convertToInternationalCurrencySystem(labelValue) {
  // Nine Zeroes for Billions
  return Math.abs(Number(labelValue)) >= 1.0e9
    ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + "B"
    : // Six Zeroes for Millions
    Math.abs(Number(labelValue)) >= 1.0e6
    ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + "M"
    : // Three Zeroes for Thousands
    Math.abs(Number(labelValue)) >= 1.0e3
    ? (Math.abs(Number(labelValue)) / 1.0e3).toFixed(2) + "K"
    : Math.abs(Number(labelValue));
}

function getBubbleData(data) {
  const bubbleMap = d3.rollup(
    data,
    (v) => d3.mean(v, (d) => d.salary_in_usd),
    (d) => (d.company_location === country_name ? country_name : "ROW"),
    (d) => d.work_year.toString()
  );
  const bubbleData = unroll(bubbleMap, ["fill", "x"], "y");
  return bubbleData;
}
let bubbleData;
let rawData;
await d3
  .csv(
    "https://gist.githubusercontent.com/AlKun25/9273150f538429294d860a9c6c22fd6f/raw/8072c6f90e65a96e01eee56fc83cc1dae7f9bcf6/ds_salaries.csv"
  )
  .then(function (data) {
    rawData = data;
  });

console.log(rawData);

const onResize = (targets) => {
  targets.forEach((target) => {
    if (target.target.getAttribute("id") !== "bubble-container") return;
    size = {
      width: target.contentRect.width,
      height: target.contentRect.height,
    };
    if (!isEmpty(size) && !isEmpty(rawData)) {
      d3.select("#bubble-svg").selectAll("*").remove();
      initBubbleChart();
    }
  });
};

const chartObserver = new ResizeObserver(debounce(onResize, 100));
// <h6>Comparison of avg salary to remote ratio across years</h6>
export const BubbleChart = () =>
  `<div class='chart-container-2 flex-column' id='bubble-container'>
      <svg id='bubble-svg' width='100%' height='100%'>
      </svg>
  </div>`;

export function mountBubbleChart() {
  let bubbleContainer = document.querySelector("#bubble-container");
  chartObserver.observe(bubbleContainer);
}

function initBubbleChart() {
  bubbleData = getBubbleData(rawData);
  const svg = d3
    .select("#bubble-svg")
    // .append("svg")
    .attr("width", size.width + margin.left + margin.right)
    .attr("height", size.height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const yExtents = d3.extent(bubbleData, (d) => d.y);

  const xCategories = [...new Set(bubbleData.map((d) => d.x))];

  // const zExtents = d3.extent(bubbleData, (d) => d.z);

  // Add X axis
  const xScale = d3
    .scaleBand()
    .rangeRound([margin.left, size.width - margin.right])
    .domain(xCategories)
    .paddingInner(1)
    .paddingOuter(0.5);

  svg
    .append("text")
    .attr("x", size.width / 2)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("text-decoration", "underline")
    .text(`Avg Salary from 2020 - 2023 in ${Data.iso[country_name]}`);

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
  // const zScale = d3.scaleLinear().domain([0, zExtents[1]]).range([4, 10]);

  // Add a scale for bubble color
  const myColor = d3
    .scaleOrdinal()
    .domain([country_name, "ROW"])
    .range(["#3978B6", "#BDD1EA"]);

  // -1- Create a Tooltip div that is hidden by default:
  const tooltip = d3.select("#bubble-container")
    .append("div")
    .style("opacity", 0)
    .attr("class", "bubble-tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "3px")
    .style("border-radius", "5px")
    .style("padding", "3px")
    .style("position", "absolute")
    .on("mouseover", (event) => {
      // A bug where if the user's cursor gets on top of the Tooltip, it flashes infinitely until the user's cursor moves
      // Very distracting and this gets rid of it completely. Besides, the cursor should never be over the Tooltip anyway
      Tooltip.style("opacity", "0");
    });

//   const line = d3.line()
//   .x(d => xScale(d.x))
//   .y(d => yScale(d.y))
// svg.selectAll("myLines")
//   .data(bubbleData)
//   .join("path")
//     .attr("class", d => d.fill)
//     .attr("d", d => line(d.values))
//     .attr("stroke", (d) => (d.fill == "US" ? myColor("US") : myColor("ROW")))
//     .style("stroke-width", 4)
//     .style("fill", "none")

  // Add dots
  const jitterWidth = size.width * 0.1;
  svg
    .append("g")
    .selectAll("dot")
    .data(bubbleData)
    .join("circle")
    .attr("class", d => d.fill)
    .attr(
      "cx",
      (d) => xScale(d.x) - jitterWidth / 2 + Math.random() * jitterWidth
    )
    .attr("cy", (d) => yScale(d.y))
    .attr("r", 10)
    .style("fill", (d) => (d.fill == country_name ? myColor(country_name) : myColor("ROW")))
    // -3- Trigger the functions
    .on("mouseover", (event, d) => {
      tooltip
      .style("opacity", 1)
    })
    .on("mousemove", (event, d) => {
      const region_name = d.fill == country_name ? Data.iso[country_name] : "Rest of World";
      tooltip
        .html(`${region_name}<br>Avg salary:$${convertToInternationalCurrencySystem(
          parseInt(d.y)
        )}`)
        .style("left", (event.x) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", (event.y)/2 + "px")
    })
    .on("mouseleave", (event, d) => {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
    });
}

export function updateBubbleChart(country) {
  country_name = country;
  d3.select("#bubble-svg").selectAll("*").remove();
  initBubbleChart();
}
