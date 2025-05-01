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
  Button,
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
  Logout as LogoutIcon,
} from '@mui/icons-material';

const SidebarSupplier = ({ onSelectSection, isOpen, onToggleOpen, isMobile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('summary');

  const handleSelect = (section) => {
    setSelectedSection(section);
    onSelectSection(section);
    if (isMobile) onToggleOpen(false);
  };

  const handleDrawerToggle = () => {
    onToggleOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/');
    window.location.reload();
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      anchor="left"
      open={isOpen}
      onClose={() => onToggleOpen(false)}
      sx={{
        width: isOpen ? 240 : 72,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: isOpen ? 240 : 72,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          boxShadow: '4px 0 10px rgba(0, 0, 0, 0.1)',
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center',
          padding: theme.spacing(0, 2),
          minHeight: '64px !important',
        }}
      >
        {isOpen ? (
          <Typography variant="h6" noWrap sx={{ fontWeight: 'bold' }}>
            GESTAGRO
          </Typography>
        ) : null}
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ color: theme.palette.primary.contrastText }}
        >
          {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
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
                backgroundColor: theme.palette.primary.dark,
              },
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.dark,
              },
              padding: theme.spacing(1, 2),
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.primary.contrastText, minWidth: '40px' }}>
              {item.icon}
            </ListItemIcon>
            {isOpen && (
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
            )}
          </ListItem>
        ))}
      </List>

      {/* Responsive logout button */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 20, 
        left: isOpen ? 20 : '50%',
        right: isOpen ? 20 : 'auto',
        transform: isOpen ? 'none' : 'translateX(-50%)',
        width: isOpen ? 'calc(100% - 40px)' : '40px'
      }}>
        <Button
          onClick={handleLogout}
          variant="contained"
          color="secondary"
          fullWidth={isOpen}
          size={isOpen ? "medium" : "small"}
          sx={{
            minWidth: 0,
            padding: isOpen ? '' : '8px',
            borderRadius: isOpen ? '4px' : '50%',
            '& .MuiButton-startIcon': {
              margin: 0
            }
          }}
          startIcon={isOpen ? null : <LogoutIcon />}
        >
          {isOpen ? 'Déconnexion' : ''}
        </Button>
      </Box>
    </Drawer>
  );
};

export default SidebarSupplier;