import React, { useState } from "react";
import { Box, CssBaseline, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../components/farmer/Sidebar";
import Summary from "../components/farmer/Summary";
import Products from "../components/farmer/Products";
import Orders from "../components/farmer/Orders";
import Billing from "../components/farmer/Billing";
import Trends from "../components/farmer/Trends";
import Tools from "../components/farmer/Tools";
import ProductionTracking from "../components/farmer/ProductionTracking";
import StockManagement from "../components/farmer/StockManagement";
import Weather from "../components/farmer/Weather";
import Directory from "../components/farmer/Directory";
import News from "../components/farmer/News";
import Training from "../components/farmer/Training";

const DashboardFarmer = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

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
      case "trends":
        return <Trends />;
      case "tools":
        return <Tools />;
      case "production":
        return <ProductionTracking />;
      case "stocks":
        return <StockManagement />;
      case "weather":
        return <Weather />;
      case "directory":
        return <Directory />;
      case "news":
        return <News />;
      case "training":
        return <Training />;
      default:
        return <Summary />;
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <CssBaseline />

      <Sidebar 
        setActiveTab={setActiveTab} 
        isMobile={isMobile} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          overflowY: "auto",
          backgroundColor: "#f5f5f5",
          marginLeft: { 
            xs: sidebarOpen ? '260px' : 0,
            sm: 0
          },
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setSidebarOpen(true)}
            edge="start"
            sx={{ 
              mr: 2,
              color: 'primary.main',
              backgroundColor: 'rgba(255,255,255,0.9)',
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: 1200,
              boxShadow: 3,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,1)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        {renderContent()}
      </Box>
    </Box>
  );
};

export default DashboardFarmer;