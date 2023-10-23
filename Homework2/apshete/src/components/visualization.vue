<template>
  <div>
    <h2>Data Visualization</h2>
    <div ref="sankey"></div> <!-- container for Sankey diagram -->
  </div>
</template>

<script lang = "ts">
import * as d3 from "d3";
import axios from 'axios';
import { isEmpty, debounce, result } from 'lodash';
import Feature from "./Feature.vue";
import * as d3Sankey from "d3-sankey";
import { sankey, sankeyLinkHorizontal , SankeyGraph,SankeyNodeMinimal, SankeyLinkMinimal} from 'd3-sankey';
import { SankeyData, ComponentSize2, Margin2, Link, Node, RawLink } from '../types';
import 'core-js/features/array/flat-map';

interface SankeyNode {
  name: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export default {
  data(){
    return {
      sankeyData: {
            nodes: [],
            links: []
    } as SankeyData, 
    size: { width: 2000, height: 800 } as ComponentSize2,
    margin: { left: 120, right: 60, top: 40, bottom: 60 } as Margin2,
  }
  }, 
  computed: {
        // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
        rerender() {
            return (!isEmpty(this.sankeyData)) && this.size
        }
    },

  created(){
    this.loadDataAndConvert();
    this.createSankeydiagram();
  },
  methods: {
    convertToSankeyFormat(data1: RawLink[]) {
      let nodes: Node[] = [];
      // Extract unique nodes from sources and targets.
      data1.forEach(d => {
    if (!nodes.some(node => node.name === d.source)) {
        nodes.push({ name: d.source });
    }
    if (!nodes.some(node => node.name === d.target)) {
        nodes.push({ name: d.target });
    }
});
      // // Convert nodes into objects and add index property.
      // nodes = nodes.map((node, index) => ({ name: node.name}));
    // Convert links to use index-based source and target.
    const links = data1.map(d => {
        return {
            // source: nodes.findIndex(node => node.name === d.source),
            // target: nodes.findIndex(node => node.name === d.target),
            // value: +d.value  // Convert the value to a number, if it's not already
            source: d.source,
            target: d.target,
            value: +d.value // Convert the value to a number, if it's not already
        };
    });
    return {
        nodes: nodes,
        links: links
    };
},
loadDataAndConvert() {
      d3.csv('../../data/ds_salaries.csv').then(data => {
        console.log(data);
        if (!isEmpty(data)) {
          let result = data.map(d => ({
          source: d.experience_level || '',
          target: d.job_title|| '',
          value: Number(d.salary_in_usd) || 0,
}));
      console.log(result, "data2");
      console.log(Array.isArray(result), "Is result an array?");

        let topTenSalaries = result.sort((a, b) => b.value - a.value).slice(0, 10);
        //console.log(topTenSalaries, "top10salaries");

        let topTenJobTitles = topTenSalaries.map(job => job.target);
        //console.log(topTenJobTitles);

        this.sankeyData.links= topTenSalaries;
        this.sankeyData.nodes = topTenSalaries.map(salary => ({ name: salary.source }));

        console.log(this.sankeyData, "SANKEY!!");


      // const convertedData = this.convertToSankeyFormat(result);  // use 'this' to call methods
      // console.log(convertedData, "Sankey format data");
      // // If you want to set it to Vue data:
      // this.sankeyData = convertedData;
      

      // // 1. Sort the links based on the 'value' property in descending order
      // const sortedLinks = [...this.sankeyData.links].sort((a, b) => b.value - a.value);
      // // 2. Get the top 10 links
      // const top10Links = sortedLinks.slice(0, 10);
      // console.log(top10Links, "top10links");

      // // Step 1: Create a Set to store unique node names
      // const uniqueNodeNames = new Set();

      // // Step 2: Iterate through the top 10 links and add node names to the Set
      // top10Links.forEach(link => {
      //   uniqueNodeNames.add(link.source);
      //   uniqueNodeNames.add(link.target);
      // });

      // Step 3: Filter nodes that are present in the Set
      // const top10Nodes = this.sankeyData.nodes.filter(node => uniqueNodeNames.has(node.name));
      // console.log(top10Nodes);

      // // Create a new 'sankeyData' object
      // const newSankeyData = {
      // nodes: top10Nodes,
      // links: top10Links,
      // };

      // this.sankeyData= newSankeyData;
      // console.log(this.sankeyData, "new sankey data");
      // console.log(this.sankeyData.nodes, "nodes");
      // console.log(this.sankeyData.links, "links");
      }
    });
  },
  createSankeydiagram(){
    const svgContainer = this.$refs.sankey as HTMLElement; // use a Vue ref to get the container element
    d3.select(svgContainer).selectAll("*").remove(); // Clear any existing SVG content
    const width = this.size.width - this.margin.left - this.margin.right;
    const height = this.size.height - this.margin.top - this.margin.bottom;
    const svg = d3.select(svgContainer)
        .append('svg')
        .attr('width', this.size.width)
        .attr('height', this.size.height)
        .append('g')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // Create a Sankey layout
    const sankeylayout = sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 1], [width - 1, height - 6]]);

        const nodeMap = new Map(this.sankeyData.nodes.map((node, index) => [node.name, index]));
        const links = this.sankeyData.links.map(link => ({
          source: nodeMap.get(link.source),
          target: nodeMap.get(link.target),
          value: link.value
        }));

        const sankeyInput = {
          nodes: this.sankeyData.nodes,
          links
        };

      console.log(sankeyInput, "sankey Input");
    
  }
}
}

</script>
