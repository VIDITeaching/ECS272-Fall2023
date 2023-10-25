import { number } from 'prop-types';
import pokemonDataJson from './pokemon_data.json';

export type Variable =
  | 'Number'
  | 'Name'
  | 'Type_1'
  | 'Type_2'
  | 'Total'
  | 'HP'
  | 'Attack'
  | 'Defense'
  | 'Sp_Atk'
  | 'Sp_Def'
  | 'Speed'
  | 'Generation'
  | 'isLegendary'
  | 'Color'
  | 'hasGender'
  | 'Pr_Male'
  | 'Egg_Group_1'
  | 'Egg_Group_2'
  | 'hasMegaEvolution'
  | 'Height_m'
  | 'Weight_kg'
  | 'Catch_Rate'
  | 'Body_Style';

export type PokemonDataItem = {
  Number: number;
  Name: string;
  Type_1: string;
  Type_2: string;
  Total: number;
  HP: number;
  Attack: number;
  Defense: number;
  Sp_Atk: number;
  Sp_Def: number;
  Speed: number;
  Generation: number;
  isLegendary: boolean;
  Color: string;
  hasGender: boolean;
  Pr_Male: number;
  Egg_Group_1: string;
  Egg_Group_2: string;
  hasMegaEvolution: boolean;
  Height_m: number;
  Weight_kg: number;
  Catch_Rate: number;
  Body_Style: string;
};

export type PokemonData = PokemonDataItem[];

export const pokemonData: PokemonData = pokemonDataJson.map((jsonData) => ({
  ...jsonData,
  Number: Number(jsonData.Number),
  Total: Number(jsonData.Total),
  HP: Number(jsonData.HP),
  Attack: Number(jsonData.Attack),
  Defense: Number(jsonData.Defense),
  Sp_Atk: Number(jsonData.Sp_Atk),
  Sp_Def: Number(jsonData.Sp_Def),
  Speed: Number(jsonData.Speed),
  Generation: Number(jsonData.Generation),
  isLegendary: Boolean(jsonData.isLegendary),
  hasGender: Boolean(jsonData.hasGender),
  Pr_Male: Number(jsonData.Pr_Male),
  hasMegaEvolution: Boolean(jsonData.hasMegaEvolution),
  Height_m: Number(jsonData.Height_m),
  Weight_kg: Number(jsonData.Weight_kg),
  Catch_Rate: Number(jsonData.Catch_Rate)
}));
