import * as d3 from "d3";
import { AxisVertical } from "./AxisVertical";
import { PokemonData, pokemonData, Variable } from "../../../data/PokemonData";
import { max } from "date-fns";

const MARGIN = { top: 60, right: 40, bottom: 30, left: 40 };

const COLORS = [
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

type ParallelCoordinateProps = {
  width: number;
  height: number;
  data: PokemonData;
  variables: Variable[];
};

type YScale = d3.ScaleLinear<number, number, never>;

export const ParallelCoordinate = ({
  width,
  height,
  data,
  variables,
}: ParallelCoordinateProps) => {
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const allGroups = [...new Set(data.map((d) => d.Type_1))];

  // Compute a xScale: spread all Y axis along the chart width
  const xScale = d3
    .scalePoint<Variable>()
    .range([0, boundsWidth])
    .domain(variables)
    .padding(0);

  // Compute the yScales: 1 scale per variable
  let yScales: { [name: string]: YScale } = {};
  variables.forEach((variable) => {
    const maxValaue = Math.max(...data.map(d => Number(d[variable])))

    yScales[variable] = d3
      .scaleLinear()
      .range([boundsHeight, 0])
      .domain([0, maxValaue]);
  });

  // Color Scale
  const colorScale = d3.scaleOrdinal<string>().domain(allGroups).range(COLORS);

  // Compute lines
  const lineGenerator = d3.line();

  const allLines = data.map((series, i) => {
    const allCoordinates = variables.map((variable) => {
      const yScale = yScales[variable];
      const x = xScale(variable) ?? 0; // I don't understand the type of scalePoint. IMO x cannot be undefined since I'm passing it something of type Variable.
      const y = yScale(series[variable]);
      const coordinate: [number, number] = [x, y];
      return coordinate;
    });

    const d = lineGenerator(allCoordinates);

    if (!d) {
      return;
    }

    return <path key={i} d={d} stroke={colorScale(series.Type_1)} fill="none" />;
  });

  // Compute Axes
  const allAxes = variables.map((variable, i) => {
    const yScale = yScales[variable];
    return (
      <g key={i} transform={"translate(" + xScale(variable) + ",0)"}>
        <AxisVertical yScale={yScale} pixelsPerTick={40} name={variable} />
      </g>
    );
  });

  return (
    <svg width={width} height={height}>
      <g
        width={boundsWidth}
        height={boundsHeight}
        transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
      >
        {allLines}
        {allAxes}
      </g>
    </svg>
  );
};
