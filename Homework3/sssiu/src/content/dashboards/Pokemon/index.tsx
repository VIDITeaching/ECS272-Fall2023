import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Box, Container, Grid, Typography } from '@mui/material';
import { pokemonData } from '../../../data/PokemonData';
import { Sankey } from './Sankey';
import { Barplot } from './BarChart';
import { Scatterplot } from './Scatterplot';
import { BarplotDatasetTransition } from './BarplotDatasetTransition';

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
              <Typography variant="h2">Bar Chart with Transitions</Typography>
              <hr></hr>
              <Typography variant="h5">
                A bar chart showing the count of the primary types of pokemons in different generations. 
              </Typography>
              <Box style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <BarplotDatasetTransition pokemonData={pokemonData} width={460} height={450} />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4.5}>
            <Box>
              <Typography variant="h2">Zoomable Scatterplot Chart</Typography>
              <hr></hr>
              <Typography variant="h5">
                A zoomable scatterplot Chart showing the distribution of pokemons based on their attack and defense. The pokemon of same primary type shares the same color. 
                Hover over the datapoint to select and show details of the pokemon
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
