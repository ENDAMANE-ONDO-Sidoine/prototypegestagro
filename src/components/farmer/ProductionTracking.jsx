import React, { useState } from 'react';
import { Container, Grid} from '@mui/material';
import GeneralStatistics from './GeneralStatistics';
import ProductionCharts from './ProductionCharts';
import ProductionTable from './ProductionTable';
import ProductionForm from './ProductionForm';
import ExportAnalysis from './ExportAnalysis';

const SuiviProduction = () => {
    const [productions, setProductions] = useState([]);

    const handleAddProduction = (newProduction) => {
      setProductions([...productions, { id: productions.length + 1, ...newProduction }]);
    };
  
    const productionData = [
      { date: '2023-01-01', quantity: 100 },
      { date: '2023-02-01', quantity: 150 },
      // Ajoutez plus de données ici
    ];
  
    const distributionData = [
      { name: 'Type A', value: 400 },
      { name: 'Type B', value: 300 },
      // Ajoutez plus de données ici
    ];
  
    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <GeneralStatistics totalProductions={productions.length} totalQuantity={productions.reduce((sum, p) => sum + p.quantity, 0)} growthRate={10} />
          </Grid>
          <Grid item xs={12}>
            <ProductionCharts productionData={productionData} distributionData={distributionData} />
          </Grid>
          <Grid item xs={12}>
            <ProductionTable productions={productions} />
          </Grid>
          <Grid item xs={12}>
            <ProductionForm onAddProduction={handleAddProduction} />
          </Grid>
          <Grid item xs={12}>
            <ExportAnalysis data={productions} />
          </Grid>
        </Grid>
      </Container>
    );
  };
export default SuiviProduction;