import React, { useState, useCallback } from 'react';
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
  Alert,
} from '@mui/material';
import { Visibility, Edit, Delete, Add } from '@mui/icons-material';
import { styled } from '@mui/system';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Styles personnalisés
const OrdersContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
}));

// Données mockées pour les commandes
const initialOrders = [
  {
    id: 1,
    orderNumber: 'ORD001',
    customer: 'Client A',
    date: '2025-05-01',
    status: 'En attente',
    items: [
      { product: 'Poulet de chair', quantity: 10, price: 50000, amount: 500000 },
      { product: 'Régime de banane', quantity: 2, price: 150000, amount: 300000 },
    ],
    total: 800000,
  },
  {
    id: 2,
    orderNumber: 'ORD002',
    customer: 'Client B',
    date: '2025-04-15',
    status: 'Expédiée',
    items: [
      { product: 'Poulet de chair', quantity: 5, price: 50000, amount: 250000 },
    ],
    total: 250000,
  },
  {
    id: 3,
    orderNumber: 'ORD003',
    customer: 'Client C',
    date: '2025-04-30',
    status: 'Livrée',
    items: [
      { product: 'Régime de banane', quantity: 3, price: 150000, amount: 450000 },
    ],
    total: 450000,
  },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
};

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
    severity: 'success',
  });

  const [orderForm, setOrderForm] = useState({
    orderNumber: '',
    customer: '',
    date: '',
    status: 'En attente',
    items: [],
    total: 0,
  });

  const [newProduct, setNewProduct] = useState({
    product: '',
    quantity: 1,
    price: '',
  });

  const filteredOrders = orders.filter(order => {
    return (
      (filters.status === '' || order.status === filters.status) &&
      (filters.date === '' || order.date === filters.date)
    );
  });

  const handleOpenOrderDialog = useCallback((order = null) => {
    if (order) {
      setOrderForm({ ...order });
    } else {
      setOrderForm({
        orderNumber: `ORD${orders.length + 1}`,
        customer: '',
        date: new Date().toISOString().split('T')[0],
        status: 'En attente',
        items: [],
        total: 0,
      });
    }
    setOpenOrderDialog(true);
  }, [orders.length]);

  const handleCloseOrderDialog = useCallback(() => {
    setOpenOrderDialog(false);
    setOrderForm({
      orderNumber: '',
      customer: '',
      date: '',
      status: 'En attente',
      items: [],
      total: 0,
    });
  }, []);

  const addProduct = useCallback(() => {
    if (!newProduct.product || !newProduct.price) return;

    const amount = parseInt(newProduct.quantity) * parseFloat(newProduct.price);
    const updatedItems = [...orderForm.items, { 
      ...newProduct, 
      price: parseFloat(newProduct.price),
      amount 
    }];
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
  }, [newProduct, orderForm]);

  const removeProduct = useCallback((index) => {
    const updatedItems = orderForm.items.filter((_, i) => i !== index);
    const total = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    setOrderForm({ ...orderForm, items: updatedItems, total });
  }, [orderForm]);

  const saveOrder = useCallback(() => {
    if (!orderForm.customer || orderForm.items.length === 0) {
      setNotification({
        open: true,
        message: 'Veuillez remplir tous les champs obligatoires',
        severity: 'error'
      });
      return;
    }

    if (orderForm.id) {
      setOrders(prevOrders =>
        prevOrders.map(order => (order.id === orderForm.id ? orderForm : order))
      );
      setNotification({
        open: true,
        message: 'Commande modifiée avec succès !',
        severity: 'success'
      });
    } else {
      setOrders([...orders, { ...orderForm, id: orders.length + 1 }]);
      setNotification({
        open: true,
        message: 'Commande créée avec succès !',
        severity: 'success'
      });
    }
    handleCloseOrderDialog();
  }, [orderForm, orders, handleCloseOrderDialog]);

  const deleteOrder = useCallback((id) => {
    setOrders(orders.filter(order => order.id !== id));
    setNotification({
      open: true,
      message: 'Commande supprimée avec succès !',
      severity: 'success'
    });
  }, [orders]);

  const exportToExcel = useCallback(() => {
    const data = filteredOrders.map(order => ({
      'Numéro': order.orderNumber,
      'Client': order.customer,
      'Date': order.date,
      'Statut': order.status,
      'Montant': formatCurrency(order.total),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Commandes');
    XLSX.writeFile(workbook, 'Commandes.xlsx');
  }, [filteredOrders]);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.text('Liste des Commandes', 14, 16);
    doc.autoTable({
      startY: 20,
      head: [['Numéro', 'Client', 'Date', 'Statut', 'Montant']],
      body: filteredOrders.map(order => [
        order.orderNumber,
        order.customer,
        order.date,
        order.status,
        formatCurrency(order.total),
      ]),
    });
    doc.save('Commandes.pdf');
  }, [filteredOrders]);

  return (
    <OrdersContainer>
      <Typography variant="h4" gutterBottom>
        Gestion des commandes
      </Typography>

      {/* Boutons d'action */}
      <Box sx={{ marginBottom: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenOrderDialog()}
        >
          Créer une commande
        </Button>
        <Button variant="outlined" onClick={exportToExcel}>
          Exporter en Excel
        </Button>
        <Button variant="outlined" onClick={exportToPDF}>
          Exporter en PDF
        </Button>
      </Box>

      {/* Filtres */}
      <Box sx={{ marginBottom: 3 }}>
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
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => setSelectedOrder(order)}>
                      <Visibility color="info" />
                    </IconButton>
                    <IconButton onClick={() => handleOpenOrderDialog(order)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => deleteOrder(order.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Détails de la commande */}
      <Dialog 
        open={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        fullWidth 
        maxWidth="md"
      >
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
                        <TableCell>Prix unitaire</TableCell>
                        <TableCell>Montant</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">
                  Montant total : {formatCurrency(selectedOrder.total)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Formulaire de commande */}
      <Dialog 
        open={openOrderDialog} 
        onClose={handleCloseOrderDialog} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle>
          {orderForm.id ? 'Modifier la commande' : 'Créer une commande'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
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
                label="Client *"
                variant="outlined"
                value={orderForm.customer}
                onChange={(e) => setOrderForm({ ...orderForm, customer: e.target.value })}
                required
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
                Produits *
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Produit *"
                    variant="outlined"
                    value={newProduct.product}
                    onChange={(e) => setNewProduct({ ...newProduct, product: e.target.value })}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    label="Quantité *"
                    type="number"
                    variant="outlined"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Prix unitaire *"
                    type="number"
                    variant="outlined"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    variant="contained"
                    onClick={addProduct}
                    sx={{ height: '56px' }}
                    disabled={!newProduct.product || !newProduct.price}
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
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{formatCurrency(item.amount)}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => removeProduct(index)}>
                            <Delete color="error" />
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
                Montant total : {formatCurrency(orderForm.total)}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDialog}>Annuler</Button>
          <Button 
            variant="contained" 
            onClick={saveOrder}
            disabled={!orderForm.customer || orderForm.items.length === 0}
          >
            {orderForm.id ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </OrdersContainer>
  );
};

export default Orders;