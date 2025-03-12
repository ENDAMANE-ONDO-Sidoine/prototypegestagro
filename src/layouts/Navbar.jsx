import { useState } from "react";
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Select, Drawer, List, ListItem, ListItemText, Collapse,
} from "@mui/material";
import {
  Brightness4, Brightness7, Menu as MenuIcon, Home, Info, ShoppingCart, People, Contacts, Login, ExpandLess, ExpandMore,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next"; // Importez useTranslation
import { useTheme as useMuiTheme } from "@mui/material/styles"; // Renommez pour éviter les conflits
import { useMediaQuery } from "@mui/material";
import { green, purple, blue, orange, red } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../utils/ThemeProvider"; // Importez useTheme depuis ThemeContext
import LogoutButton from "../components/LogoutButton"; // Importez le composant LogoutButton

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
  const { t, i18n } = useTranslation(); // Utilisez useTranslation pour obtenir t et i18n
  const theme = useMuiTheme(); // Utilisez useMuiTheme pour le thème MUI
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme(); // Utilisez mode et toggleTheme

  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElPartners, setAnchorElPartners] = useState(null);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setMenuOpen(open);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false); // Fermer le Drawer après la navigation
    setAnchorEl(null); // Fermer les menus déroulants
    setAnchorElPartners(null);
  };

  // Données pour les sous-menus
  const servicesItems = [
    { path: "/dashboard/farmer", label: t("Agriculteur") },
    { path: "/dashboard/buyer", label: t("Acheteur") },
    { path: "/dashboard/supplier", label: t("Fournisseur") },
  ];

  const partnersItems = [
    { path: "/dashboard/transporter", label: t("Transporteurs") },
    { path: "/dashboard/agronomist", label: t("Agronomes") },
    { path: "/dashboard/ngo", label: t("ONG") },
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
                  <ListItemText primary={t("Accueil")} />
                </ListItem>

                {/* À propos */}
                <ListItem button onClick={() => handleNavigation("/about")}>
                  <Info sx={{ mr: 1, color: orange[500] }} />
                  <ListItemText primary={t("À propos")} />
                </ListItem>

                {/* Services */}
                <SubMenu
                  label={t("Services")}
                  icon={<ShoppingCart sx={{ mr: 1, color: red[500] }} />}
                  items={servicesItems}
                  handleNavigation={handleNavigation}
                />

                {/* Partenaires */}
                <SubMenu
                  label={t("Partenaires")}
                  icon={<People sx={{ mr: 1, color: purple[500] }} />}
                  items={partnersItems}
                  handleNavigation={handleNavigation}
                />

                {/* Contact */}
                <ListItem button onClick={() => handleNavigation("/contact")}>
                  <Contacts sx={{ mr: 1, color: green[500] }} />
                  <ListItemText primary={t("Contact")} />
                </ListItem>

                {/* Mode Sombre/Lumière */}
                <ListItem>
                  <IconButton
                    onClick={toggleTheme} // Utilisez toggleTheme directement
                    color="inherit"
                    sx={{ width: "100%", justifyContent: "flex-start" }}
                  >
                    {mode === "dark" ? <Brightness7 /> : <Brightness4 />} {/* Utilisez mode pour déterminer l'icône */}
                    <Typography sx={{ ml: 2 }}>{mode === "dark" ? t("Mode Clair") : t("Mode Sombre")}</Typography>
                  </IconButton>
                </ListItem>

                {/* Sélecteur de langue */}
                <ListItem>
                  <Select
                    value={i18n.language}
                    onChange={(e) => i18n.changeLanguage(e.target.value)} // Utilisez i18n.changeLanguage
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
                    <LogoutButton handleLogout={handleLogout} /> // Utilisez LogoutButton ici
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Login />}
                      sx={{ backgroundColor: purple[500], color: "white", "&:hover": { backgroundColor: purple[700] } }}
                      onClick={() => handleNavigation("/login")}
                    >
                      {t("Se Connecter")}
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
              {t("Accueil")}
            </Button>
            <Button color="inherit" startIcon={<Info sx={{ color: orange[500] }} />} onClick={() => handleNavigation("/about")}>
              {t("À propos")}
            </Button>

            {/* Services */}
            <Button color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} startIcon={<ShoppingCart sx={{ color: red[500] }} />}>
              {t("Services")}
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
              {t("Partenaires")}
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
              {t("Contact")}
            </Button>

            {/* Mode Sombre/Lumière */}
            <IconButton
              onClick={toggleTheme} // Utilisez toggleTheme directement
              color="inherit"
            >
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />} {/* Utilisez mode pour déterminer l'icône */}
            </IconButton>

            {/* Sélecteur de langue */}
            <Select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)} // Utilisez i18n.changeLanguage
              variant="outlined"
              size="small"
              sx={{ mx: 2, color: "white", borderColor: "white" }}
            >
              <MenuItem value="fr">🇫🇷 FR</MenuItem>
              <MenuItem value="en">🇬🇧 EN</MenuItem>
            </Select>

            {/* Bouton Se Connecter/Déconnexion */}
            {isAuthenticated ? (
              <LogoutButton handleLogout={handleLogout} /> // Utilisez LogoutButton ici
            ) : (
              <Button
                variant="contained"
                startIcon={<Login />}
                sx={{ backgroundColor: purple[500], color: "white", "&:hover": { backgroundColor: purple[700] } }}
                onClick={() => handleNavigation("/login")}
              >
                {t("Se Connecter")}
              </Button>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;