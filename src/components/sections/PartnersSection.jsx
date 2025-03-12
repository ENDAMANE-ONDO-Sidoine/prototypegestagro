import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Grid, Card, CardContent, Typography, Button } from "@mui/material";
import { LocalShipping, Agriculture, Handshake } from "@mui/icons-material";

const partners = [
  { title: "Transporteurs", desc: "Optimisez la logistique des produits agricoles.", icon: <LocalShipping fontSize="large" color="primary" />, role: "transporter" },
  { title: "Agronomes", desc: "Accompagnez les agriculteurs avec des conseils.", icon: <Agriculture fontSize="large" color="success" />, role: "agronomist" },
  { title: "ONG", desc: "Soutenez l’agriculture locale et durable.", icon: <Handshake fontSize="large" color="secondary" />, role: "ngo" },
];

export default function PartnersSection({ isAuthenticated, userRole }) {
  const navigate = useNavigate();

  const handleNavigation = (role) => {
    if (isAuthenticated) {
      navigate(`/dashboard/${role}`);
    } else {
      navigate("/login");
    }
  };

  return (
    <section style={{ padding: "64px 20px", backgroundColor: "#fff" }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        Nos Partenaires
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {partners.map((partner, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card sx={{ textAlign: "center", p: 2, boxShadow: 3 }}>
                <CardContent>
                  {partner.icon}
                  <Typography variant="h6" fontWeight="bold" mt={2}>
                    {partner.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {partner.desc}
                  </Typography>
                  <motion.div whileHover={{ scale: 1.1 }} style={{ marginTop: "16px" }}>
                    <Button 
                      variant="contained" 
                      color="success" 
                      onClick={() => handleNavigation(partner.role)}
                    >
                      {isAuthenticated ? "Accéder" : "Nous rejoindre"}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </section>
  );
}
