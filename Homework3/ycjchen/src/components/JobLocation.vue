<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/ds_salaries.json';
// import app from '../main.js';
import axios from 'axios';
import { isEmpty, debounce } from 'lodash';

import { Dot, ComponentSize, Margin } from '../types';
import { drag } from 'd3';
// A "extends" B means A inherits the properties and methods from B.
interface CategoricalDot extends Dot{
    company_location: string;
    work_year: number;
    experience_level: string;
    company_size:string;
    country_name:string;
}

// Computed property: https://vuejs.org/guide/essentials/computed.html
// Lifecycle in vue.js: https://vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram

export default {
    inject:['eventBus'],
    data() {
        // Here we define the local states of this component. If you think the component as a class, then these are like its private variables.
        return {
            dots: [] as CategoricalDot[], // "as <Type>" is a TypeScript expression to indicate what data structures this variable is supposed to store.
            size: { width: 0, height: 0 } as ComponentSize,
            margin: {left: 40, right: 40, top: 25, bottom: 35} as Margin,
            tickLabels: {
                0: '2020',
                1: '2021',
                2: '2022',
                3: '2023',
            },

            SliderValue:0,
            country:'none',
            model: false,
        }
    },
    computed: {
        // Re-render the chart whenever the window is resized or the data changes (and data is non-empty)
        rerender() {
            return (!isEmpty(this.dots)) && this.size 
        },
        updateChart(){ //will show the box-plot if switch value is on
            let isBox = this.model
            let xExtents = d3.extent(this.dots.map((d: CategoricalDot) => d.salary_in_usd as number)) as [number, number]
            let yCategories: string[] = [ ...new Set(this.dots.map((d: CategoricalDot) => d.company_location as string))].sort()
            // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
            let yScale = d3.scalePoint()
                .range([this.size.height - this.margin.bottom -5, this.margin.top])
                .domain(yCategories)
            
            let xScale = d3.scaleLinear()
                .range([this.margin.left, this.size.width - this.margin.right+20]) 
                .domain([0, xExtents[1]]) 
            if(!isBox){
                d3.select('#dot-svg').selectAll('.vertLines').remove()
                d3.select('#dot-svg').selectAll('.boxes').remove()
                d3.select('#dot-svg').selectAll('.medianLines').remove()
                let chartContainer = d3.select('#dot-svg')
                const dots = chartContainer.append('g')
                            .selectAll('circle')
                            .data<CategoricalDot>(this.dots) // TypeScript expression. This always expects an array of objects.
                            .enter()
                            .append('circle')
                            .attr('class','dots')
                            .attr('cx', (d: CategoricalDot) => xScale(d.salary_in_usd) as number)
                            .attr('cy', (d: CategoricalDot) => yScale(d.company_location) as string)
                            .attr("stroke",function (d) { return "#A4A4A4"})
                            .attr('fill','none')
                            .attr("r",2.5)
                
            }
            if(isBox){
                d3.select('#dot-svg').selectAll('circle').remove()
                let chartContainer = d3.select('#dot-svg')
                var isoCountries = {
                    'AF' : 'Afghanistan',
                    'AX' : 'Aland Islands',
                    'AL' : 'Albania',
                    'DZ' : 'Algeria',
                    'AS' : 'American Samoa',
                    'AD' : 'Andorra',
                    'AO' : 'Angola',
                    'AI' : 'Anguilla',
                    'AQ' : 'Antarctica',
                    'AG' : 'Antigua And Barbuda',
                    'AR' : 'Argentina',
                    'AM' : 'Armenia',
                    'AW' : 'Aruba',
                    'AU' : 'Australia',
                    'AT' : 'Austria',
                    'AZ' : 'Azerbaijan',
                    'BS' : 'Bahamas',
                    'BH' : 'Bahrain',
                    'BD' : 'Bangladesh',
                    'BB' : 'Barbados',
                    'BY' : 'Belarus',
                    'BE' : 'Belgium',
                    'BZ' : 'Belize',
                    'BJ' : 'Benin',
                    'BM' : 'Bermuda',
                    'BT' : 'Bhutan',
                    'BO' : 'Bolivia',
                    'BA' : 'Bosnia And Herzegovina',
                    'BW' : 'Botswana',
                    'BV' : 'Bouvet Island',
                    'BR' : 'Brazil',
                    'IO' : 'British Indian Ocean Territory',
                    'BN' : 'Brunei Darussalam',
                    'BG' : 'Bulgaria',
                    'BF' : 'Burkina Faso',
                    'BI' : 'Burundi',
                    'KH' : 'Cambodia',
                    'CM' : 'Cameroon',
                    'CA' : 'Canada',
                    'CV' : 'Cape Verde',
                    'KY' : 'Cayman Islands',
                    'CF' : 'Central African Republic',
                    'TD' : 'Chad',
                    'CL' : 'Chile',
                    'CN' : 'China',
                    'CX' : 'Christmas Island',
                    'CC' : 'Cocos (Keeling) Islands',
                    'CO' : 'Colombia',
                    'KM' : 'Comoros',
                    'CG' : 'Congo',
                    'CD' : 'Congo, Democratic Republic',
                    'CK' : 'Cook Islands',
                    'CR' : 'Costa Rica',
                    'CI' : 'Cote D\'Ivoire',
                    'HR' : 'Croatia',
                    'CU' : 'Cuba',
                    'CY' : 'Cyprus',
                    'CZ' : 'Czech Republic',
                    'DK' : 'Denmark',
                    'DJ' : 'Djibouti',
                    'DM' : 'Dominica',
                    'DO' : 'Dominican Republic',
                    'EC' : 'Ecuador',
                    'EG' : 'Egypt',
                    'SV' : 'El Salvador',
                    'GQ' : 'Equatorial Guinea',
                    'ER' : 'Eritrea',
                    'EE' : 'Estonia',
                    'ET' : 'Ethiopia',
                    'FK' : 'Falkland Islands (Malvinas)',
                    'FO' : 'Faroe Islands',
                    'FJ' : 'Fiji',
                    'FI' : 'Finland',
                    'FR' : 'France',
                    'GF' : 'French Guiana',
                    'PF' : 'French Polynesia',
                    'TF' : 'French Southern Territories',
                    'GA' : 'Gabon',
                    'GM' : 'Gambia',
                    'GE' : 'Georgia',
                    'DE' : 'Germany',
                    'GH' : 'Ghana',
                    'GI' : 'Gibraltar',
                    'GR' : 'Greece',
                    'GL' : 'Greenland',
                    'GD' : 'Grenada',
                    'GP' : 'Guadeloupe',
                    'GU' : 'Guam',
                    'GT' : 'Guatemala',
                    'GG' : 'Guernsey',
                    'GN' : 'Guinea',
                    'GW' : 'Guinea-Bissau',
                    'GY' : 'Guyana',
                    'HT' : 'Haiti',
                    'HM' : 'Heard Island & Mcdonald Islands',
                    'VA' : 'Holy See (Vatican City State)',
                    'HN' : 'Honduras',
                    'HK' : 'Hong Kong',
                    'HU' : 'Hungary',
                    'IS' : 'Iceland',
                    'IN' : 'India',
                    'ID' : 'Indonesia',
                    'IR' : 'Iran, Islamic Republic Of',
                    'IQ' : 'Iraq',
                    'IE' : 'Ireland',
                    'IM' : 'Isle Of Man',
                    'IL' : 'Israel',
                    'IT' : 'Italy',
                    'JM' : 'Jamaica',
                    'JP' : 'Japan',
                    'JE' : 'Jersey',
                    'JO' : 'Jordan',
                    'KZ' : 'Kazakhstan',
                    'KE' : 'Kenya',
                    'KI' : 'Kiribati',
                    'KR' : 'Korea',
                    'KW' : 'Kuwait',
                    'KG' : 'Kyrgyzstan',
                    'LA' : 'Lao People\'s Democratic Republic',
                    'LV' : 'Latvia',
                    'LB' : 'Lebanon',
                    'LS' : 'Lesotho',
                    'LR' : 'Liberia',
                    'LY' : 'Libyan Arab Jamahiriya',
                    'LI' : 'Liechtenstein',
                    'LT' : 'Lithuania',
                    'LU' : 'Luxembourg',
                    'MO' : 'Macao',
                    'MK' : 'Macedonia',
                    'MG' : 'Madagascar',
                    'MW' : 'Malawi',
                    'MY' : 'Malaysia',
                    'MV' : 'Maldives',
                    'ML' : 'Mali',
                    'MT' : 'Malta',
                    'MH' : 'Marshall Islands',
                    'MQ' : 'Martinique',
                    'MR' : 'Mauritania',
                    'MU' : 'Mauritius',
                    'YT' : 'Mayotte',
                    'MX' : 'Mexico',
                    'FM' : 'Micronesia, Federated States Of',
                    'MD' : 'Moldova',
                    'MC' : 'Monaco',
                    'MN' : 'Mongolia',
                    'ME' : 'Montenegro',
                    'MS' : 'Montserrat',
                    'MA' : 'Morocco',
                    'MZ' : 'Mozambique',
                    'MM' : 'Myanmar',
                    'NA' : 'Namibia',
                    'NR' : 'Nauru',
                    'NP' : 'Nepal',
                    'NL' : 'Netherlands',
                    'AN' : 'Netherlands Antilles',
                    'NC' : 'New Caledonia',
                    'NZ' : 'New Zealand',
                    'NI' : 'Nicaragua',
                    'NE' : 'Niger',
                    'NG' : 'Nigeria',
                    'NU' : 'Niue',
                    'NF' : 'Norfolk Island',
                    'MP' : 'Northern Mariana Islands',
                    'NO' : 'Norway',
                    'OM' : 'Oman',
                    'PK' : 'Pakistan',
                    'PW' : 'Palau',
                    'PS' : 'Palestinian Territory, Occupied',
                    'PA' : 'Panama',
                    'PG' : 'Papua New Guinea',
                    'PY' : 'Paraguay',
                    'PE' : 'Peru',
                    'PH' : 'Philippines',
                    'PN' : 'Pitcairn',
                    'PL' : 'Poland',
                    'PT' : 'Portugal',
                    'PR' : 'Puerto Rico',
                    'QA' : 'Qatar',
                    'RE' : 'Reunion',
                    'RO' : 'Romania',
                    'RU' : 'Russian Federation',
                    'RW' : 'Rwanda',
                    'BL' : 'Saint Barthelemy',
                    'SH' : 'Saint Helena',
                    'KN' : 'Saint Kitts And Nevis',
                    'LC' : 'Saint Lucia',
                    'MF' : 'Saint Martin',
                    'PM' : 'Saint Pierre And Miquelon',
                    'VC' : 'Saint Vincent And Grenadines',
                    'WS' : 'Samoa',
                    'SM' : 'San Marino',
                    'ST' : 'Sao Tome And Principe',
                    'SA' : 'Saudi Arabia',
                    'SN' : 'Senegal',
                    'RS' : 'Serbia',
                    'SC' : 'Seychelles',
                    'SL' : 'Sierra Leone',
                    'SG' : 'Singapore',
                    'SK' : 'Slovakia',
                    'SI' : 'Slovenia',
                    'SB' : 'Solomon Islands',
                    'SO' : 'Somalia',
                    'ZA' : 'South Africa',
                    'GS' : 'South Georgia And Sandwich Isl.',
                    'ES' : 'Spain',
                    'LK' : 'Sri Lanka',
                    'SD' : 'Sudan',
                    'SR' : 'Suriname',
                    'SJ' : 'Svalbard And Jan Mayen',
                    'SZ' : 'Swaziland',
                    'SE' : 'Sweden',
                    'CH' : 'Switzerland',
                    'SY' : 'Syrian Arab Republic',
                    'TW' : 'Taiwan',
                    'TJ' : 'Tajikistan',
                    'TZ' : 'Tanzania',
                    'TH' : 'Thailand',
                    'TL' : 'Timor-Leste',
                    'TG' : 'Togo',
                    'TK' : 'Tokelau',
                    'TO' : 'Tonga',
                    'TT' : 'Trinidad And Tobago',
                    'TN' : 'Tunisia',
                    'TR' : 'Turkey',
                    'TM' : 'Turkmenistan',
                    'TC' : 'Turks And Caicos Islands',
                    'TV' : 'Tuvalu',
                    'UG' : 'Uganda',
                    'UA' : 'Ukraine',
                    'AE' : 'United Arab Emirates',
                    'GB' : 'United Kingdom',
                    'US' : 'United States',
                    'UM' : 'United States Outlying Islands',
                    'UY' : 'Uruguay',
                    'UZ' : 'Uzbekistan',
                    'VU' : 'Vanuatu',
                    'VE' : 'Venezuela',
                    'VN' : 'Viet Nam',
                    'VG' : 'Virgin Islands, British',
                    'VI' : 'Virgin Islands, U.S.',
                    'WF' : 'Wallis And Futuna',
                    'EH' : 'Western Sahara',
                    'YE' : 'Yemen',
                    'ZM' : 'Zambia',
                    'ZW' : 'Zimbabwe'
                };
                function getCountryName (countryCode) {
                    if (isoCountries.hasOwnProperty(countryCode)) {
                        return isoCountries[countryCode];
                    } else {
                        return countryCode;
                    }
                }
                
                
                let groupData = d3.group(this.dots, (d) => d.company_location);
                const sortedGroupData = new Map(yCategories.map((key) => [key, groupData.get(key)]));
                // console.log(sortedGroupData)
                const sumstat = Array.from(sortedGroupData, ([key, values]) => {
                    // console.log(values.length)
                    const length_of_data = values.length
                    const salaries = values.map((g) => g.salary_in_usd).sort(d3.ascending);
                    const q1 = d3.quantile(salaries, 0.25);
                    const median = d3.quantile(salaries, 0.5);
                    const q3 = d3.quantile(salaries, 0.75);
                    const interQuantileRange = q3 - q1;
                    const min = d3.min(salaries);
                    const max = d3.max(salaries);
                    const country_name = getCountryName(key);
                    // console.log(country_name)

                    return {
                        key,
                        value: { q1, median, q3, interQuantileRange, min, max , length_of_data, country_name},
                    };
                });
                const ver_line = chartContainer.append('g')
                    .selectAll("vertLines")
                    .data(sumstat.filter(d => d.value.length_of_data > 0))
                    .enter()
                    .append("line")
                    .attr('class','vertLines')
                    .attr("x1", function(d){return(xScale(d.value.min))})
                    .attr("x2", function(d){return(xScale(d.value.max))})
                    .attr("y1", function(d){return(yScale(d.key))})
                    .attr("y2", function(d){return(yScale(d.key))})
                    .attr("stroke", "black")
                    .style("width", 40)

                // rectangle for the main box
                var boxWidth = 5
                const boxes = chartContainer.append('g')
                    .selectAll("boxes")
                    .data(sumstat.filter(d => d.value.length_of_data > 0))
                    .enter()
                    .append("rect")
                    .attr('class','boxes')
                    .attr("x", function(d){return(xScale(d.value.q1))})
                    .attr("y", function(d){return(yScale(d.key)-boxWidth/2)})
                    .attr("width", function(d){return(xScale(d.value.q3)-xScale(d.value.q1))})
                    .attr("height", boxWidth )
                    .attr("stroke", "black")
                    .style("fill", 'lightgrey')//"#CEE3F6"
                    .on('mouseover', function(e,d) {
                        let median = d.value.median;
                        // Create a new <g> element for text and position it
                        const textGroup = chartContainer.append('g')
                            .attr('class', 'tooltip');
                        const textbox = textGroup.append('rect')
                            .attr('class', 'tooltiprect')
                            .attr('x', e.clientX +10 )
                            .attr('y', e.clientY -40) 
                            .attr('width', 30) 
                            .attr('height', 35) 
                            .attr('rx',3)
                            .attr('fill', '#FBF8EF') 
                            .attr('stroke', 'black') 
                            .attr('stroke-width', 1) 

                        const text_name = textGroup.append('text')
                            .attr('class', 'tooltiptext')
                            .attr('x', e.clientX + 20)
                            .attr('y', e.clientY -25) 
                            .style('font-weight', 500)
                            .style('font-family', 'Arial')
                            .style('fill', 'black')
                            .style('text-anchor', 'justify')
                            .text("country name: "+d.value.country_name);
                        const text_num = textGroup.append('text')
                            .attr('class', 'tooltiptext')
                            .attr('x', e.clientX + 20)
                            .attr('y', e.clientY -15) 
                            .style('font-weight', 500)
                            .style('font-family', 'Arial')
                            .style('fill', 'black')
                            .style('text-anchor', 'justify')
                            .text("the total number of Data Scientists:"+d.value.length_of_data);
                        const text_min = textGroup.append('text')
                            .attr('class', 'tooltiptext')
                            .attr('x', e.clientX + 20)
                            .attr('y', e.clientY -5) 
                            .style('font-weight', 500)
                            .style('font-family', 'Arial')
                            .style('fill', 'black')
                            .style('text-anchor', 'justify')
                            .text("minimum: "+(d.value.min).toLocaleString()+" (USD)");
                        const text_max = textGroup.append('text')
                            .attr('class', 'tooltiptext')
                            .attr('x', e.clientX + 20)
                            .attr('y', e.clientY+5 ) 
                            .style('font-weight', 500)
                            .style('font-family', 'Arial')
                            .style('fill', 'black')
                            .style('text-anchor', 'justify')
                            .text("maximum: "+(d.value.max).toLocaleString()+" (USD)");
                        const text_med = textGroup.append('text')
                            .attr('class', 'tooltiptext')
                            .attr('x', e.clientX + 20)
                            .attr('y', e.clientY+15 ) 
                            .style('font-weight', 500)
                            .style('font-family', 'Arial')
                            .style('fill', 'black')
                            .style('text-anchor', 'justify')
                            .text("median: "+median.toLocaleString()+" (USD)");   
                        // Add a mouseout event to remove the text when not hovering
                        d3.select(this)
                            .on('mouseout', function () {
                                textGroup.remove();
                            });
                    })
                
                // Show the median
                const median = chartContainer.append('g')
                        .selectAll("medianLines")
                        .data(sumstat.filter(d => d.value.length_of_data > 0))
                        .enter()
                        .append("line")
                        .attr('class','medianLines')
                        .attr("x1", function(d){return(xScale(d.value.median)) })
                        .attr("x2", function(d){return(xScale(d.value.median)) })
                        .attr("y1", function(d){return(yScale(d.key)+boxWidth/2)})
                        .attr("y2", function(d){return(yScale(d.key)-boxWidth/2)})
                        .attr("stroke", "black")
                        .style("width", 80)                
            }
            

            
            // // console.log(this.SliderValue)
            // let range = this.SliderValue
            // // console.log(this.tickLabels[range])
            // let chosen_year = this.tickLabels[range]
            // let certain_year_data = this.dots.filter((d)=> (d.work_year== (chosen_year)))
            // let others = this.dots.filter((d)=> (d.work_year != (chosen_year)))
            
            
            // const dots_grey = chartContainer.append('g')
            //     .selectAll('circle')
            //     .data<CategoricalDot>(others)
            //     .enter()  
            //     .append('circle')
            //     .attr('cx', (d: CategoricalDot) => xScale(d.salary_in_usd) as number)
            //     .attr('cy', (d: CategoricalDot) => yScale(d.company_location) as string)
            //     .attr("stroke","#D8D8D8")
            //     .attr('fill','none')
            //     .attr("r",2.5)

            // const dots_chosen = chartContainer.append('g')
            //     .selectAll('circle')
            //     .data<CategoricalDot>(certain_year_data) 
            //     .enter()  
            //     .append('circle')
            //     .attr('cx', (d: CategoricalDot) => xScale(d.salary_in_usd) as number)
            //     .attr('cy', (d: CategoricalDot) => yScale(d.company_location) as string)
            //     .attr("stroke","black")
            //     .attr('fill','none')
            //     .attr("r",0)
            //     .transition()
            //     .duration(300)
            //     .attr("r",2.5)
            
        }

        
    
    },
    // Anything in here will only be executed once.
    // Refer to the lifecycle in Vue.js for more details, mentioned at the very top of this file.
    created() {
        
        if (isEmpty(Data)) return;
        this.dots = Data.data;
    },
    methods: {
        onResize() {  // record the updated size of the target element
            let target = this.$refs.dotContainer as HTMLElement
            if (target === undefined) return;
            this.size = { width: target.clientWidth, height: target.clientHeight };
            
        },
        
        initChart() {
            
            let chartContainer = d3.select('#dot-svg')
            
            let xExtents = d3.extent(this.dots.map((d: CategoricalDot) => d.salary_in_usd as number)) as [number, number]
            let yCategories: string[] = [ ...new Set(this.dots.map((d: CategoricalDot) => d.company_location as string))].sort()
            let yScale = d3.scalePoint()
                .range([this.size.height - this.margin.bottom -5, this.margin.top])
                .domain(yCategories)
            
            let xScale = d3.scaleLinear()
                .range([this.margin.left, this.size.width - this.margin.right+20]) 
                .domain([0, xExtents[1]]) 
           
            const xAxis = chartContainer.append('g')
                .attr('transform', `translate(0, ${this.size.height - this.margin.bottom})`)
                .call(d3.axisBottom(xScale))
                .style("font-size", "8px")                

            const yAxis = chartContainer.append('g')
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(yScale))
                .style("font-size", "8px")

            
            let self = this
            const highlight = yAxis
                                .selectAll("text")                 
                                .data(yCategories)
                                .attr('class','zoom')
                                .on('mouseover',function(){
                                    d3.select(this)
                                      .style("fill", "red");})
                                .on('mouseout',function(){
                                    d3.select(this)
                                    .style("fill", "black");
                                })
                                .on('click', function(e,d){
                                    self.eventBus.emit('countrymsg',d)
                                })
            
            
            const yLabel = chartContainer.append('g')
                .attr('transform', `translate(${10}, ${this.size.height / 2}) rotate(-90)`)
                .append('text')
                .text('Company location')
                .style('font-size', '.9rem')

            const xLabel = chartContainer.append('g')
                .attr('transform', `translate(${this.size.width - this.margin.left -40}, ${this.size.height -6})`)
                .append('text')
                .text('Salary(USD)')
                .style('font-size', '.9rem')
           
            const dots = chartContainer.append('g')
                .selectAll('circle')
                .data<CategoricalDot>(this.dots) // TypeScript expression. This always expects an array of objects.
                .enter()
                .append('circle')
                .attr('class','dots')
                .attr('cx', (d: CategoricalDot) => xScale(d.salary_in_usd) as number)
                .attr('cy', (d: CategoricalDot) => yScale(d.company_location) as string)
                .attr("stroke",function (d) { return "#A4A4A4"})
                .attr('fill','none')
                .attr("r",2.5)
            
            const grid = chartContainer.append('g')
                .selectAll('line')
                .data(xScale.ticks())
                .enter()
                .append('line')
                .attr('x1', d => {return xScale(d)})
                .attr('x2', d => xScale(d))
                .attr('y1', this.margin.top)
                .attr('y2', this.size.height - this.margin.bottom)
                .style('stroke','lightgrey')
                .style('opacity',0.3)
            const grid2 = chartContainer.append('g')
            .selectAll('line')
            .data(yCategories)
            .enter()
            .append('line')
            .attr('x1', this.margin.left)
            .attr('x2', this.size.width-this.margin.right+20)
            .attr('y1', d=> yScale(d))
            .attr('y2', d=> yScale(d))
            .style('stroke','lightgrey')
            .style('opacity',0.3)
            const title = chartContainer.append('g')
                .append('text') // adding the text
                .attr('transform', `translate(${this.size.width / 2}, ${this.size.height - 3})`)
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .style('font-size', '1rem')
                .text('Fig.1 Data Scientist Salaries in different Countries') // text content
        }
    },
    watch: {
        rerender(newSize) {
            if (!isEmpty(newSize)) {
                d3.select('#dot-svg').selectAll('*').remove() // Clean all the elements in the chart
                this.initChart()
            }
        },

        
    },
    
    // The following are general setup for resize events.
    mounted() {
        window.addEventListener('resize', debounce(this.onResize, 100)) 
        this.onResize()
    },
    beforeDestroy() {
       window.removeEventListener('resize', this.onResize)
    }
}

</script>

<!-- "ref" registers a reference to the HTML element so that we can access it via the reference in Vue.  -->
<!-- We use flex (d-flex) to arrange the layout-->
<template>
    <div class="chart-container" ref="dotContainer">
        <svg id="dot-svg" width="100%" height="100%">
            <!-- all the visual elements we create in initChart() will be inserted here in DOM-->
        </svg>
        <v-switch
            class="button"
            @input="updateChart" 
            v-model="model"
            color="light grey"
            label="toggle and hover the box to see the statistic info. with box-plot"
            hide-details
        ></v-switch>
        <!-- <v-slider v-model = "SliderValue" class="yearslider" id="year-slider" @input="updateChart" 
            :ticks="tickLabels"
            :max="3"
            :thumb-size="15"
            step="1"
            color="blue"
            thumb-color="blue"
            label="work year"
            show-ticks="always"
            tick-size="5"
        ></v-slider> -->
    </div>
</template>

<style >
.chart-container{
    height: 100%;
}


.button{
    display: absolute;
    bottom:92vh;
    left:15vh;
}
.v-switch.v-input--horizontal{
    position:absolute;
}

.chart-container g rect.tooltiprect{
    width: 38vh;
    height:10vh;
    
}


.zoom{
  transition: transform .2s;
}
.zoom:hover {
  transform: scale(1.3);
  cursor: pointer;
}




</style>

