import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Grid, Card, CardContent, Typography, Button } from "@mui/material";
import { Agriculture, ShoppingCart, Build } from "@mui/icons-material";

const services = [
  { title: "Agriculteurs", desc: "Vendez vos récoltes et gérez votre production.", icon: <Agriculture fontSize="large" color="success" />, role: "farmer" },
  { title: "Acheteurs", desc: "Trouvez et achetez des produits agricoles.", icon: <ShoppingCart fontSize="large" color="primary" />, role: "buyer" },
  { title: "Fournisseurs", desc: "Proposez du matériel et des intrants.", icon: <Build fontSize="large" color="secondary" />, role: "supplier" },
];

export default function ServicesSection({ isAuthenticated, userRole }) {
  const navigate = useNavigate();

  const handleNavigation = (role) => {
    if (isAuthenticated) {
      // Si authentifié, navigue vers le dashboard correspondant
      navigate(`/dashboard/${role}`);
    } else {
      // Sinon, redirige vers la page de login
      navigate("/login");
    }
  };

  return (
    <section id="services-section" style={{ backgroundColor: "#f5f5f5", padding: "40px 20px" }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        Nos Services
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card sx={{ textAlign: "center", p: 2, boxShadow: 3 }}>
                <CardContent>
                  {service.icon}
                  <Typography variant="h6" fontWeight="bold" mt={2}>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {service.desc}
                  </Typography>
                  <motion.div whileHover={{ scale: 1.1 }} style={{ marginTop: "16px" }}>
                    <Button 
                      variant="contained" 
                      color="success" 
                      onClick={() => handleNavigation(service.role)}
                    >
                      Commencer
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
