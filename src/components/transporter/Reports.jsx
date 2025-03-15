import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Enregistrer les composants de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  // Données pour le graphique des courses effectuées
  const coursesData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
    datasets: [
      {
        label: 'Courses effectuées',
        data: [12, 19, 3, 5, 2, 3, 15],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Données pour le graphique des revenus générés
  const revenueData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
    datasets: [
      {
        label: 'Revenus (XAF)',
        data: [500000, 600000, 450000, 700000, 550000, 800000, 900000],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
      },
    ],
  };

  // Avis des clients
  const customerReviews = [
    { id: 1, text: 'Service rapide et efficace !', client: 'Client A', rating: 5 },
    { id: 2, text: 'Très bon rapport qualité-prix.', client: 'Client B', rating: 4 },
    { id: 3, text: 'Livraison toujours à temps.', client: 'Client C', rating: 5 },
    { id: 4, text: 'Je recommande ce service.', client: 'Client D', rating: 4 },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Titre */}
      <Typography variant="h4" gutterBottom>
        Rapports
      </Typography>

      {/* Graphiques et statistiques */}
      <Grid container spacing={3}>
        {/* Graphique des courses effectuées */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Nombre de courses effectuées par mois
              </Typography>
              <Bar data={coursesData} />
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique des revenus générés */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenus générés par mois
              </Typography>
              <Line data={revenueData} />
            </CardContent>
          </Card>
        </Grid>

        {/* Avis des clients */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Avis des clients
              </Typography>
              <List>
                {customerReviews.map((review) => (
                  <React.Fragment key={review.id}>
                    <ListItem alignItems="flex-start">
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <StarIcon />
                      </Avatar>
                      <ListItemText
                        primary={review.text}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              - {review.client}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              {[...Array(review.rating)].map((_, index) => (
                                <StarIcon key={index} sx={{ color: 'gold', fontSize: '1rem' }} />
                              ))}
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;