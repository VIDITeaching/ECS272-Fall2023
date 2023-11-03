<template>
  <div class="container">
    <div id="my_dataviz"></div>
    <div style="font-weight: bold;">Note:You can click on a region in the stream graph to select it and re-click to
      unselect it. You can also use mouse wheel to pan and zoom.</div>
    <br>
    <div id="barChart"></div>
    <div id="pieChart"></div>
    <div style="font-weight: bold;">Note:You can move your mouse onto certain portion if you cannot see its information clearly in the piechart.</div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  data() {
    return {
      selectedRegion: null, // 用于跟踪当前选定的区域
      isRegionSelected: false, // 标志变量，表示当前是否选定了某个区域
      regionData: [], // 存储选定区域的数据
      width: 460,
      height: 350,
      zoomTransform: d3.zoomIdentity,
    };
  },
  mounted() {
    this.createChart();

  },
  methods: {
    createChart() {
      const vm = this;
      // Set the dimensions and margins of the graph
      const margin = { top: 20, right: 30, bottom: 0, left: 10 };
      const width = 660 - margin.left - margin.right;
      const height = 600 - margin.top - margin.bottom;

      const margin1 = { top: 30, right: 30, bottom: 70, left: 60 };

      // Append the SVG object to the body of the page
      const svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("pointer-events", "all")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      // Read the data
      d3.csv("../../data/terrorism.csv").then(data => {


        const statistics = [];
        for (let year = 1970; year <= 2017; year++) {
          statistics.push({ year: year });
          for (let region = 1; region <= 12; region++) {
            statistics[year - 1970][`region${region}`] = 0;
          }
        }


        data.forEach(row => {
          const year = row.iyear;
          const region = row.region;
          statistics[year - 1970][`region${region}`]++;
        });

        console.log(statistics);

        const keys = ['region1', 'region2', 'region3', 'region4', 'region5', 'region6', 'region7', 'region8', 'region9', 'region10', 'region11', 'region12'];


        // Add X axis
        const x = d3.scaleLinear()
          .domain(d3.extent(statistics, d => +d.year))
          .range([0, width]);
        svg.append("g")
          .attr("transform", `translate(0, ${height * 0.8})`)
          .call(d3.axisBottom(x).tickSize(-height * 0.7).tickValues([1976, 1988, 2000, 2012]))
          .select(".domain").remove();

        // Customization
        svg.selectAll(".tick line").attr("stroke", "#b8b8b8");

        // Add X axis label
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("x", width)
          .attr("y", height - 30)
          .text("Time (year)");

        // Add Y axis
        const y = d3.scaleLinear()
          .domain([-15000, 15000])
          .range([height, 0]);

        // Color palette
        const color = d3.scaleOrdinal()
          .domain(keys)
          .range(d3.schemeDark2);

        // Stack the data
        const stackedData = d3.stack()
          .offset(d3.stackOffsetSilhouette)
          .keys(keys)
          (statistics);

        // Create a tooltip
        const Tooltip = d3.select("#my_dataviz")
          .append("text")
          .attr("x", 0)
          .attr("y", 0)
          .style("opacity", 0)
          .style("font-size", 17)
          .style("font-weight", "bold");

        // Area generator
        const area = d3.area()
          .x(d => x(+d.data.year))
          .y0(d => y(d[0]))
          .y1(d => y(d[1]));

        // Add pan and zoom behavior
        const zoom = d3.zoom()
          .scaleExtent([1, 8]) // 设置缩放范围
          .on("zoom", zoomed);

        svg.call(zoom);

        function zoomed(event) {
          const newTransform = event.transform;
          // 更新缩放比例和偏移量
          svg.attr("transform", newTransform);
        }


        // 定义柱状图容器
        const barChartContainer = d3.select("#barChart")
          .append("svg")
          .attr("width", this.width + margin1.left + margin1.right)
          .attr("height", this.height + margin1.top + margin1.bottom)
          .append("g")
          .attr("transform", `translate(${margin1.left}, ${margin1.top})`);

        const pieChart = d3.select("#pieChart")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const tooltip1 = d3.select("#pieChart")
          .append("div")
          .style("opacity", 0)
          .attr("class", "tooltip")
          .style("background-color", "white")
          .style("border", "solid")
          .style("border-width", "2px")
          .style("border-radius", "5px")
          .style("padding", "5px");


        // Show the areas
        svg
          .selectAll("mylayers")
          .data(stackedData)
          .join("path")
          .attr("class", "myArea")
          .style("fill", d => color(d.key))
          .attr("d", area)
          .on("mouseover", function (event, d) {
            if (!vm.isRegionSelected) { // 仅当没有选定区域时才高亮
              Tooltip.style("opacity", 1);
              d3.selectAll(".myArea").style("opacity", 0.2);
              d3.select(event.currentTarget)
                .style("stroke", "black")
                .style("opacity", 1);
            }
          })
          .on("mousemove", function (event, d) {
            if (!vm.isRegionSelected) { // 仅当没有选定区域时才显示 tooltip
              const grp = d.key;
              if (grp == 'region1') {
                Tooltip.text("North America");
              } else if (grp == 'region2') {
                Tooltip.text("Central America & Caribbean");
              } else if (grp == 'region3') {
                Tooltip.text("South America");
              } else if (grp == 'region4') {
                Tooltip.text("East Asia");
              } else if (grp == 'region5') {
                Tooltip.text("Southeast Asia");
              } else if (grp == 'region6') {
                Tooltip.text("South Asia");
              } else if (grp == 'region7') {
                Tooltip.text("Central Asia");
              } else if (grp == 'region8') {
                Tooltip.text("Western Europe");
              } else if (grp == 'region9') {
                Tooltip.text("Eastern Europe");
              } else if (grp == 'region10') {
                Tooltip.text("Middle East & North Africa");
              } else if (grp == 'region11') {
                Tooltip.text("Sub-Saharan Africa");
              } else {
                Tooltip.text("Australasia & Oceania");
              }
            }
          })
          .on("mouseleave", function (event, d) {
            if (!vm.isRegionSelected) { // 仅当没有选定区域时才取消高亮
              Tooltip.style("opacity", 0);
              d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none");
            }
          })
          .on("click", function (event, d) {
            // 获取所点击的区域信息
            const clickedRegion = d.key;
            const regionValue = parseInt(clickedRegion.replace("region", "")); // 将 "region2" 转换为整数 2


            if (!isNaN(regionValue)) {
              if (vm.selectedRegion !== clickedRegion) {
                vm.selectedRegion = clickedRegion;
                vm.isRegionSelected = true;

                console.log(clickedRegion);
                console.log(regionValue);
                console.log(data);

                // 筛选数据
                // vm.regionData = data.filter(row => row.region === regionValue);
                vm.regionData = data.filter(row => parseInt(row.region, 10) === regionValue);


                console.log(vm.regionData);

                // 统计 imonth 数据
                const monthCounts = Array(12).fill(0);
                vm.regionData.forEach(row => {
                  monthCounts[row.imonth - 1]++;
                });

                console.log(monthCounts);


                // 渲染柱状图
                const xScale = d3.scaleBand()
                  .domain(d3.range(1, 13))
                  .range([0, 460])
                  .padding(0.2);

                const yScale = d3.scaleLinear()
                  .domain([0, d3.max(monthCounts)])
                  .range([400, 0]);

                // 添加 X 轴到 SVG
                barChartContainer.append("g")
                  .attr("class", "x-axis")
                  .attr("transform", `translate(0, ${this.height})`)
                  .call(d3.axisBottom(xScale));

                // 添加 Y 轴到 SVG
                barChartContainer.append("g")
                  .attr("class", "y-axis")
                  .call(d3.axisLeft(yScale));

                // 添加 X 轴标签
                barChartContainer.append("text")
                  .attr("text-anchor", "end")
                  .attr("x", this.width)
                  .attr("y", this.height + 30) // 调整位置
                  .text("Month");

                // 添加 Y 轴标签
                barChartContainer.append("text")
                  .attr("text-anchor", "middle")
                  .attr("transform", "rotate(-90)") // 旋转 Y 轴标签
                  .attr("x", -200)
                  .attr("y", -40) // 调整位置
                  .text("Count");

                barChartContainer.selectAll("rect")
                  .data(monthCounts)
                  .enter()
                  .append("rect")
                  .attr("x", (d, i) => xScale(i + 1))
                  .attr("y", d => yScale(d))
                  .attr("width", xScale.bandwidth())
                  .attr("height", d => height - yScale(d))
                  .style("fill", "steelblue");

                barChartContainer.append("text")
                  .attr("class", "chart-title")
                  .attr("text-anchor", "middle")
                  .attr("x", 230)
                  .attr("y", -15)
                  .text("Global Terrorism Incidents Counted in This Region by Month")
                  .style("font-size", "18px")
                  .style('font-weight', 'bold');



                // Count countries
                const countryCounts = {};
                vm.regionData.forEach(row => {
                  const country = row.country_txt;
                  if (countryCounts[country]) {
                    countryCounts[country]++;
                  } else {
                    countryCounts[country] = 1;
                  }
                });

                // Convert counts to an array of objects
                const result = [];
                for (const country in countryCounts) {
                  result.push({ country, count: countryCounts[country] });
                }

                // Generate pie chart
                const pie = d3.pie()
                  .value(d => d.count);

                const arc = d3.arc()
                  .innerRadius(0)
                  .outerRadius(Math.min(width, height) / 2 - 50);

                const arcs = pie(result);

                const path = pieChart
                  .selectAll("path")
                  .data(arcs)
                  .join("path")
                  .attr("d", arc)
                  .attr("fill", d => color(d.data.country))
                  .attr("class", "pie-slice") // 添加类名，用于样式
                  .on("mouseover", function (event, d) {
                    // 添加鼠标悬停效果
                    d3.select(this).attr("opacity", 0.7);
                  })
                  .on("mouseout", function (event, d) {
                    // 恢复正常样式
                    d3.select(this).attr("opacity", 1);
                  });


                // 添加标签
                pieChart
                  .selectAll("text")
                  .data(arcs)
                  .join("text")
                  .attr("transform", d => `translate(${arc.centroid(d)})`)
                  .attr("dy", "0.35em")
                  .text(d => {
                    const percentage = (d.endAngle - d.startAngle) / (2 * Math.PI) * 100;
                    return `${d.data.country}`;
                  })
                  .style("text-anchor", "middle");

                // 添加饼图标题
                pieChart
                  .append("text")
                  .attr("text-anchor", "middle")
                  .style("font-size", "18px")
                  .style("font-weight", "bold")
                  .attr("dy", "-14em")
                  .text("Terrorism Incidents in This Region by Countries"); // 替换为你的标题文本

                // 为每个部分添加悬停事件
                path
                  .on("mouseover", function (event, d) {
                    const percentage = (d.endAngle - d.startAngle) / (2 * Math.PI) * 100;
                    tooltip1
                      .style("opacity", 1)
                      .html(`${d.data.country}&nbsp${d.data.count}&nbsp${percentage.toFixed(2)}%`)
                      .style("left", (event.pageX + 10) + "px")
                      .style("top", (event.pageY + 10) + "px");
                  })
                  .on("mouseout", function () {
                    tooltip1.style("opacity", 0);
                  });

              } else {
                vm.selectedRegion = null;
                vm.isRegionSelected = false;
                vm.regionData = [];
                // 移除柱状图
                barChartContainer.selectAll("*").remove();
                // Clear the pie chart
                pieChart.selectAll("*").remove();
              }

            }
          });

        svg.append("text")
          .attr("x", width / 2)
          .attr("y", 0 - margin.top / 2 + 5) // Adjust the position based on your needs
          .attr("text-anchor", "middle") // Center the text
          .style("font-size", "18px")
          .style("font-weight", "bold")
          .text("Global Terrorism Incidents from 1970 to 2017"); // Replace with your desired title

      });

    },
  },
};
</script>
