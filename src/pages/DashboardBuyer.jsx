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
  Container,
} from '@mui/material';
import {
  Search,
  ShoppingCart,
  Close,
  LocationOn,
  Logout,
  Delete,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // Données des produits
  const produits = [
    { id: 1,
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
      localisation: 'Ndendé',
      producteur: 'Agropag',
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
      producteur: 'Agrivi',
    },
    {
      id: 5,
      nom: 'Manioc',
      description: 'Manioc frais',
      categorie: 'Végétaux',
      prix: 1500,
      promotion: true,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwqwHt1PV87KQBJVRnS8xLH2f8Ft4AXVwRdA&s',
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
      localisation: 'Medouneu',
      producteur: 'AgriMed',
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
      producteur: 'Agrivi',
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
    { id: 19, nom: 'Pastèque', description: 'Pastèque sucrée et juteuse', categorie: 'Végétaux', prix: 2500, promotion: true, image: 'https://img.freepik.com/photos-premium/pasteque-isole-blanc_253984-5306.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid&w=740', localisation: 'Lambaréné', producteur: 'FruitGabon' },
{ id: 20, nom: 'Papaye', description: 'Papaye mûre et parfumée', categorie: 'Végétaux', prix: 1800, promotion: false, image: 'https://img.freepik.com/photos-premium/vue-rapprochee-fruit-orange-fond-blanc_1048944-16444569.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid&w=740', localisation: 'Libreville', producteur: 'Papaya Express' },
{ id: 22, nom: 'Feuille de manioc', description: 'Feuilles de manioc pilées', categorie: 'Végétaux', prix: 1000, promotion: false, image: 'https://img.freepik.com/photos-premium/plante-verte-fleur-rouge-au-milieu_1216253-29.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid&w=740', localisation: 'Franceville', producteur: 'Ferme Verte' },
{ id: 23, nom: 'Folon', description: 'Feuille de folon fraîche', categorie: 'Végétaux', prix: 1200, promotion: true, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLT9IrKZ8wimZKELzMvfO13DXU60VqPChINA&s', localisation: 'Oyem', producteur: 'NatureNord' },
{ id: 24, nom: 'Huile de palme', description: 'Huile de palme rouge artisanale', categorie: 'Produits transformés', prix: 3500, promotion: false, image: 'data:image/jpeg;base64,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', localisation: 'Ndendé', producteur: 'PalmaGabon' },
{ id: 27, nom: 'Miel', description: 'Miel pur de forêt gabonaise', categorie: 'Produits transformés', prix: 6000, promotion: true, image: 'https://img.freepik.com/photos-gratuite/bouteille-miel-dessin-anime-3d_23-2151754451.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid&w=740', localisation: 'Lastoursville', producteur: 'Miel du Haut-Ogooué' },
{ id: 29, nom: 'Chenilles', description: 'Chenilles comestibles séchées', categorie: 'Animaux', prix: 5000, promotion: false, image: 'https://img.freepik.com/photos-premium/groupe-chenilles-sont-feuille_782156-52.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid&w=740', localisation: 'Mouila', producteur: 'Rural Insecta' },
{ id: 30, nom: 'Escargots', description: 'Escargots géants africains', categorie: 'Animaux', prix: 4500, promotion: true, image: 'https://img.freepik.com/photos-gratuite/escargot-realiste-dans-nature_23-2150417280.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid&w=740', localisation: 'Kango', producteur: 'SnailAgro' },
{ id: 36, nom: 'Vin de palme', description: 'Vin de palme traditionnel', categorie: 'Boissons', prix: 2000, promotion: false, image: 'https://img.freepik.com/photos-premium/morceau-jus-canne-sucre-fond-blanc_525574-3715.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid&w=740', localisation: 'Ndjolé', producteur: 'FermentLocal' },
{ id: 37, nom: 'Gingembre', description: 'Racine de gingembre frais', categorie: 'Végétaux', prix: 1300, promotion: true, image: 'https://img.freepik.com/photos-premium/racine-gingembre-isole-close-up_183352-665.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid&w=740', localisation: 'Libreville', producteur: 'Gingembre du Nord' },

  ];

  // Filtrage des produits
  const filteredProducts = produits.filter((produit) => {
    const matchesSearch = produit.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Catégories' || produit.categorie === selectedCategory;
    const matchesLocation = selectedLocation === 'Localisation' || produit.localisation === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Pagination - 12 produits par page (soit l'alignement de 3 produits en largeur et 4 produits en hauteur)
  const productsPerPage = 12;
  const pageCount = Math.ceil(filteredProducts.length / productsPerPage);
  const displayedProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );

  // Gestion du panier
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

  const clearCart = () => {
    setCart([]);
  };

  const totalCart = cart.reduce((total, produit) => total + produit.prix * produit.quantity, 0);

  // Déconnexion
  const handleLogout = () => {
    navigate('/');
  };

  // Suivi de commande
  const steps = ['Commande validée', 'En cours de livraison', 'Livrée'];

  // Modes de paiement
  const paymentMethods = [
    { name: 'Airtel Money', image: 'https://www.vhv.rs/dpng/d/422-4221364_send-cash-to-ghana-airtel-logo-new-hd.png' },
    { name: 'Moov Money', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfc4gHsakgFMod4ogYJNgXEJ_B3L_MY60o5A&s' },
    { name: 'Bamboo Mobile', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvxZ5zj8MB6aNFefai7zR4C010hZK6lyQPxqWyhgh_Jq6RfqxEsIIYzUVQlXN6DHT-Id0&usqp=CAU' },
    { name: 'Paiement à la livraison', image: 'https://e7.pngegg.com/pngimages/1017/516/png-clipart-advance-payment-computer-icons-money-cash-payment-icon-dollar-bill-illustration-miscellaneous-angle-thumbnail.png' },
  ];

  // Formatage des nombres
  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  // Paiement
  const handlePayment = (method) => {
    setSelectedPaymentMethod(method);
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setShowCheckout(false);
      setActiveStep(1);
      generateInvoice(method);
    }, 2000);
  };

  // Génération de la facture
  const generateInvoice = (paymentMethod) => {
    const doc = new jsPDF();
    const now = new Date();
    
    // En-tête
    doc.setFillColor(34, 139, 34);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('GESTAGRO', 15, 20);
    
    // Infos société
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Marché Agricole Numérique du Gabon', 15, 35);
    doc.text('Fournisseur : AGRIVI', 15, 40);
    doc.text('Quartier Mvégué Village, Franceville', 15, 45);
    doc.text('RCCM: LBV123456 | NIF: 1234567890123', 15, 50);
    doc.text('Tél: +241 01 23 45 67 | Email: contact@agrivi.com', 15, 55);
    
    // Titre facture
    doc.setFontSize(16);
    doc.setTextColor(34, 139, 34);
    doc.text('FACTURE', 105, 70, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`N°: INV-${now.getFullYear()}-${Math.floor(Math.random() * 1000)}`, 105, 75, { align: 'center' });
    doc.text(`Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 105, 80, { align: 'center' });
    
    // Infos client
    doc.setFontSize(12);
    doc.text('Client:', 15, 90);
    doc.text('Restaurant USTM', 15, 95);
    doc.text('Mbaya, Franceville', 15, 100);
    
    
    // Données tableau
    const tableData = cart.map((item, index) => [
      index + 1,
      item.nom,
      `${item.quantity} kg`,
      `${formatNumber(item.prix)} FCFA`,
      `${formatNumber(item.quantity * item.prix)} FCFA`
    ]);
    
    const tva = totalCart * 0.18;
    const totalTTC = totalCart * 1.18;
    
    tableData.push([
      { content: '', colSpan: 3, styles: { fontStyle: 'bold' } },
      { content: 'Sous-total:', styles: { fontStyle: 'bold', halign: 'right' } },
      { content: `${formatNumber(totalCart)} FCFA`, styles: { fontStyle: 'bold' } }
    ]);
    
    tableData.push([
      { content: '', colSpan: 3, styles: { fontStyle: 'bold' } },
      { content: 'TVA (18%):', styles: { fontStyle: 'bold', halign: 'right' } },
      { content: `${formatNumber(tva)} FCFA`, styles: { fontStyle: 'bold' } }
    ]);
    
    tableData.push([
      { content: '', colSpan: 3, styles: { fontStyle: 'bold' } },
      { content: 'Total TTC:', styles: { fontStyle: 'bold', halign: 'right' } },
      { content: `${formatNumber(totalTTC)} FCFA`, styles: { fontStyle: 'bold', textColor: [34, 139, 34] } }
    ]);

    // Génération tableau
    doc.autoTable({
      startY: 115,
      head: [['#', 'Désignation', 'Quantité', 'Prix unitaire', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 139, 34],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 60 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 }
      },
      margin: { top: 10 },
      styles: {
        overflow: 'linebreak',
        cellPadding: 2,
        fontSize: 10
      },
      didDrawPage: function(data) {
        const finalY = data.cursor.y;
        
        // Infos paiement
        doc.setFontSize(10);
        doc.text(`Mode de paiement: ${paymentMethod}`, 15, finalY + 15);
        doc.text(`Référence: TRX${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`, 15, finalY + 20);
        doc.text('Conditions: Aucun retour après 24h.', 15, finalY + 25);
        
        // Pied de page
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Merci pour votre confiance!', 105, 285, { align: 'center' });
        doc.text('GESTAGRO - Tous droits réservés © ' + now.getFullYear(), 105, 290, { align: 'center' });
      }
    });
    
    doc.save(`Facture_GESTAGRO_${now.toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      <AppBar position="fixed" sx={{ bgcolor: 'green', color: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Avatar sx={{ bgcolor: 'white', color: 'green', mr: 2 }}>U</Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            GESTAGRO
          </Typography>
          {!isMobile && (
            <>
              <TextField
                variant="outlined"
                placeholder="Rechercher un produit..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ marginRight: 2, bgcolor: 'white', borderRadius: 1 }}
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
                sx={{ marginRight: 2, bgcolor: 'white', borderRadius: 1, minWidth: 150 }}
              >
                <MenuItem value="Catégories">Catégories</MenuItem>
                <MenuItem value="Animaux">Produits Animaux</MenuItem>
                <MenuItem value="Végétaux">Produits Végétaux</MenuItem>
              </Select>
              <Select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                size="small"
                sx={{ marginRight: 2, bgcolor: 'white', borderRadius: 1, minWidth: 150 }}
              >
                <MenuItem value="Localisation">Localisation</MenuItem>
                <MenuItem value="Libreville">Libreville</MenuItem>
                <MenuItem value="Medouneu">Medouneu</MenuItem>
                <MenuItem value="Port-Gentil">Port-Gentil</MenuItem>
                <MenuItem value="Oyem">Oyem</MenuItem>
                <MenuItem value="Franceville">Franceville</MenuItem>
                <MenuItem value="Lambaréné">Lambaréné</MenuItem>
                <MenuItem value="Tchibanga">Tchibanga</MenuItem>
                <MenuItem value="Ndendé">Ndendé</MenuItem>
              </Select>
            </>
          )}
          <IconButton color="inherit" onClick={() => setShowCart(true)}>
            <Badge badgeContent={cart.reduce((sum, item) => sum + item.quantity, 0)} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        <Box
          sx={{
            textAlign: 'center',
            bgcolor: 'rgba(0, 128, 0, 0.1)',
            p: 3,
            border: '1px solid rgba(0, 128, 0, 0.2)',
            borderRadius: 2,
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: 'green',
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            }}
          >
            BIENVENUE SUR LE MARCHE AGRICOLE NUMERIQUE DU GABON
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 2, color: 'text.secondary' }}>
            Achetez directement auprès des producteurs locaux
          </Typography>
        </Box>

        {isMobile && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, bgcolor: 'rgba(0, 128, 0, 0.05)', borderRadius: 2, mb: 3 }}>
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
        
        {/* Section des produits pour un alignement stable */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 3,
            padding: 3,
            alignItems: 'stretch'
          }}
        >
          {displayedProducts.map((produit) => (
            <Card
              key={produit.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                },
                border: '1px solid rgba(0, 128, 0, 0.1)',
                position: 'relative'
              }}
            >
              {produit.promotion && (
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bgcolor: 'red',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: '0 4px 0 4px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  zIndex: 1
                }}>
                  PROMO
                </Box>
              )}
              
              {/* Conteneur d'image avec ratio fixe */}
              <Box sx={{ 
                position: 'relative',
                width: '100%',
                pt: '75%', // Ratio 4:3
                overflow: 'hidden'
              }}>
                <CardMedia
                  component="img"
                  image={produit.image}
                  alt={produit.nom}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {produit.nom}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {produit.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <LocationOn fontSize="small" color="primary" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {produit.localisation}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                  Producteur: {produit.producteur}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                  {formatNumber(produit.prix)} FCFA
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => addToCart(produit)}
                  startIcon={<ShoppingCart />}
                  sx={{ borderRadius: 2 }}
                >
                  Ajouter au panier
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>

        {pageCount > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
              shape="rounded"
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>
        )}

        <Drawer anchor="right" open={showCart} onClose={() => setShowCart(false)}>
          <Box sx={{ width: isMobile ? '100%' : 400, padding: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Votre Panier
              </Typography>
              <IconButton onClick={() => setShowCart(false)}>
                <Close />
              </IconButton>
            </Box>
            
            {cart.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <ShoppingCart sx={{ fontSize: 60, color: 'text.disabled' }} />
                <Typography variant="h6" sx={{ mt: 2 }}>Votre panier est vide</Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Ajoutez des produits pour commencer vos achats
                </Typography>
              </Box>
            ) : (
              <>
                <List>
                  {cart.map((item) => (
                    <ListItem key={item.id} sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar 
                          src={item.image} 
                          alt={item.nom} 
                          sx={{ width: 60, height: 60, mr: 2 }}
                          variant="rounded"
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1">{item.nom}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatNumber(item.prix)} FCFA / kg
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Button
                              size="small"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              sx={{ minWidth: 30 }}
                            >
                              -
                            </Button>
                            <TextField
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updateQuantity(item.id, val);
                              }}
                              size="small"
                              sx={{ width: 60, mx: 1 }}
                              inputProps={{ style: { textAlign: 'center' } }}
                            />
                            <Button
                              size="small"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              sx={{ minWidth: 30 }}
                            >
                              +
                            </Button>
                          </Box>
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {formatNumber(item.quantity * item.prix)} FCFA
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'right', mb: 2 }}>
                  <Typography variant="body1">
                    Sous-total: <strong>{formatNumber(totalCart)} FCFA</strong>
                  </Typography>
                  <Typography variant="body1">
                    TVA (18%): <strong>{formatNumber(totalCart * 0.18)} FCFA</strong>
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, color: 'green' }}>
                    Total: <strong>{formatNumber(totalCart * 1.18)} FCFA</strong>
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mb: 2, py: 1.5 }}
                  onClick={() => {
                    setShowCart(false);
                    setShowCheckout(true);
                  }}
                >
                  Passer la commande
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={() => generateInvoice('Non spécifié')}
                >
                  Télécharger la facture
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={clearCart}
                  startIcon={<Delete />}
                >
                  Vider le panier
                </Button>
              </>
            )}
          </Box>
        </Drawer>

        <Modal open={showCheckout} onClose={() => setShowCheckout(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isMobile ? '90%' : 500,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
              Choisissez un mode de paiement
            </Typography>
            
            <Grid container spacing={2}>
              {paymentMethods.map((method) => (
                <Grid item xs={6} key={method.name}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ 
                      p: 2,
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      height: '100%',
                      '&:hover': {
                        borderColor: 'green',
                        backgroundColor: 'rgba(0, 128, 0, 0.05)'
                      }
                    }}
                    onClick={() => handlePayment(method.name)}
                  >
                    <img 
                      src={method.image} 
                      alt={method.name} 
                      style={{ width: 50, height: 50, objectFit: 'contain', marginBottom: 8 }} 
                    />
                    <Typography variant="body2">{method.name}</Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
            
            {paymentSuccess && (
              <Alert 
                severity="success" 
                sx={{ mt: 3 }}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setPaymentSuccess(false)}
                  >
                    <Close fontSize="inherit" />
                  </IconButton>
                }
              >
                Paiement effectué avec succès ({selectedPaymentMethod})! Votre facture a été générée.
              </Alert>
            )}
          </Box>
        </Modal>

        <Modal open={activeStep > 0} onClose={() => setActiveStep(0)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isMobile ? '90%' : 500,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
              Suivi de votre commande
            </Typography>
            
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Votre commande est en cours de traitement.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Numéro de commande: CMD-{new Date().getFullYear()}-{Math.floor(Math.random() * 10000)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Mode de paiement: {selectedPaymentMethod}
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              fullWidth
              onClick={() => setActiveStep(0)}
              sx={{ py: 1.5 }}
            >
              Fermer
            </Button>
          </Box>
        </Modal>
      </Container>
    </div>
  );
};

export default DashboardBuyer;