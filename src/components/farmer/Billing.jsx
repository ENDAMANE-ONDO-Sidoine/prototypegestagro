import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Add, Edit, Delete, Download } from '@mui/icons-material';
import { styled } from '@mui/system';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// Styles personnalisés
const BillingContainer = styled(Box)({
  padding: '24px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
});

// Données mockées pour les clients
const initialClients = [
  { id: 1, name: 'Client A', address: 'Adresse du client A', phone: '123456789', email: 'clientA@example.com', taxId: '123456789' },
  { id: 2, name: 'Client B', address: 'Adresse du client B', phone: '987654321', email: 'clientB@example.com', taxId: '987654321' },
];

// Données mockées pour les factures
const initialInvoices = [
  {
    id: 1,
    invoiceNumber: '2023001',
    issueDate: '01/03/2025',
    dueDate: '31/03/2025',
    reference: '12345',
    client: initialClients[0],
    items: [
      { product: 'Poulet de chair', quantity: 10, unitPrice: '50 000 FCFA', amount: '500 000 FCFA' },
      { product: 'Régime de banane', quantity: 2, unitPrice: '150 000 FCFA', amount: '300 000 FCFA' },
    ],
    totalHT: '800 000 FCFA',
    tva: '144 000 FCFA',
    totalTTC: '944 000 FCFA',
    paymentTerms: 'Airtel Money',
    notes: 'En cas de retard de paiement, des pénalités de retard peuvent être appliquées.',
  },
];

const Billing = () => {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [clients, setClients] = useState(initialClients);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [openClientDialog, setOpenClientDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // États pour le formulaire de client
  const [clientForm, setClientForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
  });

  // États pour le formulaire de facture
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    issueDate: '',
    dueDate: '',
    reference: '',
    client: null,
    items: [],
    totalHT: '',
    tva: '',
    totalTTC: '',
    paymentTerms: '',
    notes: '',
  });

  // États pour un nouveau produit
  const [newProduct, setNewProduct] = useState({
    product: '',
    quantity: 1,
    unitPrice: '',
    amount: '',
  });

  // Pré-remplir le formulaire de client lors de la modification
  useEffect(() => {
    if (selectedClient) {
      setClientForm({
        name: selectedClient.name,
        address: selectedClient.address,
        phone: selectedClient.phone,
        email: selectedClient.email,
        taxId: selectedClient.taxId,
      });
    } else {
      setClientForm({
        name: '',
        address: '',
        phone: '',
        email: '',
        taxId: '',
      });
    }
  }, [selectedClient]);

  // Pré-remplir le formulaire de facture lors de la modification
  useEffect(() => {
    if (selectedInvoice) {
      setInvoiceForm({
        ...selectedInvoice,
      });
    } else {
      setInvoiceForm({
        invoiceNumber: '',
        issueDate: '',
        dueDate: '',
        reference: '',
        client: null,
        items: [],
        totalHT: '',
        tva: '',
        totalTTC: '',
        paymentTerms: '',
        notes: '',
      });
    }
  }, [selectedInvoice]);

  // Fonction pour ajouter un produit à la facture
  const addProduct = () => {
    const amount = newProduct.quantity * parseFloat(newProduct.unitPrice);
    const updatedItems = [...invoiceForm.items, { ...newProduct, amount }];
    const totalHT = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const tva = totalHT * 0.18; // TVA de 18%
    const totalTTC = totalHT + tva;

    setInvoiceForm({
      ...invoiceForm,
      items: updatedItems,
      totalHT,
      tva,
      totalTTC,
    });

    setNewProduct({
      product: '',
      quantity: 1,
      unitPrice: '',
      amount: '',
    });
  };

  // Fonction pour supprimer un produit de la facture
  const removeProduct = (index) => {
    const updatedItems = invoiceForm.items.filter((_, i) => i !== index);
    const totalHT = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const tva = totalHT * 0.18; // TVA de 18%
    const totalTTC = totalHT + tva;

    setInvoiceForm({
      ...invoiceForm,
      items: updatedItems,
      totalHT,
      tva,
      totalTTC,
    });
  };

  // Fonction pour ouvrir le formulaire de création/modification de client
  const handleOpenClientDialog = (client = null) => {
    setSelectedClient(client);
    setOpenClientDialog(true);
    setFormErrors({});
  };

  // Fonction pour fermer le formulaire de client
  const handleCloseClientDialog = () => {
    setOpenClientDialog(false);
    setSelectedClient(null);
  };

  // Fonction pour valider le formulaire de client
  const validateClientForm = (data) => {
    const errors = {};
    if (!data.name) errors.name = 'Ce champ est requis';
    if (!data.address) errors.address = 'Ce champ est requis';
    if (!data.phone) errors.phone = 'Ce champ est requis';
    if (!data.email) errors.email = 'Ce champ est requis';
    return errors;
  };

  // Fonction pour enregistrer un client
  const saveClient = () => {
    const errors = validateClientForm(clientForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (selectedClient) {
      // Modifier un client existant
      setClients(clients.map((cli) => (cli.id === selectedClient.id ? { ...cli, ...clientForm } : cli)));
    } else {
      // Ajouter un nouveau client
      setClients([...clients, { ...clientForm, id: clients.length + 1 }]);
    }
    handleCloseClientDialog();
  };

  // Fonction pour supprimer un client
  const handleDeleteClient = (id) => {
    setClients(clients.filter((client) => client.id !== id));
  };

  // Fonction pour ouvrir le formulaire de création/modification de facture
  const handleOpenInvoiceDialog = (invoice = null) => {
    setSelectedInvoice(invoice);
    setOpenInvoiceDialog(true);
    setFormErrors({});
  };

  // Fonction pour fermer le formulaire de facture
  const handleCloseInvoiceDialog = () => {
    setOpenInvoiceDialog(false);
    setSelectedInvoice(null);
  };

  // Fonction pour valider le formulaire de facture
  const validateInvoiceForm = (data) => {
    const errors = {};
    if (!data.invoiceNumber) errors.invoiceNumber = 'Ce champ est requis';
    if (!data.issueDate) errors.issueDate = 'Ce champ est requis';
    if (!data.client) errors.client = 'Ce champ est requis';
    if (data.items.length === 0) errors.items = 'Ajoutez au moins un produit';
    return errors;
  };

  // Fonction pour enregistrer une facture
  const saveInvoice = () => {
    const errors = validateInvoiceForm(invoiceForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (selectedInvoice) {
      // Modifier une facture existante
      setInvoices(invoices.map((inv) => (inv.id === selectedInvoice.id ? invoiceForm : inv)));
    } else {
      // Ajouter une nouvelle facture
      setInvoices([...invoices, { ...invoiceForm, id: invoices.length + 1 }]);
    }
    handleCloseInvoiceDialog();
  };

  // Fonction pour supprimer une facture
  const handleDeleteInvoice = (id) => {
    setInvoices(invoices.filter((invoice) => invoice.id !== id));
  };

  // Fonction pour exporter une facture au format texte
  const exportInvoiceAsText = (invoice) => {
    const invoiceText = `
---------------------------------------------
Nom de l'entreprise (ou Raison sociale)
Adresse complète
Numéro de téléphone
Adresse e-mail
Numéro de contribuable (TIN)
Numéro de registre de commerce (RCCM)
Numéro de TVA (le cas échéant)

Facture n° : ${invoice.invoiceNumber}
Date d'émission : ${invoice.issueDate}
Date d'échéance : ${invoice.dueDate}
Référence de commande : ${invoice.reference}

Client :
${invoice.client.name}
${invoice.client.address}
${invoice.client.phone}
${invoice.client.email}
${invoice.client.taxId ? `Numéro de contribuable : ${invoice.client.taxId}` : ''}

Description des produits agricoles 
-------------------------------------------------
| Produit/Service     | Qté | Prix unitaire HT | Montant HT |
|---------------------|-----|------------------|------------|
${invoice.items.map((item) => `| ${item.product} | ${item.quantity} | ${item.unitPrice} | ${item.amount} |`).join('\n')}
-------------------------------------------------
Montant total HT : ${invoice.totalHT}
TVA (18%) : ${invoice.tva}
Montant total TTC : ${invoice.totalTTC}

Modalités de paiement : 
- ${invoice.paymentTerms}

${invoice.notes}

Merci pour votre confiance.
---------------------------------------------
    `;

    const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `Facture_${invoice.invoiceNumber}.txt`);
  };

  // Fonction pour exporter une facture au format PDF
  const exportInvoiceAsPDF = (invoice) => {
    const doc = new jsPDF();
    doc.text(`Facture n° : ${invoice.invoiceNumber}`, 10, 10);
    doc.text(`Date d'émission : ${invoice.issueDate}`, 10, 20);
    doc.text(`Client : ${invoice.client.name}`, 10, 30);
    doc.text(`Montant total TTC : ${invoice.totalTTC}`, 10, 40);
    doc.save(`Facture_${invoice.invoiceNumber}.pdf`);
  };

  // Données mockées pour les graphiques
  const revenueData = [
    { month: 'Jan', revenue: 50000 },
    { month: 'Fév', revenue: 75000 },
    { month: 'Mar', revenue: 30000 },
  ];

  const invoiceStatusData = [
    { name: 'Payées', value: 2 },
    { name: 'En attente', value: 1 },
  ];

  const colors = ['#00C49F', '#FF8042'];

  return (
    <BillingContainer>
      <Typography variant="h4" gutterBottom>
        Gestion des factures
      </Typography>

      {/* Graphiques statistiques */}
      <Grid container spacing={3} sx={{ marginBottom: '24px' }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: '16px' }}>
            <Typography variant="h6" gutterBottom>
              Revenus mensuels
            </Typography>
            <BarChart width={500} height={300} data={revenueData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: '16px' }}>
            <Typography variant="h6" gutterBottom>
              Statut des factures
            </Typography>
            <PieChart width={400} height={300}>
              <Pie
                data={invoiceStatusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {invoiceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Paper>
        </Grid>
      </Grid>

      {/* Gestion des clients */}
      <Box sx={{ marginBottom: '24px' }}>
        <Typography variant="h6" gutterBottom>
          Clients
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenClientDialog()}
        >
          Ajouter un client
        </Button>
        <TableContainer component={Paper} sx={{ marginTop: '16px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.address}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenClientDialog(client)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClient(client.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Formulaire de client */}
      <Dialog open={openClientDialog} onClose={handleCloseClientDialog}>
        <DialogTitle>
          {selectedClient ? 'Modifier le client' : 'Ajouter un client'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginTop: '8px' }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="name"
                label="Nom"
                variant="outlined"
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                label="Adresse"
                variant="outlined"
                value={clientForm.address}
                onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                error={!!formErrors.address}
                helperText={formErrors.address}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="phone"
                label="Téléphone"
                variant="outlined"
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="email"
                label="Email"
                variant="outlined"
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="taxId"
                label="Numéro de contribuable"
                variant="outlined"
                value={clientForm.taxId}
                onChange={(e) => setClientForm({ ...clientForm, taxId: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClientDialog}>Annuler</Button>
          <Button variant="contained" color="primary" onClick={saveClient}>
            {selectedClient ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Gestion des factures */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Factures
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenInvoiceDialog()}
        >
          Créer une facture
        </Button>
        <TableContainer component={Paper} sx={{ marginTop: '16px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Numéro</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date d'émission</TableCell>
                <TableCell>Montant TTC</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.client.name}</TableCell>
                  <TableCell>{invoice.issueDate}</TableCell>
                  <TableCell>{invoice.totalTTC}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenInvoiceDialog(invoice)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteInvoice(invoice.id)}>
                      <Delete />
                    </IconButton>
                    <IconButton onClick={() => exportInvoiceAsText(invoice)}>
                      <Download />
                    </IconButton>
                    <IconButton onClick={() => exportInvoiceAsPDF(invoice)}>
                      <Download />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Formulaire de facture */}
      <Dialog open={openInvoiceDialog} onClose={handleCloseInvoiceDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedInvoice ? 'Modifier la facture' : 'Créer une facture'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginTop: '8px' }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Numéro de facture"
                variant="outlined"
                value={invoiceForm.invoiceNumber}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                error={!!formErrors.invoiceNumber}
                helperText={formErrors.invoiceNumber}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date d'émission"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={invoiceForm.issueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                error={!!formErrors.issueDate}
                helperText={formErrors.issueDate}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date d'échéance"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Référence de commande"
                variant="outlined"
                value={invoiceForm.reference}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, reference: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.client}>
                <InputLabel>Client</InputLabel>
                <Select
                  label="Client"
                  value={invoiceForm.client ? invoiceForm.client.id : ''}
                  onChange={(e) => {
                    const selectedClient = clients.find((cli) => cli.id === e.target.value);
                    setInvoiceForm({ ...invoiceForm, client: selectedClient });
                  }}
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.client && <Typography color="error">{formErrors.client}</Typography>}
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
                    value={newProduct.unitPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, unitPrice: e.target.value })}
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
                    {invoiceForm.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unitPrice}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => removeProduct(index)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            {/* Montants totaux */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Montants
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Total HT"
                    variant="outlined"
                    value={invoiceForm.totalHT}
                    disabled
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="TVA (18%)"
                    variant="outlined"
                    value={invoiceForm.tva}
                    disabled
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Total TTC"
                    variant="outlined"
                    value={invoiceForm.totalTTC}
                    disabled
                  />
                </Grid>
              </Grid>
            </Grid>
            {/* Mode de paiement */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Mode de paiement</InputLabel>
                <Select
                  label="Mode de paiement"
                  value={invoiceForm.paymentTerms}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentTerms: e.target.value })}
                >
                  <MenuItem value="Espèce">Espèce</MenuItem>
                  <MenuItem value="Airtel Money">Airtel Money</MenuItem>
                  <MenuItem value="Moov Money">Moov Money</MenuItem>
                  <MenuItem value="Virement bancaire">Virement bancaire</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                variant="outlined"
                multiline
                rows={3}
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInvoiceDialog}>Annuler</Button>
          <Button variant="contained" color="primary" onClick={saveInvoice}>
            {selectedInvoice ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </BillingContainer>
  );
};

export default Billing;