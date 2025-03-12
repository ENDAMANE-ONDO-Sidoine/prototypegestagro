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
  TextField,
  IconButton,
  Pagination,
  InputAdornment,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';

const CustomerManagement = () => {
  // États pour la liste des clients
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Jean Okouyi',
      email: 'jean.okouyi@example.com',
      phone: '+241 01 23 45 67',
      cni: '1234567890',
      address: 'Quartier Louis, Libreville',
      createdAt: '2023-10-01 10:30',
    },
    {
      id: 2,
      name: 'Marie Mba',
      email: 'marie.mba@example.com',
      phone: '+241 07 89 01 23',
      cni: '0987654321',
      address: 'Quartier Nzeng-Ayong, Libreville',
      createdAt: '2023-10-02 14:45',
    },
  ]);

  // États pour le formulaire d'ajout/mise à jour
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    cni: '',
    address: '',
  });

  // États pour la mise à jour d'un client
  const [editIndex, setEditIndex] = useState(null);

  // États pour les erreurs de validation
  const [errors, setErrors] = useState({});

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Recherche
  const [searchTerm, setSearchTerm] = useState('');

  // Gestion des changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({ ...newCustomer, [name]: value });
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    if (!newCustomer.name) newErrors.name = 'Le nom est obligatoire';
    if (!newCustomer.email) newErrors.email = 'L\'email est obligatoire';
    if (!newCustomer.phone) newErrors.phone = 'Le téléphone est obligatoire';
    if (!newCustomer.cni) newErrors.cni = 'Le numéro de CNI est obligatoire';
    if (!newCustomer.address) newErrors.address = 'L\'adresse est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ajouter ou mettre à jour un client
  const handleAddOrUpdateCustomer = () => {
    if (!validateForm()) return; // Arrêter si le formulaire n'est pas valide

    if (editIndex !== null) {
      // Mettre à jour un client existant
      const updatedCustomers = [...customers];
      updatedCustomers[editIndex] = {
        ...newCustomer,
        id: customers[editIndex].id,
        createdAt: customers[editIndex].createdAt, // Conserver la date d'origine
      };
      setCustomers(updatedCustomers);
      setEditIndex(null);
    } else {
      // Ajouter un nouveau client
      const now = new Date();
      const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString()}`;
      setCustomers([
        ...customers,
        {
          id: customers.length + 1,
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          cni: newCustomer.cni,
          address: newCustomer.address,
          createdAt: formattedDate, // Ajouter la date et l'heure actuelles
        },
      ]);
    }
    setNewCustomer({ name: '', email: '', phone: '', cni: '', address: '' });
  };

  // Supprimer un client
  const handleDeleteCustomer = (index) => {
    const updatedCustomers = customers.filter((_, i) => i !== index);
    setCustomers(updatedCustomers);
  };

  // Éditer un client
  const handleEditCustomer = (index) => {
    setNewCustomer(customers[index]);
    setEditIndex(index);
  };

  // Exportation en Excel
  const handleExportExcel = () => {
    const data = customers.map((customer) => ({
      'ID Client': customer.id,
      Nom: customer.name,
      Email: customer.email,
      Téléphone: customer.phone,
      'Numéro CNI': customer.cni,
      Adresse: customer.address,
      'Date et heure d\'ajout': customer.createdAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
    XLSX.writeFile(workbook, 'clients_gabon.xlsx');
  };

  // Pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Filtrage des clients par recherche
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.cni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCustomers = filteredCustomers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5">Gestion des clients (Contexte Gabonais)</Typography>

        {/* Formulaire pour ajouter ou mettre à jour un client */}
        <Paper sx={{ padding: '20px', marginBottom: '20px', boxShadow: 3, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Nom complet"
                name="name"
                value={newCustomer.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={newCustomer.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Téléphone"
                name="phone"
                value={newCustomer.phone}
                onChange={handleInputChange}
                error={!!errors.phone}
                helperText={errors.phone}
                placeholder="+241 01 23 45 67"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Numéro CNI"
                name="cni"
                value={newCustomer.cni}
                onChange={handleInputChange}
                error={!!errors.cni}
                helperText={errors.cni}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse (Quartier, Ville)"
                name="address"
                value={newCustomer.address}
                onChange={handleInputChange}
                error={!!errors.address}
                helperText={errors.address}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleAddOrUpdateCustomer}>
                {editIndex !== null ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Champ de recherche */}
        <TextField
          fullWidth
          label="Rechercher un client"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Tableau des clients */}
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Client</TableCell>
                <TableCell>Nom complet</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Numéro CNI</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Date et heure d'ajout</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCustomers.map((customer, index) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.cni}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.createdAt}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditCustomer(index)}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteCustomer(index)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          count={Math.ceil(filteredCustomers.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
        />

        {/* Bouton d'exportation sous le tableau */}
        <Button variant="contained" color="success" onClick={handleExportExcel} sx={{ mt: 2 }}>
          Exporter en Excel
        </Button>
      </Grid>
    </Grid>
  );
};

export default CustomerManagement;