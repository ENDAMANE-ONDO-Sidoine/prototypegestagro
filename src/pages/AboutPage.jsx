import React from "react";
import { Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
    Group, 
    BarChart, 
    Share, 
    Agriculture, 
    Handshake, 
    DataUsage, 
    Lightbulb, 
    Login
} from "@mui/icons-material";

const AboutPage = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                padding: "2rem",
                backgroundColor: "#f9f9f9",
                minHeight: "100vh",
                marginTop: "4rem", 
            }}
        >
            <Card sx={{ maxWidth: "900px", margin: "0 auto", borderRadius: "10px", boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h4" gutterBottom sx={{ color: "green", textTransform: "uppercase" }}>
                        À PROPOS DE GESTAGRO
                    </Typography>

                    <Typography variant="h6" gutterBottom sx={{ color: "green", textTransform: "uppercase" }}>
                        UNE RÉPONSE AUX DÉFIS DE L’AGRICULTURE GABONAISE
                    </Typography>
                    <Typography paragraph sx={{ textAlign: "justify" }}>
                        L’agriculture, bien que pleine de potentiel, reste un secteur sous-exploité au Gabon. Elle souffre d’un manque de
                        statistiques fiables, d’une faible collaboration entre les acteurs, et d’un partage limité des connaissances et bonnes
                        pratiques. Ces défis freinent les opportunités d’innovation et de modernisation, nécessaires pour renforcer l’impact
                        de l’agriculture sur le développement durable du pays.
                    </Typography>
                    <Typography paragraph sx={{ textAlign: "justify" }}>
                        GESTAGRO s’inscrit comme une solution numérique pour combler ces lacunes, en connectant les agriculteurs, fournisseurs,
                        et clients, et en leur offrant des outils modernes pour optimiser leurs activités.
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ color: "green", textTransform: "uppercase" }}>
                        NOTRE MISSION
                    </Typography>
                    <Typography paragraph sx={{ textAlign: "justify" }}>
                        Notre mission est de transformer le paysage agricole au Gabon en mettant à disposition une plateforme intuitive et
                        collaborative, conçue pour faciliter la gestion, la planification, et l’échange d’informations entre les acteurs du secteur.
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ color: "green", textTransform: "uppercase" }}>
                        NOS OBJECTIFS
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon><Group sx={{ color: "blue" }} /></ListItemIcon>
                            <ListItemText 
                                primary="Créer un écosystème collaboratif" 
                                secondary="Favoriser l’interconnexion entre agriculteurs, fournisseurs d’intrants, et partenaires stratégiques." 
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><BarChart sx={{ color: "purple" }} /></ListItemIcon>
                            <ListItemText 
                                primary="Rendre les données accessibles et exploitables" 
                                secondary="Collecter, centraliser, et analyser les données agricoles pour soutenir la prise de décision." 
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><Share sx={{ color: "orange" }} /></ListItemIcon>
                            <ListItemText 
                                primary="Faciliter le partage des connaissances" 
                                secondary="Proposer un espace de communication pour échanger des bonnes pratiques et expériences." 
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><Lightbulb sx={{ color: "yellow" }} /></ListItemIcon>
                            <ListItemText 
                                primary="Encourager l’innovation agricole" 
                                secondary="Promouvoir de nouvelles techniques et technologies adaptées aux réalités locales." 
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><Agriculture sx={{ color: "green" }} /></ListItemIcon>
                            <ListItemText 
                                primary="Optimiser la gestion des exploitations agricoles" 
                                secondary="Fournir des outils numériques pour améliorer la production et la distribution." 
                            />
                        </ListItem>
                    </List>

                    <Typography variant="h5" gutterBottom sx={{ color: "green", textTransform: "uppercase" }}>
                        POURQUOI GESTAGRO ?
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon><Handshake sx={{ color: "blue" }} /></ListItemIcon>
                            <ListItemText 
                                primary="Collaboration renforcée" 
                                secondary="Un espace dédié pour connecter tous les acteurs de la chaîne de valeur agricole." 
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><DataUsage sx={{ color: "purple" }} /></ListItemIcon>
                            <ListItemText 
                                primary="Analyse et planification" 
                                secondary="Des données fiables pour aider les agriculteurs à optimiser leurs rendements et leurs ventes." 
                            />
                        </ListItem>
                    </List>

                    <Typography variant="h5" gutterBottom sx={{ color: "green", textTransform: "uppercase" }}>
                        REJOIGNEZ LE MOUVEMENT GESTAGRO
                    </Typography>
                    <Typography paragraph sx={{ textAlign: "justify" }}>
                        GestAgro n’est pas seulement une application web, c’est une révolution dans la manière de penser et de pratiquer
                        l’agriculture au Gabon. En connectant les acteurs, en partageant les connaissances, et en valorisant les données, nous œuvrons pour
                        un avenir agricole plus collaboratif, productif et durable.
                    </Typography>

                    {/* Bouton d'appel à l'action */}
                    <Box sx={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            size="large" 
                            onClick={() => navigate("/login")} 
                            sx={{ textTransform: "uppercase", fontWeight: "bold", display: "flex", alignItems: "center", gap: 1, transition: "0.3s", '&:hover': { transform: "scale(1.05)" } }}
                        >
                            <Login /> Rejoignez-nous dès maintenant
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AboutPage;
