import * as d3 from "d3";
import axios from "axios";
import { isEmpty, debounce } from "lodash";
import { unroll } from "./utils";

const margin = { left: 40, right: 20, top: 50, bottom: 60 };
let size = { width: 0, height: 0 };

function convertToHierarchicalStructure(data) {
  const targetData = {
    name: "country",
    children: [],
  };

  const countryMap = new Map();

  // Group data by company_location
  data.forEach((item) => {
    const { company_location, company_size, experience_level, value } = item;

    if (!countryMap.has(company_location)) {
      countryMap.set(company_location, {
        name: company_location,
        children: [],
      });
    }

    const companyLocationNode = countryMap.get(company_location);

    if (
      !companyLocationNode.children.find((node) => node.name === company_size)
    ) {
      companyLocationNode.children.push({
        name: company_size,
        children: [],
      });
    }

    const companySizeNode = companyLocationNode.children.find(
      (node) => node.name === company_size
    );

    companySizeNode.children.push({
      name: experience_level,
      value: value,
    });
  });

  targetData.children = Array.from(countryMap.values());
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
    (d) => (d.company_location == "US" ? "US" : "Rest of World"),
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

const sunburstData = convertToHierarchicalStructure(
  getSunburstData(
    await d3.csv(
      "https://gist.githubusercontent.com/AlKun25/9273150f538429294d860a9c6c22fd6f/raw/8072c6f90e65a96e01eee56fc83cc1dae7f9bcf6/ds_salaries.csv",
      d3.autoType
    )
  )
);

const onResize = (targets) => {
  targets.forEach((target) => {
    if (target.target.getAttribute("id") !== "sunburst-container") return;
    size = {
      width: target.contentRect.width,
      height: target.contentRect.height,
    };
    if (!isEmpty(size) && !isEmpty(sunburstData)) {
      d3.select("#sunburst-svg").selectAll("*").remove();
      initChart();
    }
  });
};

const chartObserver = new ResizeObserver(debounce(onResize, 100));

export const SunburstChart = () =>
  `<div class='chart-container d-flex flex-column' id='sunburst-container'>
      <h4>Distribution of Jobs across companies and experience levels</h4>
      <svg id='sunburst-svg' width='100%' height='100%'>
      </svg>
  </div>`;

export function mountSunburstChart() {
  let sunburstContainer = document.querySelector("#sunburst-container");
  chartObserver.observe(sunburstContainer);
}

function initChart() {
  // const color = d3.scaleOrdinal(
  // d3.quantize(d3.interpolateRainbow, sunburstData.children.length + 1)
  // );

  const color = d3
    .scaleOrdinal()
    .domain(["US", "Rest of World"])
    .range(["#3978B6", "#BDD1EA"]);
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

  const root = partition(sunburstData);

  const svg = d3
    .select("#sunburst-svg")
    .attr("viewBox", `-${radius} -${radius} ${2 * radius} ${2 * radius}`)
    .style("font", "14px sans-serif");

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