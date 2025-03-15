import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

const Offers = () => {
  // État pour gérer les offres
  const [offers, setOffers] = useState([]);

  // État pour gérer les champs du formulaire
  const [formData, setFormData] = useState({
    availability: '',
    vehicleType: '',
    price: '',
    zones: '',
    image: null,
  });

  // Gestion des changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Gestion de l'upload d'image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: URL.createObjectURL(file) });
    }
  };

  // Ajouter une nouvelle offre
  const handleAddOffer = () => {
    if (formData.availability && formData.vehicleType && formData.price && formData.zones) {
      const newOffer = {
        ...formData,
        id: Date.now(),
        publishedAt: new Date().toLocaleString(), // Ajouter la date et l'heure de publication
      };
      setOffers([...offers, newOffer]);
      setFormData({
        availability: '',
        vehicleType: '',
        price: '',
        zones: '',
        image: null,
      });
    }
  };

  // Supprimer une offre
  const handleDeleteOffer = (id) => {
    setOffers(offers.filter((offer) => offer.id !== id));
  };

  // Modifier une offre
  const handleEditOffer = (id) => {
    const offerToEdit = offers.find((offer) => offer.id === id);
    if (offerToEdit) {
      setFormData(offerToEdit);
      handleDeleteOffer(id); // Supprimer l'offre pour la remplacer par la version modifiée
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Titre */}
      <Typography variant="h4" gutterBottom>
        Offres
      </Typography>

      {/* Formulaire pour publier une offre */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Publier une offre
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Disponibilité"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Type de véhicule"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tarif (XAF)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Zones couvertes"
                name="zones"
                value={formData.zones}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="upload-image"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="upload-image">
                <Button variant="contained" component="span">
                  Télécharger une image
                </Button>
              </label>
              {formData.image && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={formData.image}
                    alt="Véhicule"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={handleAddOffer}>
                Publier l'offre
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Liste des offres publiées */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Offres publiées
          </Typography>
          <List>
            {offers.map((offer) => (
              <ListItem key={offer.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                  {offer.image && (
                    <Box sx={{ marginRight: 2 }}>
                      <img
                        src={offer.image}
                        alt="Véhicule"
                        style={{ maxWidth: '100px', height: 'auto' }}
                      />
                    </Box>
                  )}
                  <Box sx={{ flexGrow: 1 }}>
                    <ListItemText
                      primary={`${offer.vehicleType} - ${offer.zones}`}
                      secondary={
                        <>
                          <div>Disponibilité: {offer.availability}</div>
                          <div>Tarif: {offer.price} XAF</div>
                          <div>Publié le: {offer.publishedAt}</div>
                        </>
                      }
                    />
                  </Box>
                </Box>
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleEditOffer(offer.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDeleteOffer(offer.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Offers;