import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroSection() {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate("/login");
  };

  return (
    <Box sx={{ position: "relative", height: { xs: "400px", md: "500px" } }}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        autoplay={{ delay: 3000 }}
        navigation
        pagination={{ clickable: true }}
        style={{ height: "100%" }}
      >
        <SwiperSlide>
          <Box
            component="img"
            src="https://img.freepik.com/photos-gratuite/homme-africain-recolte-legumes_23-2151441303.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid"
            alt="Agriculteurs au travail"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </SwiperSlide>
        <SwiperSlide>
          <Box
            component="img"
            src="https://integratoregoodnight.it/wp-content/uploads/2021/05/banner-frutta2.jpg"
            alt="Marché agricole"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </SwiperSlide>
        <SwiperSlide>
          <Box
            component="img"
            src="https://img.freepik.com/photos-gratuite/femme-photorealiste-dans-jardin-biologique-durable-recoltant-produits_23-2151462992.jpg?semt=ais_hybrid"
            alt="Marché agricole"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </SwiperSlide>
        <SwiperSlide>
          <Box
            component="img"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcLi_1Tgjgl63Up5XnohM5P0uIqDoCXcteNQ&s"
            alt="Marché agricole"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </SwiperSlide>
        <SwiperSlide>
          <Box
            component="img"
            src="https://img.freepik.com/photos-premium/photo-camion-ferme-charge-caisses-legumes-frais_1055425-41781.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid"
            alt="Marché agricole"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </SwiperSlide>
      </Swiper>

      {/* Overlay avec texte et bouton */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          textAlign: "center",
          padding: "20px",
          zIndex: 2, // S'assurer que l'overlay est bien visible
        }}
      > 
        <Typography variant="h3" fontWeight="bold" sx={{ fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" } }}>
          BIENVENUE SUR GESTAGRO
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          LA PLATEFORME NUMERIQUE QUI CONNECTE LES ACTEURS DE L'AGRICULTURE GABONAISE
        </Typography>
        <Typography 
        variant="body1" 
        sx={{ 
          mt: 2, 
          fontWeight: 'bold', 
          fontStyle: 'italic', 
          color: 'white' 
        }}
      >
        Achetez, vendez et collaborez avec les agriculteurs et fournisseurs.
      </Typography> 
        <motion.div whileHover={{ scale: 1.1 }} style={{ marginTop: "16px" }}>
          <Button
            onClick={handleStartClick}
            variant="contained"
            color="success"
            sx={{ px: 4, py: 1.5, cursor: "pointer" }}
          >
            Commencer
          </Button>
        </motion.div>
      </Box>
    </Box>
  );
}
