import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Tooltip,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Input as InputIcon,
  Output as OutputIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { useConfirm } from 'material-ui-confirm';

// Catégories prédéfinies pour uniformité
const CATEGORIES = [
  'Engrais',
  'Outils',
  'Semences',
  'Machines',
  'Pesticides',
  'Équipement de protection',
  'Irrigation',
];

const StockManagement = () => {
  // États pour les produits en stock
  const [products, setProducts] = useState(() => {
    // Chargement initial depuis localStorage si disponible
    const savedProducts = localStorage.getItem('stockProducts');
    return savedProducts
      ? JSON.parse(savedProducts)
      : [
          { id: 1, name: 'Engrais A', quantity: 100, category: 'Engrais', alertThreshold: 20 },
          { id: 2, name: 'Outils B', quantity: 30, category: 'Outils', alertThreshold: 10 },
          { id: 3, name: 'Semences C', quantity: 50, category: 'Semences', alertThreshold: 30 },
          { id: 4, name: 'Machines D', quantity: 5, category: 'Machines', alertThreshold: 2 },
        ];
  });

  // États pour le formulaire d'ajout/mise à jour
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    category: '',
    alertThreshold: '',
  });

  // États pour la mise à jour d'un produit
  const [editIndex, setEditIndex] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // États pour les erreurs de validation
  const [errors, setErrors] = useState({});

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Recherche
  const [searchTerm, setSearchTerm] = useState('');

  // Feedback utilisateur
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Confirmation pour les actions critiques
  const confirm = useConfirm();

  // Sauvegarde automatique dans localStorage
  useEffect(() => {
    localStorage.setItem('stockProducts', JSON.stringify(products));
  }, [products]);

  // Gestion des changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    if (!newProduct.name.trim()) newErrors.name = 'Le nom est obligatoire';
    if (!newProduct.quantity || isNaN(newProduct.quantity)) newErrors.quantity = 'Quantité invalide';
    if (!newProduct.category) newErrors.category = 'La catégorie est obligatoire';
    if (!newProduct.alertThreshold || isNaN(newProduct.alertThreshold)) newErrors.alertThreshold = 'Seuil invalide';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setNewProduct({ name: '', quantity: '', category: '', alertThreshold: '' });
    setErrors({});
    setEditIndex(null);
  };

  // Ouvrir le dialogue pour ajouter un produit
  const handleAddClick = () => {
    resetForm();
    setOpenDialog(true);
  };

  // Fermer le dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  // Ajouter ou mettre à jour un produit
  const handleAddOrUpdateProduct = () => {
    if (!validateForm()) return;

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
      showSnackbar('Produit mis à jour avec succès', 'success');
    } else {
      // Ajouter un nouveau produit
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      setProducts([
        ...products,
        {
          id: newId,
          name: newProduct.name.trim(),
          quantity: parseInt(newProduct.quantity),
          category: newProduct.category,
          alertThreshold: parseInt(newProduct.alertThreshold),
        },
      ]);
      showSnackbar('Produit ajouté avec succès', 'success');
    }

    handleCloseDialog();
  };

  // Afficher un message de feedback
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Fermer le snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Supprimer un produit avec confirmation
  const handleDeleteProduct = (index) => {
    confirm({
      title: 'Confirmer la suppression',
      description: `Êtes-vous sûr de vouloir supprimer ${products[index].name} ?`,
      confirmationText: 'Supprimer',
      cancellationText: 'Annuler',
    })
      .then(() => {
        const updatedProducts = products.filter((_, i) => i !== index);
        setProducts(updatedProducts);
        showSnackbar('Produit supprimé avec succès', 'success');
      })
      .catch(() => {});
  };

  // Éditer un produit
  const handleEditProduct = (index) => {
    setNewProduct(products[index]);
    setEditIndex(index);
    setOpenDialog(true);
  };

  // Gestion des entrées/sorties de stock
  const handleStockOperation = (index, operation, quantity = 1) => {
    const updatedProducts = [...products];
    if (operation === 'in') {
      updatedProducts[index].quantity += quantity;
    } else if (operation === 'out') {
      if (updatedProducts[index].quantity >= quantity) {
        updatedProducts[index].quantity -= quantity;
      } else {
        showSnackbar('Quantité insuffisante en stock', 'error');
        return;
      }
    }
    setProducts(updatedProducts);
    showSnackbar(
      `Stock ${operation === 'in' ? 'augmenté' : 'diminué'} avec succès`,
      'success'
    );
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
    XLSX.writeFile(workbook, `stocks_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showSnackbar('Export Excel généré avec succès', 'success');
  };

  // Pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Filtrage des produits par recherche
  const filteredProducts = products.filter((product) =>
    Object.values(product).some(
      (value) =>
        typeof value === 'string' &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Calcul des statistiques
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.quantity <= p.alertThreshold).length;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Gestion des stocks
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleExportExcel}
              sx={{ mr: 2 }}
            >
              Exporter
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Ajouter
            </Button>
          </Box>
        </Box>

        {/* Statistiques rapides */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Produits en stock</Typography>
              <Typography variant="h4">{totalProducts}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Stock total</Typography>
              <Typography variant="h4">{totalQuantity}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Stocks faibles</Typography>
              <Typography variant="h4" color={lowStockCount > 0 ? 'error' : 'inherit'}>
                {lowStockCount}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Alertes pour les stocks faibles */}
        {products
          .filter((product) => product.quantity <= product.alertThreshold)
          .map((product, index) => (
            <Alert
              key={index}
              severity="warning"
              sx={{ mb: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => handleStockOperation(
                    products.findIndex(p => p.id === product.id),
                    'in',
                    50
                  )}
                >
                  Réapprovisionner
                </Button>
              }
            >
              Stock faible pour {product.name} (Quantité: {product.quantity} / Seuil: {product.alertThreshold})
            </Alert>
          ))}

        {/* Champ de recherche */}
        <TextField
          fullWidth
          label="Rechercher un produit"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1); // Reset à la première page lors d'une nouvelle recherche
          }}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Tableau des produits en stock */}
        {filteredProducts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">Aucun produit trouvé</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              sx={{ mt: 2 }}
            >
              Ajouter un produit
            </Button>
          </Paper>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'primary.contrastText' }}>ID</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText' }}>Nom</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText' }}>Catégorie</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText' }}>Quantité</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText' }}>Seuil</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText' }}>Statut</TableCell>
                    <TableCell sx={{ color: 'primary.contrastText' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProducts.map((product, index) => {
                    const globalIndex = products.findIndex(p => p.id === product.id);
                    const isLowStock = product.quantity <= product.alertThreshold;
                    const stockPercentage = (product.quantity / (product.alertThreshold * 2)) * 100;

                    return (
                      <TableRow
                        key={product.id}
                        sx={{
                          '&:hover': { backgroundColor: 'action.hover' },
                          backgroundColor: isLowStock ? 'error.light' : 'inherit',
                        }}
                      >
                        <TableCell>{product.id}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {product.quantity}
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(stockPercentage, 100)}
                              sx={{
                                ml: 2,
                                height: 8,
                                width: 60,
                                borderRadius: 5,
                                backgroundColor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: isLowStock ? 'error.main' : 'success.main',
                                },
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{product.alertThreshold}</TableCell>
                        <TableCell>
                          {isLowStock ? (
                            <Typography color="error" fontWeight="bold">
                              Stock faible
                            </Typography>
                          ) : (
                            <Typography color="success.main" fontWeight="bold">
                              Disponible
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Modifier">
                            <IconButton onClick={() => handleEditProduct(globalIndex)}>
                              <EditIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton onClick={() => handleDeleteProduct(globalIndex)}>
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Entrée de stock">
                            <IconButton
                              color="success"
                              onClick={() => handleStockOperation(globalIndex, 'in', 10)}
                            >
                              <InputIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sortie de stock">
                            <IconButton
                              color="error"
                              onClick={() => handleStockOperation(globalIndex, 'out', 10)}
                            >
                              <OutputIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Typography variant="body2">
                {filteredProducts.length} produit(s) trouvé(s)
              </Typography>
              <Pagination
                count={Math.ceil(filteredProducts.length / rowsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
              />
            </Box>
          </>
        )}
      </Grid>

      {/* Dialogue pour ajouter/modifier un produit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editIndex !== null ? 'Modifier un produit' : 'Ajouter un nouveau produit'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom du produit"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantité"
                name="quantity"
                type="number"
                value={newProduct.quantity}
                onChange={handleInputChange}
                error={!!errors.quantity}
                helperText={errors.quantity}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Seuil d'alerte"
                name="alertThreshold"
                type="number"
                value={newProduct.alertThreshold}
                onChange={handleInputChange}
                error={!!errors.alertThreshold}
                helperText={errors.alertThreshold}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                  label="Catégorie"
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            startIcon={<CancelIcon />}
            color="inherit"
          >
            Annuler
          </Button>
          <Button
            onClick={handleAddOrUpdateProduct}
            startIcon={editIndex !== null ? <SaveIcon /> : <AddIcon />}
            variant="contained"
          >
            {editIndex !== null ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default StockManagement;