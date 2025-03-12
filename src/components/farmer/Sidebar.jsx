import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Toolbar, Typography, Box, IconButton } from "@mui/material";
import { Dashboard, ShoppingCart, Inventory, Receipt, TrendingUp, Build, ExpandLess, ExpandMore, Grass, Storage, Cloud, Menu, Contacts } from "@mui/icons-material";
import LogoutButton from "../../components/LogoutButton"; // Chemin corrigé

const Sidebar = ({ setActiveTab }) => {
  const [openTools, setOpenTools] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // État pour gérer l'ouverture/fermeture de la barre latérale
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    navigate("/");
    window.location.reload();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isSidebarOpen ? 260 : 60,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isSidebarOpen ? 260 : 60,
          backgroundColor: "#1B5E20",
          color: "#FFFFFF",
          borderRight: "2px solid #fff",
          transition: "width 0.3s ease",
        },
      }}
    >
      <Toolbar>
        <IconButton onClick={toggleSidebar} sx={{ color: "white" }}>
          <Menu />
        </IconButton>
        {isSidebarOpen && (
          <Typography variant="h6" sx={{ fontWeight: "bold", mx: "auto" }}>
            GESTAGRO
          </Typography>
        )}
      </Toolbar>

      <List>
        <ListItemButton onClick={() => setActiveTab("summary")} sx={{ "&:hover": { backgroundColor: "#3B82F6" } }}>
          <ListItemIcon>
            <Dashboard sx={{ color: "white" }} />
          </ListItemIcon>
          {isSidebarOpen && <ListItemText primary="RÉSUMÉ" />}
        </ListItemButton>

        <ListItemButton onClick={() => setActiveTab("products")} sx={{ "&:hover": { backgroundColor: "#3B82F6" } }}>
          <ListItemIcon>
            <ShoppingCart sx={{ color: "white" }} />
          </ListItemIcon>
          {isSidebarOpen && <ListItemText primary="PRODUITS" />}
        </ListItemButton>

        <ListItemButton onClick={() => setActiveTab("orders")} sx={{ "&:hover": { backgroundColor: "#3B82F6" } }}>
          <ListItemIcon>
            <Inventory sx={{ color: "white" }} />
          </ListItemIcon>
          {isSidebarOpen && <ListItemText primary="COMMANDES" />}
        </ListItemButton>

        <ListItemButton onClick={() => setActiveTab("billing")} sx={{ "&:hover": { backgroundColor: "#3B82F6" } }}>
          <ListItemIcon>
            <Receipt sx={{ color: "white" }} />
          </ListItemIcon>
          {isSidebarOpen && <ListItemText primary="FACTURATION" />}
        </ListItemButton>

        {/* Remplacement de Messagerie par Tendances */}
        <ListItemButton onClick={() => setActiveTab("trends")} sx={{ "&:hover": { backgroundColor: "#3B82F6" } }}>
          <ListItemIcon>
            <TrendingUp sx={{ color: "white" }} /> {/* Utilisation de l'icône TrendingUp */}
          </ListItemIcon>
          {isSidebarOpen && <ListItemText primary="TENDANCES" />}
        </ListItemButton>

        {/* Ajout de l'annuaire */}
        <ListItemButton onClick={() => setActiveTab("directory")} sx={{ "&:hover": { backgroundColor: "#3B82F6" } }}>
          <ListItemIcon>
            <Contacts sx={{ color: "white" }} /> {/* Utilisation de l'icône Contacts */}
          </ListItemIcon>
          {isSidebarOpen && <ListItemText primary="ANNUAIRE" />}
        </ListItemButton>

        {/* Outils - Liste déroulante */}
        <ListItemButton onClick={() => setOpenTools(!openTools)} sx={{ "&:hover": { backgroundColor: "#3B82F6" } }}>
          <ListItemIcon>
            <Build sx={{ color: "white" }} />
          </ListItemIcon>
          {isSidebarOpen && <ListItemText primary="OUTILS" />}
          {isSidebarOpen && (openTools ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>

        <Collapse in={openTools} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4, "&:hover": { backgroundColor: "#60A5FA" } }} onClick={() => setActiveTab("production")}>
              <ListItemIcon>
                <Grass sx={{ color: "white" }} />
              </ListItemIcon>
              {isSidebarOpen && <ListItemText primary="SUIVI DE PRODUCTION" />}
            </ListItemButton>

            <ListItemButton sx={{ pl: 4, "&:hover": { backgroundColor: "#60A5FA" } }} onClick={() => setActiveTab("stocks")}>
              <ListItemIcon>
                <Storage sx={{ color: "white" }} />
              </ListItemIcon>
              {isSidebarOpen && <ListItemText primary="GESTION DES STOCKS" />}
            </ListItemButton>

            <ListItemButton sx={{ pl: 4, "&:hover": { backgroundColor: "#60A5FA" } }} onClick={() => setActiveTab("weather")}>
              <ListItemIcon>
                <Cloud sx={{ color: "white" }} />
              </ListItemIcon>
              {isSidebarOpen && <ListItemText primary="MÉTÉO" />}
            </ListItemButton>
          </List>
        </Collapse>
      </List>

      {/* Bouton de déconnexion dans le Sidebar */}
      <Box sx={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
        <LogoutButton handleLogout={handleLogout} />
      </Box>
    </Drawer>
  );
};

export default Sidebar;