import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { GroupWork, Home } from "@mui/icons-material";
import { Link } from "react-router-dom";

const DashboardNGO = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          textAlign: "center",
          p: 4,
          backgroundColor: "#e8f5e9",
          borderRadius: 2,
          borderLeft: "6px solid #2e7d32",
        }}
      >
        <GroupWork sx={{ fontSize: 80, color: "#2e7d32", mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: "bold", color: "#1b5e20" }}>
          Espace ONG en construction
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, color: "#2e7d41" }}>
          Nous préparons votre espace dédié aux organisations partenaires.
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, maxWidth: "600px" }}>
          Ce tableau de bord spécialisé pour les ONG agricoles est en cours de développement. Nous y intégrons des fonctionnalités spécifiques pour le suivi des projets collaboratifs.
        </Typography>
        
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<Home />}
          component={Link}
          to="/"
          sx={{
            px: 4,
            py: 2,
            fontSize: "1.1rem",
            fontWeight: "bold",
            borderRadius: 2,
            bgcolor: "#2e7d32",
            "&:hover": { bgcolor: "#1b5e20" }
          }}
        >
          Retour à l'accueil
        </Button>
      </Box>
    </Container>
  );
};

export default DashboardNGO;