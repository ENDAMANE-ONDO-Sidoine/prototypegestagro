import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid, 
  Chip,
  Divider,
  Button,
  Link,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Avatar,
  IconButton,
  Menu,
  MenuItem
} from "@mui/material";
import {
  CalendarToday,
  LocationOn,
  NewReleases,
  TrendingUp,
  Agriculture,
  School,
  MonetizationOn,
  Add,
  Close,
  Edit,
  Delete,
  MoreVert
} from "@mui/icons-material";

const News = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    location: "",
    category: "",
    image: null
  });
  const [notification, setNotification] = useState({ open: false, message: "" });
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);

  const handleMenuClick = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setCurrentPostId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentPostId(null);
  };

  const handleEdit = (postId) => {
    const postToEdit = posts.find(post => post.id === postId);
    setNewPost({
      title: postToEdit.title,
      content: postToEdit.fullContent || postToEdit.excerpt,
      location: postToEdit.location,
      category: postToEdit.category,
      image: postToEdit.image
    });
    setEditPostId(postId);
    setOpenForm(true);
    handleMenuClose();
  };

  const handleDelete = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
    setNotification({ open: true, message: "Publication supprimée avec succès" });
    handleMenuClose();
  };

  const toggleExpandPost = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost({...newPost, image: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  // Données initiales enrichies
  const initialNewsItems = [
    {
      id: 1,
      title: "BCEG LANCE UN NOUVEAU CRÉDIT AGRICOLE À 3%",
      excerpt: "La Banque pour le Commerce et l'Entrepreneuriat du Gabon propose des financements adaptés aux petits exploitants.",
      fullContent: "La BCEG a mis en place un nouveau dispositif de crédit spécialement conçu pour les agriculteurs gabonais. Avec des taux avantageux à 3% et des délais de remboursement adaptés aux cycles de production, ce programme vise à moderniser les exploitations agricoles. Les demandes peuvent être déposées dans toutes les agences de la BCEG.",
      image: "https://scontent.flbv1-1.fna.fbcdn.net/v/t39.30808-6/473687438_122132007746463229_8054154058632039680_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=110&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeEjpPVlMleDJiUYzMLvbgK47HIwXblq7vHscjBduWru8X-yNLbOviKpki1eRGNIZPO_A2z0T_t0QvIPTaC24Iub&_nc_ohc=zeGdOUop3I4Q7kNvwGB8_c-&_nc_oc=AdnspyALOSHXQNe2sPxD_xkXH3QbSptwDA25wafDmA8lmJoNAbfHWpEVZfp4a-KHS2c&_nc_zt=23&_nc_ht=scontent.flbv1-1.fna&_nc_gid=r3zOoOY9GvrLydqZfHXviA&oh=00_AfLVAKf89VEIkfmxnKx5MTTf11ojZVisf3A3ihQHR_XQ-w&oe=6827EEC7",
      date: "10 Mai 2025",
      location: "Tout le Gabon",
      category: "Financement",
      trending: true,
      icon: <MonetizationOn />,
      author: "BCEG",
      isUserPost: false
    },
    {
      id: 2,
      title: "SEMINAIRE SUR L'AGRICULTURE DURABLE À LIBREVILLE",
      excerpt: "Formation intensive de 3 jours sur les techniques respectueuses de l'environnement.",
      fullContent: "Ce séminaire organisé en partenariat avec la FAO abordera les meilleures pratiques pour une agriculture productive et durable. Au programme : gestion des sols, utilisation rationnelle de l'eau, et méthodes de lutte biologique contre les parasites. Les inscriptions sont ouvertes jusqu'au 20 mai.",
      image: "https://www.gabonreview.com/wp-content/uploads/2025/03/FOIRE--640x423.jpeg",
      date: "05 Mai 2025",
      location: "Libreville",
      category: "Formation",
      trending: false,
      icon: <School />,
      author: "Ministère de l'Agriculture",
      isUserPost: false
    },
    {
      id: 3,
      title: "NOUVELLE USINE DE TRANSFORMATION DE MANIOC À MOANDA",
      excerpt: "Un investissement de 15 milliards FCFA pour valoriser la production locale.",
      fullContent: "Cette nouvelle unité de transformation permettra de produire de la farine, de l'amidon et des produits dérivés du manioc. Elle créera 120 emplois directs et bénéficiera à plus de 2000 planteurs de la région. La première phase sera opérationnelle dès septembre 2024.",
      image: "https://www.gabonreview.com/wp-content/uploads/2023/05/Agriculture-Gabon-1.jpg",
      date: "30 Avril 2025",
      location: "Moanda",
      category: "Infrastructure",
      trending: true,
      icon: <Agriculture />,
      author: "Agence de Développement Agricole",
      isUserPost: false
    },
    {
      id: 4,
      title: "DISTRIBUTION DE SEMENCES AMÉLIORÉES DANS LE WOLU-NTEM",
      excerpt: "Campagne de distribution gratuite pour relancer la production vivrière.",
      fullContent: "Plus de 5000 sachets de semences améliorées de maïs, haricot et arachide seront distribués aux agriculteurs de la province. Ces variétés à haut rendement sont adaptées aux conditions climatiques locales et résistantes aux maladies courantes dans la région.",
      image: "https://www.fao.org/fileadmin/user_upload/FAO-countries/Gabon/images/FAO%20don%20Kits%20agricoles%20.jpg",
      date: "29 Avril 2025",
      location: "Woleu-Ntem",
      category: "Subvention",
      trending: false,
      icon: <Agriculture />,
      author: "Direction Provinciale de l'Agriculture",
      isUserPost: false
    },
    {
      id: 5,
      title: "APPEL À PROJETS POUR LES JEUNES AGRICULTEURS",
      excerpt: "Fonds spécial de 2 milliards FCFA pour les porteurs de projets innovants.",
      fullContent: "Cet appel à projets cible spécifiquement les jeunes de 18 à 35 ans souhaitant s'installer en agriculture. Les dossiers seront évalués sur leur innovation, durabilité et potentiel de création d'emplois. Date limite de dépôt : 30 juin 2024.",
      image: "https://www.francebleu.fr/s3/cruiser-production/2021/09/23554813-5568-4634-ba50-97b5f265a8c5/1200x680_maxnewsworldfour740643.jpg",
      date: "02 Avril 2025",
      location: "Tout le Gabon",
      category: "Appel à projets",
      trending: false,
      icon: <Agriculture />,
      author: "Ministère de la Jeunesse",
      isUserPost: false
    },
    {
      id: 6,
      title: "FORMATION SUR L'AGRICULTURE NUMÉRIQUE À PORT-GENTIL",
      excerpt: "Apprenez à utiliser les technologies digitales pour optimiser votre production agricole.",
      fullContent: "Cette formation de deux jours couvrira l'utilisation des applications mobiles pour le suivi des cultures, les outils de gestion agricole en ligne, et les plateformes de vente directe. Organisée par la Chambre d'Agriculture en partenariat avec Orange Gabon, elle se tiendra les 15 et 16 juin 2025.",
      image: "https://img.freepik.com/photos-gratuite/scene-ferme-poulets-volailles-gens_23-2151462199.jpg",
      date: "12 Mai 2025",
      location: "Port-Gentil",
      category: "Formation",
      trending: false,
      icon: <School />,
      author: "Chambre d'Agriculture",
      isUserPost: false
    },
    {
      id: 7,
      title: "LANCEMENT DU PROJET 'GABON VERT 2030'",
      excerpt: "Un plan ambitieux pour doubler la production agricole nationale d'ici 2030.",
      fullContent: "Le gouvernement gabonais a dévoilé son plan stratégique pour transformer le secteur agricole. Avec un budget de 500 milliards FCFA, ce projet vise à moderniser les infrastructures, former 10 000 jeunes agriculteurs, et développer 50 000 hectares de nouvelles terres cultivables.",
      image: "https://www.gabonmediatime.com/wp-content/uploads/2023/11/Agriculture-Gabon.jpg",
      date: "08 Mai 2025",
      location: "Tout le Gabon",
      category: "Politique Agricole",
      trending: true,
      icon: <Agriculture />,
      author: "Ministère de l'Agriculture",
      isUserPost: false
    },
    {
      id: 8,
      title: "INNOVATION : UN SYSTÈME D'IRRIGATION ÉCONOME EN EAU DÉVELOPPÉ À FRANCEVILLE",
      excerpt: "Une solution locale pour faire face aux périodes de sécheresse.",
      fullContent: "Des chercheurs de l'Université des Sciences et Techniques de Masuku ont mis au point un système d'irrigation intelligent qui réduit la consommation d'eau de 60%. Ce système sera disponible pour les agriculteurs à partir de juillet 2025 à un prix subventionné.",
      image: "https://img.freepik.com/photos-premium/jardin-paysage-systeme-goutte-goutte-realise-systemes-goutte-goutte-jardin_798458-2596.jpg",
      date: "03 Mai 2025",
      location: "Franceville",
      category: "Innovation",
      trending: false,
      icon: <Agriculture />,
      author: "Université de Masuku",
      isUserPost: false
    }
  ];

  const [posts, setPosts] = useState(initialNewsItems);
  const featuredNews = posts.find(item => item.trending);

  const handlePublish = () => {
    if (newPost.title && newPost.content) {
      if (editPostId) {
        // Modification existante
        setPosts(posts.map(post => 
          post.id === editPostId ? {
            ...post,
            title: newPost.title,
            excerpt: newPost.content.substring(0, 100) + "...",
            fullContent: newPost.content,
            location: newPost.location || "Non spécifié",
            category: newPost.category || "Communauté",
            image: newPost.image || "/images/default-agriculture.jpg"
          } : post
        ));
        setNotification({ open: true, message: "Publication modifiée avec succès !" });
      } else {
        // Nouvelle publication
        const newPostItem = {
          id: Date.now(),
          title: newPost.title,
          excerpt: newPost.content.substring(0, 100) + "...",
          fullContent: newPost.content,
          image: newPost.image || "/images/user-post.jpg",
          date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
          location: newPost.location || "Non spécifié",
          category: newPost.category || "Communauté",
          trending: false,
          icon: <Agriculture />,
          author: "Agriculteur",
          isUserPost: true
        };

        setPosts([newPostItem, ...posts]);
        setNotification({ open: true, message: "Votre publication a été partagée avec la communauté !" });
      }

      setOpenForm(false);
      setEditPostId(null);
      setNewPost({ 
        title: "", 
        content: "", 
        location: "", 
        category: "",
        image: null
      });
    }
  };

  // Gestion des clics sur les ressources
  const handleResourceClick = (resourceType) => {
    let message = "";
    switch(resourceType) {
      case "cultures":
        message = "Guide des cultures téléchargé avec succès!";
        break;
      case "aides":
        message = "Liste des aides financières affichée!";
        break;
      case "formations":
        message = "Accès aux formations en ligne!";
        break;
      case "marches":
        message = "Marchés agricoles consultés!";
        break;
      default:
        message = "Ressource consultée!";
    }
    setNotification({ open: true, message });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Bannière titre avec phrase d'appel */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 6,
        background: 'linear-gradient(135deg, #1B5E20 0%, #388E3C 100%)',
        p: 3,
        borderRadius: 2,
        boxShadow: 3,
        color: 'white'
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          mb: 2
        }}>
          ESPACE D'INFORMATIONS AGRICOLES GABONAIS
        </Typography>
        <Typography variant="h6" sx={{ fontStyle: 'italic' }}>
          "Partagez, découvrez et collaborez pour une agriculture gabonaise plus forte"
        </Typography>
      </Box>

      {/* Bouton de publication */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => {
            setEditPostId(null);
            setOpenForm(true);
          }}
          sx={{
            backgroundColor: '#FF9800',
            '&:hover': { backgroundColor: '#F57C00' },
            fontWeight: 'bold'
          }}
        >
          Publier une information
        </Button>
      </Box>

      {/* Actualité vedette */}
      {featuredNews && (
        <Card sx={{ 
          mb: 4, 
          borderRadius: 2,
          boxShadow: 3,
          position: 'relative',
          borderLeft: '5px solid #1B5E20'
        }}>
          <Chip 
            icon={<NewReleases />}
            label="À la Une"
            color="error"
            sx={{ 
              position: 'absolute', 
              top: 16, 
              left: 16, 
              zIndex: 1,
              fontWeight: 'bold'
            }}
          />
          <Grid container>
            <Grid item xs={12} md={6}>
              <CardMedia
                component="img"
                sx={{ 
                  height: 350,
                  width: '100%',
                  objectFit: 'cover'
                }}
                image={featuredNews.image}
                alt={featuredNews.title}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {featuredNews.icon}
                    <Chip 
                      label={featuredNews.category} 
                      color="primary" 
                      size="medium"
                      sx={{ ml: 1, fontWeight: 'bold' }}
                    />
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {featuredNews.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
                    {expandedPost === featuredNews.id ? featuredNews.fullContent : featuredNews.excerpt}
                  </Typography>
                  {featuredNews.fullContent && (
                    <Button 
                      onClick={() => toggleExpandPost(featuredNews.id)}
                      sx={{ 
                        color: '#1B5E20',
                        fontWeight: 'bold',
                        textTransform: 'none'
                      }}
                    >
                      {expandedPost === featuredNews.id ? "Voir moins" : "Lire la suite"}
                    </Button>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      {featuredNews.author}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 2 }}>
                  <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" sx={{ mr: 2, fontWeight: '500' }}>
                    {featuredNews.date}
                  </Typography>
                  <LocationOn fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: '500' }}>
                    {featuredNews.location}
                  </Typography>
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      )}

      <Divider sx={{ my: 3, borderWidth: 1, borderColor: '#1B5E20' }} />

      {/* Liste des actualités */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 'bold', 
          display: 'flex',
          alignItems: 'center'
        }}>
          <TrendingUp sx={{ mr: 1, color: '#1B5E20' }} /> DERNIÈRES ACTUALITÉS
        </Typography>
        <Link 
          href="https://www.youtube.com/results?search_query=agriculture+gabon" 
          target="_blank"
          rel="noopener noreferrer"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none',
            color: '#1B5E20',
            fontWeight: 'bold',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          Voir les vidéos sur YouTube →
        </Link>
      </Box>

      <Grid container spacing={3}>
        {posts
          .filter(item => !item.trending)
          .map((news) => (
            <Grid item xs={12} sm={6} md={4} key={news.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 4
                }
              }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    sx={{ 
                      height: 200,
                      width: '100%',
                      objectFit: 'cover'
                    }}
                    image={news.image}
                    alt={news.title}
                  />
                  {news.isUserPost && (
                    <IconButton
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,1)'
                        }
                      }}
                      onClick={(e) => handleMenuClick(e, news.id)}
                    >
                      <MoreVert />
                    </IconButton>
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {news.icon}
                    <Chip 
                      label={news.category} 
                      color="secondary" 
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {news.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {expandedPost === news.id ? news.fullContent || news.excerpt : news.excerpt}
                  </Typography>
                  {(news.fullContent || news.isUserPost) && (
                    <Button 
                      onClick={() => toggleExpandPost(news.id)}
                      sx={{ 
                        color: '#1B5E20',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        p: 0
                      }}
                    >
                      {expandedPost === news.id ? "Voir moins" : "Lire plus"}
                    </Button>
                  )}
                </CardContent>
                <Box sx={{ 
                  px: 2, 
                  pb: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }} />
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {news.author}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday fontSize="small" sx={{ mr: 0.5 }} />
                      {news.date}
                    </Typography>
                  </Box>
                  <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">
                    {news.location}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
      </Grid>

      <Divider sx={{ my: 6, borderWidth: 1, borderColor: '#1B5E20' }} />

      {/* Section Événements à venir */}
      <Typography variant="h5" sx={{ 
        fontWeight: 'bold', 
        mb: 3,
        display: 'flex',
        alignItems: 'center'
      }}>
        <CalendarToday sx={{ mr: 1, color: '#1B5E20' }} /> ÉVÉNEMENTS À VENIR
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
            <CardMedia
              component="img"
              sx={{ height: 180, width: '100%', objectFit: 'cover' }}
              image="https://www.m.gabonews.com/IMG/jpg/foire_agricole.jpg"
              alt="Foire Agricole"
            />
            <CardContent>
              <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                FOIRE AGRICOLE INTERNATIONALE DE LIBREVILLE
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                La 8ème édition de la plus grande foire agricole d'Afrique centrale.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">15-22 Juillet 2025</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <LocationOn fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Stade de l'Amitié, Libreville</Typography>
              </Box>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2, backgroundColor: '#1B5E20' }}
                href="https://www.foagric-gabon.com"
                target="_blank"
              >
                Plus d'informations
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
            <CardMedia
              component="img"
              sx={{ height: 180, width: '100%', objectFit: 'cover' }}
              image="https://suco.org/wp-content/uploads/2022/02/Haiti-2022-PROFI-Programme-de-formation-en-Agroecologie-Moindre-Saint-Jean-du-Sud-CR-Tania-Saint-Germain-IMG-20220201-WA00091.jpg"
              alt="Formation"
            />
            <CardContent>
              <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                FORMATION EN AGROÉCOLOGIE
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Programme intensif de 6 mois avec certification reconnue par l'État.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Inscriptions jusqu'au 30 Juin 2025</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <LocationOn fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Centre Agricole de Nkok</Typography>
              </Box>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2, backgroundColor: '#1B5E20' }}
                onClick={() => window.location.href = "mailto:formations@agriculture.ga"}
              >
                S'inscrire
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
            <CardMedia
              component="img"
              sx={{ height: 180, width: '100%', objectFit: 'cover' }}
              image="https://scontent.flbv1-1.fna.fbcdn.net/v/t39.30808-6/495154562_2064155974054217_4322909255458131393_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGItTnSGIoVeEKOxQBf4vba5Qaf8swVFv_lBp_yzBUW_wsVaF3Fi3eyyn0ZCzWHi0SlsC7bjNQtHNS7dC64j1P4&_nc_ohc=v5i1ZkH7hpwQ7kNvwEOopPQ&_nc_oc=Adk3NzYr6Zn0QV_5OVaB0KhvNjbnimyqATOr8UyF2_VM9RpwyA7mFDXV--bLwd_M-60&_nc_zt=23&_nc_ht=scontent.flbv1-1.fna&_nc_gid=sQ9SpGwlEi_Y2ViFtcAaRA&oh=00_AfJgV0fJ-aOvwTsowu2FPTyG7W7REFH3nuv0Jc4gQBbXRQ&oe=682803AF"
              alt="Concours"
            />
            <CardContent>
              <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                CONCOURS DU MEILLEUR JEUNE AGRICULTEUR
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Prix de 5 millions FCFA pour le projet le plus innovant.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Dépôt des dossiers avant le 15 Août 2025</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <LocationOn fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">En ligne</Typography>
              </Box>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2, backgroundColor: '#1B5E20' }}
                onClick={(e) => {
                  e.preventDefault();
                  setNotification({ open: true, message: "Le formulaire d'inscription sera disponible à partir du 1er juin" });
                }}
              >
                Participer
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 6, borderWidth: 1, borderColor: '#1B5E20' }} />

      {/* Section Ressources */}
      <Typography variant="h5" sx={{ 
        fontWeight: 'bold', 
        mb: 3,
        display: 'flex',
        alignItems: 'center'
      }}>
        <School sx={{ mr: 1, color: '#1B5E20' }} /> RESSOURCES UTILES
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Agriculture sx={{ fontSize: 50, color: '#1B5E20', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Guide des cultures</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Calendriers culturaux et techniques adaptées au climat gabonais
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ color: '#1B5E20', borderColor: '#1B5E20' }}
              onClick={() => handleResourceClick("cultures")}
            >
              Télécharger
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', p: 2, textAlign: 'center', borderRadius: 2 }}>
            <MonetizationOn sx={{ fontSize: 50, color: '#1B5E20', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Aides financières</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Liste complète des subventions et crédits agricoles disponibles
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ color: '#1B5E20', borderColor: '#1B5E20' }}
              onClick={() => handleResourceClick("aides")}
            >
              Consulter
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', p: 2, textAlign: 'center', borderRadius: 2 }}>
            <School sx={{ fontSize: 50, color: '#1B5E20', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Formations en ligne</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Modules gratuits sur les techniques agricoles modernes
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ color: '#1B5E20', borderColor: '#1B5E20' }}
              onClick={() => handleResourceClick("formations")}
            >
              Accéder
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', p: 2, textAlign: 'center', borderRadius: 2 }}>
            <TrendingUp sx={{ fontSize: 50, color: '#1B5E20', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Marchés agricoles</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Prix en temps réel et débouchés commerciaux pour vos productions
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ color: '#1B5E20', borderColor: '#1B5E20' }}
              onClick={() => handleResourceClick("marches")}
            >
              Explorer
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Footer communautaire */}
      <Box sx={{ 
        backgroundColor: '#f5f5f5', 
        p: 4, 
        borderRadius: 2,
        textAlign: 'center',
        mt: 4
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          REJOIGNEZ NOTRE COMMUNAUTÉ D'AGRICULTEURS
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Partagez vos expériences, posez vos questions et restez informé des dernières actualités agricoles
        </Typography>
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: '#1B5E20',
            '&:hover': { backgroundColor: '#388E3C' },
            fontWeight: 'bold',
            px: 4,
            py: 1
          }}
          onClick={() => setNotification({ open: true, message: "Vous êtes maintenant inscrit à notre newsletter!" })}
        >
          S'inscrire à la newsletter
        </Button>
      </Box>

      {/* Menu contextuel pour modifier/supprimer */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(currentPostId)}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Modifier
        </MenuItem>
        <MenuItem onClick={() => handleDelete(currentPostId)}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Supprimer
        </MenuItem>
      </Menu>

      {/* Formulaire de publication */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: '#1B5E20', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {editPostId ? "Modifier la publication" : "Publier une information"}
          </Typography>
          <IconButton onClick={() => setOpenForm(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre de votre publication"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Localisation (Province, Ville)"
                value={newPost.location}
                onChange={(e) => setNewPost({...newPost, location: e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Catégorie"
                value={newPost.category}
                onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                variant="outlined"
                select
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                <option value="Astuce">Astuce agricole</option>
                <option value="Alerte">Alerte</option>
                <option value="Événement">Événement</option>
                <option value="Question">Question</option>
                <option value="Expérience">Partage d'expérience</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contenu détaillé"
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                variant="outlined"
                multiline
                rows={6}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" sx={{ mr: 2 }}>
                Ajouter une photo
                <input 
                  type="file" 
                  hidden 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                (Optionnel - Formats: JPG, PNG)
              </Typography>
              {newPost.image && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption">Image sélectionnée :</Typography>
                  <Box 
                    component="img"
                    src={newPost.image}
                    alt="Preview"
                    sx={{ 
                      maxHeight: 100,
                      maxWidth: '100%',
                      mt: 1,
                      display: 'block'
                    }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenForm(false)}
            sx={{ color: '#1B5E20' }}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handlePublish}
            disabled={!newPost.title || !newPost.content}
            sx={{ 
              backgroundColor: '#1B5E20',
              '&:hover': { backgroundColor: '#388E3C' },
              '&:disabled': { backgroundColor: '#e0e0e0' }
            }}
          >
            {editPostId ? "Modifier" : "Publier"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({...notification, open: false})}
      >
        <Alert 
          onClose={() => setNotification({...notification, open: false})} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default News;