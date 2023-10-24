import * as d3 from 'd3';
import './style.css';

function kernelDensityEstimator(kernel, X) {
    return function (V) {
        return X.map(function (x) {
            return [x, d3.mean(V, function (v) { return kernel(x - v); })];
        });
    };
}

function kernelEpanechnikov(k) {
    return function (v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}

async function loadCSV() {
    const data = await d3.csv("ds_salaries.csv");
    const svgWidth = 1600;
    const svgHeight = 750;
    const sectionWidth = svgWidth / 2;
    const sectionHeight = svgHeight / 2;

    data.forEach((d) => {
        d.work_year = parseInt(d.work_year.replace(/[,.]/g, ''));
    });

    const svg = d3.select('#app').append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    const pieG = svg.append('g')
        .attr('width', sectionWidth)
        .attr('height', sectionHeight)
        .attr('transform', `translate(300,200)`);

    const kdeG = svg.append('g')
        .attr('width', sectionWidth)
        .attr('height', sectionHeight)
        .attr('transform', `translate(${sectionWidth - 830},+10)`);

    const pcG = svg.append('g')
        .attr('width', sectionWidth)
        .attr('height', sectionHeight)
        .attr('transform', `translate(10,${sectionHeight})`);

    // Create the Pie Chart
    const experienceLevelCounts = d3.group(data, d => d.experience_level);
    const pieData = Array.from(experienceLevelCounts, ([key, value]) => ({ key, value: value.length }));

    const pieColors = ['#9764a8', '#0800ff', '#0095ff', '#ff00b7'];//efine colors for pie chart segments

    const pie = d3.pie().value(d => d.value);
    const arcData = pie(pieData);

    const pieRadius = 130; // Adjust the radius here

    const path = d3.arc()
        .outerRadius(pieRadius)
        .innerRadius(0);

    const arc = pieG.selectAll(".arc")
        .data(arcData)
        .enter().append("g")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path)
        .attr("fill", (d, i) => pieColors[i]);

    arc.append("text")
        .attr("transform", d => "translate(" + path.centroid(d) + ")")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(d => `${Math.round(100 * d.data.value / d3.sum(pieData, d => d.value))}%`);

    pieG.append("text")
        .attr("dy", "-9em")
        .attr("text-anchor", "middle")
        .text("Experience Level Distribution");

    // Add legends to the pie chart
    pieG.selectAll('.legend')
        .data(pieData)
        .enter()
        .append('rect') // Append rectangles
        .attr('class', 'legend-rect')
        .attr('x', svgWidth - 1400) // Adjust the x-coordinate as needed
        .attr('y', (d, i) => 30 + i * 20) // Adjust the y-coordinate and spacing as needed
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', (d, i) => pieColors[i]);

    pieG.selectAll('.legend')
        .data(pieData)
        .enter()
        .append('text')
        .attr('class', 'legend')
        .attr('x', svgWidth - 1380) // Adjust the x-coordinate as needed
        .attr('y', (d, i) => 45 + i * 20) // Adjust the y-coordinate and spacing as needed
        .text(d => d.key)
        .style('fill', 'black'); // Text color

    // Create the KDE Plot
    const kdeHeight = 250;
    const kdeOffset = 110;
    const kdeLabelOffset = 8000;
    const kdeTitleOffset = 30;

    const smallCompany = data.filter(d => d.company_size === 'S').map(d => +d.salary_in_usd);
    const mediumCompany = data.filter(d => d.company_size === 'M').map(d => +d.salary_in_usd);
    const largeCompany = data.filter(d => d.company_size === 'L').map(d => +d.salary_in_usd);
    const x = d3.scaleLinear().domain([0, 500000]).range([800, 1500]);
    const yAxisMaxValue = Math.max(
        d3.max(kernelDensityEstimator(kernelEpanechnikov(7000), x.ticks(100))(smallCompany), d => d[1]),
        d3.max(kernelDensityEstimator(kernelEpanechnikov(7000), x.ticks(100))(mediumCompany), d => d[1]),
        d3.max(kernelDensityEstimator(kernelEpanechnikov(7000), x.ticks(100))(largeCompany), d => d[1])
    );
    const y = d3.scaleLinear().domain([0, yAxisMaxValue]).range([kdeHeight + kdeOffset, kdeOffset - 10]);
    const xAxis = d3.axisBottom(x).tickValues([0, 100000, 200000, 300000, 400000, 500000]).tickFormat(d => `$${d / 1000}K`);
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d3.format(".1e"));
    kdeG.append('g').attr('transform', `translate(0, ${kdeOffset + kdeHeight})`).call(xAxis);

    const kde = kernelDensityEstimator(kernelEpanechnikov(7000), x.ticks(100));
    const smallDensity = kde(smallCompany);
    const mediumDensity = kde(mediumCompany);
    const largeDensity = kde(largeCompany);

    kdeG.append("g")
        .attr("class", "kde-y-axis")
        .attr("transform", `translate(800, ${kdeOffset - 100})`)
        .call(yAxis);

    const kdeLegends = ['Small Company', 'Medium Company', 'Large Company'];
    kdeLegends.forEach((legend, index) => {
        kdeG.append('rect')
            .attr('x', svgWidth - 200)
            .attr('y', kdeOffset + kdeHeight + (index * 20) - 110)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', pieColors[index]); // Use the same colors as in the pie chart
        kdeG.append('text')
            .attr('x', svgWidth - 170)
            .attr('y', kdeOffset + kdeHeight + (index * 20) - 100)
            .text(legend);
    });

    kdeG.append("text")
        .attr("class", "kde-title")
        .attr("x", svgWidth / 2 + 300)
        .attr("y", kdeOffset - 60)
        .attr("text-anchor", "middle")
        .text("Salary distribution by company size");

    kdeG.append("path")
        .datum(smallDensity)
        .attr("fill", "none")
        .attr("opacity", .3)
        .attr("stroke", pieColors[0]) // Use the same color as in the pie chart
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .curve(d3.curveBasis)
            .x(d => x(d[0]))
            .y(d => y(d[1])));

    kdeG.append("path")
        .datum(mediumDensity)
        .attr("fill", "none")
        .attr("opacity", .3)
        .attr("stroke", pieColors[1]) // Use the same color as in the pie chart
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .curve(d3.curveBasis)
            .x(d => x(d[0]))
            .y(d => y(d[1])));

    kdeG.append("path")
        .datum(largeDensity)
        .attr("fill", "none")
        .attr("opacity", .3)
        .attr("stroke", pieColors[2]) // Use the same color as in the pie chart
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .curve(d3.curveBasis)
            .x(d => x(d[0]))
            .y(d => y(d[1])));

    // Create the Parallel Coordinates Plot
    const pcMargin = { top: 120, right: 0, bottom: 410, left: 40 };
    const pcWidth = sectionWidth - pcMargin.left - pcMargin.right;
    const pcHeight = sectionHeight - pcMargin.top - pcMargin.bottom + 340;

    const pcSvg = pcG.append('svg')
        .attr('width', pcWidth + pcMargin.left + pcMargin.right)
        .attr('height', pcHeight + pcMargin.top + pcMargin.bottom)
        .append('g')
        .attr('transform', `translate(${pcMargin.left}, ${pcMargin.top})`);

    const pcDimensions = ['work_year', 'salary_in_usd', 'remote_ratio'];

    const pcXScale = d3.scalePoint()
        .domain(pcDimensions)
        .range([0, pcWidth])
        .padding(1);

    const pcYScale = {};
    pcDimensions.forEach((d) => {
        pcYScale[d] = d3.scaleLinear()
            .domain(d3.extent(data, (p) => +p[d]))
            .range([pcHeight, 0]);
    });

    const pcLineGenerator = d3.line()
        .defined((d) => !isNaN(d[1]))
        .x((d) => pcXScale(d[0]))
        .y((d) => pcYScale[d[0]](d[1]));

    pcSvg.selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('class', 'line')
        .attr('d', (d) => pcLineGenerator(pcDimensions.map((p) => [p, +d[p]])))
        .style('fill', 'none')
        .style('stroke', (d) => {
            if (d === 'work_year') return 'red';
            else if (d === 'salary_in_usd') return 'green';
            else if (d === 'remote_ratio') return 'blue';
            return '#006fff'
        })
        .style('opacity', 0.5);

    pcSvg.selectAll('.axis')
        .data(pcDimensions)
        .enter()
        .append('g')
        .attr('class', 'axis')
        .attr('transform', (d) => `translate(${pcXScale(d)},0)`)
        .each(function (d) {
            d3.select(this).call(d3.axisLeft().scale(pcYScale[d]));
        })
        .append('text')
        .style('text-anchor', 'middle')
        .attr('y', 50)
        .text((d) => {
            if (d === 'work_year') return 'Work Year';
            else if (d === 'salary_in_usd') return 'Salary (USD)';
            else if (d === 'remote_ratio') return 'Remote Ratio';
            return d;
        });


    pcSvg.append("text")
        .attr("x", pcXScale("work_year"))
        .attr("y", pcHeight + pcMargin.top - 100)
        .attr("text-anchor", "middle")
        .text("Work Year");

    pcSvg.append("text")
        .attr("x", pcXScale("salary_in_usd"))
        .attr("y", pcHeight + pcMargin.top - 100)
        .attr("text-anchor", "middle")
        .text("Salary (USD)");

    pcSvg.append("text")
        .attr("x", pcXScale("remote_ratio"))
        .attr("y", pcHeight + pcMargin.top - 100)
        .attr("text-anchor", "middle")
        .text("Remote Ratio");

    pcSvg.append("text")
        .attr("class", "pc-title")
        .attr("x", -(pcHeight / 2))
        .attr("y", 100)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Values");

    pcSvg.append("text")
        .attr("class", "pc-title")
        .attr("x", pcWidth / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Parallel Coordinates Plot for Work Year, Salary, and Remote Ratio");
    const jobSalaryData = data.map(d => ({
        job_title: d.job_title,
        salary_in_usd: +d.salary_in_usd
    }));

    // Calculate the mean salary for each job title
    const jobTitleMeans = d3.rollup(jobSalaryData, v => d3.mean(v, d => d.salary_in_usd), d => d.job_title);

    // Convert the map to an array and sort by mean salary in descending order
    const topJobs = Array.from(jobTitleMeans, ([job_title, mean_salary]) => ({ job_title, mean_salary }))
        .sort((a, b) => b.mean_salary - a.mean_salary)
        .slice(0, 10);

    // Define the dimensions for the chart
    const chartWidth = sectionWidth / 1.8;
    const chartHeight = sectionHeight / 1.8 + 0;
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    // Create a scale for the x-axis (Mean Salary)
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(topJobs, d => d.mean_salary)])
        .range([0, chartWidth]);

    // Create a scale for the y-axis (Job Title)
    const yScale = d3.scaleBand()
        .domain(topJobs.map(d => d.job_title))
        .range([chartHeight, 0])
        .padding(0.1);

    // Create the bar chart container
    const barChart = svg.append('g')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .attr('transform', `translate(${sectionWidth + 100},${sectionHeight + 70})`);

    // Append the bars to the chart
    barChart.selectAll('.bar')
        .data(topJobs)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => yScale(d.job_title))
        .attr('width', d => xScale(d.mean_salary))
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colorScale(d.job_title)); // Use the color scale to set fill color

    // Add labels to the bars for mean salary numbers
    barChart.selectAll('.label')
        .data(topJobs)
        .enter().append('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.mean_salary) + 10) // Adjust the label position
        .attr('y', d => yScale(d.job_title) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .text(d => `$${d.mean_salary.toFixed(2)}`); // Format mean salary as currency

    // Add axis labels
    barChart.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format("$.2s"))); // Format salary ticks as currency

    barChart.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale)); // Y-axis shows job titles

    // Add a title for the chart
    barChart.append('text')
        .attr('class', 'chart-title')
        .attr('x', chartWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .text('Top 10 Job Titles with Highest Mean Salary');
    barChart.append('text')
        .attr('class', 'x-label')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 50) // Adjust the y-coordinate to position the label
        .style('text-anchor', 'middle')
        .text('Mean Salary (USD)');

    // Add y-axis label
    barChart.append('text')
        .attr('class', 'y-label')
        .attr('transform', 'rotate(-90)') // Rotate the label for the y-axis
        .attr('x', -chartHeight / 2) // Adjust the x-coordinate to position the label
        .attr('y', -150)//just the y-coordinate to position the label
        .style('text-anchor', 'middle')
        .text('Job Title');
    kdeG.append("text")
        .attr("x", svgWidth / 2 + 300)
        .attr("y", +380)
        .attr("text-anchor", "middle")
        .text("Mean Salary (USD)");

    // Add y-axis label

    kdeG.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(kdeHeight / 2 + kdeOffset))
        .attr("y", -(kdeOffset - kdeTitleOffset))
        .attr("text-anchor", "middle")
        .text("Density")
        .attr("dy", "+50em");// Adjust this value to move the label to the left
}

loadCSV();
