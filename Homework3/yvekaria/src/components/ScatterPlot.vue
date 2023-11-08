<template>
  <div id="scatter-plot" ref="scatterContainer">
    <div class="chart-container">
      <div class="tooltip"></div>
    </div>
    <div class="slicer-container">
      <span>Size represents the scaled Pokemon Capture Rate</span>&nbsp;
      <input type="range" class="capture-rate-slicer" min="3" max="255" value="255">&nbsp;
      <span class="slicer-value"> <span class="capture-rate-value"> 255</span></span>
    </div>
    <button class="reset-button" @click="resetView">Reset View</button>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { watch } from 'vue';

export default {
  props: ['gen', 'res'],
  mounted() {
    this.margin = { top: 2, right: 20, bottom: 50, left: 50 };
    let target = this.$refs.scatterContainer;
    if (target === undefined) return;
    this.size = { width: target.clientWidth, height: target.clientHeight };
    this.width = this.size.width + 80;
    this.height = this.size.height + 190;
    this.$watch('gen', () => {
      this.slicerInput = document.querySelector('.capture-rate-slicer');
      this.slicerValueDisplay = document.querySelector('.capture-rate-value');
      this.slicerInput.value = '255';
      this.slicerValueDisplay.textContent = '255';
      this.initializeScatterPlot();
    });
    this.$watch('res', () => {
      this.slicerInput = document.querySelector('.capture-rate-slicer');
      this.slicerValueDisplay = document.querySelector('.capture-rate-value');
      this.slicerInput.value = '255';
      this.slicerValueDisplay.textContent = '255';
      this.initializeScatterPlot();
    });
    this.initializeScatterPlot(); // Call the initialization method in the mounted hook
  },
  created() {
    watch(this.gen, () => {
      console.log('test-gen')
    });
    watch(this.res, () => {
      console.log('test-res')
    });
  },
  methods: {
    initializeScatterPlot() {
      // Fetch and parse the CSV file
      d3.csv('../../data/pokemon_alopez247.csv').then(data => {
        // Process and retain only necessary columns
        data = data.map(d => ({
          Name: d.Name,
          Generation: d.Generation,
          Weight_kg: +d.Weight_kg,
          Height_cm: +d.Height_m * 100,
          Body_Style: d.Body_Style,
          Catch_Rate: +d.Catch_Rate
        }));

        if (this.gen !== -1) {
          this.data = data.filter(d => d.Generation == this.gen);
        }
        else {
          this.data = data;
        };
        // console.log("Hello Scatter", this.gen, this.data);

        // Your D3.js code to create the scatter plot using processed data
        // this.margin = { top: 2, right: 20, bottom: 50, left: 50 };
        // let target = this.$refs.scatterContainer;
        // if (target === undefined) return;
        // this.size = { width: target.clientWidth, height: target.clientHeight };
        // this.width = this.size.width + 80;
        // this.height = this.size.height + 190;

        // this.width = 1450 // 1100 - margin.left - margin.right;
        // this.height = 240 - this.margin.top - this.margin.bottom;

        const el = d3
          .select('#scatter-plot');

        el.selectAll('svg').remove();
          
        this.svg = el
          .append('svg')
          .attr('width', this.width + this.margin.left + this.margin.right)
          .attr('height', this.height + this.margin.top + this.margin.bottom)
          .append('g')
          .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
        // X-axis scale (log scale for Height_cm)
        this.xScale = d3
          .scaleLog()
          .domain([9, d3.max(this.data, d => d.Height_cm)])
          .range([0, this.width-300]);

        // Y-axis scale (log scale for Weight_kg)
        this.yScale = d3
          .scaleLog()
          .domain([0.1, d3.max(this.data, d => d.Weight_kg)])
          .range([this.height, 0]);

        // Scale for circle size based on Catch_Rate
        this.sizeScale = d3
          .scaleLinear()
          .domain([0, d3.max(this.data, d => d.Catch_Rate)])
          .range([1.5, 16.5]);

        // Color scale for Body_Style
        
        // Define an array of distinct light hue-based colors for your categories
        this.lightColors = [
          "#B57EDC",
          "#ffa6c9",
          "#FA8072",
          "#ff55a3",
          "#DC143C",
          "#9e146c",
          "#ffb90f",
          "#b07922",
          "#808000",
          "#CDEE2B",
          "#00dfaf",
          "#0bbed8",
          "#417881",
          "#020385"
        ];

        // Create a custom color scale using the distinct light colors
        this.colorScale = d3
          .scaleOrdinal()
          .domain(this.data.map(d => d.Body_Style))
          .range(this.lightColors);


        // Draw circles
        this.svg.selectAll('circle')
          .data(this.data)
          .enter()
          .append('circle')
          .attr('cx', d => this.xScale(d.Height_cm))
          .attr('cy', d => this.yScale(d.Weight_kg))
          .attr('r', d => this.sizeScale(0.5 * d.Catch_Rate))
          .attr('fill', d => this.colorScale(d.Body_Style))
          .on('mouseover', function(event, d) {
            const tooltip = d3.select('.tooltip');
            tooltip.transition().duration(200).style('opacity', 2.0);
            const formattedHeight = parseFloat(d.Height_cm).toFixed(0);
            const formattedWeight = parseFloat(d.Weight_kg).toFixed(0); // Format weight to two decimal digits
            tooltip.html(`Name: ${d.Name} (Gen ${d.Generation})<br>Height: ${formattedHeight} cm<br>Weight: ${formattedWeight} kg<br>Catch Rate: ${d.Catch_Rate}`)
              .style('left', (event.pageX) + 'px')
              .style('top', (event.pageY - 72) + 'px')
              .style('width', '250px');
          })
          .on('mouseout', function() {
            d3.select('.tooltip').transition().duration(500).style('opacity', 0);
          })
          .on('click', (event, d) => {
              const bodyStyle = d.Body_Style;
              this.handleScatterClick(bodyStyle);
          });

        // X-axis
        this.svg.append('g')
          .attr('transform', `translate(0,${this.height})`)
          .call(d3.axisBottom(this.xScale).ticks(5, '.0s'))
          .selectAll('text')
          .style('font-size', '14px');
        
        this.svg.append('text')
          .attr('x', (this.width - 275) / 2)
          .attr('y', this.height + this.margin.bottom - 5)
          .attr('fill', '#000')
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .text('Height (cm) (logscale)');

        // Y-axis
        this.svg.append('g')
          .call(d3.axisLeft(this.yScale).ticks(5, '.0s'))
          .selectAll('text')
          .style('font-size', '14px');
          
        this.svg.append('text')
          .attr('x', -(this.height / 2))
          .attr('y', -this.margin.left + 10)
          .attr('fill', '#000')
          .attr('text-anchor', 'middle')
          .attr('transform', 'rotate(-90)')
          .style('font-size', '16px')
          .text('Weight (kg) (logscale)');

        // Legend
        const legend = this.svg.append('g')
          .attr('class', 'legend')
          //.attr('transform', 'translate(${width + 200}, 0)');

        const legendKeys = Array.from(new Set(this.data.map(d => d.Body_Style)));
        legend.selectAll('rect')
          .data(legendKeys)
          .enter()
          .append('rect')
          .attr('x', this.width - 275)
          .attr('y', (d, i) => i * 17)
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', d => this.colorScale(d));

        legend.selectAll('text')
          .data(legendKeys)
          .enter()
          .append('text')
          .attr('x', this.width - 250)
          .attr('y', (d, i) => i * 17 + 12.5)
          .text(d => d.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));

        // Add capture rate description
        this.svg.append('text')
          .attr('x', 85) // Set x-coordinate for the center of the plot
          .attr('y', -this.height + 420) // Set y-coordinate for the top of the plot
          .attr('text-anchor', 'middle')
          .style('font-size', '18px')
          .style('font-weight', 'bold')
          .text('Pokemon Physique Distribution');

        // Title
        // this.svg.append('text')
        //   .attr('x', 175) // Set x-coordinate for the center of the plot
        //   .attr('y', -this.height + 200) // Set y-coordinate for the top of the plot
        //   .attr('text-anchor', 'middle')
        //   .style('font-size', '14px')
        //   .text('Size represents the scaled Pokemon Capture Rate');

        // Get unique capture rates from the data
        this.uniqueCaptureRates = [...new Set(this.data.map(d => d.Catch_Rate))];
        this.datalist = document.createElement('datalist');
        this.datalist.id = 'capture-rate-options';

        // Add options for each unique capture rate
        this.uniqueCaptureRates.forEach(rate => {
          const option = document.createElement('option');
          option.value = rate;
          this.datalist.appendChild(option);
        });

        console.log("check", this.uniqueCaptureRates) //, this.slider.value)

        // Slicer functionality
        this.slider = document.querySelector('.capture-rate-slicer');
        // this.slider.setAttribute('list', 'capture-rate-options');
        this.slicerValueDisplay = document.querySelector('.capture-rate-value');
        this.slider.parentNode.appendChild(this.datalist);
        // Set default value to max capture rate
        this.slider.value = Math.max(...this.uniqueCaptureRates);
        this.slider.addEventListener('input', () => {
          const diffs = this.uniqueCaptureRates.map(x => Math.abs(parseInt(this.slider.value) - x));
          const idx = diffs.indexOf(Math.min(...diffs));
          const value = this.uniqueCaptureRates[idx];
          this.slider.value = value;
          this.selectedCaptureRate = parseInt(value);
          this.slicerValueDisplay.textContent = this.selectedCaptureRate;
          this.handleSlicerChange(this.selectedCaptureRate);
        });
      });
    },
    handleSlicerChange(selectedCaptureRate) {
      // Filter data based on selected capture rate
      const filteredData = this.data.filter(d => d.Catch_Rate === selectedCaptureRate);

      // Remove existing circles
      this.svg.selectAll('circle').remove();

      // Redraw circles for the filtered data
      this.svg.selectAll('circle')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('cx', d => this.xScale(d.Height_cm))
        .attr('cy', d => this.yScale(d.Weight_kg))
        .attr('r', d => this.sizeScale(0.5 * d.Catch_Rate))
        .attr('fill', d => this.colorScale(d.Body_Style))
        .on('mouseover', function(event, d) {
            const tooltip = d3.select('.tooltip');
            tooltip.transition().duration(200).style('opacity', 2.0);
            const formattedHeight = parseFloat(d.Height_cm).toFixed(0);
            const formattedWeight = parseFloat(d.Weight_kg).toFixed(0); // Format weight to two decimal digits
            tooltip.html(`Name: ${d.Name} (Gen ${d.Generation})<br>Height: ${formattedHeight} cm<br>Weight: ${formattedWeight} kg<br>Catch Rate: ${d.Catch_Rate}`)
              .style('left', (event.pageX) + 'px')
              .style('top', (event.pageY - 72) + 'px')
              .style('width', '250px');
          })
          .on('mouseout', function() {
            d3.select('.tooltip').transition().duration(500).style('opacity', 0);
          })
          .on('click', (event, d) => {
              const bodyStyle = d.Body_Style;
              this.handleScatterClick(bodyStyle);
          });
    },
    resetView() {
      this.slicerInput = document.querySelector('.capture-rate-slicer');
      this.slicerValueDisplay = document.querySelector('.capture-rate-value');
      this.slicerInput.value = '255';
      this.slicerValueDisplay.textContent = '255';
      // Select and remove existing chart elements
      d3.select('#scatter-plot svg').remove();
      this.initializeScatterPlot();
    },
    handleScatterClick(bodyStyle) {
      // this.data = data;
      // Filter data based on the clicked bodyStyle
      const filteredData = this.data.filter(d => d.Body_Style === bodyStyle);

      // Remove existing circles
      this.svg.selectAll('circle').remove();

      // Redraw circles for the filtered data
      this.svg.selectAll('circle')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('cx', d => this.xScale(d.Height_cm))
        .attr('cy', d => this.yScale(d.Weight_kg))
        .attr('r', d => this.sizeScale(0.5 * d.Catch_Rate))
        .attr('fill', d => this.colorScale(d.Body_Style))
        .on('mouseover', function(event, d) {
          const tooltip = d3.select('.tooltip');
          tooltip.transition().duration(200).style('opacity', 2.0);
          const formattedHeight = parseFloat(d.Height_cm).toFixed(0);
          const formattedWeight = parseFloat(d.Weight_kg).toFixed(0); // Format weight to two decimal digits
          tooltip.html(`Name: ${d.Name} (Gen ${d.Generation})<br>Height: ${formattedHeight} cm<br>Weight: ${formattedWeight} kg<br>Catch Rate: ${d.Catch_Rate}`)
            .style('left', (event.pageX) + 'px')
            .style('top', (event.pageY - 72) + 'px')
            .style('width', '250px');
        })
        .on('mouseout', function() {
          d3.select('.tooltip').transition().duration(500).style('opacity', 0);
        });
    }
  }
};
</script>

<style scoped>
#chart {
  position: relative;
}
.slicer-container {
  position: absolute;
  top : 537px; /* top: 548px; Set the desired top position for the slicer container */
  left: 100px; /* Set the desired left position for the slicer container */
  z-index: 1;
  font-size: 14px; /* Set the desired font size for the slicer container */
  color: #333; /* Set the desired text color for the slicer container */
  display: flex;
  align-items: center;
}
.chart-container {
  position: relative;
  width: 100%; /* Set width to 100% to fill the entire chart area */
  height: 100%; /* Set height to 100% to fill the entire chart area */
  /* Add other styling properties for the chart container if needed */
}
.tooltip {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 50px;
  pointer-events: none;
  display: none;
}
.reset-button {
  position: absolute;
  top: 572px;
  left: 105px;
  z-index: 1;
  padding: 5px 10px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}
.reset-button:hover {
  background-color: #0056b3;
}
/* Add this style to your <style scoped> section */
/* Hide the default slider styles */
.capture-rate-slicer {
  appearance: none;
  background: #aaa;
  border-radius: 8px;
}


/* Hide the default tooltip that appears on hover */
.capture-rate-slicer::-webkit-slider-thumb::hover {
  display: none;
}
</style>
