import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  LocalShipping as ShippingIcon,
  MonetizationOn as PaymentsIcon,
  AssignmentTurnedIn as ReservationsIcon, // Icône mise à jour
  Assignment as ReportsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const SidebarTransporter = ({ isSidebarOpen, toggleSidebar, handleLogout, setSelectedSection }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Détecter les écrans mobiles

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'} // Utiliser un Drawer temporaire sur mobile
      open={isSidebarOpen}
      onClose={toggleSidebar} // Fermer la sidebar lors du clic en dehors sur mobile
      sx={{
        width: isSidebarOpen ? 240 : isMobile ? 0 : 60, // Largeur réduite sur mobile
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isSidebarOpen ? 240 : isMobile ? 0 : 60, // Largeur réduite sur mobile
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: 'width 0.3s',
          background: 'linear-gradient(180deg, #1976d2 0%, #115293 100%)', // Nouveau dégradé bleu
          color: '#fff', // Texte en blanc
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)', // Ombre légère
        },
      }}
    >
      <div>
        {/* Titre de la sidebar et bouton de dépliement */}
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isSidebarOpen && (
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff' }}>
              GESTAGRO
            </Typography>
          )}
          <IconButton onClick={toggleSidebar} sx={{ color: '#fff' }}>
            {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Toolbar>

        {/* Liste des sections */}
        {isSidebarOpen && (
          <List>
            {[
              { text: 'Résumé', icon: <HomeIcon sx={{ color: '#fff' }} />, section: 'summary' },
              { text: 'Offres', icon: <ShippingIcon sx={{ color: '#fff' }} />, section: 'offers' },
              { text: 'Réservations', icon: <ReservationsIcon sx={{ color: '#fff' }} />, section: 'bookings' }, // Icône mise à jour
              { text: 'Paiements', icon: <PaymentsIcon sx={{ color: '#fff' }} />, section: 'payments' },
              { text: 'Rapports', icon: <ReportsIcon sx={{ color: '#fff' }} />, section: 'reports' },
            ].map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  setSelectedSection(item.section);
                  if (isMobile) toggleSidebar(); // Fermer la sidebar après un clic sur mobile
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Effet de survol
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Bouton de déconnexion */}
        {isSidebarOpen && (
          <Box sx={{ mt: 'auto', p: 2 }}>
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              fullWidth
              onClick={handleLogout}
              sx={{
                backgroundColor: '#fff',
                color: '#115293',
                '&:hover': {
                  backgroundColor: '#f8f9fa',
                },
              }}
            >
              Déconnexion
            </Button>
          </Box>
        )}
      </div>
    </Drawer>
  );
};

export default SidebarTransporter;