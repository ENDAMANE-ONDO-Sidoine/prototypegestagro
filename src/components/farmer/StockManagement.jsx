import React, { useState, useCallback, useMemo } from 'react';
import {
  Box, Button, TextField, Typography, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Snackbar, Alert, InputAdornment
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Save as SaveIcon, Search as SearchIcon } from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

Chart.register(...registerables);

// Liste des produits initiale
const initialProducts = [
  { id: 1, name: 'Maïs', quantity: 100, critical: false },
  { id: 2, name: 'Blé', quantity: 50, critical: true },
  { id: 3, name: 'Riz', quantity: 200, critical: false },
];

const GestionStock = () => {
  const [products, setProducts] = useState(initialProducts);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: 0 });
  const [editProductId, setEditProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleAddProduct = useCallback(() => {
    if (!newProduct.name.trim() || newProduct.quantity <= 0) return;

    setProducts((prev) => [
      ...prev,
      { id: prev.length + 1, name: newProduct.name, quantity: newProduct.quantity, critical: newProduct.quantity < 20 },
    ]);

    setNewProduct({ name: '', quantity: 0 });
    setNotification({ open: true, message: 'Produit ajouté avec succès', severity: 'success' });
  }, [newProduct]);

  const handleDeleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
    setNotification({ open: true, message: 'Produit supprimé avec succès', severity: 'warning' });
  }, []);

  const handleEditProduct = useCallback((id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setNewProduct({ name: product.name, quantity: product.quantity });
    setEditProductId(id);
  }, [products]);

  const handleSaveProduct = useCallback(() => {
    if (!newProduct.name.trim() || newProduct.quantity <= 0) return;

    setProducts((prev) =>
      prev.map((product) =>
        product.id === editProductId
          ? { ...product, name: newProduct.name, quantity: newProduct.quantity, critical: newProduct.quantity < 20 }
          : product
      )
    );

    setNewProduct({ name: '', quantity: 0 });
    setEditProductId(null);
    setNotification({ open: true, message: 'Produit mis à jour avec succès', severity: 'info' });
  }, [newProduct, editProductId]);

  const filteredProducts = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm]
  );

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredProducts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produits');
    XLSX.writeFile(workbook, 'produits.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des produits", 10, 10);
    doc.autoTable({
      head: [['Produit', 'Quantité', 'Statut']],
      body: filteredProducts.map(product => [
        product.name,
        product.quantity,
        product.critical ? 'Critique' : 'OK',
      ]),
      startY: 20,
    });
    doc.save('produits.pdf');
  };

  const chartData = {
    labels: filteredProducts.map(product => product.name),
    datasets: [
      {
        label: 'Quantité',
        data: filteredProducts.map(product => product.quantity),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Quantité des produits en stock',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Gestion des stocks</Typography>

      <Box display="flex" alignItems="center" mb={2}>
        <TextField label="Nom du produit" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} sx={{ mr: 2 }} />
        <TextField label="Quantité" type="number" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: Math.max(0, parseInt(e.target.value, 10) || 0) })} sx={{ mr: 2 }} />
        <Button variant="contained" color={editProductId ? 'warning' : 'primary'} startIcon={editProductId ? <SaveIcon /> : <AddIcon />} onClick={editProductId ? handleSaveProduct : handleAddProduct}>
          {editProductId ? 'Sauvegarder' : 'Ajouter'}
        </Button>
      </Box>

      <TextField label="Rechercher un produit" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), }} sx={{ mb: 2, width: '100%' }} />

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produit</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{product.critical ? <Typography color="error">Critique</Typography> : <Typography color="success">OK</Typography>}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEditProduct(product.id)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDeleteProduct(product.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">Aucun produit trouvé.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ width: '100%', height: '400px', mb: 2 }}>
        <Typography variant="h6" gutterBottom>Graphique des quantités</Typography>
        <Bar data={chartData} options={chartOptions} />
      </Box>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="success" onClick={handleExportExcel} sx={{ mr: 2 }}>Exporter en Excel</Button>
        <Button variant="contained" color="error" onClick={handleExportPDF}>Exporter en PDF</Button>
      </Box>

      <Snackbar open={notification.open} autoHideDuration={3000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionStock;