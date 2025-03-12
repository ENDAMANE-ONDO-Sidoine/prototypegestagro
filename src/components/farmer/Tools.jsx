import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
} from '@mui/material';

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
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 2,
    name: 'Bananes plantains',
    category: 'Fruits',
    price: 2000,
    quantity: 50,
    location: 'Port-Gentil',
    description: 'Bananes plantains mûres, prêtes à la vente.',
    image: 'https://via.placeholder.com/150',
  },
];

const Products = () => {
  const [products, setProducts] = useState(initialProducts);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    location: '',
    description: '',
    image: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const productsPerPage = 6;

  // Gérer les changements dans les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

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
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const product = { ...newProduct, id: Date.now() };
    setProducts([...products, product]);
    setNewProduct({
      name: '',
      category: '',
      price: '',
      quantity: '',
      location: '',
      description: '',
      image: '',
    });
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
      {/* En-tête */}
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
        Espace Agriculteurs Gabonais
      </Typography>
      <Typography variant="subtitle1" align="center" gutterBottom>
        Publiez et gérez vos produits agricoles.
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
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Formulaire de publication */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Publier un Produit
        </Typography>
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="URL de l'image"
              name="image"
              value={newProduct.image}
              onChange={handleInputChange}
            />
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddProduct}
              sx={{ mt: 2 }}
            >
              Publier
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Liste des produits */}
      <Grid container spacing={4}>
        {displayedProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={product.image || 'https://via.placeholder.com/150'}
                alt={product.name}
              />
              <CardContent>
                <Typography variant="h6" component="h3">
                  {product.name}
                </Typography>
                <Typography color="textSecondary">{product.category}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {product.description}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Prix :</strong> {product.price} FCFA
                </Typography>
                <Typography variant="body1">
                  <strong>Quantité :</strong> {product.quantity}
                </Typography>
                <Typography variant="body1">
                  <strong>Localisation :</strong> {product.location}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
        />
      )}
    </Container>
  );
};

export default Products;