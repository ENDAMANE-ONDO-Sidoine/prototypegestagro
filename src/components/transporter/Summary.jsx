import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Assignment as AssignmentIcon,
  MonetizationOn as MonetizationOnIcon,
} from '@mui/icons-material';

const Summary = ({ setSelectedSection }) => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Titre */}
      <Typography variant="h4" gutterBottom>
        Résumé
      </Typography>

      {/* Cartes d'aperçu */}
      <Grid container spacing={3}>
        {/* Livraisons en cours */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShippingIcon fontSize="large" sx={{ mr: 2 }} />
                <Typography variant="h6">Livraisons en cours</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                5
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dernière mise à jour : 10 min
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Nouvelles demandes */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon fontSize="large" sx={{ mr: 2 }} />
                <Typography variant="h6">Nouvelles demandes</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                3
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dernière mise à jour : 15 min
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenus récents */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MonetizationOnIcon fontSize="large" sx={{ mr: 2 }} />
                <Typography variant="h6">Revenus récents</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                500 000 XAF
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dernière mise à jour : 1h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation simplifiée */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Navigation rapide
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<ShippingIcon />}
              sx={{ py: 2 }}
              onClick={() => setSelectedSection('bookings')} // Redirige vers "Réservations"
            >
              Courses
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AssignmentIcon />}
              sx={{ py: 2 }}
              onClick={() => setSelectedSection('offers')} // Redirige vers "Offres"
            >
              Offres
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<MonetizationOnIcon />}
              sx={{ py: 2 }}
              onClick={() => setSelectedSection('payments')} // Redirige vers "Paiements"
            >
              Paiements
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Summary;
