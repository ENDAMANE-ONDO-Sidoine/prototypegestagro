import React from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import {
  Inventory as InventoryIcon,
  LocalShipping as OrdersIcon,
  AttachMoney as RevenueIcon,
  Warning as AlertIcon,
} from '@mui/icons-material';

const Summary = () => {
  return (
    <Grid container spacing={3}>
      {/* Carte 1 : Produits en stock */}
      <Grid item xs={12} md={6} lg={3}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <InventoryIcon sx={{ fontSize: 40, color: '#3f51b5', mr: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Produits en stock
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              1,200
            </Typography>
            <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 5 }} />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              75% de stock disponible
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Carte 2 : Commandes récentes */}
      <Grid item xs={12} md={6} lg={3}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <OrdersIcon sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Commandes récentes
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              15
            </Typography>
            <Typography variant="body2" color="textSecondary">
              5 commandes en attente
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Carte 3 : Chiffre d'affaires */}
      <Grid item xs={12} md={6} lg={3}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <RevenueIcon sx={{ fontSize: 40, color: '#f44336', mr: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Chiffre d'affaires
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              5,750,000 XAF
            </Typography>
            <Typography variant="body2" color="textSecondary">
              +12% ce mois-ci
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Carte 4 : Alertes */}
      <Grid item xs={12} md={6} lg={3}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <AlertIcon sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Alertes
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              3
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Stocks faibles détectés
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Summary;