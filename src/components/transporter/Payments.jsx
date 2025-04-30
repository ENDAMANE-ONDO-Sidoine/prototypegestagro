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
  Chip,
  Button,
  useMediaQuery,
  useTheme,
  styled,
  Snackbar,
  Alert
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

// Style personnalisé pour les lignes mobiles
const MobilePaymentCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& > div': {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
}));

// Noms gabonais réalistes
const gaboneseNames = [
  'Mbadinga',
'ONGOUORI',
'Nzengue',
'Tchitoumba',
'Obame',
'Bouka',
'Nguema',
'Mapangou'
];

// Méthodes de paiement courantes au Gabon
const paymentMethods = [
  'Airtel Money',
  'Moov Money',
  'Bamboo Mobile',
  'Paiement à la livraison',
  'Virement bancaire',
  'Espèces'
];

// Générer des dates aléatoires pour 2025
const generateRandomDate = () => {
  const randomHour = Math.floor(Math.random() * 12) + 8;
  const randomMinute = Math.floor(Math.random() * 60);
  const day = Math.floor(Math.random() * 28) + 1;
  const month = Math.floor(Math.random() * 12) + 1;
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/2025 ${randomHour}:${randomMinute.toString().padStart(2, '0')}`;
};

// Générer des paiements aléatoires
const generatePayments = () => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    client: gaboneseNames[i],
    amount: `${Math.floor(Math.random() * 500) + 50} 000 XAF`,
    method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    status: Math.random() > 0.3 ? 'Payé' : 'En attente',
    invoiceGenerated: Math.random() > 0.7,
    date: generateRandomDate(),
    phone: `+241 0${Math.floor(1000000 + Math.random() * 9000000)}`
  }));
};

const Payments = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [payments] = useState(generatePayments());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleGenerateInvoice = (id) => {
    showSnackbar(`Facture #${id} téléchargée avec succès`);
  };

  // Couleurs pour les statuts
  const statusColors = {
    'Payé': 'success',
    'En attente': 'warning',
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: isMobile ? 1 : 3,
      overflowX: 'hidden'
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontSize: isMobile ? '1.3rem' : '2rem',
        mb: 2,
        fontWeight: 600
      }}>
        Historique des Paiements 2025
      </Typography>

      {isMobile ? (
        <TableContainer component={Paper} sx={{ 
          borderRadius: 2,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`
        }}>
          {payments.map((payment) => (
            <MobilePaymentCard key={payment.id}>
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Client:</Typography>
                <Typography sx={{ textAlign: 'right' }}>
                  {payment.client}
                </Typography>
              </div>
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Téléphone:</Typography>
                <Typography sx={{ textAlign: 'right' }}>{payment.phone}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Montant:</Typography>
                <Typography sx={{ textAlign: 'right', fontWeight: 600 }}>{payment.amount}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Méthode:</Typography>
                <Typography sx={{ textAlign: 'right' }}>{payment.method}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Date:</Typography>
                <Typography sx={{ textAlign: 'right' }}>{payment.date}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Statut:</Typography>
                <Chip 
                  label={payment.status} 
                  color={statusColors[payment.status]} 
                  size="small"
                  sx={{ 
                    minWidth: 80,
                    justifyContent: 'center'
                  }}
                />
              </div>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                width: '100%',
                mt: 2
              }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleGenerateInvoice(payment.id)}
                  disabled={payment.status !== 'Payé' || payment.invoiceGenerated}
                  sx={{ ml: 'auto' }}
                >
                  {payment.invoiceGenerated ? 'Facture générée' : 'Télécharger'}
                </Button>
              </Box>
            </MobilePaymentCard>
          ))}
        </TableContainer>
      ) : (
        <TableContainer component={Paper} sx={{ 
          borderRadius: 2,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Montant</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Méthode</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date/Heure</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Box>
                      <Typography>{payment.client}</Typography>
                      <Typography variant="body2" color="text.secondary">{payment.phone}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{payment.amount}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={payment.status} 
                      color={statusColors[payment.status]} 
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleGenerateInvoice(payment.id)}
                      disabled={payment.status !== 'Payé' || payment.invoiceGenerated}
                    >
                      {payment.invoiceGenerated ? 'Déjà générée' : 'Facture'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Payments;