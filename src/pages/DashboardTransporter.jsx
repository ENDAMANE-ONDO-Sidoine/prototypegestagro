import React, { useState } from 'react';
import { Box, CssBaseline, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Composants pour chaque section
import Summary from '../components/transporter/Summary';
import Offers from '../components/transporter/Offers';
import Bookings from '../components/transporter/Bookings';
import Payments from '../components/transporter/Payments';
import Reports from '../components/transporter/Reports';

// Composant Sidebar
import SidebarTransporter from '../components/transporter/SidebarTransporter';

const DashboardTransporter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Détecter les écrans mobiles
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile); // Fermer la sidebar par défaut sur mobile
  const [selectedSection, setSelectedSection] = useState('summary'); // État pour la section active
  const navigate = useNavigate(); // Pour la redirection

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    // Rediriger vers la page d'accueil
    navigate('/');
  };

  const renderSection = () => {
    switch (selectedSection) {
      case 'summary':
        return <Summary setSelectedSection={setSelectedSection} />;
      case 'offers':
        return <Offers />;
      case 'bookings':
        return <Bookings />;
      case 'payments':
        return <Payments />;
      case 'reports':
        return <Reports />;
      default:
        return <Summary setSelectedSection={setSelectedSection} />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* Sidebar */}
      <SidebarTransporter
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        handleLogout={handleLogout}
        setSelectedSection={setSelectedSection}
      />

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isMobile ? 2 : 3, // Réduire l'espacement sur mobile
          width: { sm: `calc(100% - ${isSidebarOpen ? 240 : 0}px)` },
          transition: 'margin 0.3s',
          ml: { sm: isSidebarOpen ? 0 : `-${240}px` }, // Décaler le contenu lorsque la sidebar est réduite
        }}
      >
        {/* Bouton pour réduire/étendre la sidebar (visible uniquement sur mobile) */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleSidebar}
            sx={{ mb: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Afficher la section sélectionnée */}
        {renderSection()}
      </Box>
    </Box>
  );
};

export default DashboardTransporter;