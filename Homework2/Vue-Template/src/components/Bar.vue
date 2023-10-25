<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/average_salary.json';
import { isEmpty, debounce } from 'lodash';

import { Bar1, ComponentSize, Margin } from '../types';

interface jobTitleBar extends Bar1 {
  job_title: string;
  color: string;
}

export default {
  data() {
    return {
      bars: [] as jobTitleBar[],
      size: { width: 10, height: 0 } as ComponentSize,
      margin: { left: 60, right: 10, top: 10, bottom: 60 } as Margin,
    };
  },
  computed: {
    rerender() {
      return !isEmpty(this.bars) && this.size;
    },
  },
  created() {
    console.log(Data);
    if (isEmpty(Data)) return;

    this.bars = Data.data.map((item) => ({
      job_title: item.job_title,
      job_title_average_salary: item.job_title_average_salary,
      color: getRandomColor(),
    }));
  },
  methods: {
    onResize() {
      let target = this.$refs.barContainer as HTMLElement;
      if (target === undefined) return;
      this.size = { width: target.clientWidth, height: target.clientHeight };
    },
    initChart() {
      let chartContainer = d3.select('#bar-svg');

      let yExtents = d3.extent(this.bars.map((d: jobTitleBar) => d.job_title_average_salary));
      let xCategories = this.bars.map((d: jobTitleBar) => d.job_title);

      let xScale = d3.scaleBand()
        .rangeRound([this.margin.left, this.size.width - this.margin.right])
        .domain(xCategories)
        .padding(0.2);

      let yScale = d3.scaleLinear()
        .range([this.size.height - this.margin.bottom, this.margin.top])
        .domain([0, yExtents[1]]);

      const xAxis = chartContainer.append('g')
        .attr('transform', `translate(0, ${this.size.height - this.margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('font-size', '12px')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

      const yAxis = chartContainer.append('g')
        .attr('transform', `translate(${this.margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

      const yLabel = chartContainer.append('g')
        .attr('transform', `translate(${10}, ${this.size.height / 2}) rotate(-90)`)
        .append('text')
        .text('Total Salary')
        .style('font-size', '.8rem');

      const xLabel = chartContainer.append('g')
        .attr('transform', `translate(${this.size.width / 2 - this.margin.left}, ${this.size.height - this.margin.top - 5})`)
        .append('text')
        .text('Job Title')
        .style('font-size', '.8rem');

      const bars = chartContainer.append('g')
        .selectAll('rect')
        .data<jobTitleBar>(this.bars)
        .join('rect')
        .attr('x', (d: jobTitleBar) => xScale(d.job_title))
        .attr('y', (d: jobTitleBar) => yScale(d.job_title_average_salary))
        .attr('width', xScale.bandwidth())
        .attr('height', (d: jobTitleBar) => Math.abs(yScale(0) - yScale(d.job_title_average_salary)))
        .attr('fill', (d: jobTitleBar) => d.color);

      const title = chartContainer.append('g')
        .append('text')
        .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - this.margin.top + 5})`)
        .attr('dy', '0.5rem')
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text('Bar Chart about Total Salary');
    },
  },
  watch: {
    rerender(newSize) {
      if (!isEmpty(newSize)) {
        d3.select('#bar-svg').selectAll('*').remove();
        this.initChart();
      }
    },
  },
  mounted() {
    window.addEventListener('resize', debounce(this.onResize, 100));
    this.onResize();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
};

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
</script>

<template>
  <div class="chart-container d-flex" ref="barContainer">
    <div class="scroll-container">
      <svg id="bar-svg" :width="size.width" :height="size.height" :style="{ overflowX: 'auto' }">
      </svg>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  height: 100%;
}

.scroll-container {
  overflow-x: auto;
}
</style>
