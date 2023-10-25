import * as d3 from "d3";
import Data from "../data/iso3166.json";
import { unroll } from "./utils";
import { isEmpty, debounce } from "lodash";

const margin = { left: 40, right: 20, top: 50, bottom: 60 };
let size = { width: 0, height: 0 };
// US-coords
// const coords_us = [Data.US.lng,Data.US.lat];
// console.log(coords_us);

function getMapData(orig_data) {
  const mapMap = d3.rollup(
    orig_data,
    (v) => d3.sum(v, (d) => d.salary_in_usd),
    (d) => Data[d.company_location],
    (d) => Data[d.employee_residence]
  );
  const mapData = unroll(mapMap, ["source", "target"], "total_amount");
  return mapData;
}

// Variable that hold the data
let dataGeo;
let data;

// Load world shape AND list of connection
await Promise.all([
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
  ), // World shape
  d3.csv(
    "https://gist.githubusercontent.com/AlKun25/9273150f538429294d860a9c6c22fd6f/raw/8072c6f90e65a96e01eee56fc83cc1dae7f9bcf6/ds_salaries.csv"
  ), // Position of circles
]).then(function (initialize) {
  dataGeo = initialize[0];
  data = getMapData(initialize[1]);
});

const onResize = (targets) => {
  targets.forEach((target) => {
    if (target.target.getAttribute("id") !== "map-container") return;
    size = {
      width: target.contentRect.width,
      height: target.contentRect.height,
    };
    if (!isEmpty(size) && !isEmpty(data)) {
      d3.select("#map-svg").selectAll("*").remove();
      //console.log(size, bars)
      initChart();
    }
  });
};
const chartObserver = new ResizeObserver(debounce(onResize, 100));

export const ConnectMap = () =>
  // equivalent to <template> in Vue
  `<div class='chart-container d-flex flex-column' id='map-container'>
        <h3>Data science employment across the world</h3>
        <svg id='map-svg' width='100%' height='100%'>
        </svg>
    </div>`;

export function mountConnectMap() {
  // registering this element to watch its size change
  let barContainer = document.querySelector("#map-container");
  chartObserver.observe(barContainer);
}

function initChart() {
  // ConnectMap and projection
  const projection = d3
    .geoMercator()
    // .scale(125)
    .translate([size.width / 2, (size.height / 2)*1.4]);

  // A path generator
  const path = d3.geoPath().projection(projection);

  const minDataValue = d3.min(data, (d) => d.total_amount);
  const maxDataValue = d3.max(data, (d) => d.total_amount);
  const range = maxDataValue - minDataValue;
  const minPathThickness = 1; // Min Path Thickness
  const maxPathThickness = 1000; // Max Path Thickness

  // Defining the scale for path thickness
  const pathThicknessScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([minPathThickness, maxPathThickness]);

  // The SVG
  const svg = d3.select("#map-svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  // Reformat the list of link. Note that columns in csv file are called long1, long2, lat1, lat2
  const link = [];
  data.forEach(function (row) {
    if (
      row.source &&
      row.source.lng &&
      row.source.lat &&
      row.target &&
      row.target.lng &&
      row.target.lat
    ) {
      let source = [+row.source.lng, +row.source.lat];
      let target = [+row.target.lng, +row.target.lat];
      let topush = {
        type: "LineString",
        coordinates: [source, target],
        value: +row.total_amount,
        code: row.source.code,
      };
      link.push(topush);
    } else {
      console.log(row);
    }
  });

  // Draw the map
  svg
    .append("g")
    .selectAll("path")
    .data(dataGeo.features)
    .join("path")
    .attr("fill", "#b8b8b8")
    .attr("d", path)
    .style("stroke", "#fff")
    .style("stroke-width", 0);

  let color_neg = false;
  // Add the path
  svg
    .selectAll("myPath")
    .data(link)
    .join("path")
    .attr("d", function (d) {
      return path(d);
    })
    .style("fill", "none")
    .style("stroke", function (d) {
      let color = "#BDD1EA";
      if (d.code === "US") {
        color = "#3978B6";
      }
      return color;
    })
    .style("stroke-width", (d) => pathThicknessScale(d.value / range));
}
