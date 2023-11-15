import * as d3 from "d3";
import Data from "../data/iso_name.json";
import axios from "axios";
import { isEmpty, debounce } from "lodash";
import { unroll } from "./utils";
import { sunburstColorScheme } from "./globals";

const margin = { left: 40, right: 20, top: 50, bottom: 60 };
let size = { width: 0, height: 0 };
let country_name="US";

function convertToHierarchicalStructure(data) {
  data = data.filter(function (el) {
    return  el.company_location == country_name;
  });
  const targetData = {
    name: country_name,
    children: [],
  };

  const companySizeMap = new Map();

  // Group data by company_size
  data.forEach((item) => {
    const { company_size, experience_level, value } = item;

    if (!companySizeMap.has(company_size)) {
      companySizeMap.set(company_size, {
        name: company_size,
        children: [],
      });
    }

    const companySizeNode = companySizeMap.get(company_size);

    companySizeNode.children.push({
      name: experience_level,
      value: value,
    });
  });

  targetData.children = Array.from(companySizeMap.values());
  return targetData;
}

function getSunburstData(data) {
  // The code for preparing Sunburst data (as provided in previous steps) goes here.
  const experienceLevel = {
    EN: "Entry Level",
    MI: "Mid Level",
    SE: "Senior Level",
    EX: "Executive Level",
  };
  const companySize = {
    S: "Small",
    M: "Medium",
    L: "Large",
  };
  const sunburstMap = d3.rollup(
    data,
    (v) => v.length,
    (d) => (d.company_location == country_name ? country_name : "Rest of World"),
    (d) => companySize[d.company_size],
    (d) => experienceLevel[d.experience_level]
  );
  const sunburstData = unroll(
    sunburstMap,
    ["company_location", "company_size", "experience_level"],
    "value"
  );
  return sunburstData;
}

// const sunburstData = convertToHierarchicalStructure(
//   getSunburstData(
//     await d3.csv(
//       "https://gist.githubusercontent.com/AlKun25/9273150f538429294d860a9c6c22fd6f/raw/8072c6f90e65a96e01eee56fc83cc1dae7f9bcf6/ds_salaries.csv",
//       d3.autoType
//     )
//   )
// );

let rawData;
await d3
  .csv(
    "https://gist.githubusercontent.com/AlKun25/9273150f538429294d860a9c6c22fd6f/raw/8072c6f90e65a96e01eee56fc83cc1dae7f9bcf6/ds_salaries.csv"
  )
  .then(function (data) {
    rawData = data;
  });

const onResize = (targets) => {
  targets.forEach((target) => {
    if (target.target.getAttribute("id") !== "sunburst-container") return;
    size = {
      width: target.contentRect.width,
      height: target.contentRect.height,
    };
    if (!isEmpty(size) && !isEmpty(rawData)) {
      d3.select("#sunburst-svg").selectAll("*").remove();
      initChart();
    }
  });
};

const chartObserver = new ResizeObserver(debounce(onResize, 100));
//   <h6>Distribution of Jobs across companies and experience levels</h6>
export const SunburstChart = () =>
  `<div class='chart-container-2 d-flex flex-column' id='sunburst-container'>
    
      <svg id='sunburst-svg' width='100%' height='100%'>
      </svg>
  </div>`;

export function mountSunburstChart() {
  let sunburstContainer = document.querySelector("#sunburst-container");
  chartObserver.observe(sunburstContainer);
}

function initChart() {
  
  const sunburstData = convertToHierarchicalStructure(getSunburstData(rawData));
  console.log(sunburstData);
  const color = sunburstColorScheme(sunburstData);

  // const color = d3
  //   .scaleOrdinal()
  //   .domain(["Small", "Rest of World"])
  //   .range(["#3978B6", "#BDD1EA"]);
  const radius = Math.min(size.width, size.height) / 2;

  const partition = (data) =>
    d3.partition().size([2 * Math.PI, radius])(
      d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value)
    );

  const arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius / 2)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1 - 1);

  // const legend = d3.legendColor()
  // .scale(color);

  const root = partition(sunburstData);

  const svg = d3
    .select("#sunburst-svg")
    .attr("viewBox", `-${0} -${radius} ${2 * radius} ${2 * radius}`)
    .style("font", "10px sans-serif");

  svg
    .append("text")
    .attr("x", 2 * radius)
    .attr("y", margin.top - radius)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("text-decoration", "underline")
    .text("Job distribution across company size & experience");
    svg
    .append("text")
    .attr("x", 2 * radius)
    .attr("y", margin.top - radius + 20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("text-decoration", "underline")
    .text(`level in ${Data.iso[country_name]}`);

  // svg.append("g")
  // .attr("transform", `translate(${2*radius},0)`)
  // .call(legend);
  svg
    .append("g")
    .attr("fill-opacity", 0.6)
    .selectAll("path")
    .data(root.descendants().filter((d) => d.depth))
    .join("path")
    .attr("fill", (d) => {
      while (d.depth > 1) d = d.parent;
      return color(d.data.name);
    })
    .attr("d", arc)
    .append("title")
    .text(
      (d) =>
        `${d
          .ancestors()
          .map((d) => d.data.name)
          .reverse()
          .join("/")}\n${d.value}`
    );

  svg
    .append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .attr("font-family", "sans-serif")
    .selectAll("text")
    .data(
      root
        .descendants()
        .filter((d) => d.depth && ((d.y0 + d.y1) / 2) * (d.x1 - d.x0) > 10)
    )
    .join("text")
    .attr("transform", function (d) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = (d.y0 + d.y1) / 2;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    })
    .attr("dy", "0.35em")
    .text((d) => d.data.name);
}

export function updateSunburstChart(country){
  country_name = country;
  d3.select("#sunburst-svg").selectAll("*").remove();
  initChart();
}