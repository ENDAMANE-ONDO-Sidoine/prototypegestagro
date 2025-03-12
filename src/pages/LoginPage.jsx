import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Tabs,
  Tab,
  InputAdornment,
  Alert,
  IconButton,
} from "@mui/material";
import { Email, Lock, Person, Visibility, VisibilityOff } from "@mui/icons-material";
import { auth } from "../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import GestAgroLogo from "./assets/GestAgro-logo-transparent.png";

const AuthForm = ({ setAuth, setUserRole }) => {
  const [tabValue, setTabValue] = useState(0); // 0 pour Connexion, 1 pour Inscription
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Routes des tableaux de bord en fonction du rôle
  const dashboardRoutes = {
    Agriculteur: "/dashboard/farmer",
    Fournisseur: "/dashboard/supplier",
    Client: "/dashboard/buyer",
    Ong: "/dashboard/ngo",
    Agronome: "/dashboard/agronomist",
    Transporteur: "/dashboard/transporter",
  };

  // Gestion du changement d'onglet (Connexion/Inscription)
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError(""); // Réinitialise l'erreur lors du changement d'onglet
  };

  // Gestion de l'affichage du mot de passe
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Empêche le comportement par défaut du bouton
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Gestion de l'inscription
  const handleSignup = async () => {
    try {
      if (!name || !email || !password || !role) {
        setError("Tous les champs sont obligatoires !");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Met à jour le profil de l'utilisateur avec le rôle
      await updateProfile(user, { displayName: role });

      // Met à jour l'état global et le localStorage
      setAuth(true);
      setUserRole(role);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", role);

      // Redirige vers le tableau de bord correspondant
      navigate(dashboardRoutes[role] || "/");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Cet e-mail est déjà utilisé. Essayez de vous connecter.");
      } else {
        setError(error.message);
      }
    }
  };

  // Gestion de la connexion
  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setError("Veuillez entrer votre e-mail et mot de passe.");
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await user.reload();
      const userRole = user.displayName || localStorage.getItem("userRole");

      if (!userRole) {
        setError("Erreur d'authentification, votre rôle n'est pas défini.");
        return;
      }

      // Met à jour l'état global et le localStorage
      setAuth(true);
      setUserRole(userRole);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", userRole);

      // Redirige vers le tableau de bord correspondant
      navigate(dashboardRoutes[userRole] || "/");
    } catch (error) {
      setError("Identifiants incorrects.");
    }
  };

  // Gestion de la réinitialisation du mot de passe
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Veuillez entrer votre adresse e-mail pour réinitialiser le mot de passe.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Un e-mail de réinitialisation a été envoyé.");
    } catch (error) {
      setError("Erreur : " + error.message);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f9f9f9", display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem", minHeight: "calc(100vh - 64px)", marginTop: "100px", marginBottom: "100px" }}>
      <Card sx={{ maxWidth: "400px", width: "100%", borderRadius: "10px", boxShadow: 3, padding: "16px" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
            <img src={GestAgroLogo} alt="GestAgro Logo" style={{ width: "100px" }} />
          </Box>
          <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ marginBottom: "16px" }}>
            <Tab label="Connexion" />
            <Tab label="Inscription" />
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {tabValue === 0 ? (
            // Formulaire de connexion
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Adresse e-mail"
                type="email"
                margin="dense"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                margin="dense"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <Button fullWidth variant="contained" color="primary" sx={{ mt: 2, borderRadius: "20px" }} onClick={handleLogin} startIcon={<Lock />}>
                Se connecter
              </Button>
              <Button fullWidth variant="text" color="primary" onClick={handlePasswordReset}>
                Mot de passe oublié ?
              </Button>
            </Box>
          ) : (
            // Formulaire d'inscription
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nom complet"
                margin="dense"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Adresse e-mail"
                type="email"
                margin="dense"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Mot de passe"
                type="password"
                margin="dense"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Je suis un(e)</InputLabel>
                <Select value={role} onChange={(e) => setRole(e.target.value)} required>
                  <MenuItem value="Agriculteur">Agriculteur</MenuItem>
                  <MenuItem value="Fournisseur">Fournisseur</MenuItem>
                  <MenuItem value="Client">Client</MenuItem>
                  <MenuItem value="Transporteur">Transporteur</MenuItem>
                  <MenuItem value="Agronome">Agronome</MenuItem>
                  <MenuItem value="Ong">ONG</MenuItem>
                </Select>
              </FormControl>
              <Button fullWidth variant="contained" color="secondary" sx={{ mt: 2, borderRadius: "20px" }} onClick={handleSignup}>
                S'inscrire
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthForm;