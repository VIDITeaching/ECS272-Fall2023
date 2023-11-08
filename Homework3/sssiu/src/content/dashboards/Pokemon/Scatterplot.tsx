import * as d3 from 'd3';
import { AxisLeft } from './AxisLeft';
import { AxisBottom } from './AxisBottom';
import { useEffect, useRef, useState } from 'react';
import { InteractionData, Tooltip } from './Tooltip';
import { PokemonData } from 'src/data/PokemonData';
import { useD3 } from './useD3';
import { Margin } from '@mui/icons-material';

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

  const k = height / width;

  const thisRef = useD3(
    (svg) => {
      const grid = (g, x, y) =>
        g
          .attr('stroke', 'currentColor')
          .attr('stroke-opacity', 0.1)
          .call((g) =>
            g
              .selectAll('.x')
              .data(x.ticks(12))
              .join(
                (enter) =>
                  enter.append('line').attr('class', 'x').attr('y2', height),
                (update) => update,
                (exit) => exit.remove()
              )
              .attr('x1', (d) => 0.5 + x(d))
              .attr('x2', (d) => 0.5 + x(d))
          )
          .call((g) =>
            g
              .selectAll('.y')
              .data(y.ticks(12 * k))
              .join(
                (enter) =>
                  enter.append('line').attr('class', 'y').attr('x2', width),
                (update) => update,
                (exit) => exit.remove()
              )
              .attr('y1', (d) => 0.5 + y(d))
              .attr('y2', (d) => 0.5 + y(d))
          );

      const y = d3
        .scaleLinear()
        .domain([0, Math.max(...data.map((d) => d.y))])
        .range([height, 0]);
      const x = d3
        .scaleLinear()
        .domain([0, Math.max(...data.map((d) => d.x))])
        .range([0, width]);
      const z = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.group))
        .range(d3.schemeCategory10);

      const xAxis = (g, x) =>
        g
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisTop(x).ticks(12))
          .call((g) => g.select('.domain').attr('display', 'none'));

      const yAxis = (g, y) =>
        g
          .call(d3.axisRight(y).ticks(12 * k))
          .call((g) => g.select('.domain').attr('display', 'none'));

      const gGrid = svg.append('g');

      const gx = svg.append('g');

      const gy = svg.append('g');

      const gDot = svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round');

      const handleTooltip = (selectionGroup) => {
        selectionGroup.each(function () {
          d3.select(this)
            .on('mouseover.tooltip', handleMouseover)
            .on('mouseleave.tooltip', handleMouseleave);
        });
        function handleMouseover() {
          // show/reveal the tooltip, set its contents,
          // style the element being hovered on
          setHovered(d3.select(this).datum())
        }

        function handleMouseleave() {
          // do things like hide the tooltip
          // reset the style of the element being hovered on
          setHovered(null)
        }
      };

      gDot
        .selectAll('path')
        .data(data)
        .join('path')
        .attr('d', (d) => `M${x(d.x)},${y(d.y)}h0`)
        .attr('stroke', (d) => z(d.group))
        .call(handleTooltip);

      const zoom = d3.zoom().scaleExtent([0.5, 32]).on('zoom', zoomed);
      svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

      function zoomed({ transform }) {
        const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
        const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
        gDot.attr('transform', transform).attr('stroke-width', 5 / transform.k);
        gx.call(xAxis, zx);
        gy.call(yAxis, zy);
        gGrid.call(grid, zx, zy);
      }
    },
    [pokemonData.length]
  );

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={thisRef} width={width} height={height}></svg>
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
