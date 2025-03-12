import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
  IconButton,
  useTheme,
  Box,
  Button, // Ajout d'un bouton pour remplacer LogoutButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const SidebarSupplier = ({ onSelectSection }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // États pour gérer l'ouverture/fermeture de la sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedSection, setSelectedSection] = useState('summary');

  // Fonction pour gérer la sélection d'une section
  const handleSelect = (section) => {
    setSelectedSection(section);
    onSelectSection(section);
  };

  // Fonction pour basculer l'état de la sidebar
  const handleDrawerToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/'); // Redirection vers la page d'accueil
    window.location.reload(); // Rechargement de la page
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      open={isSidebarOpen}
      sx={{
        width: isSidebarOpen ? 240 : 72, // Largeur de la sidebar
        flexShrink: 0,
        whiteSpace: 'nowrap',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: isSidebarOpen ? 240 : 72, // Largeur du papier (contenu de la sidebar)
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backgroundColor: theme.palette.primary.main, // Fond coloré
          color: theme.palette.primary.contrastText, // Couleur du texte
          boxShadow: '4px 0 10px rgba(0, 0, 0, 0.1)', // Ombre portée
        },
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarOpen ? 'space-between' : 'center',
          padding: theme.spacing(0, 2),
        }}
      >
        {isSidebarOpen && (
          <Typography variant="h6" noWrap sx={{ fontWeight: 'bold' }}>
            GESTAGRO
          </Typography>
        )}
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ color: theme.palette.primary.contrastText }}
          aria-label={isSidebarOpen ? 'Fermer la sidebar' : 'Ouvrir la sidebar'}
        >
          {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Toolbar>
      <Divider sx={{ backgroundColor: theme.palette.primary.light }} />
      <List>
        {[
          { text: 'Résumé', icon: <DashboardIcon />, section: 'summary' },
          { text: 'Gestion des produits', icon: <InventoryIcon />, section: 'products' },
          { text: 'Suivi des commandes', icon: <LocalShippingIcon />, section: 'orders' },
          { text: 'Gestion des stocks', icon: <StorageIcon />, section: 'stock' },
          { text: 'Gestion des clients', icon: <PeopleIcon />, section: 'customers' },
          { text: 'Analyse des ventes', icon: <BarChartIcon />, section: 'sales' },
        ].map((item) => (
          <ListItem
            button
            key={item.section}
            selected={selectedSection === item.section}
            onClick={() => handleSelect(item.section)}
            sx={{
              '&:hover': {
                backgroundColor: '#1976d2', // Couleur bleue au survol
              },
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.dark, // Couleur de fond pour l'élément sélectionné
              },
              padding: theme.spacing(1, 2), // Réduction de l'espacement
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.primary.contrastText, minWidth: '40px' }}>
              {item.icon}
            </ListItemIcon>
            {isSidebarOpen && (
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: 'bold' }} // Texte en gras
              />
            )}
          </ListItem>
        ))}
      </List>

      {/* Bouton de déconnexion dans le Sidebar */}
      <Box sx={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
        <Button
          onClick={handleLogout}
          variant="contained"
          color="secondary"
          fullWidth
        >
          Déconnexion
        </Button>
      </Box>
    </Drawer>
  );
};

export default SidebarSupplier;