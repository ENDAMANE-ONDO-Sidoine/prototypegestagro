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
  Tabs,
  Tab,
  Pagination,
  IconButton,
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
  Box,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  Edit as EditIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const OrderTracking = () => {
  // États pour les commandes
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [editOrderId, setEditOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const rowsPerPage = 5;

  // Simuler le chargement des données
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockOrders = [
        {
          id: 1,
          customer: 'Jean Okouyi',
          customerId: 101,
          products: [
            { id: 1, name: 'Engrais A', quantity: 10, price: 5000 },
            { id: 2, name: 'Outils B', quantity: 5, price: 10000 },
          ],
          total: 100000,
          status: 'processing',
          date: format(new Date('2023-10-01'), 'PPpp', { locale: fr }),
          deliveryAddress: 'Quartier Louis, Libreville',
          paymentMethod: 'Mobile Money'
        },
        {
          id: 2,
          customer: 'Marie Mba',
          customerId: 102,
          products: [
            { id: 3, name: 'Semences C', quantity: 20, price: 2000 },
          ],
          total: 40000,
          status: 'shipped',
          date: format(new Date('2023-10-02'), 'PPpp', { locale: fr }),
          deliveryAddress: 'Quartier Nzeng-Ayong, Libreville',
          paymentMethod: 'Carte Bancaire'
        },
        {
          id: 3,
          customer: 'Paul Nzeng',
          customerId: 103,
          products: [
            { id: 4, name: 'Machines D', quantity: 1, price: 500000 },
          ],
          total: 500000,
          status: 'delivered',
          date: format(new Date('2023-10-03'), 'PPpp', { locale: fr }),
          deliveryAddress: 'Quartier Glass, Libreville',
          paymentMethod: 'Espèces'
        },
        {
          id: 4,
          customer: 'Alice Mboumba',
          customerId: 104,
          products: [
            { id: 1, name: 'Engrais A', quantity: 15, price: 5000 },
            { id: 3, name: 'Semences C', quantity: 30, price: 2000 },
          ],
          total: 135000,
          status: 'processing',
          date: format(new Date('2023-10-04'), 'PPpp', { locale: fr }),
          deliveryAddress: 'Quartier Oloumi, Libreville',
          paymentMethod: 'Mobile Money'
        },
        {
          id: 5,
          customer: 'David Nguema',
          customerId: 105,
          products: [
            { id: 2, name: 'Outils B', quantity: 8, price: 10000 },
          ],
          total: 80000,
          status: 'shipped',
          date: format(new Date('2023-10-05'), 'PPpp', { locale: fr }),
          deliveryAddress: 'Quartier Mont-Bouët, Libreville',
          paymentMethod: 'Carte Bancaire'
        }
      ];
      setOrders(mockOrders);
      setLoading(false);
    }, 1500);
  }, []);

  const statusLabels = {
    processing: { label: 'En traitement', color: 'warning' },
    shipped: { label: 'Expédiée', color: 'info' },
    delivered: { label: 'Livrée', color: 'success' },
    cancelled: { label: 'Annulée', color: 'error' }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  const handleCancelConfirmation = (orderId) => {
    setCancelOrderId(orderId);
    setOpenDialog(true);
  };

  const handleCancelOrder = () => {
    setLoading(true);
    setTimeout(() => {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === cancelOrderId && order.status === 'processing'
            ? { ...order, status: 'cancelled' }
            : order
        )
      );
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Commande annulée avec succès',
        severity: 'success'
      });
      setLoading(false);
    }, 800);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setLoading(true);
    setTimeout(() => {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setEditOrderId(null);
      setSnackbar({
        open: true,
        message: 'Statut de la commande mis à jour',
        severity: 'success'
      });
      setLoading(false);
    }, 800);
  };

  const handleExportExcel = () => {
    const data = filteredOrders.map(order => ({
      'ID Commande': order.id,
      Client: order.customer,
      Produits: order.products.map(p => p.name).join(', '),
      Quantité: order.products.map(p => p.quantity).join(', '),
      'Prix unitaire': order.products.map(p => p.price).join(', '),
      'Total (XAF)': order.total,
      Statut: statusLabels[order.status].label,
      'Date et heure': order.date,
      'Adresse livraison': order.deliveryAddress,
      'Méthode paiement': order.paymentMethod
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Commandes');
    XLSX.writeFile(workbook, `commandes_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Suivi des Commandes', 14, 16);
    doc.autoTable({
      head: [['ID', 'Client', 'Produits', 'Total', 'Statut', 'Date']],
      body: filteredOrders.map(order => [
        order.id,
        order.customer,
        order.products.map(p => p.name).join(', '),
        `${order.total} XAF`,
        statusLabels[order.status].label,
        order.date
      ]),
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [25, 118, 210] }
    });
    doc.save(`commandes_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Suivi des Commandes</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            h1 { color: #1976d2; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1976d2; color: white; }
            .status-processing { color: orange; }
            .status-shipped { color: blue; }
            .status-delivered { color: green; }
            .status-cancelled { color: red; }
          </style>
        </head>
        <body>
          <h1>Suivi des Commandes</h1>
          <p>Généré le ${format(new Date(), 'PPpp', { locale: fr })}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Produits</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(order => `
                <tr>
                  <td>${order.id}</td>
                  <td>${order.customer}</td>
                  <td>${order.products.map(p => p.name).join(', ')}</td>
                  <td>${order.total} XAF</td>
                  <td class="status-${order.status}">
                    ${statusLabels[order.status].label}
                  </td>
                  <td>${order.date}</td>
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

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const filteredOrders = orders
    .filter(order => 
      (tabValue === 0 ? order.status !== 'cancelled' && order.status !== 'delivered' : true) &&
      (tabValue === 1 ? order.status === 'cancelled' || order.status === 'delivered' : true)
    )
    .filter(order =>
      statusFilter === 'all' || order.status === statusFilter
    )
    .filter(order =>
      Object.values(order).some(value => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  const paginatedOrders = filteredOrders.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Grid container spacing={3}>
      <Backdrop open={loading} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir annuler cette commande ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleCancelOrder} color="error" variant="contained">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Suivi des Commandes
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Commandes en cours" />
            <Tab label="Historique" />
          </Tabs>

          <Box sx={{ display: 'flex', gap: 1 }}>
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
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filtrer par statut</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filtrer par statut"
            >
              <MenuItem value="all">Tous les statuts</MenuItem>
              <MenuItem value="processing">En traitement</MenuItem>
              <MenuItem value="shipped">Expédiée</MenuItem>
              <MenuItem value="delivered">Livrée</MenuItem>
              <MenuItem value="cancelled">Annulée</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Produits</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Paiement</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {order.customer.charAt(0)}
                        </Avatar>
                        <Typography>{order.customer}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      {order.products.map((product, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            {product.name} (x{product.quantity})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.price} XAF/unité
                          </Typography>
                        </Box>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">
                        {order.total.toLocaleString()} XAF
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {editOrderId === order.id ? (
                        <FormControl size="small" fullWidth>
                          <Select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            autoFocus
                          >
                            <MenuItem value="processing">En traitement</MenuItem>
                            <MenuItem value="shipped">Expédiée</MenuItem>
                            <MenuItem value="delivered">Livrée</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <Chip
                          label={statusLabels[order.status].label}
                          color={statusLabels[order.status].color}
                          size="small"
                          icon={
                            order.status === 'shipped' ? <ShippingIcon fontSize="small" /> :
                            order.status === 'delivered' ? <CheckCircleIcon fontSize="small" /> :
                            order.status === 'cancelled' ? <CancelIcon fontSize="small" /> : null
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell sx={{ maxWidth: 150 }}>
                      <Typography variant="body2" noWrap>
                        {order.deliveryAddress}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={order.paymentMethod} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      {order.status === 'processing' && (
                        <>
                          <Tooltip title="Modifier statut">
                            <IconButton
                              size="small"
                              onClick={() => setEditOrderId(editOrderId === order.id ? null : order.id)}
                            >
                              {editOrderId === order.id ? <CloseIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Annuler commande">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCancelConfirmation(order.id)}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Aucune commande trouvée
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredOrders.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(filteredOrders.length / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default OrderTracking;