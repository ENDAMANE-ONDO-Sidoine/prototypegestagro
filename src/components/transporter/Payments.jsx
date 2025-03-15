import React, { useState } from 'react';
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
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { Download as DownloadIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';

const Payments = () => {
  // État pour gérer les paiements
  const [payments, setPayments] = useState([
    {
      id: 1,
      client: 'Client A',
      amount: '200 000 XAF',
      method: 'Airtel Money',
      status: 'Payé',
      invoiceGenerated: false,
      date: '2023-10-01 14:30',
    },
    {
      id: 2,
      client: 'Client B',
      amount: '150 000 XAF',
      method: 'Moov Money',
      status: 'Payé',
      invoiceGenerated: false,
      date: '2023-10-02 10:15',
    },
    {
      id: 3,
      client: 'Client C',
      amount: '300 000 XAF',
      method: 'Paiement à la livraison',
      status: 'En attente',
      invoiceGenerated: false,
      date: '2023-10-03 16:45',
    },
    {
      id: 4,
      client: 'Client D',
      amount: '250 000 XAF',
      method: 'Bamboo Mobile',
      status: 'Payé',
      invoiceGenerated: true,
      date: '2023-10-04 09:00',
    },
  ]);

  // État pour gérer le menu d'actions
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  // État pour gérer les messages d'alerte
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Ouvrir le menu d'actions
  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedPaymentId(id);
  };

  // Fermer le menu d'actions
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPaymentId(null);
  };

  // Afficher un message d'alerte
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // Fermer le message d'alerte
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Générer et télécharger une facture
  const handleGenerateInvoice = (id) => {
    setPayments(
      payments.map((payment) =>
        payment.id === id ? { ...payment, invoiceGenerated: true } : payment
      )
    );
    handleMenuClose();
    showSnackbar(`Facture générée pour le paiement ${id}`);
    // Ici, tu peux ajouter la logique pour générer et télécharger la facture
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Titre */}
      <Typography variant="h4" gutterBottom>
        Règlement
      </Typography>

      {/* Tableau des paiements */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Méthode de paiement</TableCell>
              <TableCell>Date et heure</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.client}</TableCell>
                <TableCell>{payment.amount}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>{payment.status}</TableCell>
                <TableCell>
                  <IconButton
                    aria-label="actions"
                    onClick={(e) => handleMenuOpen(e, payment.id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={selectedPaymentId === payment.id}
                    onClose={handleMenuClose}
                  >
                    <MenuItem
                      onClick={() => handleGenerateInvoice(payment.id)}
                      disabled={payment.status !== 'Payé' || payment.invoiceGenerated}
                    >
                      <DownloadIcon sx={{ mr: 1 }} />
                      {payment.invoiceGenerated ? 'Facture générée' : 'Générer facture'}
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Message d'alerte (Snackbar) */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Payments;