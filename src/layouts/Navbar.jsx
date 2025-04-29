import { useState } from "react";
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Select, Drawer, List, ListItem, ListItemText, Collapse,
} from "@mui/material";
import {
  Brightness4, Brightness7, Menu as MenuIcon, Home, Info, ShoppingCart, People, Contacts, Login, ExpandLess, ExpandMore,
} from "@mui/icons-material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { green, purple, blue, orange, red } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../utils/ThemeProvider";
import LogoutButton from "../components/LogoutButton";

// Composant pour les sous-menus (Services et Partenaires)
const SubMenu = ({ label, icon, items, handleNavigation }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ListItem button onClick={() => setOpen(!open)}>
        {icon}
        <ListItemText primary={label} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {items.map((item, index) => (
            <ListItem button key={index} sx={{ pl: 4 }} onClick={() => handleNavigation(item.path)}>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
};

const Navbar = ({ isAuthenticated, userRole, handleLogout }) => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElPartners, setAnchorElPartners] = useState(null);
  const [language, setLanguage] = useState('fr'); // Ajout d'un état pour la langue

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setMenuOpen(open);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false);
    setAnchorEl(null);
    setAnchorElPartners(null);
  };

  // Données pour les sous-menus (textes statiques en français)
  const servicesItems = [
    { path: "/dashboard/farmer", label: "Agriculteur" },
    { path: "/dashboard/buyer", label: "Acheteur" },
    { path: "/dashboard/supplier", label: "Fournisseur" },
  ];

  const partnersItems = [
    { path: "/dashboard/transporter", label: "Transporteurs" },
    { path: "/dashboard/agronomist", label: "Agronomes" },
    { path: "/dashboard/ngo", label: "ONG" },
  ];

  return (
    <AppBar position="fixed" sx={{ backgroundColor: mode === "dark" ? "#2E7D32" : green[700] }}>
      <Toolbar>
        {/* Logo */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          GESTAGRO
        </Typography>

        {/* Menu pour mobile */}
        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={menuOpen} onClose={toggleDrawer(false)}>
              <List>
                {/* Accueil */}
                <ListItem button onClick={() => handleNavigation("/")}>
                  <Home sx={{ mr: 1, color: blue[500] }} />
                  <ListItemText primary="Accueil" />
                </ListItem>

                {/* À propos */}
                <ListItem button onClick={() => handleNavigation("/about")}>
                  <Info sx={{ mr: 1, color: orange[500] }} />
                  <ListItemText primary="À propos" />
                </ListItem>

                {/* Services */}
                <SubMenu
                  label="Services"
                  icon={<ShoppingCart sx={{ mr: 1, color: red[500] }} />}
                  items={servicesItems}
                  handleNavigation={handleNavigation}
                />

                {/* Partenaires */}
                <SubMenu
                  label="Partenaires"
                  icon={<People sx={{ mr: 1, color: purple[500] }} />}
                  items={partnersItems}
                  handleNavigation={handleNavigation}
                />

                {/* Contact */}
                <ListItem button onClick={() => handleNavigation("/contact")}>
                  <Contacts sx={{ mr: 1, color: green[500] }} />
                  <ListItemText primary="Contact" />
                </ListItem>

                {/* Mode Sombre/Lumière */}
                <ListItem>
                  <IconButton
                    onClick={toggleTheme}
                    color="inherit"
                    sx={{ width: "100%", justifyContent: "flex-start" }}
                  >
                    {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
                    <Typography sx={{ ml: 2 }}>{mode === "dark" ? "Mode Clair" : "Mode Sombre"}</Typography>
                  </IconButton>
                </ListItem>

                {/* Sélecteur de langue (maintenu mais simplifié) */}
                <ListItem>
                  <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ color: "white", borderColor: "white" }}
                  >
                    <MenuItem value="fr">🇫🇷 FR</MenuItem>
                    <MenuItem value="en">🇬🇧 EN</MenuItem>
                  </Select>
                </ListItem>

                {/* Bouton Se Connecter/Déconnexion */}
                <ListItem>
                  {isAuthenticated ? (
                    <LogoutButton handleLogout={handleLogout} />
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Login />}
                      sx={{ backgroundColor: purple[500], color: "white", "&:hover": { backgroundColor: purple[700] } }}
                      onClick={() => handleNavigation("/login")}
                    >
                      Se Connecter
                    </Button>
                  )}
                </ListItem>
              </List>
            </Drawer>
          </>
        ) : (
          <>
            {/* Mode Desktop */}
            <Button color="inherit" startIcon={<Home sx={{ color: blue[500] }} />} onClick={() => handleNavigation("/")}>
              Accueil
            </Button>
            <Button color="inherit" startIcon={<Info sx={{ color: orange[500] }} />} onClick={() => handleNavigation("/about")}>
              À propos
            </Button>

            {/* Services */}
            <Button color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} startIcon={<ShoppingCart sx={{ color: red[500] }} />}>
              Services
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              {servicesItems.map((item, index) => (
                <MenuItem key={index} onClick={() => { handleNavigation(item.path); setAnchorEl(null); }}>
                  {item.label}
                </MenuItem>
              ))}
            </Menu>

            {/* Partenaires */}
            <Button color="inherit" onClick={(e) => setAnchorElPartners(e.currentTarget)} startIcon={<People sx={{ color: purple[500] }} />}>
              Partenaires
            </Button>
            <Menu anchorEl={anchorElPartners} open={Boolean(anchorElPartners)} onClose={() => setAnchorElPartners(null)}>
              {partnersItems.map((item, index) => (
                <MenuItem key={index} onClick={() => { handleNavigation(item.path); setAnchorElPartners(null); }}>
                  {item.label}
                </MenuItem>
              ))}
            </Menu>

            {/* Contact */}
            <Button color="inherit" startIcon={<Contacts sx={{ color: green[500] }} />} onClick={() => handleNavigation("/contact")}>
              Contact
            </Button>

            {/* Mode Sombre/Lumière */}
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {/* Sélecteur de langue (maintenu mais simplifié) */}
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ mx: 2, color: "white", borderColor: "white" }}
            >
              <MenuItem value="fr">🇫🇷 FR</MenuItem>
              <MenuItem value="en">🇬🇧 EN</MenuItem>
            </Select>

            {/* Bouton Se Connecter/Déconnexion */}
            {isAuthenticated ? (
              <LogoutButton handleLogout={handleLogout} />
            ) : (
              <Button
                variant="contained"
                startIcon={<Login />}
                sx={{ backgroundColor: purple[500], color: "white", "&:hover": { backgroundColor: purple[700] } }}
                onClick={() => handleNavigation("/login")}
              >
                Se Connecter
              </Button>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;