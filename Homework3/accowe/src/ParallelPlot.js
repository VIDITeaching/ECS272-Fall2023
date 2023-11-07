import {useEffect, useState} from "react";
import * as d3 from "d3";
import {click} from "@testing-library/user-event/dist/click";

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
    const margin = {top: 30, right: 50, bottom: 10, left: 10},
        width = 1750,
        height = 400;

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
            .attr("viewBox", [-height/6, -40, 1.35 * width, 1.35 * height])
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

        function makePath(d) {
            // creates line's path from initial position on one axis to final position on the next axis
            return d3.line()(dimensions.map(function(p)
            {
                return [x(p), y[p](d[p])];
            }));
        }

        const path = svg
            .selectAll("myPath")
            .data(props.data)
            .enter()
            .append("path")
            .attr("class", "pplines") // 2 classes for each line: 'line' and the group name
            .attr("id", function (d) { return "ppl" + d.Type_1 } )
            .attr("d",  makePath)
            .style("fill", "none" )
            .style("stroke", function(d){ return(typeColors[d.Type_1])} )
            .style("opacity", 0.4)

        const axes = svg.selectAll("myAxis")
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
            .style("font-weight", "bold")
            .attr("y", -9)
            .text(function(d) { return d; })
            .style("fill", "black");

        const deselectedColor = "#e6e6e6";
        const brushWidth = 20;
        const brush = d3.brushY()
            .extent([[-brushWidth/2, 0], [brushWidth/2,height]])
            .on("start brush end",
                brushed);

        d3.selectAll(".axis").call(brush);

        const selections = new Map();
        function brushed({selection}, key) {
            if (selection === null) selections.delete(key);
            else selections.set(key, selection.map(y[key].invert));
            const selected = [];
            path.each(function(d) {
                const active = Array.from(selections).every(([key, [max,min]]) => d[key] >= min && d[key] <= max)
                d3.select(this).style("stroke", active ? typeColors[d.Type_1] : deselectedColor);
                if (active) {
                    d3.select(this).raise();
                    selected.push(d);
                    d3.selectAll(".axis").raise();
                }
            });
            d3.selectAll(".piePieces").attr("fill-opacity", 1)
            d3.selectAll(".pieText").attr("fill-opacity", 1)
            d3.selectAll(".polylines").attr("stroke-opacity", 1)
            d3.selectAll(".ribbons").attr("fill-opacity", 0.7).attr("stroke-opacity", 1)
            svg.property("value", selected).dispatch("input");
        }

        // Add chart title
        svg.append("text")
            .attr("x",125)
            .attr("y", -50)
            .attr("font-weight", "bold")
            .attr("font-size", 20)
            .text("Overview of Pokemon Type, Physical Characteristic, and Battle Stat Data");

    })

    // Return the svg chart
    return(
            <svg width={width} height={height} id={"parallel"} />
    )
}
export default ParallelPlot;