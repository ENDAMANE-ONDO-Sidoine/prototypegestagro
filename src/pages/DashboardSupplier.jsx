import React, { useState } from 'react';
import SidebarSupplier from '../components/supplier/SidebarSupplier';
import Summary from '../components/supplier/Summary';
import ProductManagement from '../components/supplier/ProductManagement';
import OrderTracking from '../components/supplier/OrderTracking';
import StockManagement from '../components/supplier/StockManagement';
import CustomerManagement from '../components/supplier/CustomerManagement';
import SalesAnalysis from '../components/supplier/SalesAnalysis';
import { Grid, useMediaQuery, useTheme, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const DashboardSupplier = () => {
  const [selectedSection, setSelectedSection] = useState('summary');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  const renderSection = () => {
    switch (selectedSection) {
      case 'summary':
        return <Summary />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderTracking />;
      case 'stock':
        return <StockManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'sales':
        return <SalesAnalysis />;
      default:
        return <Summary />;
    }
  };

  return (
    <>
      {/* Bouton menu pour mobile */}
      {isMobile && !isSidebarOpen && (
        <IconButton
          onClick={() => setIsSidebarOpen(true)}
          sx={{
            position: 'fixed',
            top: 10,
            left: 10,
            zIndex: 1200,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Grid container>
        {/* Sidebar - position fixed sur desktop */}
        <Grid 
          item 
          xs={12} 
          md={isSidebarOpen ? 2 : 1}
          sx={{
            position: { md: 'fixed' },
            height: { md: '100vh' },
            zIndex: 1,
          }}
        >
          <SidebarSupplier 
            onSelectSection={setSelectedSection} 
            isOpen={isSidebarOpen} 
            onToggleOpen={setIsSidebarOpen}
            isMobile={isMobile}
          />
        </Grid>

        {/* Contenu principal - avec marge pour la sidebar */}
        <Grid 
          item 
          xs={12} 
          md={isSidebarOpen ? 10 : 11}
          sx={{
            ml: { md: isSidebarOpen ? '16.666667%' : '8.333333%' },
            padding: isMobile ? '10px' : '20px',
            marginTop: isMobile && !isSidebarOpen ? '50px' : 0,
            width: { md: isSidebarOpen ? '83.333333%' : '91.666667%' },
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {renderSection()}
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardSupplier;