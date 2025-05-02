import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Rating,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Données fictives pour les fournisseurs et les produits
const suppliers = [
    {
      id: 1,
      name: "AgriTech Gabon",
      region: "Estuaire",
      city: "Libreville",
      address: "123 Rue de l'Agriculture",
      phone: "+241 01 23 45 67",
      email: "contact@agritechga.com",
      website: "www.agritechga.com",
      rating: 4.7,
      reviews: [
        { id: 1, user: "Jean Okouma", comment: "Livraison rapide, produits de qualité.", rating: 5 },
      ],
      specialOffers: ["10% de réduction sur les engrais"],
    },
    {
      id: 2,
      name: "GreenFarm Solutions",
      region: "Haut-Ogooué",
      city: "Franceville",
      address: "456 Avenue des Cultures",
      phone: "+241 04 56 78 90",
      email: "info@greenfarmga.com",
      website: "www.greenfarmga.com",
      rating: 4.2,
      reviews: [
        { id: 1, user: "Marie Mba", comment: "Matériel robuste et durable.", rating: 4 },
      ],
      specialOffers: ["Livraison gratuite pour les commandes > 500 000 XAF"],
    },
    {
      id: 3,
      name: "Moyen-Ogooué Agri",
      region: "Moyen-Ogooué",
      city: "Lambaréné",
      address: "789 Rue des Pêcheurs",
      phone: "+241 07 89 01 23",
      email: "contact@moyenogoueagri.com",
      website: "www.moyenogoueagri.com",
      rating: 4.5,
      reviews: [
        { id: 1, user: "Paul Nzoghe", comment: "Service client exceptionnel.", rating: 5 },
      ],
      specialOffers: ["5% de réduction sur les semences"],
    },
    {
      id: 4,
      name: "Ngounié Agro",
      region: "Ngounié",
      city: "Mouila",
      address: "101 Rue des Plantations",
      phone: "+241 02 34 56 78",
      email: "info@ngounieagro.com",
      website: "www.ngounieagro.com",
      rating: 4.0,
      reviews: [
        { id: 1, user: "Alice Mboumba", comment: "Produits biologiques de qualité.", rating: 4 },
      ],
      specialOffers: ["Livraison express gratuite"],
    },
    {
      id: 5,
      name: "Nyanga Agri",
      region: "Nyanga",
      city: "Tchibanga",
      address: "202 Avenue des Fermiers",
      phone: "+241 03 45 67 89",
      email: "contact@nyangaagri.com",
      website: "www.nyangaagri.com",
      rating: 4.3,
      reviews: [
        { id: 1, user: "David Nzamba", comment: "Prix compétitifs et produits fiables.", rating: 4 },
      ],
      specialOffers: ["Réduction de 15% sur les engrais"],
    },
    {
      id: 6,
      name: "Ogooué-Ivindo Agro",
      region: "Ogooué-Ivindo",
      city: "Makokou",
      address: "303 Rue des Forêts",
      phone: "+241 06 78 90 12",
      email: "info@ogoueivindoagro.com",
      website: "www.ogoueivindoagro.com",
      rating: 4.6,
      reviews: [
        { id: 1, user: "Sarah Nzeng", comment: "Service rapide et professionnel.", rating: 5 },
      ],
      specialOffers: ["Offre spéciale sur les équipements"],
    },
    {
      id: 7,
      name: "Ogooué-Lolo Agri",
      region: "Ogooué-Lolo",
      city: "Koulamoutou",
      address: "404 Rue des Cultures",
      phone: "+241 05 67 89 01",
      email: "contact@ogoueloloagri.com",
      website: "www.ogoueloloagri.com",
      rating: 4.1,
      reviews: [
        { id: 1, user: "Luc Nzoghe", comment: "Produits de qualité supérieure.", rating: 4 },
      ],
      specialOffers: ["Réduction de 10% sur les semences"],
    },
    {
      id: 8,
      name: "Ogooué-Maritime Agro",
      region: "Ogooué-Maritime",
      city: "Port-Gentil",
      address: "505 Rue des Pêcheurs",
      phone: "+241 04 56 78 90",
      email: "info@ogouemaritimeagro.com",
      website: "www.ogouemaritimeagro.com",
      rating: 4.4,
      reviews: [
        { id: 1, user: "Clara Mba", comment: "Livraison rapide et fiable.", rating: 5 },
      ],
      specialOffers: ["Offre spéciale sur les engrais"],
    },
    {
      id: 9,
      name: "Woleu-Ntem Agri",
      region: "Woleu-Ntem",
      city: "Oyem",
      address: "606 Rue des Plantations",
      phone: "+241 01 23 45 67",
      email: "contact@woleuntemagri.com",
      website: "www.woleuntemagri.com",
      rating: 4.2,
      reviews: [
        { id: 1, user: "Pierre Nzoghe", comment: "Service client réactif.", rating: 4 },
      ],
      specialOffers: ["Réduction de 20% sur les équipements"],
    },
  ];
  
  const products = [
    {
      id: 1,
      name: "Engrais organique",
      price: "5000 XAF/sac",
      quantity: "50 sacs disponibles",
      location: "Libreville",
      image: "https://img.freepik.com/photos-premium/ingredients-pour-sol-plantes-pot-maison-tourbe-terre-sable-perlite-vermiculite-noix-coco-melange-pour-planter-plantes-dans-pot_292419-5568.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 1,
    },
    {
      id: 2,
      name: "Semences de maïs",
      price: "2000 XAF/kg",
      quantity: "100 kg disponibles",
      location: "Libreville",
      image: "https://img.freepik.com/photos-gratuite/mais-pop-corn_1368-8888.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 1,
    },
    {
      id: 3,
      name: "Tracteur",
      price: "5 000 000 XAF",
      quantity: "2 disponibles",
      location: "Franceville",
      image: "https://img.freepik.com/psd-gratuit/puissant-tracteur-vert-john-deere-est-machine-agricole-moderne_191095-82167.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 2,
    },
    {
      id: 4,
      name: "Système d'irrigation",
      price: "1 200 000 XAF",
      quantity: "10 disponibles",
      location: "Franceville",
      image: "https://img.freepik.com/photos-premium/ferme-the-chiang-rai-thailande_39704-1682.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 2,
    },
    {
      id: 5,
      name: "Engrais bio",
      price: "4500 XAF/sac",
      quantity: "30 sacs disponibles",
      location: "Lambaréné",
      image: "https://img.freepik.com/photos-premium/main-coupee-femme-tenant-plante_1048944-15701045.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 3,
    },
    {
      id: 6,
      name: "Semences de riz",
      price: "2500 XAF/kg",
      quantity: "80 kg disponibles",
      location: "Lambaréné",
      image: "https://img.freepik.com/photos-gratuite/sac-graines-riz-du-riz-blanc-petite-cuillere-bois-plant-riz_1150-35744.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 3,
    },
    {
      id: 7,
      name: "Pulvérisateur",
      price: "300 000 XAF",
      quantity: "5 disponibles",
      location: "Mouila",
      image: "https://img.freepik.com/photos-premium/pulverisateurs-pesticides-fond-blanc-isole-travailler-dans-jardin-potager-pulverisateur-agricole_544249-1486.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 4,
    },
    {
      id: 8,
      name: "Semences de légumes",
      price: "1500 XAF/kg",
      quantity: "120 kg disponibles",
      location: "Mouila",
      image: "https://img.freepik.com/photos-premium/semences-dans-sacs-sol-preparation-pour-plantation-printemps-nature_472916-9419.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 4,
    },
    {
      id: 9,
      name: "Moissonneuse-batteuse",
      price: "8 000 000 XAF",
      quantity: "1 disponible",
      location: "Tchibanga",
      image: "https://img.freepik.com/photos-gratuite/vue-aerienne-par-drone-moissonneuse-batteuse_1268-20615.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 5,
    },
    {
      id: 10,
      name: "Engrais minéral",
      price: "6000 XAF/sac",
      quantity: "40 sacs disponibles",
      location: "Tchibanga",
      image: "https://img.freepik.com/vecteurs-libre/ensemble-bouteilles-sacs-engrais-pour-jardinage_1284-46446.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 5,
    },
    {
      id: 11,
      name: "Semences de bouture de manioc",
      price: "6 500 XAF/Sac",
      quantity: "1300 disponibles",
      location: "Makokou",
      image: "https://img.freepik.com/photos-premium/plantes-poussent-champ-contre-ciel_1048944-24347394.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 6,
    },
    {
      id: 12,
      name: "Semences de cacao",
      price: "3000 XAF/kg",
      quantity: "90 kg disponibles",
      location: "Makokou",
      image: "https://img.freepik.com/photos-premium/cabosses-cacao-feves-cacao-fond-bois_51137-2949.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 6,
    },
    {
      id: 13,
      name: "Motoculteur",
      price: "400 000 XAF",
      quantity: "7 disponibles",
      location: "Koulamoutou",
      image: "https://img.freepik.com/photos-premium/cultivateur-isole-fond-blanc-chemin-decoupage_823268-2926.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 7,
    },
    {
      id: 14,
      name: "Semences de café",
      price: "3500 XAF/kg",
      quantity: "70 kg disponibles",
      location: "Koulamoutou",
      image: "https://img.freepik.com/photos-premium/vue-rapprochee-fruits-fond-blanc_1048944-6249661.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 7,
    },
    {
      id: 15,
      name: "Motomompe",
      price: "250 000 XAF",
      quantity: "15 disponibles",
      location: "Port-Gentil",
      image: "https://img.freepik.com/photos-premium/tamper-plate-est-affichee-fond-blanc-propre-mettant-evidence-son-contraste-couleurs-son-design-industriel_331695-28077.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 8,
    },
    {
      id: 16,
      name: "Semences de palmier",
      price: "4000 XAF/kg",
      quantity: "60 kg disponibles",
      location: "Port-Gentil",
      image: "https://img.freepik.com/photos-premium/fruits-palmier_1048944-11012682.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 8,
    },
    {
      id: 17,
      name: "Petit matériel",
      price: "150 000 XAF",
      quantity: "10 disponibles",
      location: "Oyem",
      image: "https://img.freepik.com/photos-premium/ensemble-differents-outils-jardinage-fond-blanc_495423-44356.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 9,
    },
    {
      id: 18,
      name: "Semences de banane",
      price: "2800 XAF/kg",
      quantity: "110 kg disponibles",
      location: "Oyem",
      image: "https://img.freepik.com/vecteurs-premium/illustration-culture-banane-explication_478981-865.jpg?ga=GA1.1.455707128.1741211748&semt=ais_hybrid",
      supplierId: 9,
    },
  ];

const Directory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [filteredSuppliers, setFilteredSuppliers] = useState(suppliers);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("suppliers"); // "suppliers" ou "products"
  const [visibleItems, setVisibleItems] = useState(6); // Nombre de cartes visibles

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(term, regionFilter, categoryFilter);
  };

  const handleRegionFilter = (event) => {
    const region = event.target.value;
    setRegionFilter(region);
    applyFilters(searchTerm, region, categoryFilter);
  };

  const handleCategoryFilter = (event) => {
    const category = event.target.value;
    setCategoryFilter(category);
    applyFilters(searchTerm, regionFilter, category);
  };

  const applyFilters = (term, region, category) => {
    const filteredProducts = products.filter(
      (product) =>
        (product.name.toLowerCase().includes(term) ||
        product.location.toLowerCase().includes(term)) &&
        (region === "" || product.location === region) &&
        (category === "" || product.name.includes(category))
    );
    setFilteredProducts(filteredProducts);

    const filteredSuppliers = suppliers.filter(
      (supplier) =>
        (supplier.name.toLowerCase().includes(term) ||
        supplier.region.toLowerCase().includes(term)) &&
        (region === "" || supplier.region === region)
    );
    setFilteredSuppliers(filteredSuppliers);
  };

  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setOpenOrderDialog(true);
  };

  const handleOrderSubmit = () => {
    setOpenOrderDialog(false);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleShowMore = () => {
    setVisibleItems((prev) => prev + 6); // Affiche 6 cartes supplémentaires
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        ANNUAIRE DES FOURNISSEUR AGRICOLES
      </Typography>

      {/* Barre de recherche et filtres */}
      <Box sx={{ mb: 4, display: "flex", gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher un produit ou un fournisseur..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Région</InputLabel>
          <Select value={regionFilter} onChange={handleRegionFilter} label="Région">
            <MenuItem value="">Toutes les régions</MenuItem>
            <MenuItem value="Estuaire">Estuaire</MenuItem>
            <MenuItem value="Haut-Ogooué">Haut-Ogooué</MenuItem>
            <MenuItem value="Moyen-Ogooué">Moyen-Ogooué</MenuItem>
            <MenuItem value="Ngounié">Ngounié</MenuItem>
            <MenuItem value="Nyanga">Nyanga</MenuItem>
            <MenuItem value="Ogooué-Ivindo">Ogooué-Ivindo</MenuItem>
            <MenuItem value="Ogooué-Lolo">Ogooué-Lolo</MenuItem>
            <MenuItem value="Ogooué-Maritime">Ogooué-Maritime</MenuItem>
            <MenuItem value="Woleu-Ntem">Woleu-Ntem</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Catégorie</InputLabel>
          <Select value={categoryFilter} onChange={handleCategoryFilter} label="Catégorie">
            <MenuItem value="">Toutes les catégories</MenuItem>
            <MenuItem value="Engrais">Engrais</MenuItem>
            <MenuItem value="Semences">Semences</MenuItem>
            <MenuItem value="Tracteur">Équipements</MenuItem>
            <MenuItem value="Irrigation">Irrigation</MenuItem>
            {/* Ajouter d'autres catégories */}
          </Select>
        </FormControl>
      </Box>

      {/* Toggle Button pour basculer entre Fournisseurs et Produits */}
      <Box sx={{bgcolor: "primary", mb: 3, display: "flex", justifyContent: "center" }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="Mode d'affichage"
        >
          <ToggleButton value="suppliers" aria-label="Fournisseurs">
            Fournisseurs
          </ToggleButton>
          <ToggleButton value="products" aria-label="Produits">
            Produits
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Section Fournisseurs */}
      {viewMode === "suppliers" && (
        <>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Fournisseurs
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {filteredSuppliers.slice(0, visibleItems).map((supplier) => (
              <Grid item key={supplier.id} xs={12} md={6} lg={4}>
                <Card>
                  <CardContent>
                    {/* Informations de base */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                        {supplier.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{supplier.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          <LocationOnIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {supplier.city}, {supplier.region}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Coordonnées */}
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Téléphone : {supplier.phone}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      E-mail : {supplier.email}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Site web : {supplier.website}
                    </Typography>

                    {/* Avis et évaluations */}
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Avis des clients :
                    </Typography>
                    <Rating value={supplier.rating} precision={0.5} readOnly sx={{ mb: 1 }} />
                    {supplier.reviews.map((review) => (
                      <Box key={review.id} sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {review.user}
                        </Typography>
                        <Typography variant="body2">{review.comment}</Typography>
                      </Box>
                    ))}

                    {/* Offres spéciales */}
                    {supplier.specialOffers.length > 0 && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          <LocalOfferIcon sx={{ mr: 1 }} />
                          Offres spéciales :
                        </Typography>
                        <ul style={{ paddingLeft: 20 }}>
                          {supplier.specialOffers.map((offer, index) => (
                            <li key={index}>{offer}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {filteredSuppliers.length > visibleItems && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button variant="contained" onClick={handleShowMore}>
                Voir plus
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Section Catalogue des produits */}
      {viewMode === "products" && (
        <>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Catalogue des produits
          </Typography>
          <Grid container spacing={3}>
            {filteredProducts.slice(0, visibleItems).map((product) => {
              const supplier = suppliers.find((s) => s.id === product.supplierId);
              return (
                <Grid item key={product.id} xs={12} md={6} lg={4}>
                  <Card>
                    <CardContent>
                      {/* Image du produit */}
                      <Box
                        sx={{
                          width: "100%",
                          height: 150,
                          backgroundImage: `url(${product.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          mb: 2,
                        }}
                      />

                      {/* Informations du produit */}
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Prix : {product.price}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Quantité : {product.quantity}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        {product.location}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Fournisseur : {supplier?.name}
                      </Typography>

                      {/* Bouton de commande */}
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleOrderClick(product)}
                      >
                        Commander
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          {filteredProducts.length > visibleItems && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button variant="contained" onClick={handleShowMore}>
                Voir plus
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Formulaire de commande */}
      <Dialog open={openOrderDialog} onClose={() => setOpenOrderDialog(false)}>
        <DialogTitle>Passer une commande</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Vous commandez : <strong>{selectedProduct?.name}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Quantité"
            type="number"
            value={orderQuantity}
            onChange={(e) => setOrderQuantity(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Adresse de livraison"
            placeholder="Entrez votre adresse"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrderDialog(false)}>Annuler</Button>
          <Button onClick={handleOrderSubmit} variant="contained" color="primary">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification de confirmation */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            Commande passée avec succès !
          </Box>
        }
      />
    </Box>
  );
};

export default Directory;