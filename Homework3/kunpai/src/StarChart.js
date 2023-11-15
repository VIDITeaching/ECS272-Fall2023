import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';
import { readCSV } from './CSV-Reader';
import { updateCharts } from './globals';

var size = { width: 0, height: 0 }

var selectedType = null;

// data should be of the form [ Grass: {HP: 100, Attack: 100, Defense: 100, Sp_Atk: 100, Sp_Def: 100, Catch_Rate: 100, Speed: 100, count: 100}, ...]
const preprocess = function preprocessData(data) {
    const typeStats = {};

    for (const entry of data) {
        const types = [entry.Type_1, entry.Type_2];

        for (const type of types) {
            if (type) {
                if (!typeStats[type]) {
                    typeStats[type] = {
                        HP: parseInt(entry.HP),
                        Attack: parseInt(entry.Attack),
                        Defense: parseInt(entry.Defense),
                        Sp_Atk: parseInt(entry.Sp_Atk),
                        Sp_Def: parseInt(entry.Sp_Def),
                        Catch_Rate: parseInt(entry.Catch_Rate),
                        Speed: parseInt(entry.Speed),
                        count: 1,
                    };
                } else {
                    typeStats[type].HP += parseInt(entry.HP);
                    typeStats[type].Attack += parseInt(entry.Attack);
                    typeStats[type].Defense += parseInt(entry.Defense);
                    typeStats[type].Sp_Atk += parseInt(entry.Sp_Atk);
                    typeStats[type].Sp_Def += parseInt(entry.Sp_Def);
                    typeStats[type].Catch_Rate += parseInt(entry.Catch_Rate);
                    typeStats[type].Speed += parseInt(entry.Speed);
                    typeStats[type].count += 1;
                }
            }
        }
    }

    for (const type in typeStats) {
        // rounding stats up to a whole number just for ease of presentation
        typeStats[type].HP = Math.round(typeStats[type].HP / typeStats[type].count);
        typeStats[type].Attack = Math.round(typeStats[type].Attack / typeStats[type].count);
        typeStats[type].Defense = Math.round(typeStats[type].Defense / typeStats[type].count);
        typeStats[type].Sp_Atk = Math.round(typeStats[type].Sp_Atk / typeStats[type].count);
        typeStats[type].Sp_Def = Math.round(typeStats[type].Sp_Def / typeStats[type].count);
        typeStats[type].Catch_Rate = Math.round(typeStats[type].Catch_Rate / typeStats[type].count);
        typeStats[type].Speed = Math.round(typeStats[type].Speed / typeStats[type].count);
    }

    return typeStats;
}

const data = await readCSV();
const postData = preprocess(data);

const onResize = (targets) => {
    targets.forEach(target => {
        if (target.target.getAttribute('id') !== 'star-container') return;
        size = { width: target.contentRect.width, height: target.contentRect.height }
        if (!isEmpty(size) && !isEmpty(data)) {
            d3.select('#star-svg').selectAll('*').remove()
            createStarChart(postData)
        }
    })
}

const chartObserver = new ResizeObserver(debounce(onResize, 100))

export const StarChart = () => (
    `<div class='star-container d-flex' id='star-container'>
        <svg id='star-svg' width='100%' height='100%'>
        </svg>
    </div>`
)

export function mountStarChart() {
    let starChartContainer = document.querySelector('#star-container')
    chartObserver.observe(starChartContainer)
}

let rectangle;

function createStarChart(data, selectedType) {
    d3.select('#star-svg').selectAll('*').remove()
    var svgWidth = size.width;
    var svgHeight = size.height;
    var svg = d3.select("#star-svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    var centerX = svgWidth / 2 - 75;
    var centerY = svgHeight / 2;
    centerX = Math.round(centerX * 10) / 10;
    centerY = Math.round(centerY * 10) / 10;

    var circleRadius = Math.min(svgWidth, svgHeight) / 3.75;

    var elements = Object.keys(data[Object.keys(data)[0]]);
    var numElements = elements.length;
    var angleOffset = (2 * Math.PI) / numElements;

    var colors = [
        "rgba(0, 128, 0, 0.3)",
        "rgba(255, 0, 0, 0.3)",
        "rgba(0, 0, 255, 0.3)",
        "rgba(255, 255, 0, 0.3)",
        "rgba(0, 255, 255, 0.3)",
        "rgba(255, 0, 255, 0.3)",
        "rgba(192, 192, 192, 0.3)",
        "rgba(128, 128, 0, 0.3)",
        "rgba(128, 0, 128, 0.3)",
        "rgba(0, 128, 128, 0.3)",
        "rgba(128, 128, 128, 0.3)",
        "rgba(255, 165, 0, 0.3)",
        "rgba(255, 192, 203, 0.3)",
        "rgba(255, 228, 225, 0.3)",
        "rgba(255, 255, 224, 0.3)",
        "rgba(51, 161, 201, 0.3)",
        "rgba(0, 138, 184, 0.3)",
        "rgba(0, 110, 145, 0.3)",
        "rgba(0, 82, 109, 0.3)",
        "rgba(0, 55, 73, 0.3)"
    ];

    svg.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", circleRadius)
        .attr("stroke", "black")
        .attr("fill", "none");

    for (var i = 0; i < numElements; i++) {
        var angle = i * angleOffset;
        var x1 = centerX;
        var y1 = centerY;
        var x2 = centerX + circleRadius * Math.cos(angle);
        var y2 = centerY + circleRadius * Math.sin(angle);
        x2 = Math.round(x2 * 10) / 10;
        y2 = Math.round(y2 * 10) / 10;

        svg.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "gray");

        svg.append("text")
            .attr("x", x2)
            .attr("y", y2)
            .attr("dx", x2 == centerX ? 20 : (x2 > centerX ? 10 : -10))
            .attr("dy", y2 == centerY ? 10 : (y2 < centerY ? -10 : 20))
            .text(function () {
                return elements[i].split("_").map(function (word) {
                    return word.charAt(0).toUpperCase() + word.slice(1);
                }).join(" ");
            })
            .attr("text-anchor", x2 > centerX ? "start" : "end")
            .attr("alignment-baseline", "middle")
            .attr("fill", "black");

    }

    var colorIndex = 0;

    rectangle = svg.append("rect")
        .attr("x", 0)
        .attr("y", 40)
        .attr("width", 170)
        .attr("height", 120)
        .attr("fill", "transparent")
        .attr("stroke", "transparent")
        .attr("rx", 10)
    var keyText = svg.append("text")
        .attr("x", 100)
        .attr("y", 40)
        .text("")
        .attr("text-anchor", "end")
        .attr("font-size", "10px");



    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            var elementData = data[key];
            console.log(elementData);
            var elementValues = Object.values(elementData);
            console.log(elementValues);

            var numElements = elementValues.length;
            var angleOffset = (2 * Math.PI) / numElements;

            var labelRadius = circleRadius + 26;
            var elementPositions = [];

            for (var i = 0; i < numElements; i++) {
                var angle = i * angleOffset;
                var x = centerX + labelRadius * Math.cos(angle);
                var y = centerY + labelRadius * Math.sin(angle);
                elementPositions.push({ x: x, y: y });
            }

            var polygonVertices = elementPositions.map(function (pos, i) {
                var scaledValue = 1 + (elementValues[i] / 100) * 100;
                return [
                    centerX + (circleRadius * scaledValue / 130) * Math.cos(i * angleOffset),
                    centerY + (circleRadius * scaledValue / 130) * Math.sin(i * angleOffset)
                ];
            });

            polygonVertices.push(polygonVertices[0]);

            var color = colors[colorIndex % colors.length];
            colorIndex++;

            svg.append("path")
                .datum(polygonVertices)
                .attr("d", d3.line())
                .attr("fill", color)
                .attr("stroke", color)
                .attr("class", "polygon")
                .attr("data-key", key);
        }
    }

    var legendX = svgWidth - 150;
    var legendY = 50;
    var legendSpacing = 25;

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + legendX + "," + legendY + ")");

    var legendLabels = legend.selectAll(".legend-label")
        .data(Object.keys(data))
        .enter().append("g")
        .attr("class", "legend-label")
        .attr("data-key", function (d) {
            return d;
        })
        .attr("transform", function (d, i) {
            return "translate(0," + i * legendSpacing + ")";
        });

    legendLabels.append("rect")
        .attr("x", 0)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", function (d, i) {
            return colors[i % colors.length];
        });

    legendLabels.append("text")
        .attr("x", 30)
        .attr("y", 10)
        .attr("dy", "0.35em")
        .text(function (d) {
            return d;
        })
        .attr("fill", "black");

    svg.append("text")
        .attr("x", svgWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text("Stat Spread Per Pokémon Type");

    addListener(svg, data, keyText, ".polygon");
    addListener(svg, data, keyText, ".legend-label");
}

let selectedPolygon = null;

function addListener(svg, data, keyText, className) {
    svg.selectAll(className)
        .on("mouseover", function (event, d) {
            if (selectedType) return;
            rectangle.attr("stroke", "black");
            var key = d3.select(this).attr("data-key");
            updateCharts(key, false);

            var polygon = svg.selectAll(".polygon[data-key='" + key + "']");
            svg.selectAll(".polygon:not([data-key='" + key + "'])")
            .style("display", "none");
            selectedPolygon = polygon.clone(true);
            selectedPolygon.attr("stroke", "black");
            selectedPolygon.attr("pointer-events", "none");
            svg.node().appendChild(selectedPolygon.node());

            var pokemonType = "Pokémon Type: " + key;
            var hp = "Avg. HP: " + data[key]["HP"];
            var speed = "Avg. Speed: " + data[key]["Speed"];
            var count = "Count: " + data[key]["count"];
            var spDef = "Avg. Sp. Defense: " + data[key]["Sp_Def"];
            var spAtk = "Avg. Sp. Attack: " + data[key]["Sp_Atk"];
            var attack = "Avg. Attack: " + data[key]["Attack"];
            var defense = "Avg. Defense: " + data[key]["Defense"];
            var catchRate = "Avg. Catch Rate: " + data[key]["Catch_Rate"];

            keyText.text("");

            keyText.append("tspan").text(pokemonType);
            keyText.append("tspan").text(hp);
            keyText.append("tspan").text(attack);
            keyText.append("tspan").text(defense);
            keyText.append("tspan").text(spAtk);
            keyText.append("tspan").text(spDef);
            keyText.append("tspan").text(speed);
            keyText.append("tspan").text(catchRate);
            keyText.append("tspan").text(count);

            keyText.selectAll("tspan")
                .attr("x", 160)
                .attr("dy", "1.2em");

        })
        .on("mouseout", function () {
            if (selectedType) return;
            rectangle.attr("stroke", "transparent");
            svg.selectAll(".polygon")
            .style("display", "block");
            keyText.text("");
            selectedPolygon.remove();
            selectedPolygon = null;
        })
        .on("click", function () {
            var key = d3.select(this).attr("data-key");
            if (selectedType === null) {
                selectedType = key;
                selectedPolygon.attr("stroke", "red");
                updateCharts(key, true);
            } else if (selectedType !== key) {
                selectedType = key;
                selectedPolygon.remove();
                selectedPolygon = svg.selectAll(".polygon[data-key='" + key + "']").clone(true);
                selectedPolygon.attr("stroke", "red");
                selectedPolygon.attr("pointer-events", "none");
                svg.node().appendChild(selectedPolygon.node());
                updateCharts(key, true);
            } else {
                selectedType = null;
                selectedPolygon.attr("stroke", "black");
                updateCharts(null, true);
            }
        });
}

export function updateStarChart(selectedType) {
    createStarChart(postData, selectedType);
}