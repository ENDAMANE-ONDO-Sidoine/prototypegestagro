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
  Chip,
  Divider
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Download,
  AttachMoney,
  Person,
  Inventory,
  Paid,
  Receipt
} from '@mui/icons-material';
import { styled } from '@mui/system';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Styles personnalisés
const InvoiceContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#f9f9f9',
  borderRadius: '12px',
}));

const StatusBadge = styled(Chip)(({ status }) => ({
  backgroundColor: status === 'payée' ? '#4caf50' : '#ff9800',
  color: 'white',
  fontWeight: 'bold',
}));

// Données initiales adaptées au contexte gabonais
const initialClients = [
  { 
    id: 1, 
    name: 'Marché Mont-Bouët', 
    address: 'Libreville, Mont-Bouët', 
    phone: '061234567', 
    email: '', 
    taxId: '', 
    type: 'marché'
  },
  { 
    id: 2, 
    name: 'Restaurant Chez Wou', 
    address: 'Port-Gentil, Rue du Commerce', 
    phone: '062345678', 
    email: 'contact@chezwou.ga', 
    taxId: 'A12345678', 
    type: 'restaurant'
  },
];

const initialProducts = [
  { id: 1, name: 'Banane plantain', unit: 'régime', price: 15000 },
  { id: 2, name: 'Poulet local', unit: 'kg', price: 2500 },
  { id: 3, name: 'Igname', unit: 'kg', price: 800 },
  { id: 4, name: 'Piment', unit: 'kg', price: 3000 },
];

const initialInvoices = [
  {
    id: 1,
    invoiceNumber: 'FAC-2025-001',
    issueDate: '2025-05-10',
    dueDate: '2025-05-30',
    client: initialClients[0],
    items: [
      { product: initialProducts[0], quantity: 5, price: 15000 },
      { product: initialProducts[1], quantity: 10, price: 2500 },
    ],
    paymentStatus: 'impayée',
    paymentMethod: 'Espèce',
    notes: 'Livraison tous les lundis',
    tvaRate: 18,
  },
];

const Billing = () => {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [clients, setClients] = useState(initialClients);
  const [products] = useState(initialProducts);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [openClientDialog, setOpenClientDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // États pour les formulaires
  const [clientForm, setClientForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    type: 'marché'
  });

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: `FAC-2025-${String(invoices.length + 1).padStart(3, '0')}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client: null,
    items: [],
    paymentStatus: 'impayée',
    paymentMethod: 'Espèce',
    notes: '',
    tvaRate: 18,
  });

  const [newItem, setNewItem] = useState({
    product: null,
    quantity: 1,
    price: 0,
  });

  // Calcul des totaux
  const calculateTotals = (items, tvaRate) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tva = subtotal * (tvaRate / 100);
    const total = subtotal + tva;
    
    return { subtotal, tva, total };
  };

  // Gestion des clients
  const handleClientSubmit = () => {
    const errors = {};
    if (!clientForm.name) errors.name = 'Nom requis';
    if (!clientForm.phone) errors.phone = 'Téléphone requis';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (selectedInvoice) {
      setClients(clients.map(c => c.id === selectedInvoice.id ? clientForm : c));
    } else {
      const newClient = { ...clientForm, id: clients.length + 1 };
      setClients([...clients, newClient]);
    }
    setOpenClientDialog(false);
  };

  // Gestion des factures
  const handleInvoiceSubmit = () => {
    const errors = {};
    if (!invoiceForm.client) errors.client = 'Client requis';
    if (invoiceForm.items.length === 0) errors.items = 'Ajoutez des produits';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const totals = calculateTotals(invoiceForm.items, invoiceForm.tvaRate);
    const completeInvoice = { ...invoiceForm, ...totals };

    if (selectedInvoice) {
      setInvoices(invoices.map(i => i.id === selectedInvoice.id ? completeInvoice : i));
    } else {
      const newInvoice = { ...completeInvoice, id: invoices.length + 1 };
      setInvoices([...invoices, newInvoice]);
    }
    setOpenInvoiceDialog(false);
  };

  // Ajout d'un produit à la facture
  const addItem = () => {
    if (!newItem.product) {
      return;
    }

    const item = {
      product: newItem.product,
      quantity: newItem.quantity,
      price: newItem.product.price
    };

    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, item]
    });

    setNewItem({ product: null, quantity: 1, price: 0 });
  };

  // Export PDF amélioré
  const exportToPDF = (invoice) => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(18);
    doc.text('FACTURE', 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.text(`N°: ${invoice.invoiceNumber}`, 105, 30, null, null, 'center');
    
    // Info client
    doc.text(`Client: ${invoice.client.name}`, 20, 45);
    doc.text(`Adresse: ${invoice.client.address}`, 20, 55);
    doc.text(`Tél: ${invoice.client.phone}`, 20, 65);
    
    // Dates
    doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 150, 45);
    doc.text(`Échéance: ${new Date(invoice.dueDate).toLocaleDateString()}`, 150, 55);
    
    // Tableau des produits
    doc.autoTable({
      startY: 80,
      head: [['Produit', 'Qté', 'Prix unitaire', 'Montant']],
      body: invoice.items.map(item => [
        item.product.name,
        item.quantity,
        `${item.price.toLocaleString()} FCFA`,
        `${(item.quantity * item.price).toLocaleString()} FCFA`
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: '#2e7d32' }
    });
    
    // Totaux
    const finalY = doc.lastAutoTable.finalY || 100;
    doc.text(`Sous-total: ${invoice.subtotal.toLocaleString()} FCFA`, 140, finalY + 10);
    doc.text(`TVA (${invoice.tvaRate}%): ${invoice.tva.toLocaleString()} FCFA`, 140, finalY + 20);
    doc.text(`Total: ${invoice.total.toLocaleString()} FCFA`, 140, finalY + 30);
    doc.setFont('helvetica', 'bold');
    doc.text(`Mode de paiement: ${invoice.paymentMethod}`, 20, finalY + 30);
    
    // Notes
    if (invoice.notes) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Notes: ${invoice.notes}`, 20, finalY + 45, { maxWidth: 170 });
    }
    
    doc.save(`Facture_${invoice.invoiceNumber}.pdf`);
  };

  return (
    <InvoiceContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: '#2e7d32' }}>
          <AttachMoney sx={{ verticalAlign: 'middle', mr: 1 }} />
          FACTURATION AGRICOLE
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<Add />}
          onClick={() => {
            setSelectedInvoice(null);
            setInvoiceForm({
              ...invoiceForm,
              invoiceNumber: `FAC-2025-${String(invoices.length + 1).padStart(3, '0')}`,
              issueDate: new Date().toISOString().split('T')[0],
              items: [],
            });
            setOpenInvoiceDialog(true);
          }}
        >
          Nouvelle Facture
        </Button>
      </Box>

      {/* Statistiques rapides */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Factures ce mois
            </Typography>
            <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              {invoices.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Clients actifs
            </Typography>
            <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              {clients.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Chiffre d'affaires
            </Typography>
            <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              {invoices.reduce((sum, inv) => sum + (inv.total || 0), 0).toLocaleString()} FCFA
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Liste des factures récentes */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            <Receipt sx={{ verticalAlign: 'middle', mr: 1 }} />
            Dernières factures
          </Typography>
          <Button 
            size="small" 
            startIcon={<Person />}
            onClick={() => setOpenClientDialog(true)}
          >
            Gérer Clients
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>N° Facture</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.slice(0, 5).map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.client.name}</TableCell>
                  <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{(invoice.total || 0).toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    <StatusBadge 
                      label={invoice.paymentStatus} 
                      status={invoice.paymentStatus} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => {
                      setSelectedInvoice(invoice);
                      setInvoiceForm(invoice);
                      setOpenInvoiceDialog(true);
                    }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => exportToPDF(invoice)}>
                      <Download fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog Client */}
      <Dialog open={openClientDialog} onClose={() => setOpenClientDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
          {selectedInvoice ? 'Modifier Client' : 'Nouveau Client'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom du client"
                value={clientForm.name}
                onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={clientForm.phone}
                onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={clientForm.email}
                onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                value={clientForm.address}
                onChange={(e) => setClientForm({...clientForm, address: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="N° Contribuable"
                value={clientForm.taxId}
                onChange={(e) => setClientForm({...clientForm, taxId: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type de client</InputLabel>
                <Select
                  value={clientForm.type}
                  onChange={(e) => setClientForm({...clientForm, type: e.target.value})}
                  label="Type de client"
                >
                  <MenuItem value="marché">Marché</MenuItem>
                  <MenuItem value="restaurant">Restaurant</MenuItem>
                  <MenuItem value="particulier">Particulier</MenuItem>
                  <MenuItem value="autre">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClientDialog(false)}>Annuler</Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={handleClientSubmit}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Facture */}
      <Dialog 
        open={openInvoiceDialog} 
        onClose={() => setOpenInvoiceDialog(false)} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Receipt sx={{ verticalAlign: 'middle', mr: 1 }} />
          {selectedInvoice ? 'Modifier Facture' : 'Nouvelle Facture'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="N° Facture"
                value={invoiceForm.invoiceNumber}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.client}>
                <InputLabel>Client</InputLabel>
                <Select
                  label="Client"
                  value={invoiceForm.client?.id || ''}
                  onChange={(e) => {
                    const client = clients.find(c => c.id === e.target.value);
                    setInvoiceForm({...invoiceForm, client});
                  }}
                >
                  {clients.map(client => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name} - {client.type}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.client && (
                  <Typography variant="caption" color="error">
                    {formErrors.client}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date facture"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={invoiceForm.issueDate}
                onChange={(e) => setInvoiceForm({...invoiceForm, issueDate: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date échéance"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Produits" icon={<Inventory />} />
              </Divider>
            </Grid>

            <Grid item xs={12} sm={5}>
              <FormControl fullWidth>
                <InputLabel>Produit</InputLabel>
                <Select
                  label="Produit"
                  value={newItem.product?.id || ''}
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value);
                    setNewItem({...newItem, product, price: product?.price || 0});
                  }}
                >
                  {products.map(product => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} - {product.price.toLocaleString()} FCFA/{product.unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Qté"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: Math.max(1, e.target.value)})}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Prix unitaire"
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({...newItem, price: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={addItem}
                sx={{ height: '56px' }}
              >
                Ajouter
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Produit</TableCell>
                      <TableCell align="right">Qté</TableCell>
                      <TableCell align="right">Prix unitaire</TableCell>
                      <TableCell align="right">Montant</TableCell>
                      <TableCell width={40}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoiceForm.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{item.price.toLocaleString()} FCFA</TableCell>
                        <TableCell align="right">{(item.quantity * item.price).toLocaleString()} FCFA</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => {
                            const newItems = [...invoiceForm.items];
                            newItems.splice(index, 1);
                            setInvoiceForm({...invoiceForm, items: newItems});
                          }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {invoiceForm.items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          Aucun produit ajouté
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {formErrors.items && (
                <Typography variant="caption" color="error">
                  {formErrors.items}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Totaux" icon={<Paid />} />
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Mode de paiement</InputLabel>
                <Select
                  label="Mode de paiement"
                  value={invoiceForm.paymentMethod}
                  onChange={(e) => setInvoiceForm({...invoiceForm, paymentMethod: e.target.value})}
                >
                  <MenuItem value="Espèce">Espèce</MenuItem>
                  <MenuItem value="Airtel Money">Airtel Money</MenuItem>
                  <MenuItem value="Moov Money">Moov Money</MenuItem>
                  <MenuItem value="Virement">Virement bancaire</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  label="Statut"
                  value={invoiceForm.paymentStatus}
                  onChange={(e) => setInvoiceForm({...invoiceForm, paymentStatus: e.target.value})}
                >
                  <MenuItem value="payée">Payée</MenuItem>
                  <MenuItem value="impayée">Impayée</MenuItem>
                  <MenuItem value="partielle">Paiement partiel</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Sous-total"
                value={calculateTotals(invoiceForm.items, invoiceForm.tvaRate).subtotal.toLocaleString() + ' FCFA'}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={`TVA (${invoiceForm.tvaRate}%)`}
                value={calculateTotals(invoiceForm.items, invoiceForm.tvaRate).tva.toLocaleString() + ' FCFA'}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Total TTC"
                value={calculateTotals(invoiceForm.items, invoiceForm.tvaRate).total.toLocaleString() + ' FCFA'}
                disabled
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInvoiceDialog(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleInvoiceSubmit}
          >
            {selectedInvoice ? 'Modifier' : 'Créer'} Facture
          </Button>
        </DialogActions>
      </Dialog>
    </InvoiceContainer>
  );
};

export default Billing;