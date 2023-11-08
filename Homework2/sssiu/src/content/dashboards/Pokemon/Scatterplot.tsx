import * as d3 from 'd3';
import { AxisLeft } from './AxisLeft';
import { AxisBottom } from './AxisBottom';
import { useState } from 'react';
import { InteractionData, Tooltip } from './Tooltip';
import { PokemonData } from 'src/data/PokemonData';

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };

type DataPoint = {
  x: number;
  y: number;
  size: number;
  group: string;
  subGroup: string;
};

type ScatterplotProps = {
  width: number;
  height: number;
  pokemonData: PokemonData;
};

export const Scatterplot = ({
  width,
  height,
  pokemonData
}: ScatterplotProps) => {
  const data: DataPoint[] = [];

  pokemonData.forEach((pkd) => {
    data.push({
      x: pkd.Defense,
      y: pkd.Attack,
      size: 1,
      group: pkd.Type_1,
      subGroup: pkd.Name
    });
  });

  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const [hovered, setHovered] = useState<InteractionData | null>(null);

  // Scales
  const yScale = d3
    .scaleLinear()
    .domain([0, Math.max(...data.map((d) => d.y))])
    .range([boundsHeight, 0]);
  const xScale = d3
    .scaleLinear()
    .domain([0, Math.max(...data.map((d) => d.x))])
    .range([0, boundsWidth]);
  const allGroups = data.map((d) => String(d.group));
  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(allGroups)
    .range([
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
    ]);

  // Build the shapes
  const allShapes = data.map((d, i) => {
    return (
      <circle
        key={i}
        r={8}
        cx={xScale(d.x)}
        cy={yScale(d.y)}
        stroke={colorScale(d.group)}
        fill={colorScale(d.group)}
        fillOpacity={0.7}
        onMouseEnter={() =>
          setHovered({
            xPos: xScale(d.x),
            yPos: yScale(d.y),
            name: d.subGroup
          })
        }
        onMouseLeave={() => setHovered(null)}
      />
    );
  });

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        >
          {/* Y axis */}
          <AxisLeft yScale={yScale} pixelsPerTick={40} width={boundsWidth} />

          {/* X axis, use an additional translation to appear at the bottom */}
          <g transform={`translate(0, ${boundsHeight})`}>
            <AxisBottom
              xScale={xScale}
              pixelsPerTick={40}
              height={boundsHeight}
            />
          </g>

          {/* Circles */}
          {allShapes}
        </g>
      </svg>

      {/* Tooltip */}
      <div
        style={{
          width: boundsWidth,
          height: boundsHeight,
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          marginLeft: MARGIN.left,
          marginTop: MARGIN.top
        }}
      >
        <Tooltip interactionData={hovered} />
      </div>
    </div>
  );
};
