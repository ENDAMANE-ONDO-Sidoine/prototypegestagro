import React, { useState, useEffect } from 'react';
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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  CircularProgress,
  Backdrop,
  Tooltip,
  Box
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as UploadIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProductManagement = () => {
  // États pour le formulaire
  const initialProductState = {
    id: '',
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    location: '',
    image: null,
    dateAdded: format(new Date(), 'PPpp', { locale: fr }),
    status: 'active',
  };

  const [newProduct, setNewProduct] = useState(initialProductState);
  const [products, setProducts] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const rowsPerPage = 5;
  const categories = ['Engrais', 'Outils', 'Machines', 'Semences', 'Pesticides'];

  // Simuler le chargement des données
  useEffect(() => {
    setLoading(true);
    // Simuler une requête API
    setTimeout(() => {
      const mockProducts = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `Produit ${i + 1}`,
        description: `Description du produit ${i + 1}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        price: (Math.random() * 10000 + 1000).toFixed(2),
        quantity: Math.floor(Math.random() * 100),
        location: ['Entrepôt A', 'Entrepôt B', 'Entrepôt C'][Math.floor(Math.random() * 3)],
        dateAdded: format(subDays(new Date(), i), 'PPpp', { locale: fr }),
        status: ['active', 'inactive'][Math.floor(Math.random() * 2)],
      }));
      setProducts(mockProducts);
      setLoading(false);
    }, 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setSnackbar({
          open: true,
          message: 'Veuillez sélectionner un fichier image valide',
          severity: 'error',
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'La taille de l\'image ne doit pas dépasser 2MB',
          severity: 'error',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newProduct.name.trim()) newErrors.name = 'Le nom est obligatoire';
    if (!newProduct.category) newErrors.category = 'La catégorie est obligatoire';
    if (!newProduct.price || isNaN(newProduct.price) || newProduct.price <= 0)
      newErrors.price = 'Prix invalide';
    if (!newProduct.quantity || isNaN(newProduct.quantity) || newProduct.quantity < 0)
      newErrors.quantity = 'Quantité invalide';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddOrUpdateProduct = () => {
    if (!validateForm()) return;

    setLoading(true);
    // Simuler une requête API
    setTimeout(() => {
      if (editIndex !== null) {
        const updatedProducts = [...products];
        updatedProducts[editIndex] = {
          ...newProduct,
          id: newProduct.id || products[editIndex].id,
          dateAdded: newProduct.dateAdded || products[editIndex].dateAdded,
        };
        setProducts(updatedProducts);
        setSnackbar({
          open: true,
          message: 'Produit mis à jour avec succès',
          severity: 'success',
        });
      } else {
        const productToAdd = {
          ...newProduct,
          id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
          dateAdded: format(new Date(), 'PPpp', { locale: fr }),
        };
        setProducts([...products, productToAdd]);
        setSnackbar({
          open: true,
          message: 'Produit ajouté avec succès',
          severity: 'success',
        });
      }

      setNewProduct(initialProductState);
      setEditIndex(null);
      setImagePreview(null);
      setLoading(false);
    }, 1000);
  };

  const handleDeleteConfirmation = (index) => {
    setDeleteIndex(index);
    setOpenDialog(true);
  };

  const handleDeleteProduct = () => {
    setLoading(true);
    // Simuler une requête API
    setTimeout(() => {
      const updatedProducts = products.filter((_, i) => i !== deleteIndex);
      setProducts(updatedProducts);
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Produit supprimé avec succès',
        severity: 'success',
      });
      setLoading(false);
    }, 800);
  };

  const handleEditProduct = (index) => {
    setNewProduct(products[index]);
    setImagePreview(products[index].image || null);
    setEditIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProducts.map((product) => ({
        ID: product.id,
        Nom: product.name,
        Description: product.description.substring(0, 100),
        Catégorie: product.category,
        'Prix (XAF)': product.price,
        Quantité: product.quantity,
        Localisation: product.location,
        Statut: product.status === 'active' ? 'Actif' : 'Inactif',
        'Date d\'ajout': product.dateAdded,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produits');
    XLSX.writeFile(workbook, `produits_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Liste des Produits', 14, 16);
    doc.autoTable({
      head: [['ID', 'Nom', 'Catégorie', 'Prix (XAF)', 'Quantité', 'Statut']],
      body: filteredProducts.map((product) => [
        product.id,
        product.name,
        product.category,
        product.price,
        product.quantity,
        product.status === 'active' ? 'Actif' : 'Inactif',
      ]),
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [25, 118, 210] },
    });
    doc.save(`produits_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Liste des Produits</title>
          <style>
            body { font-family: Arial; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1976d2; color: white; }
            .title { text-align: center; margin-bottom: 20px; }
            .date { text-align: right; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1 class="title">Liste des Produits</h1>
          <p class="date">Généré le ${format(new Date(), 'PPpp', { locale: fr })}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix (XAF)</th>
                <th>Quantité</th>
                <th>Localisation</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProducts.map(product => `
                <tr>
                  <td>${product.id}</td>
                  <td>${product.name}</td>
                  <td>${product.category}</td>
                  <td>${product.price}</td>
                  <td>${product.quantity}</td>
                  <td>${product.location}</td>
                  <td>${product.status === 'active' ? 'Actif' : 'Inactif'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product => 
      filterCategory === 'all' || product.category === filterCategory
    );

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Grid container spacing={3}>
      <Backdrop open={loading} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer ce produit? Cette action est irréversible.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleDeleteProduct} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Formulaire */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            {editIndex !== null ? (
              <>
                <EditIcon color="primary" sx={{ mr: 1 }} />
                Modifier un produit
              </>
            ) : (
              <>
                <AddIcon color="primary" sx={{ mr: 1 }} />
                Ajouter un nouveau produit
              </>
            )}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nom du produit *"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name || " "}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small" error={!!errors.category}>
                <InputLabel>Catégorie *</InputLabel>
                <Select
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                  label="Catégorie *"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <Typography variant="caption" color="error">
                    {errors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Prix (XAF) *"
                name="price"
                type="number"
                value={newProduct.price}
                onChange={handleInputChange}
                error={!!errors.price}
                helperText={errors.price || " "}
                variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: 'XAF',
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Quantité *"
                name="quantity"
                type="number"
                value={newProduct.quantity}
                onChange={handleInputChange}
                error={!!errors.quantity}
                helperText={errors.quantity || " "}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Localisation"
                name="location"
                value={newProduct.location}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  name="status"
                  value={newProduct.status}
                  onChange={handleInputChange}
                  label="Statut"
                >
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ height: '40px' }}
                >
                  Télécharger une image
                </Button>
              </label>
            </Grid>

            <Grid item xs={12} md={6}>
              {imagePreview && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={imagePreview}
                    variant="rounded"
                    sx={{ width: 56, height: 56 }}
                  />
                  <Button
                    color="error"
                    onClick={() => {
                      setNewProduct({ ...newProduct, image: null });
                      setImagePreview(null);
                    }}
                    startIcon={<CloseIcon />}
                  >
                    Supprimer
                  </Button>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {editIndex !== null && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setNewProduct(initialProductState);
                    setEditIndex(null);
                    setImagePreview(null);
                  }}
                  startIcon={<CloseIcon />}
                >
                  Annuler
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddOrUpdateProduct}
                startIcon={editIndex !== null ? <SaveIcon /> : <AddIcon />}
                disabled={loading}
              >
                {editIndex !== null ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Tableau des produits */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              Liste des produits ({filteredProducts.length})
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Exporter en Excel">
                <IconButton color="success" onClick={handleExportExcel}>
                  <PdfIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Exporter en PDF">
                <IconButton color="error" onClick={handleExportPDF}>
                  <PdfIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Imprimer">
                <IconButton color="info" onClick={handlePrint}>
                  <PrintIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              sx={{ width: 300 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filtrer par catégorie</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Filtrer par catégorie"
              >
                <MenuItem value="all">Toutes les catégories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell align="right">Prix (XAF)</TableCell>
                  <TableCell align="center">Quantité</TableCell>
                  <TableCell>Localisation</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Date d'ajout</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product, index) => (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.id}</TableCell>
                      <TableCell sx={{ fontWeight: 'medium' }}>{product.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.category}
                          color={
                            product.category === 'Engrais' ? 'primary' :
                            product.category === 'Outils' ? 'secondary' :
                            product.category === 'Machines' ? 'warning' : 'success'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(product.price).toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={product.quantity}
                          color={product.quantity > 20 ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{product.location}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.status === 'active' ? 'Actif' : 'Inactif'}
                          color={product.status === 'active' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {product.image ? (
                          <Avatar
                            src={product.image}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          />
                        ) : (
                          <Avatar variant="rounded" sx={{ width: 40, height: 40 }}>
                            <InventoryIcon />
                          </Avatar>
                        )}
                      </TableCell>
                      <TableCell>{product.dateAdded}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Modifier">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditProduct((page - 1) * rowsPerPage + index)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteConfirmation((page - 1) * rowsPerPage + index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        Aucun produit trouvé
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredProducts.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(filteredProducts.length / rowsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ProductManagement;