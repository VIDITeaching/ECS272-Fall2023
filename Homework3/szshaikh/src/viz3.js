
import * as d3 from 'd3';
import Data from '../data/mentalH.json';

function createScatterPlot() {
    const filteredData = Data.filter(d => d["While working"] === "Yes" || d["While working"] === "No");

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

    // Define colors for "While working" values.
    const colorScale = d3.scaleOrdinal()
        .domain(["Yes", "No"])
        .range(["lightblue", "lightorange"]);

    // Create the container SVG.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // Create a group for the scatter plot.
    const scatter = svg.append("g");

    // Create a zoom behavior and attach it to the scatter plot.
    const zoom = d3.zoom()
        .scaleExtent([0.5, 4])  // Set the zoom extent
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event) {
        // Get the current transform state
        const transform = event.transform;
    
        // Update the x and y scales with the zoom transform.
        const new_x = transform.rescaleX(x);
        const new_y = transform.rescaleY(y);
    
        // Define the visible range of data points based on the current transform
        const xMin = new_x.domain()[0];
        const xMax = new_x.domain()[1];
        const yMin = new_y.domain()[0];
        const yMax = new_y.domain()[1];
    
        // Filter the data points within the visible range
        const visibleData = filteredData.filter(d => d.Age >= xMin && d.Age <= xMax && d.Depression >= yMin && d.Depression <= yMax);
    
        // Update the circles and axes with the new scales and visible data points
        scatter.selectAll("circle")
            .data(visibleData)
            .join("circle")
            .attr("cx", d => new_x(d.Age))
            .attr("cy", d => new_y(d.Depression))
            .attr("r", 3)
            .attr("fill", d => colorScale(d["While working"]));
    
        scatter.select(".x-axis").call(d3.axisBottom(new_x));
        scatter.select(".y-axis").call(d3.axisLeft(new_y));
    }
    

    // Add the axes.
    scatter.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x));

    scatter.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y));

    // Append circles for each data point with color based on "While working" value.
    scatter.append("g")
        .selectAll("circle")
        .data(filteredData)
        .join("circle")
        .attr("cx", d => x(d.Age))
        .attr("cy", d => y(d.Depression))
        .attr("r", 3)
        .attr("fill", d => colorScale(d["While working"]));

    // Add legend for "While working" values.
    // Add legend for "While working" values.
    const legend = svg.append("g")
        .attr("transform", `translate(${width - marginRight - 80},${marginTop})`);

    legend.selectAll("rect")
        .data(["Yes", "No"])
        .enter().append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20 + 50)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colorScale(d));

    legend.selectAll("text")
        .data(["Yes", "No"])
        .enter().append("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 12 + 50)
        .text(d => d);

    // Add titles to the legend.
    legend.append("text")
        .attr("x", -10)
        .attr("y", 40)
        .attr("font-weight", "bold")
        .text("While working");

    // Add chart title.
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", marginTop / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "1.1em")
        .style("font-weight", "bold")
        .text("Exploring the Relationship Between Age and Depression");

    // Add x-axis label.
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "1em")
        .text("Age");

    // Add y-axis label.
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
