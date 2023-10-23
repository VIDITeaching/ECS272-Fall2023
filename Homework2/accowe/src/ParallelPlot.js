import {useEffect, useState} from "react";
import * as d3 from "d3";

function processData(data){
    // Organize data values in arrays that can directly be used to construct parallel plot axis

    let pData = {
        Height_m: [],
        Weight_kg: [],
        HP: [],
        Attack: [],
        Defense: [],
        Sp_Atk: [],
        Sp_Def: [],
        Speed: [],
        Total: [],
    }

    // Push numerical value into corresponding variable array
    data.forEach(d => {
        pData.Height_m.push(d.Height_m)
        pData.Weight_kg.push(d.Weight_kg)
        pData.HP.push(d.HP)
        pData.Attack.push(d.Attack)
        pData.Defense.push(d.Defense)
        pData.Sp_Atk.push(d.Sp_Atk)
        pData.Sp_Def.push(d.Sp_Def)
        pData.Speed.push(d.Speed)
        pData.Total.push(d.Total)
    })

    return pData
}
function ParallelPlot(props){
    // process data for parallel plot
    const processedData = processData(props.data)

    // Set up dimensional constants for svg
    const margin = {top: 30, right: 50, bottom: 10, left: 50},
        width = 1500,
        height = 759;

    // Set up type colors for colored lines based on type
    const typeColors = {
        Normal: "#A8A77A",
        Fire: "#EE8130",
        Water: "#6390F0",
        Grass: "#7AC74C",
        Flying: "#A98FF3",
        Fighting: "#C22E28",
        Poison: "#A33EA1",
        Electric: "#F7D02C",
        Ground: "#E2BF65",
        Rock: "#B6A136",
        Psychic: "#F95587",
        Ice: "#96D9D6",
        Bug: "#A6B91A",
        Ghost: "#735797",
        Steel: "#B7B7CE",
        Dragon: "#6F35FC",
        Dark: "#705746",
        Fairy: "#D685AD",
    }

    // Set up domain names for parallel plot
    const dimensions = ["Height_m", "Weight_kg", "HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed", "Total"]

    // Create parallel plot SVG within useEffect
    useEffect(() => {

        // Set up the SVG display
        // Link d3 svg instance with the svg element whose id is "parallel"
        let svg = d3.select("#parallel")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("viewBox", [-height/6, -40, 1.25 * width, 1.25 * height])
            .attr("style", "max-width: 100%; height: auto;")
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Builds the Y scale; It will find the best position for each Y axis
        let y = {}
        for (let i in dimensions) {
            let name = dimensions[i]
            y[name] = d3.scaleLinear()
                .domain([Math.min(...processedData[name]), Math.max(...processedData[name])])
                .range([height, 0])
        }

        // Builds the X scale; It find the best position for each Y axis
        let x = d3.scalePoint()
            .range([0, width])
            .padding(1)
            .domain(dimensions);

        function path(d) {
            // creates line's path from initial position on one axis to final position on the next axis
            return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
        }

        svg
            .selectAll("myPath")
            .data(props.data)
            .enter()
            .append("path")
            .attr("class", function (d) { return "line " + d.Species } ) // 2 classes for each line: 'line' and the group name
            .attr("d",  path)
            .style("fill", "none" )
            .style("stroke", function(d){ return(typeColors[d.Type_1])} )
            .style("opacity", 0.2)

        svg.selectAll("myAxis")
            // For each dimension of the dataset, add a 'g' element:
            .data(dimensions).enter()
            .append("g")
            .attr("class", "axis")
            // Translate this element to its right position on the x axis
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
            // Build the axis with the call function
            .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
            // Add axis title
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d; })
            .style("fill", "black")

        // Add chart title
        svg.append("text")
            .attr("x", 50)
            .attr("y", -50)
            .attr("font-weight", "bold")
            .attr("font-size", 20)
            .text("Parallel Plot for Pokemon Physical Characteristic and Stat Data");


    })

    // Return the svg chart
    return(
            <svg width={width} height={height} id={"parallel"} />
    )
}
export default ParallelPlot;