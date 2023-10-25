import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Box, Container, Grid, Typography } from '@mui/material';
import Footer from 'src/components/Footer';
import { PokemonData } from 'src/data/PokemonData';

import AccountBalance from './AccountBalance';
import Wallets from './Wallets';
import AccountSecurity from './AccountSecurity';
import WatchList from './WatchList';
import csv2Json from 'csvtojson';
import { useState } from 'react';
import { pokemonData } from '../../../data/PokemonData';
import { Sankey } from './Sankey';
import { string } from 'prop-types';
import { PieChart } from './PieChart';
import { Scatterplot } from './Scatterplot';

function DashboardPokemon() {
  return (
    <>
      <Helmet>
        <title>Pokemon Dashboard</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader />
      </PageTitleWrapper>
      <Container >
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={4}
        >
          <Grid item xs={12} md={2.5}>
            <Box>
              <Typography variant="h2">Sankey diagram</Typography>
              <hr></hr>
              <Typography variant="h5">
                A sankey diagram showing the primary types of new Pokemons
                introduced in each generation.
              </Typography>
              <Box style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <Sankey pokemonData={pokemonData} width={200} height={500} />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box>
              <Typography variant="h2">Pie Chart</Typography>
              <hr></hr>
              <Typography variant="h5">
                A pie chart showing the count of the primary types of pokemons in all generations.
              </Typography>
              <Box style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <PieChart pokemonData={pokemonData} width={460} height={450} />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4.5}>
            <Box>
              <Typography variant="h2">Scatterplot Chart</Typography>
              <hr></hr>
              <Typography variant="h5">
                A scatterplot Chart showing the distribution of pokemons based on their attack and defense. The pokemon of same primary type shares the same color.
              </Typography>
              <Box style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <Scatterplot pokemonData={pokemonData} width={450} height={450} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container >
    </>
  );
}

export default DashboardPokemon;
