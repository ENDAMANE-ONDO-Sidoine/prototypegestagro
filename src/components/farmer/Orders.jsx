import React, { useState} from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
} from '@mui/material';
import { Visibility, Edit, Delete, Add } from '@mui/icons-material';
import { styled } from '@mui/system';
//import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Styles personnalisés
const OrdersContainer = styled(Box)({
  padding: '24px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
});

// Données mockées pour les commandes
const initialOrders = [
  {
    id: 1,
    orderNumber: 'ORD001',
    customer: 'Client A',
    date: '2023-10-01',
    status: 'En attente',
    items: [
      { product: 'Poulet de chair', quantity: 10, price: '50 000 FCFA' },
      { product: 'Régime de banane', quantity: 2, price: '150 000 FCFA' },
    ],
    total: '800 000 FCFA',
  },
  {
    id: 2,
    orderNumber: 'ORD002',
    customer: 'Client B',
    date: '2023-09-15',
    status: 'Expédiée',
    items: [
      { product: 'Poulet de chair', quantity: 5, price: '50 000 FCFA' },
    ],
    total: '250 000 FCFA',
  },
  {
    id: 3,
    orderNumber: 'ORD003',
    customer: 'Client C',
    date: '2023-08-30',
    status: 'Livrée',
    items: [
      { product: 'Régime de banane', quantity: 3, price: '150 000 FCFA' },
    ],
    total: '450 000 FCFA',
  },
];

const Orders = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    date: '',
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
  });

  // États pour le formulaire de commande
  const [orderForm, setOrderForm] = useState({
    orderNumber: '',
    customer: '',
    date: '',
    status: 'En attente',
    items: [],
    total: '',
  });

  // États pour un nouveau produit
  const [newProduct, setNewProduct] = useState({
    product: '',
    quantity: 1,
    price: '',
  });

  // Fonction pour ouvrir le formulaire de création/modification de commande
  const handleOpenOrderDialog = (order = null) => {
    if (order) {
      setOrderForm(order);
    } else {
      setOrderForm({
        orderNumber: `ORD${orders.length + 1}`,
        customer: '',
        date: new Date().toISOString().split('T')[0],
        status: 'En attente',
        items: [],
        total: '',
      });
    }
    setOpenOrderDialog(true);
  };

  // Fonction pour fermer le formulaire de commande
  const handleCloseOrderDialog = () => {
    setOpenOrderDialog(false);
    setOrderForm({
      orderNumber: '',
      customer: '',
      date: '',
      status: 'En attente',
      items: [],
      total: '',
    });
  };

  // Fonction pour ajouter un produit à la commande
  const addProduct = () => {
    const amount = newProduct.quantity * parseFloat(newProduct.price);
    const updatedItems = [...orderForm.items, { ...newProduct, amount }];
    const total = updatedItems.reduce((sum, item) => sum + item.amount, 0);

    setOrderForm({
      ...orderForm,
      items: updatedItems,
      total,
    });

    setNewProduct({
      product: '',
      quantity: 1,
      price: '',
    });
  };

  // Fonction pour enregistrer une commande
  const saveOrder = () => {
    if (orderForm.id) {
      // Modifier une commande existante
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderForm.id ? orderForm : order))
      );
      setNotification({ open: true, message: 'Commande modifiée avec succès !' });
    } else {
      // Ajouter une nouvelle commande
      setOrders([...orders, { ...orderForm, id: orders.length + 1 }]);
      setNotification({ open: true, message: 'Commande créée avec succès !' });
    }
    handleCloseOrderDialog();
  };

  // Fonction pour exporter les commandes en Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(orders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Commandes');
    XLSX.writeFile(workbook, 'Commandes.xlsx');
  };

  // Fonction pour exporter les commandes en PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Numéro', 'Client', 'Date', 'Statut', 'Montant']],
      body: orders.map((order) => [
        order.orderNumber,
        order.customer,
        order.date,
        order.status,
        order.total,
      ]),
    });
    doc.save('Commandes.pdf');
  };

  return (
    <OrdersContainer>
      <Typography variant="h4" gutterBottom>
        Gestion des commandes
      </Typography>

      {/* Boutons d'action */}
      <Box sx={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenOrderDialog()}
        >
          Créer une commande
        </Button>
        <Button variant="contained" onClick={exportToExcel}>
          Exporter en Excel
        </Button>
        <Button variant="contained" onClick={exportToPDF}>
          Exporter en PDF
        </Button>
      </Box>

      {/* Filtres */}
      <Box sx={{ marginBottom: '24px' }}>
        <Typography variant="h6" gutterBottom>
          Filtres
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                label="Statut"
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="En attente">En attente</MenuItem>
                <MenuItem value="Expédiée">Expédiée</MenuItem>
                <MenuItem value="Livrée">Livrée</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Tableau des commandes */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Liste des commandes
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Numéro</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => setSelectedOrder(order)}>
                      <Visibility />
                    </IconButton>
                    <IconButton onClick={() => handleOpenOrderDialog(order)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => setOrders(orders.filter((o) => o.id !== order.id))}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Détails de la commande */}
      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} fullWidth maxWidth="md">
        <DialogTitle>Détails de la commande</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">Numéro : {selectedOrder.orderNumber}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Client : {selectedOrder.customer}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Date : {selectedOrder.date}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Statut : {selectedOrder.status}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Produits :</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Produit</TableCell>
                        <TableCell>Quantité</TableCell>
                        <TableCell>Prix</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Montant total : {selectedOrder.total}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Formulaire de commande */}
      <Dialog open={openOrderDialog} onClose={handleCloseOrderDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {orderForm.id ? 'Modifier la commande' : 'Créer une commande'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginTop: '8px' }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Numéro de commande"
                variant="outlined"
                value={orderForm.orderNumber}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client"
                variant="outlined"
                value={orderForm.customer}
                onChange={(e) => setOrderForm({ ...orderForm, customer: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={orderForm.date}
                onChange={(e) => setOrderForm({ ...orderForm, date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={orderForm.status}
                  onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                  label="Statut"
                >
                  <MenuItem value="En attente">En attente</MenuItem>
                  <MenuItem value="Expédiée">Expédiée</MenuItem>
                  <MenuItem value="Livrée">Livrée</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Ajouter des produits */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Produits
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Produit"
                    variant="outlined"
                    value={newProduct.product}
                    onChange={(e) => setNewProduct({ ...newProduct, product: e.target.value })}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    label="Quantité"
                    type="number"
                    variant="outlined"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Prix unitaire"
                    type="number"
                    variant="outlined"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={addProduct}
                    sx={{ height: '100%' }}
                  >
                    Ajouter
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            {/* Liste des produits */}
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Produit</TableCell>
                      <TableCell>Quantité</TableCell>
                      <TableCell>Prix unitaire</TableCell>
                      <TableCell>Montant</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderForm.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.price}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => {
                            const updatedItems = orderForm.items.filter((_, i) => i !== index);
                            const total = updatedItems.reduce((sum, item) => sum + item.amount, 0);
                            setOrderForm({ ...orderForm, items: updatedItems, total });
                          }}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            {/* Montant total */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Montant total : {orderForm.total}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDialog}>Annuler</Button>
          <Button variant="contained" color="primary" onClick={saveOrder}>
            {orderForm.id ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        message={notification.message}
      />
    </OrdersContainer>
  );
};

export default Orders;