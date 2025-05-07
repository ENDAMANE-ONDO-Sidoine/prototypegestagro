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
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Options de livraison
  const deliveryOptions = [
    { id: 1, name: 'Retrait chez le producteur', description: 'Vous récupérez votre commande directement chez l\'agriculteur', price: 0 },
    { id: 2, name: 'Moto-taxi', description: 'Livraison rapide pour petites commandes (jusqu\'à 10kg)', price: 2000, maxWeight: 10 },
    { id: 3, name: 'Voiture particulière', description: 'Livraison standard pour commandes moyennes (10-50kg)', price: 5000, maxWeight: 50 },
    { id: 4, name: 'Camionnette', description: 'Livraison pour grosses commandes (50-200kg)', price: 10000, maxWeight: 200 },
  ];

  const [deliveryMethod, setDeliveryMethod] = useState(deliveryOptions[0]);

  // Données des produits
  const produits = [
    { id: 1, nom: 'Poulet', description: 'Poulet fermier élevé en plein air', categorie: 'Animaux', prix: 5000, promotion: true, image: 'https://img.freepik.com/photos-gratuite/viande-poulet-cru_1203-6759.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Libreville', producteur: 'Ferme Bio Gabon' },
    { id: 2, nom: 'Boeuf', description: 'Viande de boeuf locale', categorie: 'Animaux', prix: 10000, promotion: false, image: 'https://img.freepik.com/psd-gratuit/belle-photo-vache_23-2151840220.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Ndendé', producteur: 'Agropag' },
    { id: 3, nom: 'Poisson', description: 'Poisson frais pêché localement', categorie: 'Animaux', prix: 7000, promotion: true, image: 'https://img.freepik.com/photos-premium/nourriture-pour-poissons-eau-douce_16596-938.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Oyem', producteur: 'Pêcherie Oyem' },
    { id: 4, nom: 'Banane plantain', description: 'Banane plantain bio', categorie: 'Végétaux', prix: 2000, promotion: false, image: 'https://img.freepik.com/photos-premium/isolat-banane-mure-jaune-fond-blanc_1048944-19422939.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Franceville', producteur: 'Agrivi' },
    { id: 5, nom: 'Manioc', description: 'Manioc frais', categorie: 'Végétaux', prix: 1500, promotion: true, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwqwHt1PV87KQBJVRnS8xLH2f8Ft4AXVwRdA&s', localisation: 'Lambaréné', producteur: 'AgriLamba' },
    { id: 6, nom: 'Igname', description: 'Igname de qualité supérieure', categorie: 'Végétaux', prix: 3000, promotion: false, image: 'https://img.freepik.com/photos-premium/seul-yams-africain-cru-entier-fond-blanc_857988-6574.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Tchibanga', producteur: 'Tchibanga Agro' },
    { id: 7, nom: 'Tomate', description: 'Tomate fraîche et bio', categorie: 'Végétaux', prix: 1000, promotion: false, image: 'https://img.freepik.com/photos-gratuite/tomates-rouges-fraiches_2829-13449.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Libreville', producteur: 'Potager Mengue' },
    { id: 8, nom: 'Oignon', description: 'Oignon local de qualité', categorie: 'Végétaux', prix: 800, promotion: true, image: 'https://img.freepik.com/photos-premium/oignon-rouge-close-up-detail-isole_404043-885.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Port-Gentil', producteur: 'AgriPort' },
    { id: 9, nom: 'Pomme de terre', description: 'Pomme de terre fraîche', categorie: 'Végétaux', prix: 1200, promotion: false, image: 'https://img.freepik.com/photos-premium/plusieurs-tubercules-jeunes-pommes-terre-se-trouvent-fond-blanc-isole_414617-660.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Medouneu', producteur: 'AgriMed' },
    { id: 10, nom: 'Ananas', description: 'Ananas sucré et juteux', categorie: 'Végétaux', prix: 2500, promotion: true, image: 'https://img.freepik.com/vecteurs-premium/vecteur-ensemble-ananas-3d-realiste-detaille-tranches-entieres-rondes_287964-9500.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Lambaréné', producteur: 'FruitLamba' },
    { id: 11, nom: 'Mangue', description: 'Mangue mûre et savoureuse', categorie: 'Végétaux', prix: 3000, promotion: false, image: 'https://img.freepik.com/photos-gratuite/nature-morte-mangue_23-2151542114.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Tchibanga', producteur: 'FruitTchib' },
    { id: 12, nom: 'Citron', description: 'Citron frais et acide', categorie: 'Végétaux', prix: 500, promotion: true, image: 'https://img.freepik.com/photos-premium/citron-vert-frais-citron-isole-blanc_93675-10925.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Libreville', producteur: 'AgriCitron' },
    { id: 13, nom: 'Avocat', description: 'Avocat crémeux et nutritif', categorie: 'Végétaux', prix: 2000, promotion: false, image: 'https://img.freepik.com/photos-gratuite/fruit-avocat-coupe-cote-autre_482257-22787.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Port-Gentil', producteur: 'FruitPort' },
    { id: 14, nom: 'Piment', description: 'Piment fort et piquant', categorie: 'Végétaux', prix: 700, promotion: true, image: 'https://img.freepik.com/photos-premium/vue-rapprochee-du-piment-poivrons-fond-blanc_1048944-14498216.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Franceville', producteur: 'Agrivi' },
    { id: 15, nom: 'Aubergine', description: 'Aubergine fraîche et bio', categorie: 'Végétaux', prix: 1500, promotion: false, image: 'https://img.freepik.com/photos-premium/aubergines-blanches-fraiches-fond-blanc_1077802-130512.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Lambaréné', producteur: 'AgriLamba' },
    { id: 16, nom: 'Arachide', description: 'Arachide de qualité', categorie: 'Végétaux', prix: 5500, promotion: true, image: 'https://img.freepik.com/photos-premium/pot-beurre-arachide-fond-arachide_185193-23262.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Oyem', producteur: 'Ferme Oyem' },
    { id: 17, nom: 'Choux', description: 'Choux frais', categorie: 'végétaux', prix: 7500, promotion: false, image: 'https://img.freepik.com/vecteurs-libre/ensemble-realiste-du-chou-blanc-frais-brocoli-feuilles-chou-fleur-isole_1284-33371.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Franceville', producteur: 'AGRIVI' },
    { id: 18, nom: 'Carotte', description: 'Carottes de qualité supérieure', categorie: 'Végétaux', prix: 3500, promotion: true, image: 'https://img.freepik.com/photos-premium/legumes-carottes-fraiches-isoles-blanc_80510-413.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid', localisation: 'Tchibanga', producteur: 'AgriTchib' },
    { id: 19, nom: 'Pastèque', description: 'Pastèque sucrée et juteuse', categorie: 'Végétaux', prix: 2500, promotion: true, image: 'https://img.freepik.com/photos-premium/pasteque-isole-blanc_253984-5306.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid&w=740', localisation: 'Lambaréné', producteur: 'FruitGabon' },
    { id: 20, nom: 'Papaye', description: 'Papaye mûre et parfumée', categorie: 'Végétaux', prix: 1800, promotion: false, image: 'https://img.freepik.com/photos-premium/vue-rapprochee-fruit-orange-fond-blanc_1048944-16444569.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid&w=740', localisation: 'Libreville', producteur: 'Papaya Express' },
    { id: 22, nom: 'Feuille de manioc', description: 'Feuilles de manioc pilées', categorie: 'Végétaux', prix: 1000, promotion: false, image: 'https://img.freepik.com/photos-premium/plante-verte-fleur-rouge-au-milieu_1216253-29.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid&w=740', localisation: 'Franceville', producteur: 'Ferme Verte' },
    { id: 23, nom: 'Folon', description: 'Feuille de folon fraîche', categorie: 'Végétaux', prix: 1200, promotion: true, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLT9IrKZ8wimZKELzMvfO13DXU60VqPChINA&s', localisation: 'Oyem', producteur: 'NatureNord' },
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

  // Pagination - 12 produits par page
  const productsPerPage = 12;
  const pageCount = Math.ceil(filteredProducts.length / productsPerPage);
  const displayedProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );

  // Calcul du poids total de la commande
  const totalWeight = cart.reduce((total, item) => total + item.quantity, 0);

  // Filtrage des options de livraison disponibles selon le poids
  const availableDeliveryOptions = deliveryOptions.filter(option => 
    option.id === 1 || (option.maxWeight && totalWeight <= option.maxWeight)
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
    { name: 'Airtel Money', image: 'https://businesspost.ng/wp-content/uploads/2021/03/Airtel-Money.png' },
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
    
    // Infos livraison
    doc.text(`Mode de livraison: ${deliveryMethod.name}`, 15, 110);
    if (deliveryMethod.id !== 1) {
      doc.text(`Adresse de livraison: ${deliveryAddress}`, 15, 115);
      doc.text(`Frais de livraison: ${formatNumber(deliveryMethod.price)} FCFA`, 15, 120);
    }
    
    // Données tableau
    const tableData = cart.map((item, index) => [
      index + 1,
      item.nom,
      `${item.quantity} kg`,
      `${formatNumber(item.prix)} FCFA`,
      `${formatNumber(item.quantity * item.prix)} FCFA`
    ]);
    
    const tva = totalCart * 0.18;
    const totalTTC = totalCart * 1.18 + deliveryMethod.price;
    
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

    if (deliveryMethod.price > 0) {
      tableData.push([
        { content: '', colSpan: 3, styles: { fontStyle: 'bold' } },
        { content: 'Frais de livraison:', styles: { fontStyle: 'bold', halign: 'right' } },
        { content: `${formatNumber(deliveryMethod.price)} FCFA`, styles: { fontStyle: 'bold' } }
      ]);
    }
    
    tableData.push([
      { content: '', colSpan: 3, styles: { fontStyle: 'bold' } },
      { content: 'Total TTC:', styles: { fontStyle: 'bold', halign: 'right' } },
      { content: `${formatNumber(totalTTC)} FCFA`, styles: { fontStyle: 'bold', textColor: [34, 139, 34] } }
    ]);

    // Génération tableau
    doc.autoTable({
      startY: 130,
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
                    setShowDeliveryOptions(true);
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

        <Modal open={showDeliveryOptions} onClose={() => setShowDeliveryOptions(false)}>
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
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
              Options de livraison
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              Poids total de votre commande: <strong>{totalWeight} kg</strong>
            </Typography>
            
            <List>
              {availableDeliveryOptions.map((option) => (
                <ListItem 
                  key={option.id}
                  button
                  selected={deliveryMethod.id === option.id}
                  onClick={() => {
                    setDeliveryMethod(option);
                    setShowDeliveryOptions(false);
                    setShowCheckout(true);
                  }}
                  sx={{
                    mb: 1,
                    border: '1px solid',
                    borderColor: deliveryMethod.id === option.id ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(0, 128, 0, 0.05)'
                    }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {option.name}
                      </Typography>
                      <Typography variant="subtitle1">
                        {option.price > 0 ? `${formatNumber(option.price)} FCFA` : 'Gratuit'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
            
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => {
                setShowDeliveryOptions(false);
                setShowCart(true);
              }}
            >
              Retour au panier
            </Button>
          </Box>
        </Modal>

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
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
              {deliveryMethod.id === 1 ? 'Récupération de la commande' : 'Livraison'}
            </Typography>
            
            <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(0, 128, 0, 0.05)', borderRadius: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {deliveryMethod.name}
              </Typography>
              <Typography variant="body2">
                {deliveryMethod.description}
              </Typography>
              {deliveryMethod.id !== 1 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Frais de livraison: <strong>{formatNumber(deliveryMethod.price)} FCFA</strong>
                </Typography>
              )}
            </Box>
            
            {deliveryMethod.id !== 1 && (
              <TextField
                label="Adresse de livraison"
                fullWidth
                sx={{ mb: 2 }}
                placeholder="Entrez votre adresse complète"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            )}
            
            {deliveryMethod.id === 1 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Vous serez contacté par le producteur pour convenir d'un rendez-vous de retrait.
              </Alert>
            )}
            
            <Typography variant="h6" sx={{ mt: 2, mb: 1, textAlign: 'center' }}>
              Total: <strong>{formatNumber(totalCart * 1.18 + (deliveryMethod.price || 0))} FCFA</strong>
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
              (Dont {formatNumber(totalCart * 0.18)} FCFA de TVA et {formatNumber(deliveryMethod.price)} FCFA de frais de livraison)
            </Typography>
            
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
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Mode de livraison: {deliveryMethod.name}
              </Typography>
              {deliveryMethod.id !== 1 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Adresse: {deliveryAddress}
                </Typography>
              )}
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