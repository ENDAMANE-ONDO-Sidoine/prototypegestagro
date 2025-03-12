import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Pagination,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';

const ProductManagement = () => {
  // États pour le formulaire
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    location: '',
    image: null,
    dateAdded: new Date().toLocaleString(),
  });

  // États pour la liste des produits
  const [products, setProducts] = useState([]);

  // États pour la mise à jour d'un produit
  const [editIndex, setEditIndex] = useState(null);

  // États pour les erreurs de validation
  const [errors, setErrors] = useState({});

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Gestion des changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  // Gestion du téléchargement d'image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    if (!newProduct.name) newErrors.name = 'Le nom est obligatoire';
    if (!newProduct.category) newErrors.category = 'La catégorie est obligatoire';
    if (!newProduct.price) newErrors.price = 'Le prix est obligatoire';
    if (!newProduct.quantity) newErrors.quantity = 'La quantité est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ajouter ou mettre à jour un produit
  const handleAddOrUpdateProduct = () => {
    if (!validateForm()) return; // Arrêter si le formulaire n'est pas valide

    if (editIndex !== null) {
      // Mettre à jour un produit existant
      const updatedProducts = [...products];
      updatedProducts[editIndex] = newProduct;
      setProducts(updatedProducts);
      setEditIndex(null);
    } else {
      // Ajouter un nouveau produit
      setProducts([...products, { ...newProduct, id: products.length + 1 }]);
    }
    setNewProduct({ name: '', description: '', category: '', price: '', quantity: '', location: '', image: null, dateAdded: new Date().toLocaleString() });
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

  // Exportation en Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      products.map((product) => ({
        Nom: product.name,
        Description: product.description.substring(0, 100), // Tronquer la description
        Catégorie: product.category,
        'Prix (XAF)': product.price,
        Quantité: product.quantity,
        Localisation: product.location,
        'Date et heure': product.dateAdded,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produits');
    XLSX.writeFile(workbook, 'produits.xlsx');
  };

  // Pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedProducts = products.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Grid container spacing={3}>
      {/* Formulaire pour ajouter ou mettre à jour un produit */}
      <Grid item xs={12}>
        <Typography variant="h5">Ajouter un produit</Typography>
        <Paper sx={{ padding: '20px', marginBottom: '20px', boxShadow: 3, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                  label="Catégorie"
                  error={!!errors.category}
                >
                  <MenuItem value="Engrais">Engrais</MenuItem>
                  <MenuItem value="Outils">Outils</MenuItem>
                  <MenuItem value="Machines">Machines</MenuItem>
                  <MenuItem value="Semences">Semences</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Prix (XAF)"
                name="price"
                type="number"
                value={newProduct.price}
                onChange={handleInputChange}
                error={!!errors.price}
                helperText={errors.price}
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Localisation"
                name="location"
                value={newProduct.location}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button variant="contained" component="span">
                  Télécharger une image
                </Button>
              </label>
              {newProduct.image && (
                <img
                  src={newProduct.image}
                  alt="Preview"
                  style={{ width: '50px', height: '50px', marginLeft: '10px' }}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleAddOrUpdateProduct}>
                {editIndex !== null ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Tableau récapitulatif des produits */}
      <Grid item xs={12}>
        <Typography variant="h5">Liste des produits</Typography>
        <Button variant="contained" color="success" onClick={handleExportExcel} sx={{ mr: 2 }}>
          Exporter en Excel
        </Button>
        <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Prix (XAF)</TableCell>
                <TableCell>Quantité</TableCell>
                <TableCell>Localisation</TableCell>
                <TableCell>Date et heure</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price} XAF</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{product.location}</TableCell>
                  <TableCell>{product.dateAdded}</TableCell>
                  <TableCell>
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditProduct((page - 1) * rowsPerPage + index)}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteProduct((page - 1) * rowsPerPage + index)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          count={Math.ceil(products.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
        />
      </Grid>
    </Grid>
  );
};

export default ProductManagement;