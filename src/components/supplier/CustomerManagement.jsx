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
  TextField,
  IconButton,
  Pagination,
  InputAdornment,
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
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CustomerManagement = () => {
  // États pour la liste des clients
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const rowsPerPage = 5;

  // États pour le formulaire
  const initialCustomerState = {
    name: '',
    email: '',
    phone: '+241 ',
    cni: '',
    address: '',
    status: 'active'
  };

  const [newCustomer, setNewCustomer] = useState(initialCustomerState);
  const [errors, setErrors] = useState({});

  // Simuler le chargement des données
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockCustomers = [
        {
          id: 1,
          name: 'Jean Okouyi',
          email: 'jeanokouyi@gmail.com',
          phone: '+241 01 23 45 67',
          cni: '1234567890',
          address: 'Quartier Louis, Libreville',
          createdAt: format(new Date('2023-10-01'), 'PPpp', { locale: fr }),
          status: 'active'
        },
        {
          id: 2,
          name: 'Marie Mba',
          email: 'mariemba@gmail.com',
          phone: '+241 07 89 01 23',
          cni: '0987654321',
          address: 'Quartier Nzeng-Ayong, Libreville',
          createdAt: format(new Date('2023-10-02'), 'PPpp', { locale: fr }),
          status: 'inactive'
        }
      ];
      setCustomers(mockCustomers);
      setLoading(false);
    }, 1500);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({ ...newCustomer, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newCustomer.name.trim()) newErrors.name = 'Nom obligatoire';
    if (!/^\S+@\S+\.\S+$/.test(newCustomer.email)) newErrors.email = 'Email invalide';
    if (!/^\+241 \d{2} \d{2} \d{2} \d{2}$/.test(newCustomer.phone)) newErrors.phone = 'Format: +241 XX XX XX XX';
    if (!/^\d{10}$/.test(newCustomer.cni)) newErrors.cni = 'CNI invalide (10 chiffres)';
    if (!newCustomer.address.trim()) newErrors.address = 'Adresse obligatoire';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddOrUpdateCustomer = () => {
    if (!validateForm()) return;

    setLoading(true);
    setTimeout(() => {
      if (editIndex !== null) {
        // Mise à jour
        const updatedCustomers = [...customers];
        updatedCustomers[editIndex] = {
          ...newCustomer,
          id: customers[editIndex].id,
          createdAt: customers[editIndex].createdAt
        };
        setCustomers(updatedCustomers);
        setSnackbar({ open: true, message: 'Client mis à jour', severity: 'success' });
      } else {
        // Nouveau client
        const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
        setCustomers([
          ...customers,
          {
            ...newCustomer,
            id: newId,
            createdAt: format(new Date(), 'PPpp', { locale: fr })
          }
        ]);
        setSnackbar({ open: true, message: 'Client ajouté', severity: 'success' });
      }
      
      setNewCustomer(initialCustomerState);
      setEditIndex(null);
      setLoading(false);
    }, 1000);
  };

  const handleDeleteCustomer = () => {
    setLoading(true);
    setTimeout(() => {
      const updatedCustomers = customers.filter((_, i) => i !== deleteIndex);
      setCustomers(updatedCustomers);
      setOpenDialog(false);
      setSnackbar({ open: true, message: 'Client supprimé', severity: 'success' });
      setLoading(false);
    }, 800);
  };

  const handleEditCustomer = (index) => {
    setNewCustomer(customers[index]);
    setEditIndex(index);
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredCustomers.map(customer => ({
        ID: customer.id,
        Nom: customer.name,
        Email: customer.email,
        Téléphone: customer.phone,
        'Numéro CNI': customer.cni,
        Adresse: customer.address,
        Statut: customer.status === 'active' ? 'Actif' : 'Inactif',
        'Date création': customer.createdAt
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
    XLSX.writeFile(workbook, `clients_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Liste des Clients', 14, 16);
    doc.autoTable({
      head: [['ID', 'Nom', 'Email', 'Téléphone', 'Statut']],
      body: filteredCustomers.map(customer => [
        customer.id,
        customer.name,
        customer.email,
        customer.phone,
        customer.status === 'active' ? 'Actif' : 'Inactif'
      ]),
      startY: 20,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [25, 118, 210] }
    });
    doc.save(`clients_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Liste des Clients</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            h1 { color: #1976d2; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1976d2; color: white; }
            .status-active { color: green; }
            .status-inactive { color: red; }
          </style>
        </head>
        <body>
          <h1>Liste des Clients</h1>
          <p>Généré le ${format(new Date(), 'PPpp', { locale: fr })}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>CNI</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${filteredCustomers.map(customer => `
                <tr>
                  <td>${customer.id}</td>
                  <td>${customer.name}</td>
                  <td>${customer.email}</td>
                  <td>${customer.phone}</td>
                  <td>${customer.cni}</td>
                  <td class="status-${customer.status}">
                    ${customer.status === 'active' ? 'Actif' : 'Inactif'}
                  </td>
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

  const filteredCustomers = customers.filter(customer =>
    Object.values(customer).some(
      value => value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedCustomers = filteredCustomers.slice(
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
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer ce client ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleDeleteCustomer} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Gestion des Clients
        </Typography>

        {/* Formulaire */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            {editIndex !== null ? (
              <>
                <EditIcon color="primary" sx={{ mr: 1 }} />
                Modifier un client
              </>
            ) : (
              <>
                <AddIcon color="primary" sx={{ mr: 1 }} />
                Ajouter un nouveau client
              </>
            )}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nom complet *"
                name="name"
                value={newCustomer.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name || " "}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Email *"
                name="email"
                type="email"
                value={newCustomer.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email || " "}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Téléphone *"
                name="phone"
                value={newCustomer.phone}
                onChange={handleInputChange}
                error={!!errors.phone}
                helperText={errors.phone || "Format: +241 XX XX XX XX"}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Numéro CNI *"
                name="cni"
                value={newCustomer.cni}
                onChange={handleInputChange}
                error={!!errors.cni}
                helperText={errors.cni || "10 chiffres"}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Adresse *"
                name="address"
                value={newCustomer.address}
                onChange={handleInputChange}
                error={!!errors.address}
                helperText={errors.address || "Quartier, Ville"}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut *</InputLabel>
                <Select
                  name="status"
                  value={newCustomer.status}
                  onChange={handleInputChange}
                  label="Statut *"
                >
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {editIndex !== null && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setNewCustomer(initialCustomerState);
                    setEditIndex(null);
                  }}
                  startIcon={<CloseIcon />}
                >
                  Annuler
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddOrUpdateCustomer}
                startIcon={editIndex !== null ? <SaveIcon /> : <AddIcon />}
                disabled={loading}
              >
                {editIndex !== null ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Recherche et actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
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

        {/* Tableau */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>CNI</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Création</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer, index) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>{customer.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Typography fontWeight="medium">{customer.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography>{customer.email}</Typography>
                      <Typography color="text.secondary">{customer.phone}</Typography>
                    </TableCell>
                    <TableCell>{customer.cni}</TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography noWrap>{customer.address}</Typography>
                    </TableCell>
                    <TableCell>{customer.createdAt}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.status === 'active' ? 'Actif' : 'Inactif'}
                        color={customer.status === 'active' ? 'success' : 'error'}
                        size="small"
                        icon={customer.status === 'active' ? <CheckCircleIcon /> : <CancelIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Modifier">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditCustomer((page - 1) * rowsPerPage + index)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          color="error"
                          onClick={() => {
                            setDeleteIndex((page - 1) * rowsPerPage + index);
                            setOpenDialog(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Aucun client trouvé
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {filteredCustomers.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(filteredCustomers.length / rowsPerPage)}
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

export default CustomerManagement;