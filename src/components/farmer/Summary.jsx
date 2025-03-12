import React from "react";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const Summary = () => {
  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
          <TrendingUpIcon sx={{ color: "#4CAF50", fontSize: 40, marginRight: 1 }} />
          Résumé des activités
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Aperçu des performances et des activités en cours.
        </Typography>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={4}>
            <Box display="flex" alignItems="center">
              <ShoppingCartIcon sx={{ color: "#2196F3", fontSize: 30, marginRight: 1 }} />
              <Typography variant="h6">120</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Transactions</Typography>
          </Grid>
          <Grid item xs={4}>
            <Box display="flex" alignItems="center">
              <MonetizationOnIcon sx={{ color: "#FF9800", fontSize: 30, marginRight: 1 }} />
              <Typography variant="h6">35,000 FCFA</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Revenus</Typography>
          </Grid>
          <Grid item xs={4}>
            <Box display="flex" alignItems="center">
              <ArrowUpwardIcon sx={{ color: "#4CAF50", fontSize: 30, marginRight: 1 }} />
              <Typography variant="h6">+8.5%</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Croissance</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Summary;
