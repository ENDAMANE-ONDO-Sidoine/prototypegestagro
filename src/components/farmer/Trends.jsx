import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Collapse,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Tendances = () => {
  const [isInfoVisible, setIsInfoVisible] = useState(true);
  const [marketData, setMarketData] = useState([]); // Données pour le graphique
  const [rawMarketData, setRawMarketData] = useState([]); // Données brutes de l'API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('1m'); // 1m, 3m, 6m, 1y
  const [produits, setProduits] = useState([]); // Produits agricoles et d'élevage

  const toggleSection = (showInfo) => {
    setIsInfoVisible(showInfo);
  };

  // Données simulées pour les produits agricoles et d'élevage
  const fetchProduits = () => {
    const produitsGabonais = [
      {
        id: 1,
        nom: 'Manioc',
        description: 'Le manioc est une culture de base au Gabon, utilisée pour la production de farine et de tapioca.',
        prix: '500 XAF/kg',
        tendance: 'Stable',
      },
      {
        id: 2,
        nom: 'Banane Plantain',
        description: 'La banane plantain est un aliment de base, souvent consommée bouillie ou frite.',
        prix: '700 XAF/kg',
        tendance: 'En hausse',
      },
      {
        id: 3,
        nom: 'Volaille',
        description: 'La volaille locale est très demandée, avec une production en augmentation.',
        prix: '2500 XAF/kg',
        tendance: 'En baisse',
      },
      {
        id: 4,
        nom: 'Porc',
        description: 'Le porc est une viande populaire, avec une production principalement locale.',
        prix: '3000 XAF/kg',
        tendance: 'Stable',
      },
    ];
    setProduits(produitsGabonais);
  };

  // Récupérer les données de l'API Marketstack
  const fetchMarketData = async (range) => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = '4d8ec4a8964876e5076bd9c182a1b142'; // Remplacez par votre clé API
      const symbol = 'AAPL'; // Exemple : Apple (vous pouvez changer pour un indice ou une action pertinente)
      const endpoint = `http://api.marketstack.com/v1/eod?access_key=${apiKey}&symbols=${symbol}&date_from=${getDateRange(range)}`;

      const response = await fetch(endpoint);
      const result = await response.json();

      if (result.data && result.data.length > 0) {
        // Formater les données pour le graphique
        const formattedData = result.data.map((item) => ({
          date: item.date.split('T')[0], // Formater la date
          price: item.close, // Utiliser le prix de clôture
        }));
        setMarketData(formattedData);

        // Stocker les données brutes pour le tableau détaillé
        setRawMarketData(result.data);
      } else {
        setError('Aucune donnée disponible');
      }
    } catch (err) {
      setError('Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  // Calculer la date de début en fonction de la période sélectionnée
  const getDateRange = (range) => {
    const now = new Date();
    switch (range) {
      case '1m':
        now.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        now.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        now.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        now.setFullYear(now.getFullYear() - 1);
        break;
      default:
        now.setMonth(now.getMonth() - 1);
    }
    return now.toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchMarketData(timeRange);
    fetchProduits(); // Charger les produits agricoles et d'élevage
  }, );

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
      {/* Conteneur pour les boutons côte à côte */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
        <Button
          variant={isInfoVisible ? 'contained' : 'outlined'}
          onClick={() => toggleSection(true)}
        >
          Afficher Informations
        </Button>
        <Button
          variant={!isInfoVisible ? 'contained' : 'outlined'}
          onClick={() => toggleSection(false)}
        >
          Afficher Évolution du marché
        </Button>
      </Box>
      
      {/* Section Informations */}
      <Collapse in={isInfoVisible}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Produits agricoles et d'élevage de première consommation
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Découvrez les produits agricoles et d'élevage les plus consommés au Gabon, avec leurs prix et tendances.
          </Typography>

          {/* Liste des produits */}
          <List>
            {produits.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={item.nom}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Prix : {item.prix} | Tendances : {item.tendance}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Collapse>
      
      {/* Section Évolution du marché */}
      <Collapse in={!isInfoVisible}>
        <CardContent>
          <Typography variant="h6">Évolution du marché boursier</Typography>
          <Typography variant="body2" color="text.secondary">
            Suivez les variations des prix sur le marché boursier en temps réel.
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel id="time-range-label">Période</InputLabel>
            <Select
              labelId="time-range-label"
              value={timeRange}
              label="Période"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="1m">1 Mois</MenuItem>
              <MenuItem value="3m">3 Mois</MenuItem>
              <MenuItem value="6m">6 Mois</MenuItem>
              <MenuItem value="1y">1 An</MenuItem>
            </Select>
          </FormControl>

          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              {/* Graphique */}
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>

              {/* Tableau des données détaillées */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Données détaillées
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Ouverture</TableCell>
                      <TableCell>Haut</TableCell>
                      <TableCell>Bas</TableCell>
                      <TableCell>Clôture</TableCell>
                      <TableCell>Volume</TableCell>
                      <TableCell>Dividende</TableCell>
                      <TableCell>Symbole</TableCell>
                      <TableCell>Bourse</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rawMarketData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.date.split('T')[0]}</TableCell>
                        <TableCell>{item.open}</TableCell>
                        <TableCell>{item.high}</TableCell>
                        <TableCell>{item.low}</TableCell>
                        <TableCell>{item.close}</TableCell>
                        <TableCell>{item.volume}</TableCell>
                        <TableCell>{item.dividend}</TableCell>
                        <TableCell>{item.symbol}</TableCell>
                        <TableCell>{item.exchange}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default Tendances;