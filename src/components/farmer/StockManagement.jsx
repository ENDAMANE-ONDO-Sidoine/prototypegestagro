import React, { useState, useCallback, useMemo } from 'react';
import {
  Box, Button, TextField, Typography, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Snackbar, Alert, InputAdornment,
  Card, CardContent, Grid, Chip, Divider, Tooltip, useTheme, styled,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, 
  Save as SaveIcon, Search as SearchIcon, Download as DownloadIcon,
  Inventory as InventoryIcon, Assessment as AssessmentIcon
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

Chart.register(...registerables);

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

const CriticalChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.dark
}));

const NormalChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.success.light,
  color: theme.palette.success.dark
}));

// Liste des produits initiale
const initialProducts = [
  { id: 1, name: 'Manioc', quantity: 100, unit: 'kg', category: 'Tubercules', critical: false },
  { id: 2, name: 'Igrame', quantity: 15, unit: 'kg', category: 'Tubercules', critical: true },
  { id: 3, name: 'Aubergine', quantity: 10, unit: 'kg', category: 'Légumes', critical: false },
  { id: 4, name: 'Folon', quantity: 5, unit: 'kg', category: 'Légumineuses', critical: false },
  { id: 5, name: 'Tomate', quantity: 10, unit: 'kg', category: 'Légumineuses', critical: true },
];

const StockManagement = () => {
  const theme = useTheme();
  const [products, setProducts] = useState(initialProducts);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    quantity: 0, 
    unit: 'kg',
    category: 'Céréales'
  });
  const [editProductId, setEditProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });

  const categories = ['Céréales', 'Légumineuses', 'Tubercules', 'Fruits', 'Légumes'];
  const units = ['kg', 'g', 'L', 'unité', 'sac', 'carton'];

  const handleAddProduct = useCallback(() => {
    if (!newProduct.name.trim() || newProduct.quantity <= 0) {
      setNotification({ 
        open: true, 
        message: 'Veuillez remplir tous les champs correctement', 
        severity: 'error' 
      });
      return;
    }

    const criticalThreshold = newProduct.unit === 'kg' ? 20 : newProduct.unit === 'g' ? 20000 : 10;
    
    setProducts((prev) => [
      ...prev,
      { 
        id: Date.now(), 
        name: newProduct.name, 
        quantity: newProduct.quantity,
        unit: newProduct.unit,
        category: newProduct.category,
        critical: newProduct.quantity < criticalThreshold 
      },
    ]);

    setNewProduct({ name: '', quantity: 0, unit: 'kg', category: 'Céréales' });
    setNotification({ 
      open: true, 
      message: 'Produit ajouté avec succès', 
      severity: 'success' 
    });
  }, [newProduct]);

  const handleDeleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
    setNotification({ 
      open: true, 
      message: 'Produit supprimé avec succès', 
      severity: 'warning' 
    });
  }, []);

  const handleEditProduct = useCallback((id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setNewProduct({ 
      name: product.name, 
      quantity: product.quantity,
      unit: product.unit,
      category: product.category
    });
    setEditProductId(id);
  }, [products]);

  const handleSaveProduct = useCallback(() => {
    if (!newProduct.name.trim() || newProduct.quantity <= 0) {
      setNotification({ 
        open: true, 
        message: 'Veuillez remplir tous les champs correctement', 
        severity: 'error' 
      });
      return;
    }

    const criticalThreshold = newProduct.unit === 'kg' ? 20 : newProduct.unit === 'g' ? 20000 : 10;

    setProducts((prev) =>
      prev.map((product) =>
        product.id === editProductId
          ? { 
              ...product, 
              name: newProduct.name, 
              quantity: newProduct.quantity,
              unit: newProduct.unit,
              category: newProduct.category,
              critical: newProduct.quantity < criticalThreshold 
            }
          : product
      )
    );

    setNewProduct({ name: '', quantity: 0, unit: 'kg', category: 'Céréales' });
    setEditProductId(null);
    setNotification({ 
      open: true, 
      message: 'Produit mis à jour avec succès', 
      severity: 'info' 
    });
  }, [newProduct, editProductId]);

  const filteredProducts = useMemo(
    () => products.filter((product) => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [products, searchTerm]
  );

  const criticalProducts = useMemo(
    () => products.filter(product => product.critical),
    [products]
  );

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProducts.map(p => ({
        Produit: p.name,
        Catégorie: p.category,
        Quantité: `${p.quantity} ${p.unit}`,
        Statut: p.critical ? 'Critique' : 'Normal'
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock');
    XLSX.writeFile(workbook, 'inventaire_stock.xlsx');
    setNotification({
      open: true,
      message: 'Export Excel réussi',
      severity: 'success'
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text("Rapport d'Inventaire", 105, 15, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.text(`Généré le: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
    
    // Tableau
    doc.autoTable({
      head: [['Produit', 'Catégorie', 'Quantité', 'Statut']],
      body: filteredProducts.map(p => [
        p.name,
        p.category,
        `${p.quantity} ${p.unit}`,
        p.critical ? 'Critique' : 'Normal'
      ]),
      startY: 30,
      styles: {
        fontSize: 9,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [34, 139, 34],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} sur ${pageCount}`, 105, 285, { align: 'center' });
    }
    
    doc.save('inventaire_stock.pdf');
    setNotification({
      open: true,
      message: 'Export PDF réussi',
      severity: 'success'
    });
  };

  const chartData = {
    labels: filteredProducts.map(product => `${product.name} (${product.unit})`),
    datasets: [
      {
        label: 'Quantité en stock',
        data: filteredProducts.map(product => product.quantity),
        backgroundColor: filteredProducts.map(product => 
          product.critical 
            ? 'rgba(255, 99, 132, 0.7)' 
            : 'rgba(75, 192, 192, 0.7)'
        ),
        borderColor: filteredProducts.map(product => 
          product.critical 
            ? 'rgba(255, 99, 132, 1)' 
            : 'rgba(75, 192, 192, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Niveaux de stock actuels',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const product = filteredProducts[context.dataIndex];
            return [
              `Produit: ${product.name}`,
              `Catégorie: ${product.category}`,
              `Quantité: ${product.quantity} ${product.unit}`,
              `Statut: ${product.critical ? 'CRITIQUE' : 'Normal'}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantité'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Produits'
        }
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 'bold',
        color: theme.palette.primary.dark,
        mb: 3,
        display: 'flex',
        alignItems: 'center'
      }}>
        <InventoryIcon sx={{ mr: 2, fontSize: '2rem' }} />
        Gestion des stocks agricoles
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex',
                alignItems: 'center',
                mb: 2
              }}>
                {editProductId ? 'Modifier un produit' : 'Ajouter un nouveau produit'}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom du produit *"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantité *"
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    size="small"
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Unité *"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    size="small"
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Catégorie *"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    size="small"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color={editProductId ? 'warning' : 'primary'}
                    startIcon={editProductId ? <SaveIcon /> : <AddIcon />}
                    onClick={editProductId ? handleSaveProduct : handleAddProduct}
                    size="medium"
                    sx={{ mt: 1 }}
                  >
                    {editProductId ? 'Sauvegarder' : 'Ajouter au stock'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex',
                alignItems: 'center',
                mb: 2
              }}>
                <AssessmentIcon sx={{ mr: 1 }} />
                Aperçu du stock
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ 
                    backgroundColor: theme.palette.background.default,
                    p: 2,
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="h4" color="primary">
                      {products.length}
                    </Typography>
                    <Typography variant="body2">
                      Produits en stock
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ 
                    backgroundColor: theme.palette.error.light,
                    p: 2,
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="h4" color="error.dark">
                      {criticalProducts.length}
                    </Typography>
                    <Typography variant="body2">
                      Produits critiques
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <TextField
                fullWidth
                label="Rechercher un produit"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      <StyledCard sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6" gutterBottom>
              Liste des produits en stock
            </Typography>
            
            <Box>
              <Tooltip title="Exporter en Excel">
                <IconButton 
                  color="success" 
                  onClick={handleExportExcel}
                  sx={{ mr: 1 }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Exporter en PDF">
                <IconButton 
                  color="error" 
                  onClick={handleExportPDF}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.light }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Produit</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Catégorie</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quantité</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow 
                      key={product.id}
                      hover
                      sx={{ 
                        '&:nth-of-type(odd)': {
                          backgroundColor: theme.palette.action.hover
                        }
                      }}
                    >
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{`${product.quantity} ${product.unit}`}</TableCell>
                      <TableCell>
                        {product.critical ? (
                          <CriticalChip label="CRITIQUE" size="small" />
                        ) : (
                          <NormalChip label="Normal" size="small" />
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Modifier">
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleEditProduct(product.id)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Aucun produit trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </StyledCard>

      <StyledCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Visualisation des niveaux de stock
          </Typography>
          <Box sx={{ 
            width: '100%', 
            height: '400px',
            position: 'relative'
          }}>
            <Bar 
              data={chartData} 
              options={chartOptions}
            />
          </Box>
        </CardContent>
      </StyledCard>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StockManagement;