import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Collapse,
  Pagination,
  Box,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
  styled
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterAlt,
  Close,
  CloudUpload,
  AttachFile,
  LocalOffer,
  Inventory,
  LocationOn,
  Description,
  Agriculture,
  Store,
  Refresh
} from '@mui/icons-material';

// Styles personnalisés
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: theme.shadows[4],
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}));

const Dropzone = styled('div')(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

const PriceChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.success.light,
  color: theme.palette.success.dark
}));

const QuantityChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.info.light,
  color: theme.palette.info.dark
}));

// Données initiales de produits (plus réalistes pour le Gabon)
const initialProducts = [
  {
    id: 1,
    name: 'Manioc frais',
    category: 'Tubercules',
    price: 2500,
    quantity: 150,
    unit: 'kg',
    location: 'Libreville',
    province: 'Estuaire',
    description: 'Manioc de première qualité, récolté dans la région de Ntoum. Sans pesticides, idéal pour la consommation directe ou la transformation.',
    images: [
      'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1570042225831-d9fa1a4b8654?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    dateAdded: '2023-05-15',
    farmer: {
      name: 'Jean Okouyi',
      rating: 4.5,
      contact: '06 12 34 56 78'
    }
  },
  {
    id: 2,
    name: 'Bananes plantains mûres',
    category: 'Fruits',
    price: 1500,
    quantity: 80,
    unit: 'régime',
    location: 'Port-Gentil',
    province: 'Ogooué-Maritime',
    description: 'Bananes plantains biologiques, parfaites pour la cuisson. Récoltées à maturité optimale.',
    images: [
      'https://images.unsplash.com/photo-1603048719537-93e55a8f710f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    dateAdded: '2023-05-10',
    farmer: {
      name: 'Marie Mboumba',
      rating: 4.2,
      contact: '07 89 01 23 45'
    }
  },
  {
    id: 3,
    name: 'Poulets fermiers',
    category: 'Animaux',
    price: 8000,
    quantity: 30,
    unit: 'unité',
    location: 'Franceville',
    province: 'Haut-Ogooué',
    description: 'Poulets élevés en plein air, nourris aux grains naturels. Poids moyen de 2kg prêts à abattre.',
    images: [
      'https://images.unsplash.com/photo-1589927986089-35812388d1f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1556910633-8b5a4f09e8a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    dateAdded: '2023-05-12',
    farmer: {
      name: 'Paul Mba',
      rating: 4.7,
      contact: '06 78 90 12 34'
    }
  },
  {
    id: 4,
    name: 'Igname blanc',
    category: 'Tubercules',
    price: 1800,
    quantity: 200,
    unit: 'kg',
    location: 'Oyem',
    province: 'Woleu-Ntem',
    description: 'Igname de qualité supérieure, riche en nutriments. Provenant de cultures traditionnelles.',
    images: [
      'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    dateAdded: '2023-05-08',
    farmer: {
      name: 'Lucie Nzeng',
      rating: 4.3,
      contact: '05 67 89 01 23'
    }
  },
  {
    id: 5,
    name: 'Aubergines africaines',
    category: 'Légumes',
    price: 1200,
    quantity: 50,
    unit: 'kg',
    location: 'Lambaréné',
    province: 'Moyen-Ogooué',
    description: 'Aubergines fraîches, riches en antioxydants. Récoltées quotidiennement pour une fraîcheur optimale.',
    images: [
      'https://images.unsplash.com/photo-1594282418423-62ba9086f0f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    dateAdded: '2023-05-14',
    farmer: {
      name: 'Pierre Ndong',
      rating: 4.0,
      contact: '06 45 67 89 01'
    }
  }
];

// Catégories de produits
const categories = [
  'Tubercules',
  'Fruits',
  'Légumes',
  'Céréales',
  'Animaux',
  'Produits laitiers',
  'Volailles',
  'Poissons',
  'Épices',
  'Noix et graines'
];

// Provinces du Gabon
const provinces = [
  'Estuaire',
  'Haut-Ogooué',
  'Moyen-Ogooué',
  'Ngounié',
  'Nyanga',
  'Ogooué-Ivindo',
  'Ogooué-Lolo',
  'Ogooué-Maritime',
  'Woleu-Ntem'
];

const Products = () => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    unit: 'kg',
    location: '',
    province: '',
    description: '',
    images: [],
    farmer: {
      name: '',
      contact: ''
    }
  });
  const [editProduct, setEditProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [page, setPage] = useState(1);
  const productsPerPage = 6;

  // Charger les produits depuis localStorage au démarrage
  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem('products')) || initialProducts;
    setProducts(savedProducts);
  }, []);

  // Sauvegarder les produits dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  // Gérer les changements dans les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('farmer.')) {
      const farmerField = name.split('.')[1];
      if (editProduct) {
        setEditProduct({ 
          ...editProduct, 
          farmer: { ...editProduct.farmer, [farmerField]: value } 
        });
      } else {
        setNewProduct({ 
          ...newProduct, 
          farmer: { ...newProduct.farmer, [farmerField]: value } 
        });
      }
    } else {
      if (editProduct) {
        setEditProduct({ ...editProduct, [name]: value });
      } else {
        setNewProduct({ ...newProduct, [name]: value });
      }
    }
  };

  // Téléchargement d'images
  const { getRootProps: getRootPropsNew, getInputProps: getInputPropsNew } = useDropzone({
    accept: 'image/*',
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) => URL.createObjectURL(file));
      setNewProduct({ ...newProduct, images: [...newProduct.images, ...newImages] });
    },
  });

  const { getRootProps: getRootPropsEdit, getInputProps: getInputPropsEdit } = useDropzone({
    accept: 'image/*',
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) => URL.createObjectURL(file));
      setEditProduct({ ...editProduct, images: [...editProduct.images, ...newImages] });
    },
  });

  // Supprimer une image
  const handleRemoveImage = (index, isEditMode = false) => {
    if (isEditMode) {
      const updatedImages = [...editProduct.images];
      updatedImages.splice(index, 1);
      setEditProduct({ ...editProduct, images: updatedImages });
    } else {
      const updatedImages = [...newProduct.images];
      updatedImages.splice(index, 1);
      setNewProduct({ ...newProduct, images: updatedImages });
    }
  };

  // Ajouter un nouveau produit
  const handleAddProduct = (e) => {
    e.preventDefault();
    
    // Validation
    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.quantity || !newProduct.location) {
      setSnackbarMessage('Veuillez remplir tous les champs obligatoires.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    if (newProduct.price <= 0 || newProduct.quantity <= 0) {
      setSnackbarMessage('Le prix et la quantité doivent être positifs.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    const product = {
      ...newProduct,
      id: Date.now(),
      dateAdded: new Date().toISOString().split('T')[0],
      farmer: {
        ...newProduct.farmer,
        rating: 4.0 // Note par défaut
      }
    };
    
    setProducts([...products, product]);
    setNewProduct({
      name: '',
      category: '',
      price: '',
      quantity: '',
      unit: 'kg',
      location: '',
      province: '',
      description: '',
      images: [],
      farmer: {
        name: '',
        contact: ''
      }
    });
    
    setSnackbarMessage('Produit publié avec succès !');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  // Ouvrir le dialogue de modification
  const handleEdit = (product) => {
    setEditProduct({...product});
    setOpenDialog(true);
  };

  // Sauvegarder les modifications
  const handleSaveEdit = () => {
    if (editProduct.price <= 0 || editProduct.quantity <= 0) {
      setSnackbarMessage('Le prix et la quantité doivent être positifs.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    const updatedProducts = products.map((p) =>
      p.id === editProduct.id ? editProduct : p
    );
    
    setProducts(updatedProducts);
    setOpenDialog(false);
    setSnackbarMessage('Produit modifié avec succès !');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  // Supprimer un produit
  const handleDelete = (id) => {
    setProducts(products.filter((p) => p.id !== id));
    setSnackbarMessage('Produit supprimé avec succès !');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  // Fermer la notification
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedProvince('');
    setPage(1);
  };

  // Filtrer les produits
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.farmer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesProvince = selectedProvince ? product.province === selectedProvince : true;
    
    return matchesSearch && matchesCategory && matchesProvince;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const displayedProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );

  // Formatage du prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(price).replace('FCFA', 'FCFA');
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* En-tête */}
      <Box sx={{
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        padding: 3,
        borderRadius: 2,
        mb: 4,
        textAlign: 'center',
        backgroundImage: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)'
      }}>
        <Agriculture sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          ESPACE DE PUBLICATION DES PRODUITS AGRICOLES
        </Typography>
        <Typography variant="h5" component="h2">
          Vendez vos prduits agricoles en toute simplicité 
        </Typography>
      </Box>

      {/* Barre de recherche et filtres */}
      <Card sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Rechercher produits, producteurs..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Catégorie"
                startAdornment={<FilterAlt sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="">Toutes catégories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Province</InputLabel>
              <Select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                label="Province"
              >
                <MenuItem value="">Toutes provinces</MenuItem>
                {provinces.map((prov) => (
                  <MenuItem key={prov} value={prov}>{prov}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={resetFilters}
              startIcon={<Refresh />}
            >
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Boutons d'affichage et de publication */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
            sx={{ mr: 1 }}
            startIcon={<Store />}
          >
            Vue Tableau
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('grid')}
            startIcon={<Inventory />}
          >
            Vue Grille
          </Button>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowForm(!showForm)}
          startIcon={showForm ? <Close /> : <Add />}
        >
          {showForm ? 'Masquer le formulaire' : 'Ajouter un produit'}
        </Button>
      </Box>

      {/* Formulaire de publication */}
      <Collapse in={showForm}>
        <StyledCard sx={{ mb: 4 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Add sx={{ mr: 1 }} /> Publier un nouveau produit
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <form onSubmit={handleAddProduct}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom du produit *"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      startAdornment: <LocalOffer sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Catégorie *</InputLabel>
                    <Select
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      label="Catégorie *"
                      required
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Prix (FCFA) *"
                    name="price"
                    type="number"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      inputProps: { min: 0 },
                      startAdornment: <AttachFile sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Quantité *"
                    name="quantity"
                    type="number"
                    value={newProduct.quantity}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Unité</InputLabel>
                    <Select
                      name="unit"
                      value={newProduct.unit}
                      onChange={handleInputChange}
                      label="Unité"
                    >
                      <MenuItem value="kg">kg</MenuItem>
                      <MenuItem value="g">g</MenuItem>
                      <MenuItem value="L">Litre</MenuItem>
                      <MenuItem value="unité">Unité</MenuItem>
                      <MenuItem value="régime">Régime</MenuItem>
                      <MenuItem value="sac">Sac</MenuItem>
                      <MenuItem value="carton">Carton</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Province</InputLabel>
                    <Select
                      name="province"
                      value={newProduct.province}
                      onChange={handleInputChange}
                      label="Province"
                    >
                      {provinces.map((prov) => (
                        <MenuItem key={prov} value={prov}>{prov}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Localisation (ville/village) *"
                    name="location"
                    value={newProduct.location}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom du producteur"
                    name="farmer.name"
                    value={newProduct.farmer.name}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <Agriculture sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact du producteur"
                    name="farmer.contact"
                    value={newProduct.farmer.contact}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Images du produit (max 5)</Typography>
                  <Dropzone {...getRootPropsNew()}>
                    <input {...getInputPropsNew()} />
                    <CloudUpload sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                    <Typography>Glissez-déposez des images ici, ou cliquez pour sélectionner</Typography>
                    <Typography variant="caption" color="textSecondary">Formats acceptés: JPG, PNG</Typography>
                  </Dropzone>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
                    {newProduct.images.map((image, index) => (
                      <Box key={index} sx={{ position: 'relative', m: 1 }}>
                        <Avatar
                          src={image}
                          variant="rounded"
                          sx={{ width: 80, height: 80 }}
                        />
                        <IconButton
                          size="small"
                          sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            right: 0, 
                            backgroundColor: 'rgba(0,0,0,0.5)', 
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.7)'
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description détaillée"
                    name="description"
                    multiline
                    rows={4}
                    value={newProduct.description}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <Description sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<Add />}
                    >
                      Publier le produit
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Box>
        </StyledCard>
      </Collapse>

      {/* Résultats de recherche */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        {filteredProducts.length} produit(s) trouvé(s)
      </Typography>

      {/* Affichage en tableau */}
      {viewMode === 'table' && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4 }}>
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.primary.light }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Produit</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Catégorie</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prix</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Disponibilité</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Localisation</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Producteur</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {product.images.length > 0 && (
                        <Avatar
                          src={product.images[0]}
                          variant="rounded"
                          sx={{ width: 56, height: 56, mr: 2 }}
                        />
                      )}
                      <Box>
                        <Typography fontWeight="bold">{product.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Ajouté le {product.dateAdded}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={product.category} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    <PriceChip label={formatPrice(product.price)} />
                  </TableCell>
                  <TableCell>
                    <QuantityChip label={`${product.quantity} ${product.unit}`} />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography>{product.location}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {product.province}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography>{product.farmer.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {product.farmer.contact}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Tooltip title="Modifier">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(product)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Affichage en grille */}
      {viewMode === 'grid' && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {displayedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <StyledCard>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      height: 200,
                      backgroundImage: `url(${product.images[0] || 'https://via.placeholder.com/400x200?text=Produit+Agricole'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px'
                    }}
                  />
                  <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <Chip label={product.category} color="primary" size="small" />
                  </Box>
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <PriceChip label={formatPrice(product.price)} />
                  </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {product.description.length > 100 
                      ? `${product.description.substring(0, 100)}...` 
                      : product.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {product.location}, {product.province}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Agriculture fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {product.farmer.name} • {product.farmer.contact}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <QuantityChip label={`${product.quantity} ${product.unit}`} />
                    
                    <Box>
                      <Tooltip title="Modifier">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(product)}
                          sx={{ mr: 1 }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            size="large"
          />
        </Box>
      )}

      {/* Dialogue de modification */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Edit sx={{ mr: 1 }} /> Modifier le produit
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du produit *"
                name="name"
                value={editProduct?.name || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Catégorie *</InputLabel>
                <Select
                  name="category"
                  value={editProduct?.category || ''}
                  onChange={handleInputChange}
                  label="Catégorie *"
                  required
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Prix (FCFA) *"
                name="price"
                type="number"
                value={editProduct?.price || ''}
                onChange={handleInputChange}
                required
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Quantité *"
                name="quantity"
                type="number"
                value={editProduct?.quantity || ''}
                onChange={handleInputChange}
                required
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Unité</InputLabel>
                <Select
                  name="unit"
                  value={editProduct?.unit || 'kg'}
                  onChange={handleInputChange}
                  label="Unité"
                >
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="g">g</MenuItem>
                  <MenuItem value="L">Litre</MenuItem>
                  <MenuItem value="unité">Unité</MenuItem>
                  <MenuItem value="régime">Régime</MenuItem>
                  <MenuItem value="sac">Sac</MenuItem>
                  <MenuItem value="carton">Carton</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Province</InputLabel>
                <Select
                  name="province"
                  value={editProduct?.province || ''}
                  onChange={handleInputChange}
                  label="Province"
                >
                  {provinces.map((prov) => (
                    <MenuItem key={prov} value={prov}>{prov}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Localisation (ville/village) *"
                name="location"
                value={editProduct?.location || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du producteur"
                name="farmer.name"
                value={editProduct?.farmer?.name || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact du producteur"
                name="farmer.contact"
                value={editProduct?.farmer?.contact || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Images du produit</Typography>
              <Dropzone {...getRootPropsEdit()}>
                <input {...getInputPropsEdit()} />
                <CloudUpload sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                <Typography>Glissez-déposez des images ici, ou cliquez pour sélectionner</Typography>
                <Typography variant="caption" color="textSecondary">Formats acceptés: JPG, PNG</Typography>
              </Dropzone>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
                {editProduct?.images?.map((image, index) => (
                  <Box key={index} sx={{ position: 'relative', m: 1 }}>
                    <Avatar
                      src={image}
                      variant="rounded"
                      sx={{ width: 80, height: 80 }}
                    />
                    <IconButton
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        right: 0, 
                        backgroundColor: 'rgba(0,0,0,0.5)', 
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index, true);
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description détaillée"
                name="description"
                multiline
                rows={4}
                value={editProduct?.description || ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleSaveEdit} color="primary" variant="contained">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Products;