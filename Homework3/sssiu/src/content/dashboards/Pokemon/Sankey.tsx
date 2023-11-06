import { scaleOrdinal } from 'd3';
import { sankey, sankeyJustify, sankeyLinkHorizontal } from 'd3-sankey';
import { PokemonData } from 'src/data/PokemonData';

const MARGIN_Y = 25;
const MARGIN_X = 5;
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

type Data = {
  nodes: { name: string }[];
  links: { source: string; target: string; value: number }[];
};

type SankeyProps = {
  width: number;
  height: number;
  pokemonData: PokemonData;
};

export const Sankey = ({ width, height, pokemonData }: SankeyProps) => {
  // Create an array of items with counts for each combination of generation and type
  const result: { source: string; target: string; value: number }[] = [];

  // Define the generations and types you want to count
  const generationsToCount: string[] = Array.from(
    new Set(pokemonData.map((p) => p.Generation.toString()))
  );
  const typesToCount: string[] = Array.from(
    new Set(pokemonData.map((p) => p.Type_1))
  );

  generationsToCount.forEach((generation) => {
    typesToCount.forEach((type) => {
      const count = pokemonData.filter(
        (pokemon) =>
          pokemon.Generation.toString() === generation &&
          pokemon.Type_1 === type
      ).length;
      if (count > 0)
        result.push({ source: generation, target: type, value: count });
    });
  });

  const points = [
    ...generationsToCount.map((g2c) => ({ name: g2c })),
    ...typesToCount.map((t2c) => ({ name: t2c }))
  ];

  const data = {nodes: points, links: result};

  const allGroups = [...new Set(data.nodes.map((d) => d.name))].sort();
  const colorScale = scaleOrdinal<string>().domain(allGroups).range(COLORS);

  // Set the sankey diagram properties
  const sankeyGenerator = sankey() // TODO: find how to type the sankey() function
    .nodeWidth(26)
    .nodePadding(10)
    .extent([
      [MARGIN_X, MARGIN_Y],
      [width - MARGIN_X, height - MARGIN_Y]
    ])
    .nodeId((node) => node.name) // Accessor function: how to retrieve the id that defines each node. This id is then used for the source and target props of links
    .nodeAlign(sankeyJustify); // Algorithm used to decide node position

  // Compute nodes and links positions
  const { nodes, links } = sankeyGenerator(data);

  //
  // Draw the nodes
  //
  const allNodes = nodes.map((node) => {
    return (
      <g key={node.index}>
        <rect
          height={node.y1 - node.y0}
          width={sankeyGenerator.nodeWidth()}
          x={node.x0}
          y={node.y0}
          stroke={'black'}
          fill={colorScale(node.name)}
          fillOpacity={1}
          rx={0.9}
        />
      </g>
    );
  });

  //
  // Draw the links
  //
  const allLinks = links.map((link, i) => {
    const linkGenerator = sankeyLinkHorizontal();
    const path = linkGenerator(link);

    return (
      <path
        key={i}
        d={path}
        stroke={colorScale(link.source.name)}
        fill="none"
        strokeOpacity={0.3}
        strokeWidth={link.width}
      />
    );
  });

  //
  // Draw the Labels
  //
  const allLabels = nodes.map((node, i) => {
    return (
      <text
        key={i}
        x={node.x0 < width / 2 ? node.x1 + 6 : node.x0 - 6}
        y={(node.y1 + node.y0) / 2}
        dy="0.35rem"
        textAnchor={node.x0 < width / 2 ? 'start' : 'end'}
        fontSize={12}
      >
        {node.name}
      </text>
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        {allLinks}
        {allNodes}
        {allLabels}
      </svg>
    </div>
  );
};
