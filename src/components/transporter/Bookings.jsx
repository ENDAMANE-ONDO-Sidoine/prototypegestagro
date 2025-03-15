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
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

const Bookings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Détecter les écrans mobiles

  // État pour gérer les courses
  const [bookings, setBookings] = useState([
    {
      id: 1,
      client: 'Client A',
      destination: 'Libreville',
      status: 'En attente',
    },
    {
      id: 2,
      client: 'Client B',
      destination: 'Port-Gentil',
      status: 'En cours',
    },
    {
      id: 3,
      client: 'Client C',
      destination: 'Franceville',
      status: 'Livré',
    },
    {
      id: 4,
      client: 'Client D',
      destination: 'Oyem',
      status: 'Annulé',
    },
  ]);

  // État pour gérer le menu d'actions sur mobile
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  // Ouvrir le menu d'actions
  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedBookingId(id);
  };

  // Fermer le menu d'actions
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBookingId(null);
  };

  // Mettre à jour le statut d'une course
  const handleStatusChange = (id, newStatus) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === id ? { ...booking, status: newStatus } : booking
      )
    );
  };

  // Accepter une demande de transport
  const handleAccept = (id) => {
    handleStatusChange(id, 'En cours');
    handleMenuClose();
  };

  // Refuser une demande de transport
  const handleReject = (id) => {
    handleStatusChange(id, 'Annulé');
    handleMenuClose();
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Titre */}
      <Typography variant="h4" gutterBottom>
        Réservations
      </Typography>

      {/* Tableau des courses */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.client}</TableCell>
                <TableCell>{booking.destination}</TableCell>
                <TableCell>
                  <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                    <InputLabel id={`status-label-${booking.id}`}>Statut</InputLabel>
                    <Select
                      labelId={`status-label-${booking.id}`}
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      label="Statut"
                    >
                      <MenuItem value="En attente">En attente</MenuItem>
                      <MenuItem value="En cours">En cours</MenuItem>
                      <MenuItem value="Livré">Livré</MenuItem>
                      <MenuItem value="Annulé">Annulé</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  {isMobile ? (
                    <>
                      <IconButton
                        aria-label="actions"
                        onClick={(e) => handleMenuOpen(e, booking.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={selectedBookingId === booking.id}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={() => handleAccept(booking.id)}>
                          <CheckIcon sx={{ mr: 1 }} /> Accepter
                        </MenuItem>
                        <MenuItem onClick={() => handleReject(booking.id)}>
                          <CloseIcon sx={{ mr: 1 }} /> Refuser
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    booking.status === 'En attente' && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          sx={{ mr: 1 }}
                          onClick={() => handleAccept(booking.id)}
                        >
                          Accepter
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleReject(booking.id)}
                        >
                          Refuser
                        </Button>
                      </>
                    )
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Bookings;