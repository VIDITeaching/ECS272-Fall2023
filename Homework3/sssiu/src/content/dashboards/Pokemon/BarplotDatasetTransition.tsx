import { useState } from "react";

import { PokemonData } from 'src/data/PokemonData';
import { Barplot } from "./BarChart";

const BUTTONS_HEIGHT = 50;

type BarplotDatasetTransitionProps = {
  width: number;
  height: number;
  pokemonData: PokemonData
};

const buttonStyle = {
  border: "1px solid #9a6fb0",
  borderRadius: "3px",
  padding: "4px 8px",
  margin: "10px 2px",
  fontSize: 14,
  color: "#9a6fb0",
  opacity: 0.7,
};

export const BarplotDatasetTransition = ({
  width,
  height,
  pokemonData
}: BarplotDatasetTransitionProps) => {
  const dataGen1 = pokemonData.filter(d => d.Generation == 1);
  const dataGen2 = pokemonData.filter(d => d.Generation == 2);
  const dataGen3 = pokemonData.filter(d => d.Generation == 3);
  const dataGen4 = pokemonData.filter(d => d.Generation == 4);
  const dataGen5 = pokemonData.filter(d => d.Generation == 5);
  const dataGen6 = pokemonData.filter(d => d.Generation == 6);


  const [selectedData, setSelectedData] = useState(dataGen1);

  return (
    <div>
      <div style={{ height: BUTTONS_HEIGHT }}>
        <button style={buttonStyle} onClick={() => setSelectedData(dataGen1)}>
          Gen 1
        </button>
        <button style={buttonStyle} onClick={() => setSelectedData(dataGen2)}>
          Gen 2
        </button>
        <button style={buttonStyle} onClick={() => setSelectedData(dataGen3)}>
          Gen 3
        </button>
        <button style={buttonStyle} onClick={() => setSelectedData(dataGen4)}>
          Gen 4
        </button>
        <button style={buttonStyle} onClick={() => setSelectedData(dataGen5)}>
          Gen 5
        </button>
        <button style={buttonStyle} onClick={() => setSelectedData(dataGen6)}>
          Gen 6
        </button>
      </div>

      <Barplot
        width={width}
        height={height - BUTTONS_HEIGHT}
        pokemonData={selectedData}
      />
    </div>
  );
};
