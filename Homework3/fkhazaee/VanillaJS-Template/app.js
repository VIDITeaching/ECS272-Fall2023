async function loadCSV() {
    let data = await d3.csv("ds_salaries.csv");

    const margin = { top: 40, right: 230, bottom: 90, left: 80 },
        totalWidth = 1560,
        width = totalWidth / 2 - margin.left - margin.right,
        height = 310 - margin.top - margin.bottom;

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
    const lineChartMargin = { top: 30, right: 230, bottom: 200, left: 80 };
    const parallelCoordinateMargin = { top: 30, right: 90, bottom: 200, left: 90 };

    const svg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const overviewPieChartSvg = d3.select("#overview-pie-chart svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const detailedPieChartSvg = d3.select("#detailed-pie-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const lineSvg = d3.select("#line-chart")
        .append("svg")
        .attr("width", width + lineChartMargin.left + lineChartMargin.right)
        .attr("height", height + lineChartMargin.top + lineChartMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + lineChartMargin.left + "," + lineChartMargin.top + ")");
    const parallelCoordinateContainer = d3.select("#parallel-coordinate-plot")
        .append("svg")
        .attr("width", width + parallelCoordinateMargin.left + parallelCoordinateMargin.right)
        .attr("height", 300 + parallelCoordinateMargin.top + parallelCoordinateMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + parallelCoordinateMargin.left + "," + parallelCoordinateMargin.top + ")");


    function drawBarChart(category) {
        // Clear the SVG
        svg.selectAll('*').remove();

        if (category === "job_title") {
            const threshold = 40;
            const titleCounts = d3.rollup(data, v => v.length, d => d.job_title);
            data = data.map(row => {
                if (titleCounts.get(row.job_title) < threshold) {
                    return { ...row, job_title: "Other" };
                }
                return row;
            });
        }

        const aggregatedData = d3.rollup(data, v => d3.mean(v, d => d.salary_in_usd), d => d[category]);

        const x = d3.scaleBand()
            .domain([...aggregatedData.keys()])
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(aggregatedData.values())])
            .range([height, 0]);

        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on('zoom', zoomed);

        function zoomed(event) {
            x.range([0, width].map(d => event.transform.applyX(d)));
            svg.selectAll("rect")
                .attr("x", d => x(d[0]))
                .attr("width", x.bandwidth());
            svg.select(".x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end")
                .style("font-size", "8px");
            svg.select(".y")
                .attr("transform", "translate(" + event.transform.x + ",0)")
                .call(d3.axisLeft(y));
        }

        svg.selectAll("rect")
            .data([...aggregatedData])
            .enter().append("rect")
            .attr("x", d => x(d[0]))
            .attr("y", d => y(d[1]))
            .attr("height", d => height - y(d[1]))
            .attr("width", x.bandwidth())
            .attr("fill", d => colorScale(d[0]))
            .on("click", function(event, d) {
                // Remove the previous text if any
                svg.selectAll(".bar-info").remove();
                // Revert the color of all bars
                svg.selectAll("rect").attr("fill", d => colorScale(d[0]));
                // Change the color of the clicked bar
                d3.select(this).attr("fill", "lightblue");
                // Append a new text above the clicked bar
                svg.append("text")
                    .attr("class", "bar-info")
                    .attr("x", x(d[0]) + x.bandwidth() / 2)
                    .attr("y", y(d[1]) - 10)  // Displaying 10 pixels above the bar
                    .attr("text-anchor", "middle")
                    .attr("fill", "black")
                    .text(`Avg: $${d[1].toFixed(2)}`);
            });

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "8px");

        svg.append("g")
            .attr("class", "y")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -70)
            .attr("x", -height / 2)
            .attr("dy", ".71em")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .text("Average Salary (USD)");

        // Add legend back
        const legend = svg.selectAll(".legend")
            .data([...aggregatedData.keys()])
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(" + (width + 20) + "," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("x", +130)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", d => colorScale(d));

        legend.append("text")
            .attr("x", +120)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .attr("text-anchor", "end")
            .style("font-size", "12px")
            .text(function(d) { return d; });
    }









    let currentZoomedExperience = null;
    // Function to draw the overview pie chart
    function drawOverviewPieChart() {
        // Select the SVG element for the overview pie chart
        const overviewPieSvg = d3.select("#overview-pie-chart svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // Create a pieContainer within the overview pie chart SVG
        const pieContainer = overviewPieSvg.append("g");

        // Group and count data by experience level
        const experienceLevelData = d3.rollup(data, v => v.length, d => d.experience_level);

        // Create a pie generator
        const pie = d3.pie().value(d => d[1]);

        // Generate the pie data
        const pieData = pie([...experienceLevelData]);

        // Define a larger outer radius for the pie chart
        const outerRadius = Math.min(width, height) / 2; // Adjust the value to make it even larger

        // Create an arc generator with the larger outer radius
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(outerRadius);

        // Create color scale for the pie segments
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Draw the pie chart
        const pieSelection = overviewPieSvg.selectAll("path")
            .data(pieData)
            .enter()
            .append("g");

        // Add path elements for each pie segment
        pieSelection
            .append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => color(i))
            .on("mouseover", zoomIn) // Add a mouseover event to zoom in
            .on("mouseout", zoomOut) // Optional: Add a mouseout event to zoom out or reset
            .style("font-size", "5px");
        function zoomOut() {
            d3.select("#detailed-pie-chart").selectAll("*").remove();
            // Any other logic you want to implement when the user moves the mouse out
        }
        // Function to zoom in on a specific experience level
        function zoomIn(d) {
            console.log("Zooming in on:", d);
            const clickedData = d3.select(this).datum();

            console.log("Received data in zoomIn:", clickedData);

            const selectedExperienceLevel = clickedData && clickedData.data && clickedData.data[0];
            console.log("Selected Experience Level:", selectedExperienceLevel);

            if (!selectedExperienceLevel) {
                console.error("Invalid data or experience level is missing:", d);
                return;
            }

            const filteredData = data.filter(row => row.experience_level === selectedExperienceLevel);
            console.log("Filtered Data:", filteredData);

            if (!filteredData || filteredData.length === 0) {
                console.error(`No data found for experience level: ${selectedExperienceLevel}`);
                return;
            }
            console.log("Filtered Data:", filteredData);
            console.log("Selected Experience Level:", selectedExperienceLevel);
            console.log("Filtered dataset for 'SE':", filteredData);

            // Call a function to draw the detailed pie chart based on company size
            drawDetailedPieChart(filteredData, selectedExperienceLevel);
        }

        // Add percentage labels to the pie chart
        pieSelection
            .append("text")
            .attr("transform", d => "translate(" + arc.centroid(d) + ")")
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .style("font-size", "9px")
            .text(d => {
                const percentage = ((d.data[1] / data.length) * 100).toFixed(1);
                return `${percentage}%`;
            });

        // Create legends for the pie chart
        const legendContainer = d3.select("#legend-container"); // The separate div for legends
        const legend = legendContainer.selectAll(".legend")
            .data(pieData)
            .enter().append("div") // You can use divs for legends
            .attr("class", "legend");

        // Add legend color boxes
        legend.append("span")
            .attr("class", "legend-color")
            .style("background-color", (d, i) => color(i));

        // Add legend text labels
        legend.append("span")
            .attr("class", "legend-text")
            .text(d => d.data[0]);
    }


    function drawDetailedPieChart(filteredData, selectedExperienceLevel) {
        // Clear the previous detailed pie chart

        d3.select("#detailed-pie-chart").selectAll("*").remove();

        const detailedPieSvg = d3.select("#detailed-pie-chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // Group and count data by company size within the selected experience level
        const companySizeData = d3.rollup(filteredData, v => v.length, d => d.company_size);
        console.log("Company Size Data:", [...companySizeData]);
        // Create a pie generator
        const pie = d3.pie().value(d => d[1]);

        // Generate the pie data
        const pieData = pie([...companySizeData]);
        console.log("Detailed Pie Data:", pieData);
        // Create an arc generator
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(Math.min(width, height) / 2 - 80);

        // Create color scale for the pie segments
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Draw the detailed pie chart
        detailedPieSvg.selectAll("path")
            .data(pieData)
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => color(i));

        // Add labels to the detailed pie chart
        detailedPieSvg.selectAll("text")
            .data(pieData)
            .enter()
            .append("text")
            .attr("transform", d => "translate(" + arc.centroid(d) + ")")
            .attr("dy", ".35em")
            .text(d => `${d.data[0]}: ${d.data[1]}`); // Display company size and count

        // Add a title to the detailed pie chart based on the selected experience level
        detailedPieSvg.append("text")
            .attr("text-anchor", "middle")
            .text("Company Size Distribution for " + selectedExperienceLevel);
    }

    // Function to draw the line chart
    function drawLineChart() {
        lineSvg.selectAll('*').remove();

        // Aggregate the data by year
        const aggregatedData = Array.from(d3.rollup(data,
            v => d3.mean(v, d => d.salary_in_usd),
            d => +d.work_year)).sort((a, b) => a[0] - b[0]);

        const x = d3.scaleLinear()
            .domain(d3.extent(aggregatedData, d => d[0]))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(aggregatedData, d => d[1])])
            .range([height, 0]);

        const line = d3.line()
            .x(d => x(d[0]))
            .y(d => y(d[1])) // Use the actual data point for the y-value
            .curve(d3.curveMonotoneX);

        const lineColor = "steelblue";

        // Add the initial line path
        lineSvg.append("path")
            .datum(aggregatedData)
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", lineColor)
            .attr("stroke-width", 1.5);

        // Calculate the total length of the line path
        const totalLength = lineSvg.select("path").node().getTotalLength();

        // Animate the line path
        lineSvg.select("path")
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(4000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        // Render the x-axis with its label
        lineSvg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(aggregatedData.length)) // Adjust the number of ticks
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "8px");

        lineSvg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 60) + ")")
            .style("text-anchor", "middle")
            .text("Work Year");

        // Render the y-axis with its label
        lineSvg.append("g")
            .call(d3.axisLeft(y));

        lineSvg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Average Salary (USD)");

        // Add legend for the line
        const legend = lineSvg.append("g")
            .attr("transform", "translate(" + (width - 100) + "," + 10 + ")");

        legend.append("line")
            .attr("x1", 110)
            .attr("x2", 150)
            .attr("y1", 140)
            .attr("y2", 140)
            .style("stroke", lineColor)
            .style("stroke-width", 1.5);

        legend.append("text")
            .attr("x", 100)
            .attr("y", 110)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text("Salary Trend");

    }
    // Function to draw the parallel coordinate plot
    function drawParallelCoordinatePlot() {
        parallelCoordinateContainer.selectAll('*').remove();

        // Define the dimensions for the parallel coordinate plot
        const dimensions = ['work_year', 'salary_in_usd', 'remote_ratio'];

        // Create scales for each dimension
        const scales = {};
        dimensions.forEach((dimension) => {
            if (dimension === "remote_ratio") {
                scales[dimension] = d3.scaleLinear()
                    .domain(d3.extent(data, (d) => +d[dimension]))
                    .range([0, height]); // Adjust the range to fit within the height
            } else {
                scales[dimension] = d3.scaleLinear()
                    .domain(d3.extent(data, (d) => +d[dimension]))
                    .range([0, height]);
            }
        });

        // Create the parallel coordinate lines
        parallelCoordinateContainer.selectAll("path")
            .data(data)
            .enter().append("path")
            .attr("class", "parallel-line")
            .attr("d", (d) => {
                return d3.line()(dimensions.map((dimension, i) => {
                    return [i * (width / (dimensions.length - 1)), scales[dimension](d[dimension])];
                }));
            })
            .style("stroke", (d, i) => colorScale(d[dimensions[0]])) // Set the stroke color based on data
            .style("opacity", 0.5)
            .style("fill", "none");

        // Use CSS to set the background of the SVG container to transparent
        parallelCoordinateContainer.style("background-color", "none");

        // Create axes for each dimension with brushing functionality
        dimensions.forEach((dimension, i) => {
            const scale = scales[dimension];

            // Create an axis for the dimension
            const axis = d3.axisLeft(scale);

            // Add the axis to the parallelCoordinateContainer
            parallelCoordinateContainer.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + i * (width / (dimensions.length - 1)) + ",0)")
                .call(axis);

            // Add axis labels
            parallelCoordinateContainer.append("text")
                .attr("class", "axis-label")
                .attr("transform", "translate(" + i * (width / (dimensions.length - 1)) + "," + (-10) + ")")
                .text(dimension);

            // Create brushing behavior for the axis
            const brush = d3.brushY()
                .extent([[i * (width / (dimensions.length - 1)), 0], [(i + 1) * (width / (dimensions.length - 1)), height]])
                .on("brush", brushed);

            // Create a group for the brush and add it to the parallelCoordinateContainer
            const brushGroup = parallelCoordinateContainer.append("g")
                .attr("class", "brush")
                .call(brush);

            // Initialize the brush to cover the entire axis by default
            brushGroup.call(brush.move, scale.range());

            // Define the brushing behavior
            function brushed(event) {
                const extent = event.selection;

                // Update the filtered data based on the brush extent
                const filteredData = data.filter((d) => {
                    return extent[0] <= scale(+d[dimension]) && scale(+d[dimension]) <= extent[1];
                });

                // Update the parallel lines based on the filtered data
                parallelCoordinateContainer.selectAll(".parallel-line")
                    .style("display", (d) => {
                        return filteredData.includes(d) ? null : "none";
                    });
            }
        });

        // Add y-axis label
        parallelCoordinateContainer.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -55)
            .text("Values");
    }

// Initial drawing

    // Initial drawing
    drawBarChart("job_title");
    drawOverviewPieChart();
    drawLineChart();
    drawParallelCoordinatePlot();

    // Update the chart when dropdown changes
    d3.select("#dropdown").on("change", function () {
        const selectedCategory = d3.select(this).property("value");
        drawBarChart(selectedCategory)
        drawLineChart();
           });
}

loadCSV();
