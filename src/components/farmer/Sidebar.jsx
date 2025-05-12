import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Collapse, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton 
} from "@mui/material";
import { 
  Dashboard, 
  ShoppingCart, 
  Inventory, 
  Receipt, 
  TrendingUp, 
  Build, 
  ExpandLess, 
  ExpandMore, 
  Grass, 
  Storage, 
  Cloud, 
  Menu, 
  Contacts,
  Article as ArticleIcon,
  School as SchoolIcon
} from "@mui/icons-material";
import LogoutButton from "../../components/LogoutButton";

const Sidebar = ({ setActiveTab, isMobile, sidebarOpen, setSidebarOpen }) => {
  const [openTools, setOpenTools] = React.useState(false);
  const [openInfo, setOpenInfo] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    navigate("/");
    window.location.reload();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { tab: "summary", icon: <Dashboard />, text: "RESUME" },
    { tab: "products", icon: <ShoppingCart />, text: "MES VENTES" },
    { tab: "orders", icon: <Inventory />, text: "COMMANDES" },
    { tab: "billing", icon: <Receipt />, text: "FACTURATION" },
    { tab: "trends", icon: <TrendingUp />, text: "TENDANCES" },
    { tab: "directory", icon: <Contacts />, text: "ANNUAIRE" },
  ];

  const toolItems = [
    { tab: "production", icon: <Grass />, text: "SUIVI DE PRODUCTION" },
    { tab: "stocks", icon: <Storage />, text: "GESTION DES STOCKS" },
    { tab: "weather", icon: <Cloud />, text: "MÉTÉO" },
  ];

  const infoItems = [
    { tab: "news", icon: <ArticleIcon />, text: "ACTUALITÉS" },
    { tab: "training", icon: <SchoolIcon />, text: "FORMATIONS" },
  ];

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      sx={{
        width: sidebarOpen ? 260 : isMobile ? 0 : 60,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: sidebarOpen ? 260 : isMobile ? 0 : 60,
          backgroundColor: "#1B5E20",
          color: "#FFFFFF",
          borderRight: "2px solid #fff",
          overflowX: 'hidden',
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          boxSizing: 'border-box',
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <Toolbar>
        <IconButton onClick={toggleSidebar} sx={{ color: "white" }}>
          <Menu />
        </IconButton>
        {sidebarOpen && (
          <Typography variant="h6" noWrap sx={{ fontWeight: "bold", mx: "auto" }}>
            GESTAGRO
          </Typography>
        )}
      </Toolbar>

      <List>
        {menuItems.map((item) => (
          <ListItemButton 
            key={item.tab}
            onClick={() => {
              setActiveTab(item.tab);
              if (isMobile) setSidebarOpen(false);
            }}
            sx={{ 
              "&:hover": { backgroundColor: "#3B82F6" },
              minHeight: 48,
              justifyContent: sidebarOpen ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon sx={{
              minWidth: 0,
              mr: sidebarOpen ? 3 : 'auto',
              justifyContent: 'center',
              color: "white",
            }}>
              {item.icon}
            </ListItemIcon>
            {sidebarOpen && <ListItemText primary={item.text} />}
          </ListItemButton>
        ))}

        {/* Section OUTILS */}
        <ListItemButton 
          onClick={() => setOpenTools(!openTools)} 
          sx={{ 
            "&:hover": { backgroundColor: "#3B82F6" },
            minHeight: 48,
            justifyContent: sidebarOpen ? 'initial' : 'center',
            px: 2.5,
          }}
        >
          <ListItemIcon sx={{
            minWidth: 0,
            mr: sidebarOpen ? 3 : 'auto',
            justifyContent: 'center',
            color: "white",
          }}>
            <Build />
          </ListItemIcon>
          {sidebarOpen && <ListItemText primary="OUTILS" />}
          {sidebarOpen && (openTools ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>

        <Collapse in={openTools && sidebarOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {toolItems.map((item) => (
              <ListItemButton 
                key={item.tab}
                sx={{ 
                  pl: 4, 
                  "&:hover": { backgroundColor: "#60A5FA" },
                  minHeight: 48,
                }} 
                onClick={() => {
                  setActiveTab(item.tab);
                  if (isMobile) setSidebarOpen(false);
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  {item.icon}
                </ListItemIcon>
                {sidebarOpen && <ListItemText primary={item.text} />}
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* Section INFORMATIONS (Nouvelle section) */}
        <ListItemButton 
          onClick={() => setOpenInfo(!openInfo)} 
          sx={{ 
            "&:hover": { backgroundColor: "#3B82F6" },
            minHeight: 48,
            justifyContent: sidebarOpen ? 'initial' : 'center',
            px: 2.5,
          }}
        >
          <ListItemIcon sx={{
            minWidth: 0,
            mr: sidebarOpen ? 3 : 'auto',
            justifyContent: 'center',
            color: "white",
          }}>
            <ArticleIcon />
          </ListItemIcon>
          {sidebarOpen && <ListItemText primary="INFORMATIONS" />}
          {sidebarOpen && (openInfo ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>

        <Collapse in={openInfo && sidebarOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {infoItems.map((item) => (
              <ListItemButton 
                key={item.tab}
                sx={{ 
                  pl: 4, 
                  "&:hover": { backgroundColor: "#60A5FA" },
                  minHeight: 48,
                }} 
                onClick={() => {
                  setActiveTab(item.tab);
                  if (isMobile) setSidebarOpen(false);
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  {item.icon}
                </ListItemIcon>
                {sidebarOpen && <ListItemText primary={item.text} />}
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>

      <Box sx={{ 
        position: "", 
        bottom: 20, 
        left: 0,
        right: 0,
        px: 2,
      }}>
        <LogoutButton 
          handleLogout={handleLogout} 
          isSidebarOpen={sidebarOpen}
        />
      </Box>
    </Drawer>
  );
};

export default Sidebar;