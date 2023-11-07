import {useEffect, useState} from "react";
import * as d3 from "d3";
import './ChordDiagram.css';

function processData(data){
    // Sort data by primary type (Type_1) X and track the number of pokemon with secondary type (Type_2) Y for each of the 18 types.
    // This will result in 18 x 18 data matrix with [i,j] corresponding to [Type_1_index, Type_2_index]
    // Color is included for future reference when constructing chart

    // Note: I re-ordered the object order, hence the weird index ordering. I wanted to order the chord diagram
    // path elements in the same order as the donut chart but could not figure out how to do so automatically.

    const types = {
        Flying: {index:4, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#A98FF3"},
        Fairy: {index:17, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#D685AD"},
        Steel: {index:14, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#B7B7CE"},
        Ice: {index:11, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#96D9D6"},
        Ghost: {index:13, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#735797"},
        Dragon: {index:15, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#6F35FC"},
        Fighting: {index:5, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#C22E28"},
        Poison: {index:6, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#A33EA1"},
        Dark: {index:16, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#705746"},
        Ground: {index:8, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#E2BF65"},
        Electric: {index:7, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#F7D02C"},
        Rock: {index:9, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#B6A136"},
        Fire: {index:1, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#EE8130"},
        Psychic: {index:10, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#F95587"},
        Bug: {index:12, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#A6B91A"},
        Grass: {index:3, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#7AC74C"},
        Normal: {index:0, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#A8A77A"},
        Water: {index:2, noPokemon:0, noPokePerType: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], color:"#6390F0"},
    }

    let count = 0
    // Sort data by primary type (Type_1) and track the number of pokemon for each.
    // If select pokemon d has second type, i.e. Type_2 is non-empty string, then increment value at array index
    // coresponding to that type
    data.forEach(d => {
        if (d.Type_2.length > 0) count++
        switch (d.Type_1) {
            case "Normal":
                types.Normal.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Normal.noPokePerType[types[d.Type_2].index] += 1
                //else types.Normal.noPokePerType[0] += 1
                break
            case "Fire":
                types.Fire.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Fire.noPokePerType[types[d.Type_2].index] += 1
                //else types.Fire.noPokePerType[1] += 1
                break
            case "Water":
                types.Water.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Water.noPokePerType[types[d.Type_2].index] += 1
                //else types.Water.noPokePerType[2] += 1
                break
            case "Grass":
                types.Grass.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Grass.noPokePerType[types[d.Type_2].index] += 1
                //else types.Grass.noPokePerType[3] += 1
                break
            case "Flying":
                types.Flying.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Flying.noPokePerType[types[d.Type_2].index] += 1
                //else types.Flying.noPokePerType[4] += 1
                break
            case "Fighting":
                types.Fighting.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Fighting.noPokePerType[types[d.Type_2].index] += 1
                //else types.Fighting.noPokePerType[5] += 1
                break
            case "Poison":
                types.Poison.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Poison.noPokePerType[types[d.Type_2].index] += 1
                //else types.Poison.noPokePerType[6] += 1
                break
            case "Electric":
                types.Electric.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Electric.noPokePerType[types[d.Type_2].index] += 1
                //else types.Electric.noPokePerType[7] += 1
                break
            case "Ground":
                types.Ground.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Ground.noPokePerType[types[d.Type_2].index] += 1
                //else types.Ground.noPokePerType[8] += 1
                break
            case "Rock":
                types.Rock.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Rock.noPokePerType[types[d.Type_2].index] += 1
                //else types.Rock.noPokePerType[9] += 1
                break
            case "Psychic":
                types.Psychic.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Psychic.noPokePerType[types[d.Type_2].index] += 1
                //else types.Psychic.noPokePerType[10] += 1
                break
            case "Ice":
                types.Ice.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Ice.noPokePerType[types[d.Type_2].index] += 1
                //else types.Ice.noPokePerType[11] += 1
                break
            case "Bug":
                types.Bug.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Bug.noPokePerType[types[d.Type_2].index] += 1
                //else types.Bug.noPokePerType[12] += 1
                break
            case "Ghost":
                types.Ghost.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Ghost.noPokePerType[types[d.Type_2].index] += 1
                //else types.Ghost.noPokePerType[13] += 1
                break
            case "Steel":
                types.Steel.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Steel.noPokePerType[types[d.Type_2].index] += 1
                //else types.Steel.noPokePerType[14] += 1
                break
            case "Dragon":
                types.Dragon.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Dragon.noPokePerType[types[d.Type_2].index] += 1
                else types.Dragon.noPokePerType[15] += 1
                break
            case "Dark":
                types.Dark.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Dark.noPokePerType[types[d.Type_2].index] += 1
                //else types.Dark.noPokePerType[16] += 1
                break
            case "Fairy":
                types.Fairy.noPokemon += 1
                if (d.Type_2.length > 0)
                    types.Fairy.noPokePerType[types[d.Type_2].index] += 1
                //else types.Fairy.noPokePerType[17] += 1
                break
        }
    })

    // Return two arrays with our data to be used for our chart
    // typeData will be the comprehensive data from above as an array
    // matData will be the matrix corresponding to the from-to values for the chord diagram
    const typeData = []
    const matData = []
    Object.keys(types).forEach(t => {
        types[t].name = t;
        typeData.push(types[t]);
        matData.push(types[t].noPokePerType)
    });

    return [typeData, matData, count]

}

function ChordDiagram(props){
    // Creates and returns the chord diagram SVG to be displayed
    const [selectType, setSelectType] = useState("none")

    // process data
    let processedData = processData(props.data)
    const matrixData = processedData[1]
    console.log(processedData[2])
    processedData = processedData[0]

    // Set up dimensional constants for svg
    const width = 400, height = 400, margin = 40;
    const outerRadius = Math.min(width, height) * 0.5 - 30;
    const innerRadius = outerRadius - 20;


    // Create chord diagram SVG within useEffect
    useEffect(() => {
        function groupTicks(d, step) {
            // Establishes tick positioning and valuation for the chord diagram
            const k = (d.endAngle - d.startAngle) / d.value;
            return d3.range(0, d.value, step).map(value => {
                return {value: value, angle: value * k + d.startAngle};
            });
        }

        // Some more tick formatting constants
        const sum = d3.sum(matrixData.flat());
        const tickStep = d3.tickStep(0, sum, 100);
        const tickStepMajor = d3.tickStep(0, sum, 20);
        const formatValue = d3.formatPrefix(",.0", tickStep);

        // Chord diagram's ribbon group setup
        const chord = d3.chord()
            .padAngle(2 / innerRadius)
            .sortSubgroups(d3.descending);

        // Chord diagram's arc dimensions
        const arc = d3.arc()
            .outerRadius(outerRadius)
            .innerRadius(innerRadius)

        // The ribbons that connect two arc-sections of the chord diagram
        const ribbon = d3.ribbon()
            .radius(innerRadius);

        function handleClick(type){
            props.resetCharts()
            d3.selectAll(".ribbons").transition().duration(350).attr("fill-opacity", 0.07).attr("stroke-opacity", 0)
            d3.selectAll(".ribbons").filter("#r" + type).transition().duration(350).attr("fill-opacity", 0.7).attr("stroke-opacity", 1)
        }

        function handleDblClick(){
            props.resetCharts()
            d3.selectAll(".ribbons").transition().duration(350).attr("fill-opacity", 0.7).attr("stroke-opacity", 1)
        }

        // Set up the SVG display
        // Link d3 svg instance with the svg element whose id is "chord"
        let svg = d3.select('#chord')
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2 - 20, -height / 2 - 20 , width * 1.1, height * 1.1])
            .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
            .attr("transform",
                "translate(" + margin + "," + margin + ")");

        // Set up instance of chords with matrix data
        const chords = chord(matrixData)

        // Append chord grouping to svg
        const group = svg.append("g")
            .selectAll()
            .data(chords.groups)
            .join("g");

        // Construct the arc segments + circle for chord diagram
        group.append("path")
            .attr("id", d => "c" + processedData[d.index].name)
            .attr("fill", d => processedData[d.index].color)
            .attr("d", arc)
            .on("click", function(event) {
                let type = event.target.id.substring(1)
                handleClick(type)
            })
            .on("dblclick", function(event) {
                handleDblClick()
            })
            .append("title")
            .text(d => `${d.value.toLocaleString("en-US")} ${processedData[d.index].name}`);

        // Append ticks to circle
        const groupTick = group.append("g")
            .selectAll()
            .data(d => groupTicks(d, tickStep))
            .join("g")
            .attr("transform", d => `rotate(${d.angle * 180 / Math.PI - 90}) translate(${outerRadius},0)`);

        // Draw out tick lines
        groupTick.append("line")
            .attr("stroke", "currentColor")
            .attr("x2", 6);

        // Add numerical text to major ticks (i.e. ticks denoting numbers at every instance of 20)
        groupTick
            .filter(d => d.value % tickStepMajor === 0)
            .append("text")
            .attr("x", 8)
            .attr("dy", ".35em")
            .attr("transform", d => d.angle > Math.PI ? "rotate(180) translate(-16)" : null)
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .text(d => formatValue(d.value));

        // Add arc-section titles to denote types and their direction
        group.select("text")
            .attr("font-weight", "bold")
            .text(function(d) {
                return this.getAttribute("text-anchor") === "end"
                    ? `↑ ${processedData[d.index].name}`
                    : `${processedData[d.index].name} ↓`;
            });

        // Add the ribbons to the chord diagram
        svg.append("g")
            .selectAll()
            .data(chords)
            .join(
                enter => enter.append("path")
                    .attr("class", "ribbons")
                    .attr("id", d => "r" + processedData[d.source.index].name)
                    .attr("d", ribbon)
                    .attr("fill", d => processedData[d.source.index].color)
                    .attr("fill-opacity",0.7)
                    .attr("stroke", d => processedData[d.source.index].color)
            )
            .on("click", function(event) {
                let type = event.target.id.substring(1)
                handleClick(type)
            })
            .on("dblclick", function(event) {
                handleDblClick()
            })
            .append("title")
            .text(d =>
                `${d.source.value.toLocaleString("en-US")} 
                ${processedData[d.source.index].name} → ${processedData[d.target.index].name}
                ${d.source.index !== d.target.index ? `\n${d.target.value.toLocaleString("en-US")} ${processedData[d.target.index].name} → ${processedData[d.source.index].name}` : ``}`);

        // Add title text
        svg.append("text")
            .attr("x", -(width * 0.55))
            .attr("y", -(height * 0.5))
            .attr("font-weight", "bold")
            .attr("font-size", 15)
            .text("No. Pokemon of Type X");

        svg.append("text")
            .attr("x", -(width * 0.55))
            .attr("y", -(height * 0.45))
            .attr("font-weight", "bold")
            .attr("font-size", 15)
            .text("w/ Type Y");



    })

    // Return the svg chart
    return(
            <svg width={width} height={height} id={"chord"} />
    )

}

export default ChordDiagram;
