import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  Avatar,
  Grid,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Equalizer,
  Info,
  ShowChart,
  LocalOffer,
  CalendarToday,
  PieChart
} from '@mui/icons-material';

const Tendances = () => {
  const theme = useTheme();
  const [activeSection, setActiveSection] = useState('info');
  const [marketData, setMarketData] = useState([]);
  const [priceComparisonData, setPriceComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('1m');
  const [produits, setProduits] = useState([]);

  // Données améliorées pour les produits agricoles
  const fetchProduits = () => {
    const produitsGabonais = [
      {
        id: 1,
        nom: 'Manioc',
        icon: '🌱',
        description: 'Culture de base transformée en farine, tapioca et bâton de manioc',
        prix: '500 XAF/kg',
        tendance: 'stable',
        evolution: '+2%',
        region: 'Estuaire, Woleu-Ntem',
        saison: 'Toute l\'année'
      },
      {
        id: 2,
        nom: 'Banane Plantain',
        icon: '🍌',
        description: 'Base alimentaire, consommée bouillie, frite ou en purée',
        prix: '700 XAF/kg',
        tendance: 'hausse',
        evolution: '+15%',
        region: 'Moyen-Ogooué',
        saison: 'Saison sèche'
      },
      {
        id: 3,
        nom: 'Volaille Locale',
        icon: '🐔',
        description: 'Élevage traditionnel en plein air, très demandé',
        prix: '2500 XAF/kg',
        tendance: 'baisse',
        evolution: '-5%',
        region: 'Toutes régions',
        saison: 'Toute l\'année'
      },
      {
        id: 4,
        nom: 'Porc Local',
        icon: '🐖',
        description: 'Viande populaire pour les occasions spéciales',
        prix: '3000 XAF/kg',
        tendance: 'stable',
        evolution: '0%',
        region: 'Haut-Ogooué',
        saison: 'Saison des pluies'
      },
      {
        id: 5,
        nom: 'Igname',
        icon: '🍠',
        description: 'Tubercule riche en amidon, base de nombreux plats',
        prix: '600 XAF/kg',
        tendance: 'hausse',
        evolution: '+8%',
        region: 'Ngounié',
        saison: 'Saison sèche'
      }
    ];
    setProduits(produitsGabonais);
    
    // Données pour le graphique de comparaison des prix
    setPriceComparisonData([
      { name: 'Manioc', jan: 450, feb: 470, mar: 500, apr: 520 },
      { name: 'Banane', jan: 650, feb: 680, mar: 700, apr: 720 },
      { name: 'Volaille', jan: 2600, feb: 2550, mar: 2500, apr: 2450 },
      { name: 'Porc', jan: 3100, feb: 3050, mar: 3000, apr: 2950 }
    ]);
  };

  // Simulation de données boursières avec useCallback
  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    try {
      // Simuler un appel API avec timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Générer des données aléatoires
      const generateData = (months) => {
        const result = [];
        const now = new Date();
        let basePrice = 150 + Math.random() * 50;
        
        for (let i = months; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          
          const fluctuation = (Math.random() - 0.5) * 20;
          basePrice = Math.max(100, basePrice + fluctuation);
          
          result.push({
            date: date.toISOString().split('T')[0],
            price: Math.round(basePrice * 100) / 100
          });
        }
        return result;
      };
      
      setMarketData(generateData(timeRange === '1m' ? 1 : 
                              timeRange === '3m' ? 3 : 
                              timeRange === '6m' ? 6 : 12));
      
      setError(null);
    } catch (err) {
      setError('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchMarketData();
    fetchProduits();
  }, [fetchMarketData, timeRange]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const getTendanceColor = (tendance) => {
    switch (tendance) {
      case 'hausse': return 'success';
      case 'baisse': return 'error';
      default: return 'info';
    }
  };

  return (
    <Card variant="outlined" sx={{ 
      borderRadius: 4,
      boxShadow: theme.shadows[2],
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 0 }}>
        {/* En-tête avec onglets */}
        <Box sx={{ 
          display: 'flex', 
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Button
            fullWidth
            variant={activeSection === 'info' ? 'contained' : 'text'}
            onClick={() => setActiveSection('info')}
            startIcon={<Info />}
            sx={{
              borderRadius: 0,
              py: 2,
              fontWeight: activeSection === 'info' ? 'bold' : 'normal'
            }}
          >
            Marché Agricole
          </Button>
          <Button
            fullWidth
            variant={activeSection === 'bourse' ? 'contained' : 'text'}
            onClick={() => setActiveSection('bourse')}
            startIcon={<ShowChart />}
            sx={{
              borderRadius: 0,
              py: 2,
              fontWeight: activeSection === 'bourse' ? 'bold' : 'normal'
            }}
          >
            Tendances Boursières
          </Button>
          <Button
            fullWidth
            variant={activeSection === 'comparaison' ? 'contained' : 'text'}
            onClick={() => setActiveSection('comparaison')}
            startIcon={<Equalizer />}
            sx={{
              borderRadius: 0,
              py: 2,
              fontWeight: activeSection === 'comparaison' ? 'bold' : 'normal'
            }}
          >
            Comparaison des Prix
          </Button>
        </Box>

        {/* Section Marché Agricole */}
        <Collapse in={activeSection === 'info'}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 3
            }}>
              <LocalOffer /> Prix des produits agricoles au Gabon
            </Typography>
            
            <Grid container spacing={3}>
              {produits.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card variant="outlined" sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        gap: 2
                      }}>
                        <Avatar sx={{ 
                          bgcolor: theme.palette.grey[200],
                          color: theme.palette.text.primary,
                          fontSize: '1.5rem'
                        }}>
                          {item.icon}
                        </Avatar>
                        <Typography variant="h6">{item.nom}</Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {item.description}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 'auto'
                      }}>
                        <Box>
                          <Typography variant="subtitle2">Prix actuel:</Typography>
                          <Typography variant="h6" color="primary">
                            {item.prix}
                          </Typography>
                        </Box>
                        
                        <Chip
                          label={`${item.evolution} ${item.tendance === 'hausse' ? '↑' : item.tendance === 'baisse' ? '↓' : '→'}`}
                          color={getTendanceColor(item.tendance)}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 2,
                        pt: 1,
                        borderTop: `1px solid ${theme.palette.divider}`
                      }}>
                        <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                          <CalendarToday fontSize="small" /> {item.saison}
                        </Typography>
                        <Typography variant="caption">
                          {item.region}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Collapse>

        {/* Section Bourse */}
        <Collapse in={activeSection === 'bourse'}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 3
            }}>
              <ShowChart /> Indice des matières premières agricoles
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3, maxWidth: 200 }}>
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
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" sx={{ p: 2 }}>
                {error}
              </Typography>
            ) : (
              <>
                <Box sx={{ height: 400, mb: 4 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marketData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: theme.palette.text.secondary }}
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tick={{ fill: theme.palette.text.secondary }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          borderColor: theme.palette.divider,
                          borderRadius: theme.shape.borderRadius
                        }}
                        formatter={(value) => [`$${value}`, 'Prix']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke={theme.palette.primary.main} 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name="Prix ($)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Données historiques
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ 
                        backgroundColor: theme.palette.grey[100]
                      }}>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Prix ($)</TableCell>
                        <TableCell align="right">Variation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {marketData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell align="right">
                            ${row.price.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {index > 0 ? (
                              <Chip
                                size="small"
                                label={`${((row.price - marketData[index-1].price) / marketData[index-1].price * 100).toFixed(2)}%`}
                                color={
                                  row.price > marketData[index-1].price ? 'success' : 
                                  row.price < marketData[index-1].price ? 'error' : 'default'
                                }
                                variant="outlined"
                              />
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        </Collapse>

        {/* Section Comparaison */}
        <Collapse in={activeSection === 'comparaison'}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 3
            }}>
              <PieChart /> Comparaison des prix des produits
            </Typography>
            
            <Box sx={{ height: 400, mb: 4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priceComparisonData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary }} />
                  <YAxis tick={{ fill: theme.palette.text.secondary }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      borderRadius: theme.shape.borderRadius
                    }}
                    formatter={(value) => [`${value} XAF`, 'Prix']}
                  />
                  <Legend />
                  <Bar dataKey="jan" stackId="a" fill="#8884d8" name="Janvier" />
                  <Bar dataKey="feb" stackId="a" fill="#82ca9d" name="Février" />
                  <Bar dataKey="mar" stackId="a" fill="#ffc658" name="Mars" />
                  <Bar dataKey="apr" stackId="a" fill="#ff8042" name="Avril" />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Typography variant="h6" sx={{ mb: 2 }}>
              Analyse des tendances
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <TrendingUp color="success" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Produits en hausse
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Banane Plantain (+15%)" />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Igname (+8%)" />
                    </ListItem>
                  </List>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <TrendingDown color="error" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Produits en baisse
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Volaille (-5%)" />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Porc (-2%)" />
                    </ListItem>
                  </List>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default Tendances;