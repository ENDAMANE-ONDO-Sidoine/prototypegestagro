import React, { useState } from "react";
import { Box, CssBaseline, Typography } from "@mui/material";
import Sidebar from "../components/farmer/Sidebar";
import Summary from "../components/farmer/Summary";
import Products from "../components/farmer/Products";
import Orders from "../components/farmer/Orders";
import Billing from "../components/farmer/Billing";
import Trends from "../components/farmer/Trends"; // Remplacez Messaging par Trends
import Tools from "../components/farmer/Tools";
import ProductionTracking from "../components/farmer/ProductionTracking";
import StockManagement from "../components/farmer/StockManagement";
import Weather from "../components/farmer/Weather";
import Directory from "../components/farmer/Directory"; // Importez le composant Directory

const DashboardFarmer = () => {
  const [activeTab, setActiveTab] = useState("summary");

  const renderContent = () => {
    switch (activeTab) {
      case "summary":
        return <Summary />;
      case "products":
        return <Products />;
      case "orders":
        return <Orders />;
      case "billing":
        return <Billing />;
      case "trends": // Remplacez "messaging" par "trends"
        return <Trends />;
      case "tools":
        return <Tools />;
      case "production":
        return <ProductionTracking />;
      case "stocks":
        return <StockManagement />;
      case "weather":
        return <Weather />;
      case "directory": // Ajoutez le cas pour l'annuaire
        return <Directory />;
      default:
        return <Summary />;
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <CssBaseline />

      {/* Barre latérale */}
      <Sidebar setActiveTab={setActiveTab} />

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflowY: "auto", // Permettre le défilement vertical si nécessaire
          backgroundColor: "#f5f5f5", // Couleur de fond pour le contenu principal
        }}
      >
        <Typography variant="h4" sx={{ mb: 2 }}>
          Tableau de Bord
        </Typography>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default DashboardFarmer;