import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton
} from "@mui/material";
import {
  ExpandMore,
  CalendarToday,
  LocationOn,
  School,
  PictureAsPdf,
  OndemandVideo,
  Article,
  Search,
  Close,
  Add
} from "@mui/icons-material";

// Données constantes
const trainingCategories = [
  { id: 'all', label: 'TOUTES LES FORMATIONS' },
  { id: 'technique', label: 'TECHNIQUES AGRICOLES' },
  { id: 'gestion', label: 'GESTION D\'ENTREPRISE' },
  { id: 'transformation', label: 'TRANSFORMATION' },
  { id: 'innovation', label: 'INNOVATIONS' }
];

const resourceTypes = [
  { id: 'documents', label: 'Documents', icon: <PictureAsPdf /> },
  { id: 'videos', label: 'Vidéos', icon: <OndemandVideo /> },
  { id: 'articles', label: 'Articles', icon: <Article /> }
];

const trainings = [
  {
    id: 1,
    title: "AGRICULTURE BIOLOGIQUE INTENSIVE",
    description: "Maîtrisez les techniques d'agriculture biologique adaptées au climat gabonais.",
    image: "https://img.freepik.com/photos-gratuite/homme-africain-recolte-legumes_23-2151441256.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid&w=740",
    duration: "3 mois",
    location: "Libreville",
    price: "Gratuit",
    category: "technique",
    startDate: "15 Juin 2025",
    resources: [
      { type: 'documents', title: 'Guide des bonnes pratiques', url: '#' },
      { type: 'videos', title: 'Techniques de compostage', url: '#' }
    ],
    details: {
      programme: [
        "Fondamentaux de l'agriculture biologique",
        "Gestion des sols et compostage",
        "Lutte biologique contre les parasites"
      ],
      certification: "Certification reconnue par le Ministère"
    }
  },
  {
    id: 2,
    title: "GESTION D'ENTREPRISE AGRICOLE",
    description: "Formation complète pour gérer une exploitation agricole rentable.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=450&q=80",
    duration: "2 mois",
    location: "Port-Gentil",
    price: "150 000 FCFA",
    category: "gestion",
    startDate: "5 Juillet 2025",
    resources: [
      { type: 'documents', title: 'Modèle business plan', url: '#' },
      { type: 'articles', title: 'Etude de marché', url: '#' }
    ],
    details: {
      programme: [
        "Comptabilité de base pour agriculteurs",
        "Gestion des stocks",
        "Stratégies de commercialisation"
      ],
      certification: "Diplôme de gestion agricole"
    }
  },
  {
    id: 3,
    title: "TRANSFORMATION DES PRODUITS AGRICOLES",
    description: "Techniques de transformation et conservation pour valoriser vos productions.",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=450&q=80",
    duration: "6 semaines",
    location: "Franceville",
    price: "Gratuit",
    category: "transformation",
    startDate: "20 Juin 2025",
    resources: [
      { type: 'videos', title: 'Techniques de séchage', url: '#' },
      { type: 'articles', title: 'Marchés des produits transformés', url: '#' }
    ],
    details: {
      programme: [
        "Techniques de séchage et conservation",
        "Transformation du manioc",
        "Conditionnement et normes"
      ],
      certification: "Attestation de formation"
    }
  },
  {
    id: 4,
    title: "AGRICULTURE NUMÉRIQUE ET PRÉCISION",
    description: "Découvrez comment les technologies optimisent la production agricole.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=450&q=80",
    duration: "1 mois",
    location: "En ligne",
    price: "75 000 FCFA",
    category: "innovation",
    startDate: "1 Juillet 2025",
    resources: [
      { type: 'documents', title: 'Guide des applications', url: '#' },
      { type: 'videos', title: 'Tutoriel drones agricoles', url: '#' }
    ],
    details: {
      programme: [
        "Applications mobiles agricoles",
        "Gestion des cultures par drone",
        "Analyse des données météo"
      ],
      certification: "Certificat en agriculture digitale"
    }
  }
];

const Training = () => {
  // États
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedResourceType, setSelectedResourceType] = useState('all');
  const [expandedTraining, setExpandedTraining] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openRequestForm, setOpenRequestForm] = useState(false);
  const [openRegistrationForm, setOpenRegistrationForm] = useState(false);
  const [currentTraining, setCurrentTraining] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '' });
  const [requestForm, setRequestForm] = useState({
    name: '',
    email: '',
    phone: '',
    trainingRequest: '',
    location: ''
  });
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    phone: '',
    trainingId: ''
  });

  // Handlers
  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const handleResourceTypeChange = (event) => {
    setSelectedResourceType(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const toggleTrainingExpand = (trainingId) => {
    setExpandedTraining(expandedTraining === trainingId ? null : trainingId);
  };

  const handleOpenRequestForm = () => {
    setOpenRequestForm(true);
  };

  const handleCloseRequestForm = () => {
    setOpenRequestForm(false);
    setRequestForm({
      name: '',
      email: '',
      phone: '',
      trainingRequest: '',
      location: ''
    });
  };

  const handleOpenRegistrationForm = (training) => {
    setCurrentTraining(training);
    setRegistrationForm({
      ...registrationForm,
      trainingId: training.id
    });
    setOpenRegistrationForm(true);
  };

  const handleCloseRegistrationForm = () => {
    setOpenRegistrationForm(false);
    setRegistrationForm({
      name: '',
      email: '',
      phone: '',
      trainingId: ''
    });
  };

  const handleRequestFormChange = (event) => {
    const { name, value } = event.target;
    setRequestForm({
      ...requestForm,
      [name]: value
    });
  };

  const handleRegistrationFormChange = (event) => {
    const { name, value } = event.target;
    setRegistrationForm({
      ...registrationForm,
      [name]: value
    });
  };

  const submitRequestForm = () => {
    // Ici vous pourriez envoyer les données à votre API
    console.log('Demande de formation:', requestForm);
    setNotification({ open: true, message: 'Votre demande a été envoyée avec succès!' });
    handleCloseRequestForm();
  };

  const submitRegistrationForm = () => {
    // Ici vous pourriez envoyer les données à votre API
    console.log('Inscription à la formation:', registrationForm);
    setNotification({ open: true, message: `Votre inscription à "${currentTraining.title}" a été enregistrée!` });
    handleCloseRegistrationForm();
  };

  // Filtrage des formations
  const filteredTrainings = trainings.filter(training => {
    const matchesCategory = selectedCategory === 'all' || training.category === selectedCategory;
    const matchesSearch = training.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         training.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* En-tête */}
      <Box textAlign="center" mb={6}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            color: '#1B5E20',
            textTransform: 'uppercase',
            letterSpacing: 1
          }}
        >
          FORMATIONS AGRICOLES
        </Typography>
        <Typography 
          variant="h6" 
          component="p" 
          sx={{ 
            color: 'text.secondary',
            maxWidth: 800,
            mx: 'auto'
          }}
        >
          DÉVELOPPEZ VOS COMPÉTENCES AVEC NOS FORMATIONS PROFESSIONNELLES ADAPTÉES AUX BESOINS DES AGRICULTEURS.
        </Typography>
      </Box>

      {/* Barre de recherche et filtres */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher une formation..."
          InputProps={{
            startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />
          }}
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ maxWidth: 500 }}
        />
        
        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ flexGrow: 1 }}
          >
            {trainingCategories.map((category) => (
              <Tab 
                key={category.id}
                value={category.id}
                label={category.label}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              />
            ))}
          </Tabs>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Type de ressources</InputLabel>
            <Select
              value={selectedResourceType}
              onChange={handleResourceTypeChange}
              label="Type de ressources"
            >
              <MenuItem value="all">Toutes les ressources</MenuItem>
              {resourceTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {type.icon}
                    <Box component="span" sx={{ ml: 1 }}>{type.label}</Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Divider sx={{ my: 3, borderWidth: 1, borderColor: '#1B5E20' }} />

      {/* Liste des formations */}
      {filteredTrainings.length > 0 ? (
        <Grid container spacing={3}>
          {filteredTrainings.map((training) => (
            <Grid item xs={12} sm={6} md={4} key={training.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={training.image}
                  alt={training.title}
                  sx={{ objectFit: 'cover' }}
                />
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip 
                      label={
                        trainingCategories.find(c => c.id === training.category)?.label || training.category
                      } 
                      color="primary" 
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {training.duration}
                    </Typography>
                  </Box>
                  
                  <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    {training.title}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {training.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday fontSize="small" sx={{ mr: 1, color: '#1B5E20' }} />
                    <Typography variant="body2">Début: {training.startDate}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LocationOn fontSize="small" sx={{ mr: 1, color: '#1B5E20' }} />
                    <Typography variant="body2">{training.location}</Typography>
                  </Box>
                  
                  <Accordion 
                    expanded={expandedTraining === training.id}
                    onChange={() => toggleTrainingExpand(training.id)}
                    sx={{ mb: 2 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography sx={{ fontWeight: 'bold' }}>DÉTAILS DU PROGRAMME</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        PROGRAMME:
                      </Typography>
                      <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                        {training.details.programme.map((item, index) => (
                          <li key={index}>
                            <Typography variant="body2">{item}</Typography>
                          </li>
                        ))}
                      </ul>
                      
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        CERTIFICATION:
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>{training.details.certification}</Typography>
                      
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        RESSOURCES DISPONIBLES:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {training.resources
                          .filter(res => selectedResourceType === 'all' || res.type === selectedResourceType)
                          .map((resource, idx) => (
                            <Button
                              key={idx}
                              variant="outlined"
                              size="small"
                              startIcon={resourceTypes.find(t => t.id === resource.type)?.icon}
                              href={resource.url}
                              target="_blank"
                              sx={{ 
                                textTransform: 'none',
                                color: '#1B5E20',
                                borderColor: '#1B5E20',
                                '&:hover': {
                                  backgroundColor: '#f5f9f5',
                                  borderColor: '#388E3C'
                                }
                              }}
                            >
                              {resource.title}
                            </Button>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  borderTop: '1px solid #eee'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1B5E20' }}>
                    {training.price}
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      backgroundColor: '#1B5E20',
                      '&:hover': { backgroundColor: '#388E3C' }
                    }}
                    onClick={() => handleOpenRegistrationForm(training)}
                  >
                    S'INSCRIRE
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            AUCUNE FORMATION NE CORRESPOND À VOTRE RECHERCHE
          </Typography>
          <Button 
            variant="outlined"
            startIcon={<Add />}
            sx={{ 
              color: '#1B5E20',
              borderColor: '#1B5E20',
              '&:hover': { borderColor: '#388E3C' },
              fontWeight: 'bold'
            }}
            onClick={handleOpenRequestForm}
          >
            DEMANDER UNE FORMATION
          </Button>
        </Box>
      )}

      {/* Section d'appel à action */}
      <Box sx={{ 
        backgroundColor: '#f5f9f5',
        borderRadius: 2,
        p: 4,
        mt: 6,
        textAlign: 'center'
      }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          VOUS SOUHAITEZ PROPOSER UNE FORMATION ?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
          NOUS COLLABORONS AVEC DES EXPERTS POUR DÉVELOPPER L'OFFRE DE FORMATION AGRICOLE.
        </Typography>
        <Button 
          variant="outlined" 
          size="large"
          startIcon={<School />}
          sx={{ 
            color: '#1B5E20',
            borderColor: '#1B5E20',
            '&:hover': { 
              backgroundColor: '#f5f9f5',
              borderColor: '#388E3C' 
            },
            fontWeight: 'bold'
          }}
          onClick={handleOpenRequestForm}
        >
          DEVENIR FORMATEUR PARTENAIRE
        </Button>
      </Box>

      {/* Formulaire de demande de formation */}
      <Dialog open={openRequestForm} onClose={handleCloseRequestForm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: '#1B5E20', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            DEMANDE DE FORMATION
          </Typography>
          <IconButton onClick={handleCloseRequestForm} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom complet"
                name="name"
                value={requestForm.name}
                onChange={handleRequestFormChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={requestForm.email}
                onChange={handleRequestFormChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Téléphone"
                name="phone"
                value={requestForm.phone}
                onChange={handleRequestFormChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Formation souhaitée"
                name="trainingRequest"
                value={requestForm.trainingRequest}
                onChange={handleRequestFormChange}
                variant="outlined"
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Localisation (Ville/Province)"
                name="location"
                value={requestForm.location}
                onChange={handleRequestFormChange}
                variant="outlined"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseRequestForm}
            sx={{ color: '#1B5E20' }}
          >
            ANNULER
          </Button>
          <Button 
            variant="contained" 
            onClick={submitRequestForm}
            disabled={!requestForm.name || !requestForm.email || !requestForm.phone || !requestForm.trainingRequest || !requestForm.location}
            sx={{ 
              backgroundColor: '#1B5E20',
              '&:hover': { backgroundColor: '#388E3C' }
            }}
          >
            ENVOYER LA DEMANDE
          </Button>
        </DialogActions>
      </Dialog>

      {/* Formulaire d'inscription */}
      <Dialog open={openRegistrationForm} onClose={handleCloseRegistrationForm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: '#1B5E20', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            INSCRIPTION À {currentTraining?.title}
          </Typography>
          <IconButton onClick={handleCloseRegistrationForm} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {currentTraining?.description}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom complet"
                name="name"
                value={registrationForm.name}
                onChange={handleRegistrationFormChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={registrationForm.email}
                onChange={handleRegistrationFormChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Téléphone"
                name="phone"
                value={registrationForm.phone}
                onChange={handleRegistrationFormChange}
                variant="outlined"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseRegistrationForm}
            sx={{ color: '#1B5E20' }}
          >
            ANNULER
          </Button>
          <Button 
            variant="contained" 
            onClick={submitRegistrationForm}
            disabled={!registrationForm.name || !registrationForm.email || !registrationForm.phone}
            sx={{ 
              backgroundColor: '#1B5E20',
              '&:hover': { backgroundColor: '#388E3C' }
            }}
          >
            CONFIRMER L'INSCRIPTION
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
    </Container>
  );
};

export default Training;