import * as d3 from "d3";
import Data from "../data/iso_name.json";
import { unroll } from "./utils";
import { isEmpty, debounce } from "lodash";
import { legendColor, legendHelpers } from "d3-svg-legend";
import { updateCharts, mapColorScheme } from "./globals";

const margin = { left: 40, right: 20, top: 50, bottom: 60 };
let size = { width: 0, height: 0 };
let country_name = "US";

// console.log(JSON.parse(Data));
// US-coords
// const coords_us = [Data.US.lng,Data.US.lat];
// console.log(coords_us);

function getMapData(orig_data) {
  const mapMap = d3.rollup(
    orig_data,
    (v) => d3.sum(v, (d) => d.salary_in_usd),
    (d) => Data.iso[d.company_location]
  );
  const mapData = unroll(mapMap, ["country"], "market_size");
  return mapData;
}

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
  console.log(data);
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
  `<div class='chart-container-1 flex-column' id='map-container'>
    <p>Data science job market in USD across world</p>
        <svg id='map-svg' width='100%' height='80%'>
        </svg>
    </div>`;

export function mountConnectMap() {
  // registering this element to watch its size change
  let mapContainer = document.querySelector("#map-container");
  chartObserver.observe(mapContainer);
}

function initChart() {
  // ConnectMap and projection
  const projection = d3
    .geoMercator()
    .scale(size.width / (2 * Math.PI))
    .translate([size.width / 2, size.height / 2])
    .center([0, 45]);

  // A path generator
  const pathBuilder = d3.geoPath(projection); // d3.geoPath.projection(projection);

  // A colorscale
  // const colorScale = d3
  //   .scaleSequentialLog()
  //   .domain(d3.extent(data, (d) => d.market_size))
  //   .nice()
  //   .interpolator(d3.interpolateBlues);

  const colorScale = mapColorScheme;

  // Define tooltip
  const Tooltip = d3
    .select("#map-container")
    .append("div")
    .attr("class", "map-tooltip")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute")
    .on("mouseover", (event) => {
      // A bug where if the user's cursor gets on top of the Tooltip, it flashes infinitely until the user's cursor moves
      // Very distracting and this gets rid of it completely. Besides, the cursor should never be over the Tooltip anyway
      Tooltip.style("visibility", "hidden");
    });

  // Define map zoom
  const zoom = d3
    .zoom()
    .on("zoom", (event) => {
      map.attr("transform", event.transform);
    })
    .scaleExtent([1, 70]);

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
  const map = d3
    .select("#map-svg")
    .attr("padding", "none")
    .attr("height", size.height - 40)
    .attr("width", size.width)
    .attr("border", "1px solid black")
    // .attr("margin-left", "10px")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .call(zoom)
    .append("g");

  // Reformat the list of link. Note that columns in csv file are called long1, long2, lat1, lat2
  // const link = [];
  // data.forEach(function (row) {
  //   if (
  //     row.source &&
  //     row.source.lng &&
  //     row.source.lat &&
  //     row.target &&
  //     row.target.lng &&
  //     row.target.lat
  //   ) {
  //     let source = [+row.source.lng, +row.source.lat];
  //     let target = [+row.target.lng, +row.target.lat];
  //     let topush = {
  //       type: "LineString",
  //       coordinates: [source, target],
  //       value: +row.total_amount,
  //       code: row.source.code,
  //     };
  //     link.push(topush);
  //   } else {
  //     console.log(row);
  //   }
  // });

  // Draw the map
  map
    // .append("g")
    .selectAll("path")
    .data(dataGeo.features)
    .enter()
    .append("path")
    .classed("country", true)
    .attr("id", (feature) => {
      return "country_" + feature.properties.name;
    })
    .attr("fill", (feature) => {
      const value = data.find(
        (item) => item.country === feature.properties.name
      );
      console.log(value);
      if (value) {
        feature.properties.total = value.market_size;
        return colorScale(value.market_size);
      } else {
        feature.properties.total = 0;
        return colorScale(null);
      }
    })
    .attr("d", (feature) => {
      return pathBuilder(feature);
    })
    .attr("opacity", ".7")
    .attr("stroke", "black")
    .attr("stroke-width", ".5px")
    .on("mouseover", (event, feature) => {
      d3.select("#country_" + feature.properties.name)
        .transition()
        .duration(200)
        .attr("opacity", "1")
        .attr("stroke-width", "1px");

      Tooltip.style("visibility", "visible");
    })
    .on("mouseleave", (event, feature) => {
      d3.selectAll(".country")
        .transition()
        .duration(200)
        .attr("opacity", "0.7")
        .attr("stroke-width", ".5px");

      Tooltip.style("visibility", "hidden");
    })
    .on("mousemove", (event, feature) => {
      const country = data.find(
        (agg) => agg.country === feature.properties.name
      );
      if (country) {
        Tooltip.html(
          feature.properties.name +
            "<br>" +
            "Market:$" +
            convertToInternationalCurrencySystem(
              parseInt(feature.properties.total)
            )
        )
          .style("left", event.x + 10 + "px")
          .style("top", event.y + 10 + "px");
      } else {
        Tooltip.html(feature.properties.name + "<br>" + "Market:$0")
          .style("left", event.x + 10 + "px")
          .style("top", event.y + 10 + "px");
      }
    })
    .on("click", (event, feature) => {
      if (feature.properties.name != country_name) {
        country_name = feature.properties.name;
        updateCharts(Data.name[feature.properties.name]);
      }
      // d3.selectAll(".country")
      //   .transition()
      //   .duration(0)
      //   .attr("opacity", "0.7")
      //   .attr("stroke-width", "1px");
    });

  map
    .append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(5,350)");

  const legend = legendColor()
    .labelFormat(d3.format(",.0f"))
    .labels(legendHelpers.thresholdLabels)
    .labelOffset(3)
    .shapePadding(0)
    .scale(colorScale);

  map.select(".legendThreshold").call(legend);

  let color_neg = false;
  // Add the path
  // map
  //   .selectAll("myPath")
  //   .data(link)
  //   .join("path")
  //   .attr("d", function (d) {
  //     return path(d);
  //   })
  //   .style("fill", "none")
  //   .style("stroke", function (d) {
  //     let color = "#BDD1EA";
  //     if (d.code === "US") {
  //       color = "#3978B6";
  //     }
  //     return color;
  //   })
  //   .style("stroke-width", (d) => pathThicknessScale(d.value / range));
}
