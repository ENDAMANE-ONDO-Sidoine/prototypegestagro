import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  styled,
  Rating,
  Chip
} from '@mui/material';
import { 
  Star as StarIcon,
  LocalShipping as DeliveryIcon,
  MonetizationOn as RevenueIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon 
} from '@mui/icons-material';
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

// Style personnalisé pour les cartes de graphique
const ChartCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '& .chart-container': {
    position: 'relative',
    height: '300px',
    [theme.breakpoints.down('sm')]: {
      height: '250px'
    }
  }
}));

const Reports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Données pour les graphiques
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  
  const deliveriesData = {
    labels: months.slice(0, 7),
    datasets: [{
      label: 'Courses effectuées',
      data: [15, 22, 18, 25, 30, 28, 35],
      backgroundColor: theme.palette.primary.light,
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
      borderRadius: 4
    }]
  };

  const revenueData = {
    labels: months.slice(0, 7),
    datasets: [{
      label: 'Revenus (XAF)',
      data: [750000, 920000, 850000, 1100000, 1250000, 1180000, 1400000],
      borderColor: theme.palette.secondary.main,
      backgroundColor: 'rgba(156, 39, 176, 0.1)',
      borderWidth: 3,
      tension: 0.3,
      fill: true
    }]
  };

  // Options des graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.dataset.label.includes('XAF')) {
              return `${context.dataset.label}: ${new Intl.NumberFormat('fr-FR').format(context.raw)} XAF`;
            }
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Avis des clients avec noms gabonais et avis défavorables
  const customerReviews = [
    { 
      id: 1, 
      text: 'Livraison toujours ponctuelle, je recommande vivement !', 
      client: 'Mbadinga', 
      rating: 5,
      date: '15/01/2025',
      positive: true
    },
    { 
      id: 2, 
      text: 'Retard de 2 heures sur la livraison, mais colis en bon état.', 
      client: 'ONGOUORI', 
      rating: 3,
      date: '12/04/2025',
      positive: false
    },
    { 
      id: 3, 
      text: 'Service impeccable, chauffeur très professionnel.', 
      client: 'Nzengue', 
      rating: 5,
      date: '10/03/2025',
      positive: true
    },
    { 
      id: 4, 
      text: 'Commande endommagée à la réception, déçu.', 
      client: 'Tchitoumba', 
      rating: 2,
      date: '02/05/2025',
      positive: false
    },
    { 
      id: 5, 
      text: 'Excellent rapport qualité-prix, je recommande.', 
      client: 'Obame', 
      rating: 4,
      date: '05/01/2025',
      positive: true
    },
    { 
      id: 6, 
      text: 'Retard important sans explication.', 
      client: 'Bouka', 
      rating: 1,
      date: '03/02/2025',
      positive: false
    },
    { 
      id: 7, 
      text: 'Service rapide et efficace, merci !', 
      client: 'Nguema', 
      rating: 5,
      date: '01/04/2025',
      positive: true
    },
    { 
      id: 8, 
      text: 'Problème de communication avec le chauffeur.', 
      client: 'Mapangou', 
      rating: 2,
      date: '28/03/2025',
      positive: false
    }
  ];

  // Statistiques résumées
  const stats = [
    {
      title: "Courses ce mois",
      value: "35",
      icon: <DeliveryIcon color="primary" />,
      change: "+12% vs mois dernier"
    },
    {
      title: "Revenus ce mois",
      value: "1 400 000 XAF",
      icon: <RevenueIcon color="secondary" />,
      change: "+18% vs mois dernier"
    },
    {
      title: "Satisfaction clients",
      value: "4.2/5",
      icon: <StarIcon style={{ color: '#ffc107' }} />,
      change: "+0.3 vs mois dernier"
    }
  ];

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: isMobile ? 2 : 3,
      backgroundColor: theme.palette.background.default
    }}>
      {/* Titre */}
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 700,
        mb: 3,
        fontSize: isMobile ? '1.8rem' : '2.4rem',
        color: theme.palette.text.primary
      }}>
        Statistiques et Rapports
      </Typography>

      {/* Statistiques rapides */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ 
              height: '100%',
              borderLeft: `4px solid ${
                index === 0 ? theme.palette.primary.main : 
                index === 1 ? theme.palette.secondary.main : '#ffc107'
              }`
            }}>
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700,
                        color: theme.palette.text.primary
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 
                      index === 0 ? theme.palette.primary.light : 
                      index === 1 ? theme.palette.secondary.light : '#fff8e1',
                    width: 56, 
                    height: 56,
                    color: index === 2 ? '#ffc107' : 'inherit'
                  }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <ChartCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activité des courses
              </Typography>
              <Box className="chart-container">
                <Bar 
                  data={deliveriesData} 
                  options={chartOptions} 
                />
              </Box>
            </CardContent>
          </ChartCard>
        </Grid>
        
        <Grid item xs={12} lg={6}>
          <ChartCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Évolution des revenus
              </Typography>
              <Box className="chart-container">
                <Line 
                  data={revenueData} 
                  options={chartOptions} 
                />
              </Box>
            </CardContent>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Avis des clients */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Avis clients
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    icon={<ThumbUpIcon />} 
                    label="Positifs" 
                    color="success" 
                    size="small" 
                  />
                  <Chip 
                    icon={<ThumbDownIcon />} 
                    label="Négatifs" 
                    color="error" 
                    size="small" 
                  />
                </Box>
              </Box>
              
              <List sx={{ 
                backgroundColor: theme.palette.background.paper,
                borderRadius: 1
              }}>
                {customerReviews.map((review) => (
                  <React.Fragment key={review.id}>
                    <ListItem alignItems="flex-start" sx={{ 
                      py: 2,
                      backgroundColor: review.positive 
                        ? 'rgba(76, 175, 80, 0.05)' 
                        : 'rgba(244, 67, 54, 0.05)'
                    }}>
                      <Avatar sx={{ 
                        bgcolor: review.positive ? theme.palette.success.main : theme.palette.error.main, 
                        mr: 2 
                      }}>
                        {review.positive ? <ThumbUpIcon /> : <ThumbDownIcon />}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 500,
                            mb: 0.5
                          }}
                        >
                          {review.text}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          flexWrap: 'wrap'
                        }}>
                          <Rating
                            value={review.rating}
                            readOnly
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mr: 1, fontWeight: 600 }}
                          >
                            {review.client}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                          >
                            • {review.date}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                    {review.id < customerReviews.length && (
                      <Divider variant="inset" component="li" />
                    )}
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