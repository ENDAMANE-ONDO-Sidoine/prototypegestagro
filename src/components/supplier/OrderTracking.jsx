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
  Tabs,
  Tab,
  Pagination,
  IconButton,
} from '@mui/material';
import { Cancel as CancelIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';

const OrderTracking = () => {
  // États pour les commandes reçues et l'historique
  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: 'Jean Okouyi',
      products: [
        { name: 'Engrais A', quantity: 10, price: 5000 },
        { name: 'Outils B', quantity: 5, price: 10000 },
      ],
      total: 100000,
      status: 'En traitement',
      date: '2023-10-01 10:30',
    },
    {
      id: 2,
      customer: 'Marie Mba',
      products: [
        { name: 'Semences C', quantity: 20, price: 2000 },
      ],
      total: 40000,
      status: 'Expédiée',
      date: '2023-10-02 14:15',
    },
    {
      id: 3,
      customer: 'Paul Nzeng',
      products: [
        { name: 'Machines D', quantity: 1, price: 500000 },
      ],
      total: 500000,
      status: 'Livrée',
      date: '2023-10-03 09:45',
    },
    {
      id: 4,
      customer: 'Alice Mboumba',
      products: [
        { name: 'Engrais A', quantity: 15, price: 5000 },
        { name: 'Semences C', quantity: 30, price: 2000 },
      ],
      total: 135000,
      status: 'En traitement',
      date: '2023-10-04 16:20',
    },
    {
      id: 5,
      customer: 'David Nguema',
      products: [
        { name: 'Outils B', quantity: 8, price: 10000 },
      ],
      total: 80000,
      status: 'Expédiée',
      date: '2023-10-05 11:10',
    },
  ]);

  const [tabValue, setTabValue] = useState(0); // 0 pour Commandes reçues, 1 pour Historique

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Gestion du changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); // Réinitialiser la pagination lors du changement d'onglet
  };

  // Annuler une commande
  const handleCancelOrder = (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId && order.status === 'En traitement'
          ? { ...order, status: 'Annulée' }
          : order
      )
    );
  };

  // Exportation en Excel
  const handleExportExcel = () => {
    const data = orders.map((order) => ({
      'ID Commande': order.id,
      Client: order.customer,
      Produits: order.products.map((p) => p.name).join(', '),
      Quantité: order.products.map((p) => p.quantity).join(', '),
      Prix: order.products.map((p) => p.price).join(', '),
      'Total (XAF)': order.total,
      Statut: order.status,
      'Date et heure': order.date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Commandes');
    XLSX.writeFile(workbook, 'commandes.xlsx');
  };

  // Pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedOrders = orders.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5">Suivi des commandes</Typography>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Commandes reçues" />
          <Tab label="Historique des commandes" />
        </Tabs>
        <Button variant="contained" color="success" onClick={handleExportExcel} sx={{ mb: 2 }}>
          Exporter en Excel
        </Button>
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Commande</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Produits</TableCell>
                <TableCell>Quantité</TableCell>
                <TableCell>Prix (XAF)</TableCell>
                <TableCell>Total (XAF)</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date et heure</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    {order.products.map((product, index) => (
                      <div key={index}>{product.name}</div>
                    ))}
                  </TableCell>
                  <TableCell>
                    {order.products.map((product, index) => (
                      <div key={index}>{product.quantity}</div>
                    ))}
                  </TableCell>
                  <TableCell>
                    {order.products.map((product, index) => (
                      <div key={index}>{product.price} XAF</div>
                    ))}
                  </TableCell>
                  <TableCell>{order.total} XAF</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    {order.status === 'En traitement' && (
                      <IconButton
                        color="error"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        <CancelIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          count={Math.ceil(orders.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
        />
      </Grid>
    </Grid>
  );
};

export default OrderTracking;