import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  LinearProgress,
  useTheme,
  styled,
  Chip,
  Avatar,
  useMediaQuery
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  LocalShipping as OrdersIcon,
  AttachMoney as RevenueIcon,
  Warning as AlertIcon,
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon
} from '@mui/icons-material';

const SummaryCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  height: '100%',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }
}));

const Summary = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const metrics = [
    {
      title: "Stock Total",
      value: "1,428",
      icon: <InventoryIcon />,
      progress: 82,
      subtitle: "1,210 disponibles",
      trend: { value: "+8%", direction: "up" },
      details: "218 en rupture",
      color: theme.palette.primary.main
    },
    {
      title: "Commandes",
      value: "36",
      icon: <OrdersIcon />,
      subtitle: "8 nouvelles",
      trend: { value: "+12%", direction: "up" },
      details: "5 non traitées",
      color: theme.palette.success.main
    },
    {
      title: "Revenus",
      value: "8.2M XAF",
      icon: <RevenueIcon />,
      progress: 65,
      subtitle: "Objectif: 12.5M XAF",
      trend: { value: "+22%", direction: "up" },
      details: "1.8M XAF cette semaine",
      color: theme.palette.info.main
    },
    {
      title: "Alertes",
      value: "9",
      icon: <AlertIcon />,
      subtitle: "3 critiques",
      trend: { value: "+2", direction: "down" },
      details: "5 stocks bas",
      color: theme.palette.warning.main
    }
  ];

  return (
    <Grid container spacing={isMobile ? 1.5 : 3}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
          <SummaryCard sx={{ 
            width: '100%',
            borderLeft: `4px solid ${metric.color}`,
            p: 0
          }}>
            <CardContent sx={{ 
              p: isMobile ? 1.5 : 2,
              '&:last-child': { pb: isMobile ? 1.5 : 2 }
            }}>
              {/* Header */}
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar sx={{ 
                  bgcolor: `${metric.color}20`, 
                  color: metric.color,
                  width: 36, 
                  height: 36,
                  mr: 1.5
                }}>
                  {metric.icon}
                </Avatar>
                <Typography variant="subtitle2" fontWeight="600">
                  {metric.title}
                </Typography>
                <Box sx={{ ml: 'auto' }}>
                  <Chip
                    size="small"
                    icon={metric.trend.direction === "up" ? 
                      <TrendUpIcon fontSize="small" /> : 
                      <TrendDownIcon fontSize="small" />}
                    label={metric.trend.value}
                    sx={{
                      fontSize: '0.7rem',
                      height: '22px',
                      bgcolor: metric.trend.direction === "up" ? 
                        `${theme.palette.success.light}80` : 
                        `${theme.palette.error.light}80`,
                      color: metric.trend.direction === "up" ? 
                        theme.palette.success.dark : 
                        theme.palette.error.dark
                    }}
                  />
                </Box>
              </Box>

              {/* Main Value */}
              <Typography variant="h6" fontWeight="700" mb={0.5}>
                {metric.value}
              </Typography>

              {/* Progress Bar */}
              {metric.progress !== null && (
                <Box mb={1.5}>
                  <LinearProgress 
                    variant="determinate" 
                    value={metric.progress} 
                    sx={{ 
                      height: 6,
                      borderRadius: 3,
                      mb: 0.5,
                      backgroundColor: theme.palette.grey[200],
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor: metric.color,
                      }
                    }} 
                  />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      {metric.subtitle}
                    </Typography>
                    <Typography variant="caption" fontWeight="600">
                      {metric.progress}%
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Details */}
              <Typography variant="caption" color="text.secondary">
                {metric.details}
              </Typography>
            </CardContent>
          </SummaryCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default Summary;