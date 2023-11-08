<template>
    <div id="tooltip" style="position: absolute; display: none; background-color: rgba(255,255,255,0.8); padding: 10px; border: 1px solid black;"></div>
    <h4 style="padding-left: 50px;">Salaries Across Different Company Sizes and Employment Types</h4>
    <div id="scatter3dContainer" style="position: relative;"></div>
    <div id="legend"></div>
  </template>

<style>
#legend {
  position: absolute;
  right: 200px;
  top: 500px;
  background: #fff;
  padding: 10px;
  border: 1px solid #000;
  border-radius: 5px;
}
</style>

<script lang="ts">
import * as d3 from "d3";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';
import { threadId } from "worker_threads";

interface companyData {
    company_size: string;
    employment_type: string;
    experience_level: string;
    job_title: string;
    remote_ratio: number;
    salary_in_usd: number;
    work_year: number
}


export default{
    data(){
        return{
        rawData: [] as companyData[],
        }
    }, 

    mounted() {
    this.loadDataAndConvert().then(() => {
        this.createSurfacePlot();
    });
        
    },

    methods:{
        async loadDataAndConvert() {
            const data= await d3.csv('../../data/ds_salaries.csv');
            console.log(data, " 3d Chart data");
            if (data && data.length > 0) {
                const fourthviz = data.map(d => ({
                work_year: Number(d.work_year) || 0,
                salary_in_usd: Number(d.salary_in_usd) || 0,
                company_size: String(d.company_size) || '',
                remote_ratio: Number(d.remote_ratio) || 0,
                job_title: String(d.job_title) || '', 
                experience_level: String(d.experience_level) || '',
                employment_type: String(d.employment_type) || '', 
                }));

                this.rawData= fourthviz;
                console.log(this.rawData, "beofore grouping"); 
                // Grouping, aggregation, and resetting the index
                const groupedData = this.rawData.reduce((accumulator, current) => {
                const key = `${current.work_year}-${current.employment_type}-${current.company_size}`;
                    if (!accumulator[key]) {
                        accumulator[key] = {
                            work_year: current.work_year,
                            employment_type: current.employment_type,
                            company_size: current.company_size,
                            salary_in_usd: 0,
                            Count: 0,
                        };
                    }
                    accumulator[key].salary_in_usd += current.salary_in_usd;
                    accumulator[key].Count += 1;

                    return accumulator;
                }, {});

                this.rawData = Object.values(groupedData).map(group => ({
                        work_year: group.work_year,
                        employment_type: group.employment_type,
                        company_size: group.company_size,
                        salary_in_usd: group.salary_in_usd / group.Count, // Calculate the mean
                    }));

                // Map the experience_level values to their full forms
                this.rawData.forEach(d => {
                    if (d.employment_type === "PT") {
                        d.employment_type = "Part-time";
                    } else if (d.employment_type === "FT") {
                        d.employment_type = "Full-time";
                    } else if (d.employment_type === "CT") {
                        d.employment_type = "Contract";
                    } else if (d.employment_type === "FL") {
                        d.employment_type = "Free Lance";
                    }
                });
                console.log(this.rawData, "after grouping")  
            }
        }, 

        createSurfacePlot() {
            const data = this.rawData;
            console.log(data, " surface data")

            // Set the dimensions and margins of the graph
            const width = 800, height = 600;

            // Append the svg object to the body of the page
            const scene = new THREE.Scene();
            scene.background = new THREE.Color("white");
            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(width, height);
            const container = document.getElementById('scatter3dContainer');
            if (container !== null) {
                container.appendChild(renderer.domElement);
            } else {
                console.error('Element with id "scatter3dContainer" not found!');
            }

            const controls = new OrbitControls(camera, renderer.domElement);

            // Set the camera position
            camera.position.set(67.16556572778372, 32.48200434829587, -57.71376491584238);

            // Add an axes helper to visualize the 3D space
            const axesHelper = new THREE.AxesHelper(50);
            scene.add(axesHelper);

            // Add lights
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(1, 1, 1).normalize();
            scene.add(directionalLight);

            // Create scales for your data
            const companySizeScale = new Map(['S', 'M', 'L'].map((d, i) => [d, i])); // Convert company size to numerical scale
            const employmentTypeScale = new Map(['Contract', 'Full-time', 'Part-time', 'Free Lance'].map((d, i) => [d, i])); // Convert employment type to numerical scale
            const xScale = d3.scaleLinear().domain([0, 2]).range([-40, 40]);
            const yScale = d3.scaleLinear().domain([0, 3]).range([-30, 30]);
            const zScale = d3.scaleLinear().domain(d3.extent(data, d => d.salary_in_usd)).range([-30, 30]);
            const colorScale = d3.scaleSequential(d3.interpolateCool).domain(d3.extent(data, d => d.work_year));
            const spheres = [];
            // Add points
            data.forEach(d => {
                const x = xScale(companySizeScale.get(d.company_size));
                const y = yScale(employmentTypeScale.get(d.employment_type));
                const z = zScale(d.salary_in_usd);
                const colorLookup = {
                2020: new THREE.Color("rgb(110, 64, 170)"),  
                2021: new THREE.Color("rgb(47, 150, 224)"), 
                2022: new THREE.Color("rgb(40, 234, 141)"),  
                2023: new THREE.Color("rgb(175, 240, 91)")  
                };
                const color = new THREE.Color(colorLookup[d.work_year]);
                

                const geometry = new THREE.SphereGeometry(1, 32, 32);
                const material = new THREE.MeshLambertMaterial({ color: color });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.userData = {
                    company_size: d.company_size,
                    employment_type: d.employment_type,
                    salary_in_usd: d.salary_in_usd,
                    work_year: d.work_year
                };
                spheres.push(sphere);
                sphere.position.set(x, y, z);
                scene.add(sphere);
            });

            function createTextLabel(text, fontSize = 50, textColor = '#000') {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                context.font = `${fontSize}px Arial`;
                context.fillStyle = textColor;
                context.fillText(text, 0, fontSize); 
                
                const texture = new THREE.CanvasTexture(canvas);
                const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                const sprite = new THREE.Sprite(spriteMaterial);
                sprite.scale.set(canvas.width / 10, canvas.height / 10, 1); 
                return sprite;
            }

            const xAxisLabel = createTextLabel('Company Size', 30);
            xAxisLabel.position.set(45, 0, 0); 
            scene.add(xAxisLabel);

            const yAxisLabel = createTextLabel('Employment Type', 30);
            yAxisLabel.position.set(0, 35, 0); 
            scene.add(yAxisLabel);

            const zAxisLabel = createTextLabel('Salary in USD', 30);
            zAxisLabel.position.set(0, 0, 35); 
            scene.add(zAxisLabel);

            controls.addEventListener('change', function() {
            });

            // Function to create axis tick labels
            function createAxisTickLabel(text, pos, fontSize = 35, textColor = '#000') {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                // Determine the approximate size needed for the canvas
                const canvasSize = fontSize * 5;
                canvas.width = canvasSize;
                canvas.height = fontSize * 5; // Ensure the canvas is tall enough for the text

                context.font = `${fontSize}px Arial`;
                context.fillStyle = textColor;
                context.fillText(text, 0, 50); 
                const texture = new THREE.CanvasTexture(canvas);
                const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                const sprite = new THREE.Sprite(spriteMaterial);
                sprite.scale.set(10, 10, 1); 
                sprite.position.copy(pos); 
                return sprite;
            }

            // Add Y-axis employment type labels
            const employmentTypes = ['Contract', 'Full-time', 'Part-time', 'Free-Lance'];
            employmentTypes.forEach((type, index) => {
                const yPos = yScale(index); 
                const label = createAxisTickLabel(type, new THREE.Vector3(0, yPos+ 25, 0)); 
                scene.add(label);
            });

            // Create the company size axis tick labels
            const companySizes = ['S', 'M', 'L'];
            const companySizePositions = companySizes.map(size => xScale(companySizeScale.get(size)));
            companySizePositions.forEach((position, index) => {
                const label = createAxisTickLabel(companySizes[index], new THREE.Vector3(position+ 25, 0, 0), 20); 
                scene.add(label);
            });

            // Define some salary values as examples for ticks on the z-axis
            const salaryValues = [100000, 200000, 300000, 400000, 500000 ]; 

            // Convert these values to positions using zScale
            const salaryPositions = salaryValues.map(value => zScale(value));

            // Create and add tick labels for the salary axis
            salaryPositions.forEach((position, index) => {
                const salaryTickLabel = createAxisTickLabel(
                    `$${salaryValues[index]}`,  // Convert number to a string with a dollar sign
                    new THREE.Vector3(0, 0, position+ 45),  // X and Y are fixed; Z uses the scaled position
                    20
                );
                scene.add(salaryTickLabel);
            });

            function addLegend(colorScale: any) {
                const years = [...new Set(data.map(d => d.work_year))].sort(); // Get unique years and sort them
                const legendDiv = document.getElementById('legend');
                legendDiv.innerHTML = '<h4>Work Year</h4>'; // Add a title to your legend

                years.forEach(year => {
                    const colorLookup = {
                    2020: new THREE.Color("rgb(110, 64, 170)"),  
                    2021: new THREE.Color("rgb(47, 150, 224)"), 
                    2022: new THREE.Color("rgb(40, 234, 141)"),  
                    2023: new THREE.Color("rgb(175, 240, 91)")
                };
                    //const color = colorScale(year);
                    const color = colorLookup[year].getStyle();
                    console.log(color, ":color", year, ":year")
                    const item = document.createElement('div');
                    item.style.display = 'flex';
                    item.style.alignItems = 'center';
                    item.style.marginBottom = '5px';
                    
                    const colorBox = document.createElement('div');
                    colorBox.style.background = color;
                    colorBox.style.width = '12px';
                    colorBox.style.height = '12px';
                    colorBox.style.marginRight = '7px';
                    
                    const text = document.createTextNode(year);
                    item.appendChild(colorBox);
                    item.appendChild(text);
                    legendDiv.appendChild(item);
                });
            }
            // Call addLegend after you create the colorScale
            addLegend(colorScale);

            // Animation
            const animate = function () {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };
            
            animate();
        }

    }



} 









</script>