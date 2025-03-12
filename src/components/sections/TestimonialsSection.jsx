import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Card, CardContent, Typography, Avatar, Container, Rating } from "@mui/material";
import "swiper/css";
import "swiper/css/pagination";

// Témoignages des acteurs de GESTAGRO
const testimonials = [
  { 
    name: "Jean M.", 
    role: "Agriculteur - Woleu-Ntem", 
    review: "Grâce à GESTAGRO, j'ai trouvé de nouveaux clients rapidement et j'ai pu écouler mon stock de manioc sans intermédiaire !", 
    rating: 5 
  },
  { 
    name: "Awa K.", 
    role: "Acheteuse - Libreville", 
    review: "Une plateforme très utile ! Je peux commander des produits frais directement auprès des producteurs sans passer par plusieurs intermédiaires.", 
    rating: 4.5 
  },
  { 
    name: "Michel D.", 
    role: "Fournisseur d'intrants - Franceville", 
    review: "J'utilise GESTAGRO pour proposer des semences de qualité aux agriculteurs. La demande est constante et je gagne en visibilité.", 
    rating: 4 
  },
  { 
    name: "Esther T.", 
    role: "Transporteur - Port-Gentil", 
    review: "Avant, je trouvais difficilement des clients réguliers. Maintenant, je reçois des commandes de transport chaque semaine via la plateforme.", 
    rating: 4.5 
  },
  { 
    name: "Dr. Alain Z.", 
    role: "Agronome - Oyem", 
    review: "GESTAGRO permet de conseiller directement les producteurs et de suivre l'évolution des cultures. Une vraie révolution pour l'agriculture locale !", 
    rating: 5 
  },
  { 
    name: "ONG AgriDév", 
    role: "Organisation de développement rural", 
    review: "Nous utilisons GESTAGRO pour coordonner nos projets avec les coopératives et améliorer l'accès au marché des petits producteurs.", 
    rating: 5 
  },
];

export default function TestimonialsSection() {
  return (
    <section style={{ padding: "64px 0", backgroundColor: "#f3f4f6" }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Avis de nos utilisateurs
        </Typography>
        <Swiper
          modules={[Autoplay, Pagination]}
          slidesPerView={1}
          autoplay={{ delay: 9000 }}
          pagination={{ clickable: true }}
          style={{ marginTop: "24px" }}
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <Card sx={{ textAlign: "center", p: 3, boxShadow: 3 }}>
                <CardContent>
                  <Avatar sx={{ width: 56, height: 56, mx: "auto", mb: 2 }}>
                    {testimonial.name.charAt(0)}
                  </Avatar>
                  <Typography variant="body1" fontStyle="italic">
                    "{testimonial.review}"
                  </Typography>
                  <Rating value={testimonial.rating} precision={0.5} readOnly sx={{ mt: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold" mt={1}>
                    {testimonial.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {testimonial.role}
                  </Typography>
                </CardContent>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </section>
  );
}
