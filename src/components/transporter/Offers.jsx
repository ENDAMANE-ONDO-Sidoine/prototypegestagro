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
  Chip,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  styled
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

// Types de véhicules courants au Gabon
const vehicleTypes = [
  'Pick-up',
  'Camion 10T',
  'Camion 20T',
  'Fourgon',
  'Camion frigorifique',
  'Camion-benne'
];

// Zones géographiques du Gabon
const gaboneseZones = [
  'Libreville - Port-Gentil',
  'Libreville - Franceville',
  'Port-Gentil - Lambaréné',
  'Toute la zone Woleu-Ntem',
  'Province de l\'Ogooué-Maritime',
  'Tout le Gabon'
];

// Style personnalisé pour les offres mobiles
const MobileOfferCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
}));

const Offers = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [offers, setOffers] = useState([]);
  const [formData, setFormData] = useState({
    availability: '',
    vehicleType: '',
    price: '',
    zones: '',
    image: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: URL.createObjectURL(file) });
    }
  };

  const handleAddOffer = () => {
    if (formData.availability && formData.vehicleType && formData.price && formData.zones) {
      const newOffer = {
        ...formData,
        id: Date.now(),
        publishedAt: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
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

  const handleDeleteOffer = (id) => {
    setOffers(offers.filter((offer) => offer.id !== id));
  };

  const handleEditOffer = (id) => {
    const offerToEdit = offers.find((offer) => offer.id === id);
    if (offerToEdit) {
      setFormData(offerToEdit);
      handleDeleteOffer(id);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: isMobile ? 1 : 3 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontSize: isMobile ? '1.5rem' : '2rem',
        fontWeight: 600,
        mb: 2
      }}>
        Mes Offres de Transport
      </Typography>

      {/* Formulaire */}
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {formData.id ? 'Modifier une offre' : 'Publier une nouvelle offre'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Type de véhicule"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                SelectProps={{
                  native: true,
                }}
              >
                <option value=""></option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Zones couvertes"
                name="zones"
                value={formData.zones}
                onChange={handleInputChange}
                SelectProps={{
                  native: true,
                }}
              >
                <option value=""></option>
                {gaboneseZones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Disponibilité"
                name="availability"
                placeholder="Ex: Lundi-Vendredi, 8h-18h"
                value={formData.availability}
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
                InputProps={{
                  endAdornment: 'XAF',
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="upload-image"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="upload-image">
                  <Button variant="outlined" component="span">
                    Ajouter une photo du véhicule
                  </Button>
                </label>
                {formData.image && (
                  <Avatar
                    src={formData.image}
                    variant="rounded"
                    sx={{ width: 56, height: 56 }}
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                onClick={handleAddOffer}
                size="large"
                fullWidth={isMobile}
              >
                {formData.id ? 'Mettre à jour' : 'Publier l\'offre'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Liste des offres */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {offers.length > 0 ? 'Mes offres actives' : 'Aucune offre publiée'}
        </Typography>

        {isMobile ? (
          <Box>
            {offers.map((offer) => (
              <MobileOfferCard key={offer.id} variant="outlined">
                <Box sx={{ display: 'flex', mb: 2 }}>
                  {offer.image && (
                    <Avatar
                      src={offer.image}
                      variant="rounded"
                      sx={{ width: 80, height: 80, mr: 2 }}
                    />
                  )}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {offer.vehicleType}
                    </Typography>
                    <Chip 
                      label={offer.zones} 
                      size="small" 
                      sx={{ mt: 0.5, mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Publié le: {offer.publishedAt}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Disponibilité:</Typography>
                  <Typography variant="body2" fontWeight={600}>{offer.availability}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Tarif:</Typography>
                  <Typography variant="body2" fontWeight={600}>{offer.price} XAF</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton onClick={() => handleEditOffer(offer.id)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteOffer(offer.id)} size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </MobileOfferCard>
            ))}
          </Box>
        ) : (
          <List>
            {offers.map((offer) => (
              <ListItem key={offer.id} sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  {offer.image && (
                    <Avatar
                      src={offer.image}
                      variant="rounded"
                      sx={{ width: 80, height: 80, mr: 3 }}
                    />
                  )}
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mr: 2 }}>
                        {offer.vehicleType}
                      </Typography>
                      <Chip label={offer.zones} size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Typography variant="body2">
                        <Box component="span" fontWeight={600}>Disponibilité:</Box> {offer.availability}
                      </Typography>
                      <Typography variant="body2">
                        <Box component="span" fontWeight={600}>Tarif:</Box> {offer.price} XAF
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Publié le: {offer.publishedAt}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleEditOffer(offer.id)} sx={{ mr: 1 }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteOffer(offer.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default Offers;