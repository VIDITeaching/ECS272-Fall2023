import * as d3 from 'd3';
import Data from '../data/mentalH.json';

function createScatterPlot(){
 const filteredData = Data;   
 // Specify the chart’s dimensions.
 const width = 640;
 const height = 400;
 const marginTop = 25;
 const marginRight = 20;
 const marginBottom = 35;
 const marginLeft = 40;

 // Define the horizontal scale.
 const x = d3.scaleLinear()
     .domain(d3.extent(filteredData, d => d.Age)).nice()
     .range([marginLeft, width - marginRight]);

 // Define the vertical scale.
 const y = d3.scaleLinear()
     .domain(d3.extent(filteredData, d => d.Depression)).nice()
     .range([height - marginBottom, marginTop]);

 // Create the container SVG.
 const svg = d3.create("svg")
     .attr("width", width)
     .attr("height", height)
     .attr("viewBox", [0, 0, width, height])
     .attr("style", "max-width: 100%; height: auto;");

 // Add the axes.
 svg.append("g")
     .attr("transform", `translate(0,${height - marginBottom})`)
     .call(d3.axisBottom(x))
     

 svg.append("g")
     .attr("transform", `translate(${marginLeft},0)`)
     .call(d3.axisLeft(y));

 // Append a circle for each data point.
 svg.append("g")
   .selectAll("circle")
   .data(filteredData)
   .join("circle")
     .filter(d => d.Depression)
     .attr("cx", d => x(d.Age))
     .attr("cy", d => y(d.Depression))
     .attr("r", 3);


     svg.append("text")
     .attr("x", width / 2)
     .attr("y", marginTop / 2)
     .attr("text-anchor", "middle")
     .style("font-size", "1.1em")
     .style("font-weight", "bold")
     .text("Exploring the Relationship Between Age and Depression");

     svg.append("text")
     .attr("x", width / 2)
     .attr("y", height - 5)
     .attr("text-anchor", "middle")
     .style("font-size", "1em")
     .text("Age");

  // Add y-axis label
  svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("x", 0 - height / 2)
     .attr("y", 15)
     .attr("text-anchor", "middle")
     .style("font-size", "1em")
     .text("Depression");
     
     return svg.node();
}

export default createScatterPlot;