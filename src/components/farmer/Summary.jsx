import React from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box,
  useTheme,
  styled 
} from "@mui/material";
import { 
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MonetizationOnIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowUpward as ArrowUpwardIcon,
  People as PeopleIcon,
  LocalShipping as DeliveryIcon,
  Receipt as InvoiceIcon
} from "@mui/icons-material";

// Styles personnalisés
const StatCard = styled(Card)(({ theme }) => ({
  minWidth: 275,
  boxShadow: theme.shadows[4],
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginLeft: theme.spacing(1),
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
}));

const Summary = () => {
  const theme = useTheme();

  const stats = [
    {
      icon: <ShoppingCartIcon sx={{ color: theme.palette.primary.main, fontSize: 30 }} />,
      value: "245",
      label: "Commandes",
      change: "+12% ce mois",
      changeColor: theme.palette.success.main
    },
    {
      icon: <MonetizationOnIcon sx={{ color: theme.palette.warning.main, fontSize: 30 }} />,
      value: "1,245,000 FCFA",
      label: "Revenus",
      change: "+8.5% ce mois",
      changeColor: theme.palette.success.main
    },
    {
      icon: <PeopleIcon sx={{ color: theme.palette.info.main, fontSize: 30 }} />,
      value: "48",
      label: "Nouveaux clients",
      change: "+5% ce mois",
      changeColor: theme.palette.success.main
    },
    {
      icon: <DeliveryIcon sx={{ color: theme.palette.secondary.main, fontSize: 30 }} />,
      value: "92%",
      label: "Livraisons réussies",
      change: "+2% ce mois",
      changeColor: theme.palette.success.main
    },
    {
      icon: <InvoiceIcon sx={{ color: theme.palette.error.main, fontSize: 30 }} />,
      value: "15",
      label: "Factures en attente",
      change: "-3% ce mois",
      changeColor: theme.palette.error.main
    }
  ];

  return (
    <StatCard>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <TrendingUpIcon sx={{ 
            color: theme.palette.success.main, 
            fontSize: 40, 
            mr: 2 
          }} />
          <Box>
            <Typography variant="h5" component="div" fontWeight="bold">
              Tableau de bord
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aperçu des performances et activités récentes
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <Box 
                display="flex" 
                flexDirection="column" 
                height="100%"
                p={2}
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                <Box display="flex" alignItems="center" mb={1}>
                  {stat.icon}
                  <StatValue variant="h6">
                    {stat.value}
                  </StatValue>
                </Box>
                <StatLabel variant="body2">
                  {stat.label}
                </StatLabel>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: stat.changeColor,
                    display: 'flex',
                    alignItems: 'center',
                    mt: 1
                  }}
                >
                  <ArrowUpwardIcon sx={{ 
                    fontSize: 14,
                    transform: stat.change.startsWith('+') ? 'none' : 'rotate(180deg)'
                  }} />
                  {stat.change}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </StatCard>
  );
};

export default Summary;