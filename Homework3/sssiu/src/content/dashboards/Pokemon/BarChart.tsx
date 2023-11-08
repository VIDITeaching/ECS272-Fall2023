import { useMemo } from 'react';
import * as d3 from 'd3';

import { PokemonData, pokemonData } from 'src/data/PokemonData';
import { BarItem } from './BarItem';

type DataItem = {
  name: string;
  value: number;
};
type BarChartProps = {
  width: number;
  height: number;
  pokemonData: PokemonData;
};

const MARGIN_X = 150;
const MARGIN_Y = 50;
const INFLEXION_PADDING = 20; // space between donut and label inflexion point

const colors = [
  '#FF0000',
  '#FF7F00',
  '#FFD400',
  '#FFFF00',
  '#BFFF00',
  '#6AFF00',
  '#00EAFF',
  '#0095FF',
  '#0040FF',
  '#AA00FF',
  '#FF00AA',
  '#EDB9B9',
  '#E7E9B9',
  '#B9EDE0',
  '#B9D7ED',
  '#DCB9ED',
  '#8F2323',
  '#8F6A23',
  '#4F8F23',
  '#23628F',
  '#6B238F',
  '#000000',
  '#737373',
  '#CCCCCC'
];

const MARGIN = { top: 5, right: 5, bottom: 5, left: 5 };

export const Barplot = ({ width, height, pokemonData }: BarChartProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const BAR_PADDING = 0.3;

  const typesToCount: string[] = Array.from(
    new Set(pokemonData.map((p) => p.Type_1))
  );

  const data: DataItem[] = [];
  typesToCount.forEach((type) => {
    const count = pokemonData.filter(
      (pokemon) => pokemon.Type_1 === type
    ).length;
    if (count > 0) data.push({ name: type, value: count });
  });


  // Y axis is for groups since the barplot is horizontal
  const groups = data.sort((a, b) => b.value - a.value).map((d) => d.name);
  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(groups)
      .range([0, boundsHeight])
      .padding(BAR_PADDING);
  }, [data, height]);

  // X axis
  const xScale = d3.scaleLinear().domain([0, 30]).range([0, boundsWidth]);

  // Build the shapes
  const allShapes = data.map((d) => {
    return (
      <BarItem
        key={d.name}
        name={d.name}
        value={d.value}
        barHeight={yScale.bandwidth()}
        barWidth={xScale(d.value)}
        x={xScale(0)}
        y={yScale(d.name)}
      />
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allShapes}
        </g>
      </svg>
    </div>
  );
};