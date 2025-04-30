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
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  useMediaQuery,
  useTheme,
  Menu,
  styled,
  Chip
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

// Style personnalisé pour le tableau mobile
const MobileTableRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& > div': {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
    flexWrap: 'wrap',
  },
}));

const statusColors = {
  'En attente': 'warning',
  'En cours': 'info',
  'Livré': 'success',
  'Annulé': 'error',
};

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

// Villes du Gabon
const gaboneseCities = [
  'Libreville', 
  'Port-Gentil',
  'Franceville',
  'Oyem',
  'Moanda',
  'Mouila',
  'Lambaréné',
  'Tchibanga'
];

// Générer des dates aléatoires pour 2025
const generateRandomDate = () => {
  const start = new Date(2025, 0, 1);
  const end = new Date(2025, 5, 2);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Générer des données aléatoires
const generateBookings = () => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    client: gaboneseNames[i],
    destination: gaboneseCities[i],
    status: ['En attente', 'En cours', 'Livré', 'Annulé'][Math.floor(Math.random() * 4)],
    date: generateRandomDate(),
    phone: `+241 0${Math.floor(1000000 + Math.random() * 9000000)}`
  }));
};

const Bookings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [bookings] = useState(generateBookings());
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedBookingId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBookingId(null);
  };

  const handleStatusChange = (id, newStatus) => {
    // Implémentation de la mise à jour du statut
    console.log(`Changement de statut pour ${id} à ${newStatus}`);
  };

  const handleAccept = (id) => {
    handleStatusChange(id, 'En cours');
    handleMenuClose();
  };

  const handleReject = (id) => {
    handleStatusChange(id, 'Annulé');
    handleMenuClose();
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
        Réservations 2025
      </Typography>

      {isMobile ? (
        <TableContainer component={Paper} sx={{ 
          borderRadius: 2,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`
        }}>
          {bookings.map((booking) => (
            <MobileTableRow key={booking.id}>
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Client:</Typography>
                <Typography sx={{ textAlign: 'right' }}>
                  {booking.client}
                </Typography>
              </div>
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Téléphone:</Typography>
                <Typography sx={{ textAlign: 'right' }}>{booking.phone}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Destination:</Typography>
                <Typography sx={{ textAlign: 'right' }}>{booking.destination}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Date:</Typography>
                <Typography sx={{ textAlign: 'right' }}>{booking.date}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Statut:</Typography>
                <Chip 
                  label={booking.status} 
                  color={statusColors[booking.status]} 
                  size="small"
                  sx={{ 
                    minWidth: 80,
                    justifyContent: 'center'
                  }}
                />
              </div>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                width: '100%',
                mt: 1
              }}>
                <FormControl fullWidth size="small" sx={{ minWidth: 120, mr: 1 }}>
                  <InputLabel>Modifier</InputLabel>
                  <Select
                    value={booking.status}
                    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                    label="Modifier"
                  >
                    <MenuItem value="En attente">En attente</MenuItem>
                    <MenuItem value="En cours">En cours</MenuItem>
                    <MenuItem value="Livré">Livré</MenuItem>
                    <MenuItem value="Annulé">Annulé</MenuItem>
                  </Select>
                </FormControl>
                <Box>
                  <IconButton
                    aria-label="actions"
                    onClick={(e) => handleMenuOpen(e, booking.id)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Box>
            </MobileTableRow>
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
                <TableCell sx={{ fontWeight: 600 }}>Téléphone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Destination</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.client}</TableCell>
                  <TableCell>{booking.phone}</TableCell>
                  <TableCell>{booking.destination}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={booking.status} 
                      color={statusColors[booking.status]} 
                    />
                  </TableCell>
                  <TableCell>
                    {booking.status === 'En attente' ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleAccept(booking.id)}
                          size="small"
                          startIcon={<CheckIcon />}
                        >
                          Accepter
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleReject(booking.id)}
                          size="small"
                          startIcon={<CloseIcon />}
                        >
                          Refuser
                        </Button>
                      </Box>
                    ) : (
                      <IconButton
                        aria-label="actions"
                        onClick={(e) => handleMenuOpen(e, booking.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleAccept(selectedBookingId)}>
          <CheckIcon sx={{ mr: 1, color: theme.palette.success.main }} /> Accepter
        </MenuItem>
        <MenuItem onClick={() => handleReject(selectedBookingId)}>
          <CloseIcon sx={{ mr: 1, color: theme.palette.error.main }} /> Refuser
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Bookings;