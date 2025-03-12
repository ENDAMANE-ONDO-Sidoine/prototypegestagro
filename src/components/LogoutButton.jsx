import React from 'react';
import { signOut } from "firebase/auth";
import { Button } from "@mui/material";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from 'react-router-dom'; // Importe useNavigate

const LogoutButton = ({ handleLogout }) => {
  const navigate = useNavigate(); // Hook pour la navigation

  const handleClick = async () => {
    try {
      await signOut(auth); // Déconnexion de Firebase
      handleLogout(); // Appeler la fonction handleLogout passée en prop
      navigate('/'); // Rediriger vers la page d'accueil
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleClick}
      sx={{
        margin: '20px',
        width: 'auto',
        backgroundColor: '#ff4444', // Rouge personnalisé
        color: '#fff', // Texte blanc
        '&:hover': {
          backgroundColor: '#cc0000', // Rouge plus foncé au survol
        },
      }}
    >
      Déconnexion
    </Button>
  );
};

export default LogoutButton;