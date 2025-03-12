import React from 'react';
import { Grid, Typography, Paper } from '@mui/material';

const GeneralStatistics = ({ totalProductions, totalQuantity, growthRate }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Nombre total de productions enregistrées</Typography>
          <Typography variant="h4">{totalProductions}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Production totale (kg/unités)</Typography>
          <Typography variant="h4">{totalQuantity}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Taux de croissance</Typography>
          <Typography variant="h4">{growthRate}%</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default GeneralStatistics;