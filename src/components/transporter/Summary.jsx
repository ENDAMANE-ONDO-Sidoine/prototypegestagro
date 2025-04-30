import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  useMediaQuery,
  useTheme,
  styled 
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Assignment as AssignmentIcon,
  MonetizationOn as MonetizationOnIcon,
  AccessTime as TimeIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

// Style personnalisé pour les cartes
const SummaryCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6]
  }
}));

const Summary = ({ setSelectedSection }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Données dynamiques
  const summaryData = [
    {
      id: 1,
      title: "Livraisons en cours",
      value: "5",
      icon: <ShippingIcon fontSize="large" color="primary" />,
      lastUpdate: "10 min",
      color: theme.palette.primary.main,
      action: 'bookings'
    },
    {
      id: 2,
      title: "Nouvelles demandes",
      value: "3",
      icon: <AssignmentIcon fontSize="large" color="secondary" />,
      lastUpdate: "15 min",
      color: theme.palette.secondary.main,
      action: 'offers'
    },
    {
      id: 3,
      title: "Revenus récents",
      value: "750 000 XAF",
      icon: <MonetizationOnIcon fontSize="large" style={{ color: '#4caf50' }} />,
      lastUpdate: "1h",
      color: '#4caf50',
      action: 'payments'
    }
  ];

  const quickActions = [
    { id: 1, label: "Courses", icon: <ShippingIcon />, section: 'bookings' },
    { id: 2, label: "Offres", icon: <AssignmentIcon />, section: 'offers' },
    { id: 3, label: "Paiements", icon: <MonetizationOnIcon />, section: 'payments' },
    { id: 4, label: "Historique", icon: <TimeIcon />, section: 'reports' }
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
        color: theme.palette.text.primary,
        mb: 3,
        fontSize: isMobile ? '1.8rem' : '2.4rem'
      }}>
        Tableau de Bord
      </Typography>

      {/* Cartes d'aperçu */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryData.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <SummaryCard 
              onClick={() => setSelectedSection(item.action)}
              sx={{ 
                cursor: 'pointer',
                borderLeft: `4px solid ${item.color}`
              }}
            >
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 2
                }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.text.secondary
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700,
                        color: item.color,
                        my: 1
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                  {item.icon}
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: theme.palette.text.secondary
                }}>
                  <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">
                    Mise à jour: {item.lastUpdate}
                  </Typography>
                </Box>
              </CardContent>
            </SummaryCard>
          </Grid>
        ))}
      </Grid>

      {/* Navigation rapide */}
      <Box sx={{ 
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        p: 3,
        boxShadow: theme.shadows[1]
      }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          Accès Rapide
          <ArrowIcon sx={{ ml: 1, color: theme.palette.primary.main }} />
        </Typography>
        
        <Grid container spacing={2}>
          {quickActions.map((action) => (
            <Grid item xs={6} sm={4} md={3} key={action.id}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={action.icon}
                onClick={() => setSelectedSection(action.section)}
                sx={{ 
                  py: 2,
                  borderRadius: 1,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {action.label}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Section d'activité récente (optionnelle) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Activité Récente
        </Typography>
        <Card sx={{ p: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Aucune activité récente à afficher
          </Typography>
        </Card>
      </Box>
    </Box>
  );
};

export default Summary;