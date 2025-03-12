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
} from '@mui/material';

// Styles pour le titre
const titleStyle = {
  backgroundColor: '#2E7D32', // Vert foncé
  color: 'white', // Texte blanc
  padding: '16px',
  border: '2px solid #1B5E20', // Bordure verte plus foncée
  textAlign: 'center',
  textTransform: 'uppercase', // Texte en majuscules
  borderRadius: '8px', // Coins arrondis
  marginBottom: '24px',
};

// Données initiales de produits (simulées)
const initialProducts = [
  {
    id: 1,
    name: 'Maïs',
    category: 'Céréales',
    price: 5000,
    quantity: 100,
    location: 'Libreville',
    description: 'Maïs de haute qualité, récolte 2023.',
    images: ['https://via.placeholder.com/150'],
  },
  {
    id: 2,
    name: 'Bananes plantains',
    category: 'Fruits',
    price: 2000,
    quantity: 50,
    location: 'Port-Gentil',
    description: 'Bananes plantains mûres, prêtes à la vente.',
    images: ['https://via.placeholder.com/150'],
  },
  {
    id: 3,
    name: 'Bœuf',
    category: 'Animaux',
    price: 15000,
    quantity: 10,
    location: 'Franceville',
    description: 'Bœuf de qualité supérieure, prêt pour la vente.',
    images: ['https://via.placeholder.com/150'],
  },
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    location: '',
    description: '',
    images: [], // Stocker plusieurs images
  });
  const [editProduct, setEditProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showTable, setShowTable] = useState(false); // Contrôle l'affichage du tableau
  const [page, setPage] = useState(1); // Pagination
  const productsPerPage = 5; // Nombre de produits par page

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
    if (editProduct) {
      setEditProduct({ ...editProduct, [name]: value });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  // Téléchargement d'images avec react-dropzone
  const { getRootProps: getRootPropsNew, getInputProps: getInputPropsNew } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) => URL.createObjectURL(file));
      setNewProduct({ ...newProduct, images: [...newProduct.images, ...newImages] });
    },
  });

  const { getRootProps: getRootPropsEdit, getInputProps: getInputPropsEdit } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) => URL.createObjectURL(file));
      setEditProduct({ ...editProduct, images: [...editProduct.images, ...newImages] });
    },
  });

  // Ajouter un nouveau produit
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (
      !newProduct.name ||
      !newProduct.category ||
      !newProduct.price ||
      !newProduct.quantity ||
      !newProduct.location
    ) {
      setSnackbarMessage('Veuillez remplir tous les champs obligatoires.');
      setOpenSnackbar(true);
      return;
    }
    if (newProduct.price <= 0 || newProduct.quantity <= 0) {
      setSnackbarMessage('Le prix et la quantité doivent être positifs.');
      setOpenSnackbar(true);
      return;
    }
    const product = {
      ...newProduct,
      id: Date.now(),
    };
    setProducts([...products, product]);
    setNewProduct({
      name: '',
      category: '',
      price: '',
      quantity: '',
      location: '',
      description: '',
      images: [],
    });
    setSnackbarMessage('Produit publié avec succès !');
    setOpenSnackbar(true);
  };

  // Ouvrir le dialogue de modification
  const handleEdit = (product) => {
    setEditProduct(product);
    setOpenDialog(true);
  };

  // Sauvegarder les modifications
  const handleSaveEdit = () => {
    if (editProduct.price <= 0 || editProduct.quantity <= 0) {
      setSnackbarMessage('Le prix et la quantité doivent être positifs.');
      setOpenSnackbar(true);
      return;
    }
    const updatedProducts = products.map((p) =>
      p.id === editProduct.id ? editProduct : p
    );
    setProducts(updatedProducts);
    setOpenDialog(false);
    setSnackbarMessage('Produit modifié avec succès !');
    setOpenSnackbar(true);
  };

  // Supprimer un produit
  const handleDelete = (id) => {
    setProducts(products.filter((p) => p.id !== id));
    setSnackbarMessage('Produit supprimé avec succès !');
    setOpenSnackbar(true);
  };

  // Fermer la notification
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Filtrer les produits par recherche et catégorie
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const displayedProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Titre stylisé */}
      <Typography variant="h3" component="h1" style={titleStyle}>
        Espace Agriculteurs Gabonais
      </Typography>

      {/* Barre de recherche et filtres */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Rechercher un produit"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Catégorie"
            >
              <MenuItem value="">Toutes les catégories</MenuItem>
              <MenuItem value="Céréales">Céréales</MenuItem>
              <MenuItem value="Fruits">Fruits</MenuItem>
              <MenuItem value="Légumes">Légumes</MenuItem>
              <MenuItem value="Tubercules">Tubercules</MenuItem>
              <MenuItem value="Animaux">Animaux</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Formulaire de publication */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Publier un Produit
        </Typography>
        <form onSubmit={handleAddProduct}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du produit"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Catégorie"
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prix (FCFA)"
                name="price"
                type="number"
                value={newProduct.price}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantité disponible"
                name="quantity"
                type="number"
                value={newProduct.quantity}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Localisation"
                name="location"
                value={newProduct.location}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <div {...getRootPropsNew()} style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}>
                <input {...getInputPropsNew()} />
                <p>Glissez-déposez des images ici, ou cliquez pour sélectionner des fichiers</p>
                {newProduct.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${newProduct.name || 'Nouveau produit'} - ${index}`}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', margin: '5px' }}
                  />
                ))}
              </div>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={newProduct.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                Publier
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>

      {/* Bouton pour afficher/masquer le tableau */}
      <Button
        variant="contained"
        color="secondary"
        onClick={() => setShowTable(!showTable)}
        sx={{ mb: 2 }}
      >
        {showTable ? 'Masquer les produits' : 'Afficher les produits'}
      </Button>

      {/* Tableau des produits (affiché/masqué) */}
      <Collapse in={showTable}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Images</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Prix (FCFA)</TableCell>
                <TableCell>Quantité</TableCell>
                <TableCell>Localisation</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {product.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${product.name} - ${index}`}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', margin: '5px' }}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{product.location}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEdit(product)}
                      sx={{ mr: 1 }}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete(product.id)}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination */}
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
        />
      </Collapse>

      {/* Dialogue de modification */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Modifier le produit</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du produit"
                name="name"
                value={editProduct?.name || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Catégorie"
                name="category"
                value={editProduct?.category || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prix (FCFA)"
                name="price"
                type="number"
                value={editProduct?.price || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantité disponible"
                name="quantity"
                type="number"
                value={editProduct?.quantity || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Localisation"
                name="location"
                value={editProduct?.location || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <div {...getRootPropsEdit()} style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}>
                <input {...getInputPropsEdit()} />
                <p>Glissez-déposez des images ici, ou cliquez pour sélectionner des fichiers</p>
                {editProduct?.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${editProduct.name || 'Produit en cours de modification'} - ${index}`}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', margin: '5px' }}
                  />
                ))}
              </div>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={editProduct?.description || ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleSaveEdit} color="primary">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Products;