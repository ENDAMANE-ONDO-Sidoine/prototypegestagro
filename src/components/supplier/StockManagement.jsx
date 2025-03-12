import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  IconButton,
  Pagination,
  Alert,
  InputAdornment,
} from '@mui/material';
import {Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';

const StockManagement = () => {
  // États pour les produits en stock
  const [products, setProducts] = useState([
    { id: 1, name: 'Engrais A', quantity: 100, category: 'Engrais', alertThreshold: 20 },
    { id: 2, name: 'Outils B', quantity: 30, category: 'Outils', alertThreshold: 10 },
    { id: 3, name: 'Semences C', quantity: 50, category: 'Semences', alertThreshold: 30 },
    { id: 4, name: 'Machines D', quantity: 5, category: 'Machines', alertThreshold: 2 },
  ]);

  // États pour le formulaire d'ajout/mise à jour
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    category: '',
    alertThreshold: '',
  });

  // États pour la mise à jour d'un produit
  const [editIndex, setEditIndex] = useState(null);

  // États pour les erreurs de validation
  const [errors, setErrors] = useState({});

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Recherche
  const [searchTerm, setSearchTerm] = useState('');

  // Gestion des changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    if (!newProduct.name) newErrors.name = 'Le nom est obligatoire';
    if (!newProduct.quantity) newErrors.quantity = 'La quantité est obligatoire';
    if (!newProduct.category) newErrors.category = 'La catégorie est obligatoire';
    if (!newProduct.alertThreshold) newErrors.alertThreshold = 'Le seuil d\'alerte est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ajouter ou mettre à jour un produit
  const handleAddOrUpdateProduct = () => {
    if (!validateForm()) return; // Arrêter si le formulaire n'est pas valide

    if (editIndex !== null) {
      // Mettre à jour un produit existant
      const updatedProducts = [...products];
      updatedProducts[editIndex] = {
        ...newProduct,
        id: products[editIndex].id,
        quantity: parseInt(newProduct.quantity),
        alertThreshold: parseInt(newProduct.alertThreshold),
      };
      setProducts(updatedProducts);
      setEditIndex(null);
    } else {
      // Ajouter un nouveau produit
      setProducts([
        ...products,
        {
          id: products.length + 1,
          name: newProduct.name,
          quantity: parseInt(newProduct.quantity),
          category: newProduct.category,
          alertThreshold: parseInt(newProduct.alertThreshold),
        },
      ]);
    }
    setNewProduct({ name: '', quantity: '', category: '', alertThreshold: '' });
  };

  // Supprimer un produit
  const handleDeleteProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  // Éditer un produit
  const handleEditProduct = (index) => {
    setNewProduct(products[index]);
    setEditIndex(index);
  };

  // Gestion des entrées de stock
  const handleStockIn = (index, quantity) => {
    const updatedProducts = [...products];
    updatedProducts[index].quantity += quantity;
    setProducts(updatedProducts);
  };

  // Gestion des sorties de stock
  const handleStockOut = (index, quantity) => {
    const updatedProducts = [...products];
    updatedProducts[index].quantity -= quantity;
    setProducts(updatedProducts);
  };

  // Exportation en Excel
  const handleExportExcel = () => {
    const data = products.map((product) => ({
      'ID Produit': product.id,
      Nom: product.name,
      Catégorie: product.category,
      Quantité: product.quantity,
      'Seuil d\'alerte': product.alertThreshold,
      Statut: product.quantity <= product.alertThreshold ? 'Stock faible' : 'Disponible',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stocks');
    XLSX.writeFile(workbook, 'stocks.xlsx');
  };

  // Pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Filtrage des produits par recherche
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedProducts = filteredProducts.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5">Gestion des stocks</Typography>

        {/* Alertes pour les stocks faibles */}
        {products
          .filter((product) => product.quantity <= product.alertThreshold)
          .map((product, index) => (
            <Alert key={index} severity="warning" sx={{ mb: 2 }}>
              Stock faible pour {product.name} (Quantité: {product.quantity})
            </Alert>
          ))}

        {/* Formulaire pour ajouter ou mettre à jour un produit */}
        <Paper sx={{ padding: '20px', marginBottom: '20px', boxShadow: 3, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Nom du produit"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Quantité"
                name="quantity"
                type="number"
                value={newProduct.quantity}
                onChange={handleInputChange}
                error={!!errors.quantity}
                helperText={errors.quantity}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Catégorie"
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
                error={!!errors.category}
                helperText={errors.category}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Seuil d'alerte"
                name="alertThreshold"
                type="number"
                value={newProduct.alertThreshold}
                onChange={handleInputChange}
                error={!!errors.alertThreshold}
                helperText={errors.alertThreshold}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleAddOrUpdateProduct}>
                {editIndex !== null ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Champ de recherche */}
        <TextField
          fullWidth
          label="Rechercher un produit"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Tableau des produits en stock */}
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Produit</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Quantité</TableCell>
                <TableCell>Seuil d'alerte</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{product.alertThreshold}</TableCell>
                  <TableCell>
                    {product.quantity <= product.alertThreshold ? (
                      <Typography color="error">Stock faible</Typography>
                    ) : (
                      <Typography color="success">Disponible</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditProduct(index)}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteProduct(index)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleStockIn(index, 10)}
                      sx={{ ml: 1 }}
                    >
                      Entrée
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleStockOut(index, 10)}
                      sx={{ ml: 1 }}
                    >
                      Sortie
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          count={Math.ceil(filteredProducts.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
        />

        {/* Bouton d'exportation sous le tableau */}
        <Button variant="contained" color="success" onClick={handleExportExcel} sx={{ mt: 2 }}>
          Exporter en Excel
        </Button>
      </Grid>
    </Grid>
  );
};

export default StockManagement;