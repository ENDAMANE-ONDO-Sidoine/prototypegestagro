import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { Construction, Home } from "@mui/icons-material";
import { Link } from "react-router-dom";

const DashboardAgronomist = () => {
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
          backgroundColor: "#fff8e1",
          borderRadius: 2,
          borderLeft: "6px solid #ff9800",
        }}
      >
        <Construction sx={{ fontSize: 80, color: "#ff9800", mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: "bold", color: "#5d4037" }}>
          Dashboard en travaux
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, color: "#6d4c41" }}>
          Nous travaillons activement à la construction de cet espace agronome.
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, maxWidth: "600px" }}>
          Cette section est actuellement en cours de développement. Nous mettons tout en œuvre pour vous offrir bientôt un outil performant de suivi agricole.
        </Typography>
        
        <Button
          variant="contained"
          color="warning"
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
          }}
        >
          Retour à l'accueil
        </Button>
      </Box>
    </Container>
  );
};

export default DashboardAgronomist;