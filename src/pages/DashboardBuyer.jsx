import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  InputAdornment,
  Modal,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Alert,
  Pagination,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search,
  ShoppingCart,
  LocalOffer,
  Close,
  LocationOn,
  Logout,
  Delete,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

const DashboardBuyer = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Catégories');
  const [selectedLocation, setSelectedLocation] = useState('Localisation');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [page, setPage] = useState(1);

  // Exemple de données pour les produits
  const produits = [
    {
      id: 1,
      nom: 'Poulet',
      description: 'Poulet fermier élevé en plein air',
      categorie: 'Animaux',
      prix: 5000,
      promotion: true,
      image: 'https://img.freepik.com/photos-gratuite/viande-poulet-cru_1203-6759.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Libreville',
      producteur: 'Ferme Bio Gabon',
    },
    {
      id: 2,
      nom: 'Boeuf',
      description: 'Viande de boeuf locale',
      categorie: 'Animaux',
      prix: 10000,
      promotion: false,
      image: 'https://img.freepik.com/psd-gratuit/belle-photo-vache_23-2151840220.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Port-Gentil',
      producteur: 'Élevage Traditionnel',
    },
    {
      id: 3,
      nom: 'Poisson',
      description: 'Poisson frais pêché localement',
      categorie: 'Animaux',
      prix: 7000,
      promotion: true,
      image: 'https://img.freepik.com/photos-premium/nourriture-pour-poissons-eau-douce_16596-938.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Oyem',
      producteur: 'Pêcherie Oyem',
    },
    {
      id: 4,
      nom: 'Banane plantain',
      description: 'Banane plantain bio',
      categorie: 'Végétaux',
      prix: 2000,
      promotion: false,
      image: 'https://img.freepik.com/photos-premium/isolat-banane-mure-jaune-fond-blanc_1048944-19422939.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Franceville',
      producteur: 'AgroFrance',
    },
    {
      id: 5,
      nom: 'Manioc',
      description: 'Manioc frais',
      categorie: 'Végétaux',
      prix: 1500,
      promotion: true,
      image: 'https://img.freepik.com/photos-premium/manihot-esculenta-communement-appele-manioc-manioc-yuca-macaxeira-mandioca-aipim-au-marche-alimentaire_259266-2499.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Lambaréné',
      producteur: 'AgriLamba',
    },
    {
      id: 6,
      nom: 'Igname',
      description: 'Igname de qualité supérieure',
      categorie: 'Végétaux',
      prix: 3000,
      promotion: false,
      image: 'https://img.freepik.com/photos-premium/seul-yams-africain-cru-entier-fond-blanc_857988-6574.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Tchibanga',
      producteur: 'Tchibanga Agro',
    },
    {
      id: 7,
      nom: 'Tomate',
      description: 'Tomate fraîche et bio',
      categorie: 'Végétaux',
      prix: 1000,
      promotion: false,
      image: 'https://img.freepik.com/photos-gratuite/tomates-rouges-fraiches_2829-13449.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Libreville',
      producteur: 'Potager Mengue',
    },
    {
      id: 8,
      nom: 'Oignon',
      description: 'Oignon local de qualité',
      categorie: 'Végétaux',
      prix: 800,
      promotion: true,
      image: 'https://img.freepik.com/photos-premium/oignon-rouge-close-up-detail-isole_404043-885.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Port-Gentil',
      producteur: 'AgriPort',
    },
    {
      id: 9,
      nom: 'Pomme de terre',
      description: 'Pomme de terre fraîche',
      categorie: 'Végétaux',
      prix: 1200,
      promotion: false,
      image: 'https://img.freepik.com/photos-premium/plusieurs-tubercules-jeunes-pommes-terre-se-trouvent-fond-blanc-isole_414617-660.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Franceville',
      producteur: 'AgriFrance',
    },
    {
      id: 10,
      nom: 'Ananas',
      description: 'Ananas sucré et juteux',
      categorie: 'Végétaux',
      prix: 2500,
      promotion: true,
      image: 'https://img.freepik.com/vecteurs-premium/vecteur-ensemble-ananas-3d-realiste-detaille-tranches-entieres-rondes_287964-9500.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Lambaréné',
      producteur: 'FruitLamba',
    },
    {
      id: 11,
      nom: 'Mangue',
      description: 'Mangue mûre et savoureuse',
      categorie: 'Végétaux',
      prix: 3000,
      promotion: false,
      image: 'https://img.freepik.com/photos-gratuite/nature-morte-mangue_23-2151542114.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Tchibanga',
      producteur: 'FruitTchib',
    },
    {
      id: 12,
      nom: 'Citron',
      description: 'Citron frais et acide',
      categorie: 'Végétaux',
      prix: 500,
      promotion: true,
      image: 'https://img.freepik.com/photos-premium/citron-vert-frais-citron-isole-blanc_93675-10925.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Libreville',
      producteur: 'AgriCitron',
    },
    {
      id: 13,
      nom: 'Avocat',
      description: 'Avocat crémeux et nutritif',
      categorie: 'Végétaux',
      prix: 2000,
      promotion: false,
      image: 'https://img.freepik.com/photos-gratuite/fruit-avocat-coupe-cote-autre_482257-22787.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Port-Gentil',
      producteur: 'FruitPort',
    },
    {
      id: 14,
      nom: 'Piment',
      description: 'Piment fort et piquant',
      categorie: 'Végétaux',
      prix: 700,
      promotion: true,
      image: 'https://img.freepik.com/photos-premium/vue-rapprochee-du-piment-poivrons-fond-blanc_1048944-14498216.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Franceville',
      producteur: 'AgriPiment',
    },
    {
      id: 15,
      nom: 'Aubergine',
      description: 'Aubergine fraîche et bio',
      categorie: 'Végétaux',
      prix: 1500,
      promotion: false,
      image: 'https://img.freepik.com/photos-premium/aubergines-blanches-fraiches-fond-blanc_1077802-130512.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Lambaréné',
      producteur: 'AgriLamba',
    },
    {
      id: 16,
      nom: 'Arachide',
      description: 'Arachide de qualité ',
      categorie: 'Végétaux',
      prix: 5500,
      promotion: true,
      image: 'https://img.freepik.com/photos-premium/pot-beurre-arachide-fond-arachide_185193-23262.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Oyem',
      producteur: 'Ferme Oyem',
    },
    {
      id: 17,
      nom: 'Choux',
      description: 'Choux frais',
      categorie: 'végétaux',
      prix: 7500,
      promotion: false,
      image: 'https://img.freepik.com/vecteurs-libre/ensemble-realiste-du-chou-blanc-frais-brocoli-feuilles-chou-fleur-isole_1284-33371.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Franceville',
      producteur: 'AGRIVI',
    },
    {
      id: 18,
      nom: 'Carotte',
      description: 'Carottes de qualité supérieure',
      categorie: 'Végétaux',
      prix: 3500,
      promotion: true,
      image: 'https://img.freepik.com/photos-premium/legumes-carottes-fraiches-isoles-blanc_80510-413.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid',
      localisation: 'Tchibanga',
      producteur: 'AgriTchib',
    },
  ];

  // Filtrage des produits
  const filteredProducts = produits.filter((produit) => {
    const matchesSearch = produit.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Catégories' || produit.categorie === selectedCategory;
    const matchesLocation = selectedLocation === 'Localisation' || produit.localisation === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Pagination
  const productsPerPage = 6;
  const pageCount = Math.ceil(filteredProducts.length / productsPerPage);
  const displayedProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );

  // Ajouter un produit au panier
  const addToCart = (produit) => {
    const existingProduct = cart.find((item) => item.id === produit.id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === produit.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...produit, quantity: 1 }]);
    }
  };

  // Modifier la quantité d'un produit dans le panier
  const updateQuantity = (id, quantity) => {
    if (quantity === 0) {
      setCart(cart.filter((item) => item.id !== id));
    } else {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity: quantity } : item
        )
      );
    }
  };

  // Vider le panier
  const clearCart = () => {
    setCart([]);
  };

  // Calculer le total du panier
  const totalCart = cart.reduce((total, produit) => total + produit.prix * produit.quantity, 0);

  // Déconnexion
  const handleLogout = () => {
    navigate('/');
  };

  // Suivi de commande
  const steps = ['Commande validée', 'En cours de livraison', 'Livrée'];

  // Images pour les modes de paiement
  const paymentMethods = [
    { name: 'Airtel Money', image: 'https://www.vhv.rs/dpng/d/422-4221364_send-cash-to-ghana-airtel-logo-new-hd.png' },
    { name: 'Moov Money', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfc4gHsakgFMod4ogYJNgXEJ_B3L_MY60o5A&s' },
    { name: 'Bamboo Mobile', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvxZ5zj8MB6aNFefai7zR4C010hZK6lyQPxqWyhgh_Jq6RfqxEsIIYzUVQlXN6DHT-Id0&usqp=CAU' },
    { name: 'Paiement à la livraison', image: 'https://e7.pngegg.com/pngimages/1017/516/png-clipart-advance-payment-computer-icons-money-cash-payment-icon-dollar-bill-illustration-miscellaneous-angle-thumbnail.png' },
  ];

  // Valider le paiement
  const handlePayment = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setShowCheckout(false);
      setActiveStep(1);
    }, 2000);
  };

  // Générer la facture en PDF
  const generateInvoice = () => {
    const doc = new jsPDF();

    // Informations de l'émetteur
    doc.setFontSize(18);
    doc.text('Facture N° : 2025-GAB-001', 10, 20);
    doc.setFontSize(12);
    doc.text('Émetteur : AgriGabon SARL', 10, 30);
    doc.text('Adresse : Quartier Nzeng Ayong, Libreville', 10, 40);
    doc.text('RCCM : LBV123456', 10, 50);
    doc.text('NIF : 1234567890123', 10, 60);
    doc.text('Téléphone : +241 01 23 45 67', 10, 70);
    doc.text('E-mail : contact@agrigabon.com', 10, 80);

    // Informations du client
    doc.text('Client : Restaurant USTM', 10, 100);
    doc.text('Adresse : Mbaya, Franceville', 10, 110);
    doc.text('NIF : 9876543210987', 10, 120);
    doc.text('Date : 08/03/2025 : 00:21', 10, 130);

    // Produits
    doc.text('Produits :', 10, 150);
    let y = 160;
    cart.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.nom} - ${item.quantity} kg x ${item.prix} FCFA = ${item.quantity * item.prix} FCFA HT`,
        10,
        y
      );
      y += 10;
    });

    // Total
    doc.text(`Sous-total HT : ${totalCart} FCFA`, 10, y + 10);
    doc.text(`TVA (18 %) : ${totalCart * 0.18} FCFA`, 10, y + 20);
    doc.text(`Total TTC : ${totalCart * 1.18} FCFA`, 10, y + 30);

    // Mode de paiement
    doc.text('Mode de paiement : Mobile Money (Airtel Money)', 10, y + 50);
    doc.text('Référence : TRX20250308-A123', 10, y + 60);

    // Conditions
    doc.text('Conditions : Aucun retour après 24 jours.', 10, y + 80);

    // Enregistrer le PDF
    doc.save('facture.pdf');
  };

  return (
    <div>
      {/* Barre d'application */}
      <AppBar position="static" sx={{ bgcolor: 'green', color: 'white' }}>
        <Toolbar>
          <Avatar sx={{ bgcolor: 'white', color: 'green', mr: 2 }}>U</Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Marché Agricole
          </Typography>
          {!isMobile && (
            <>
              <TextField
                variant="outlined"
                placeholder="Rechercher un produit..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ marginRight: 2, bgcolor: 'white' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                size="small"
                sx={{ marginRight: 2, bgcolor: 'white' }}
              >
                <MenuItem value="Catégories">Catégories</MenuItem>
                <MenuItem value="Animaux">Produits Animaux</MenuItem>
                <MenuItem value="Végétaux">Produits Végétaux</MenuItem>
              </Select>
              <Select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                size="small"
                sx={{ marginRight: 2, bgcolor: 'white' }}
              >
                <MenuItem value="Localisation">Localisation</MenuItem>
                <MenuItem value="Libreville">Libreville</MenuItem>
                <MenuItem value="Port-Gentil">Port-Gentil</MenuItem>
                <MenuItem value="Oyem">Oyem</MenuItem>
                <MenuItem value="Franceville">Franceville</MenuItem>
                <MenuItem value="Lambaréné">Lambaréné</MenuItem>
                <MenuItem value="Tchibanga">Tchibanga</MenuItem>
              </Select>
            </>
          )}
          <IconButton color="inherit" onClick={() => setShowCart(true)}>
            <Badge badgeContent={cart.length} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Titre de bienvenue */}
      <Box
        sx={{
          textAlign: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.05)',
          p: 3,
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
          mx: 4,
          my: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: 'green',
            fontWeight: 'bold',
            fontSize: { xs: '1rem', sm: '1.4rem', md: '1.8rem' },
          }}
        >
          BIENVENUE SUR LE MARCHE AGRICOLE NUMÉRIQUE DU GABON
        </Typography>
      </Box>

      {/* Barre de recherche et filtres en mode mobile */}
      {isMobile && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Rechercher un produit..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ bgcolor: 'white' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            size="small"
            sx={{ bgcolor: 'white' }}
          >
            <MenuItem value="Catégories">Catégories</MenuItem>
            <MenuItem value="Animaux">Produits Animaux</MenuItem>
            <MenuItem value="Végétaux">Produits Végétaux</MenuItem>
          </Select>
          <Select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            size="small"
            sx={{ bgcolor: 'white' }}
          >
            <MenuItem value="Localisation">Localisation</MenuItem>
            <MenuItem value="Libreville">Libreville</MenuItem>
            <MenuItem value="Port-Gentil">Port-Gentil</MenuItem>
            <MenuItem value="Oyem">Oyem</MenuItem>
            <MenuItem value="Franceville">Franceville</MenuItem>
            <MenuItem value="Lambaréné">Lambaréné</MenuItem>
            <MenuItem value="Tchibanga">Tchibanga</MenuItem>
          </Select>
        </Box>
      )}

      {/* Affichage des produits */}
      <Grid container spacing={3} sx={{ padding: 3 }}>
        {displayedProducts.map((produit) => (
          <Grid item key={produit.id} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={produit.image}
                alt={produit.nom}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">
                  {produit.nom}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {produit.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <LocationOn fontSize="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {produit.localisation}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Producteur : {produit.producteur}
                </Typography>
                <Typography variant="h6" color="primary">
                  {produit.prix} XAF
                </Typography>
                {produit.promotion && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocalOffer color="secondary" />
                    <Typography variant="body2" color="secondary" sx={{ ml: 1 }}>
                      En promotion
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => addToCart(produit)}
                  startIcon={<ShoppingCart />}
                >
                  Ajouter au panier
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={(event, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Panier */}
      <Drawer anchor="right" open={showCart} onClose={() => setShowCart(false)}>
        <Box sx={{ width: 350, padding: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Votre Panier
          </Typography>
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setShowCart(false)}
          >
            <Close />
          </IconButton>
          <List>
            {cart.map((item) => (
              <ListItem key={item.id}>
                <ListItemText
                  primary={item.nom}
                  secondary={`${item.prix} XAF x ${item.quantity}`}
                />
                <TextField
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  size="small"
                  sx={{ width: 60 }}
                />
              </ListItem>
            ))}
          </List>
          <Divider />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Total : {totalCart} XAF
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => {
              setShowCart(false);
              setShowCheckout(true);
            }}
          >
            Passer à la commande
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            onClick={generateInvoice}
          >
            Exporter la facture en PDF
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            onClick={clearCart}
            startIcon={<Delete />}
          >
            Vider le panier
          </Button>
        </Box>
      </Drawer>

      {/* Modal de paiement */}
      <Modal open={showCheckout} onClose={() => setShowCheckout(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Choisissez un mode de paiement
          </Typography>
          {paymentMethods.map((method) => (
            <Button
              key={method.name}
              variant="outlined"
              fullWidth
              sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}
              onClick={handlePayment}
            >
              <img src={method.image} alt={method.name} width="30" />
              {method.name}
            </Button>
          ))}
          {paymentSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Paiement effectué avec succès !
            </Alert>
          )}
        </Box>
      </Modal>

      {/* Suivi de commande */}
      <Modal open={activeStep > 0} onClose={() => setActiveStep(0)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => setActiveStep(0)}
          >
            Fermer
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default DashboardBuyer;