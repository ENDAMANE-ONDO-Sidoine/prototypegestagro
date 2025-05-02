import React from "react";
import { 
  Typography, 
  Box, 
  Button,
  Container,
  Grid,
  Avatar,
  Paper,
  useTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
  Group, 
  BarChart, 
  Share, 
  Handshake, 
  DataUsage, 
  Lightbulb, 
  Login,
  EmojiNature,
  TrendingUp,
  ConnectWithoutContact,
  School
} from "@mui/icons-material";

const AboutPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const featureItems = [
      {
        icon: <Group sx={{ color: theme.palette.primary.main }} />,
        title: "Ecosystème collaboratif",
        description: "Interconnexion entre agriculteurs, fournisseurs et partenaires"
      },
      {
        icon: <BarChart sx={{ color: theme.palette.secondary.main }} />,
        title: "Données exploitables",
        description: "Analyses pour une meilleure prise de décision"
      },
      {
        icon: <Share sx={{ color: theme.palette.info.main }} />,
        title: "Partage des connaissances",
        description: "Espace d'échange de bonnes pratiques"
      },
      {
        icon: <Lightbulb sx={{ color: theme.palette.warning.main }} />,
        title: "Innovation agricole",
        description: "Technologies adaptées aux réalités locales"
      }
    ];

    const benefitItems = [
      {
        icon: <Handshake sx={{ color: theme.palette.success.main }} />,
        title: "Collaboration renforcée",
        description: "Chaîne de valeur agricole connectée"
      },
      {
        icon: <DataUsage sx={{ color: theme.palette.error.main }} />,
        title: "Planification intelligente",
        description: "Optimisation des rendements et ventes"
      }
    ];

    return (
        <Box
            sx={{
                backgroundColor: theme.palette.background.default,
                py: 8,
                minHeight: "100vh"
            }}
        >
            <Container maxWidth="lg">
                <Paper 
                    elevation={3} 
                    sx={{ 
                        borderRadius: 4,
                        overflow: "hidden",
                        background: "linear-gradient(to bottom, #f5fff5, #ffffff)",
                        position: "relative",
                        '&:before': {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 8,
                            background: "linear-gradient(to right, #4caf50, #8bc34a)"
                        }
                    }}
                >
                    <Box sx={{ p: 6 }}>
                        <Box textAlign="center" mb={6}>
                            <Avatar sx={{ 
                                bgcolor: theme.palette.primary.main, 
                                width: 80, 
                                height: 80,
                                mx: "auto",
                                mb: 3
                            }}>
                                <EmojiNature sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Typography 
                                variant="h3" 
                                gutterBottom 
                                sx={{ 
                                    fontWeight: 700,
                                    color: theme.palette.primary.dark,
                                    mb: 2
                                }}
                            >
                                À PROPOS DE GESTAGRO
                            </Typography>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    color: theme.palette.text.secondary,
                                    maxWidth: 800,
                                    mx: "auto"
                                }}
                            >
                                La révolution numérique de l'agriculture gabonaise
                            </Typography>
                        </Box>

                        <Grid container spacing={6} mb={6}>
                            <Grid item xs={12} md={6}>
                                <Typography 
                                    variant="h5" 
                                    gutterBottom 
                                    sx={{ 
                                        fontWeight: 600,
                                        color: theme.palette.primary.dark,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2
                                    }}
                                >
                                    <TrendingUp /> UNE RÉPONSE AUX DÉFIS
                                </Typography>
                                <Typography paragraph>
                                    L'agriculture gabonaise possède un immense potentiel mais fait face à des défis majeurs : manque de données fiables, faible collaboration entre acteurs, et partage limité des connaissances. Ces obstacles freinent l'innovation et la modernisation nécessaires au développement durable du secteur.
                                </Typography>
                                <Typography paragraph>
                                    GESTAGRO apporte une solution numérique complète pour connecter agriculteurs, fournisseurs et clients, tout en fournissant des outils modernes d'optimisation des activités agricoles.
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography 
                                    variant="h5" 
                                    gutterBottom 
                                    sx={{ 
                                        fontWeight: 600,
                                        color: theme.palette.primary.dark,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2
                                    }}
                                >
                                    <ConnectWithoutContact /> NOTRE MISSION
                                </Typography>
                                <Typography paragraph>
                                    Transformer le paysage agricole gabonais grâce à une plateforme intuitive et collaborative. Nous facilitons la gestion, la planification et les échanges entre tous les acteurs du secteur agricole.
                                </Typography>
                                <Box sx={{ 
                                    backgroundColor: theme.palette.primary.light, 
                                    p: 3, 
                                    borderRadius: 2,
                                    borderLeft: `4px solid ${theme.palette.primary.main}`
                                }}>
                                    <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                                        "Achetez, vendez et collaborez avec les agriculteurs et fournisseurs."
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Box mb={6}>
                            <Typography 
                                variant="h4" 
                                gutterBottom 
                                sx={{ 
                                    fontWeight: 600,
                                    color: theme.palette.primary.dark,
                                    textAlign: "center",
                                    mb: 4
                                }}
                            >
                                NOS OBJECTIFS STRATEGIQUES
                            </Typography>
                            <Grid container spacing={4}>
                                {featureItems.map((item, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Paper elevation={2} sx={{ p: 3, height: "100%", borderRadius: 3 }}>
                                            <Box sx={{ minWidth: 48, mb: 2, color: item.icon.props.sx.color }}>
                                                {item.icon}
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.description}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        <Box mb={6}>
                            <Typography 
                                variant="h4" 
                                gutterBottom 
                                sx={{ 
                                    fontWeight: 600,
                                    color: theme.palette.primary.dark,
                                    textAlign: "center",
                                    mb: 4
                                }}
                            >
                                AVANTAGES GESTAGRO
                            </Typography>
                            <Grid container spacing={4} justifyContent="center">
                                {benefitItems.map((item, index) => (
                                    <Grid item xs={12} md={6} key={index}>
                                        <Paper elevation={2} sx={{ p: 3, height: "100%", borderRadius: 3 }}>
                                            <Box sx={{ minWidth: 48, mb: 2, color: item.icon.props.sx.color }}>
                                                {item.icon}
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.description}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        <Box sx={{ 
                            backgroundColor: theme.palette.grey[100], 
                            p: 4, 
                            borderRadius: 3,
                            textAlign: "center",
                            mb: 6
                        }}>
                            <Typography 
                                variant="h4" 
                                gutterBottom 
                                sx={{ 
                                    fontWeight: 600,
                                    color: theme.palette.primary.dark,
                                    mb: 3
                                }}
                            >
                                <School sx={{ verticalAlign: "middle", mr: 2 }} />
                                REJOIGNEZ LA RÉVOLUTION AGRICOLE
                            </Typography>
                            <Typography paragraph sx={{ maxWidth: 800, mx: "auto", mb: 4 }}>
                                GESTAGRO représente bien plus qu'une application web, c'est un mouvement visant à transformer durablement l'agriculture gabonaise. En connectant les acteurs, partageant les connaissances et valorisant les données, nous bâtissons ensemble un avenir agricole plus collaboratif, productif et durable.
                            </Typography>
                            <Button 
                                variant="contained" 
                                size="large" 
                                onClick={() => navigate("/login")} 
                                sx={{ 
                                    px: 6,
                                    py: 2,
                                    borderRadius: 50,
                                    fontWeight: 700,
                                    fontSize: "1.1rem",
                                    textTransform: "none",
                                    boxShadow: 3,
                                    '&:hover': {
                                        transform: "translateY(-2px)",
                                        boxShadow: 6
                                    },
                                    transition: "all 0.3s ease"
                                }}
                                startIcon={<Login />}
                            >
                                Commencez dès maintenant
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default AboutPage;