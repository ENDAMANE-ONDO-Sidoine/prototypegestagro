import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Alert,
  Button,
  Badge,
  useMediaQuery,
  useTheme,
  Chip,
  Stack
} from "@mui/material";
import { Tooltip as MuiTooltip } from "@mui/material";
import {
  FaCloudSun,
  FaCloudRain,
  FaSnowflake,
  FaSun,
  FaCloud,
  FaSmog,
  FaTint,
  FaWind,
  FaTemperatureLow,
  FaTemperatureHigh,
  FaSeedling,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaLeaf,
  FaTintSlash
} from "react-icons/fa";
import { WiRaindrop, WiBarometer, WiSunrise, WiSunset, WiDaySunny, WiStrongWind } from "react-icons/wi";
import { Search as SearchIcon, Notifications, Refresh, Opacity } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Legend } from 'chart.js';
import { Tooltip as ChartTooltip } from 'chart.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetrainUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const API_KEY = "d3ba353d488a9e43b6718f79b82e070a";

const MeteoAgricole = () => {
  const [city, setCity] = useState("Franceville");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [uvIndex, setUvIndex] = useState(null);
  const [evapotranspiration, setEvapotranspiration] = useState(null);
  const [soilMoisture, setSoilMoisture] = useState(null);
  const [growthDegreeDays, setGrowthDegreeDays] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const checkWeatherAlerts = useCallback((currentWeather, forecastData) => {
    const newNotifications = [];
    
    if (currentWeather.main.temp < 5) {
      newNotifications.push("⚠️ Alerte gel! Température inférieure à 5°C");
    }
    
    if (currentWeather.rain && currentWeather.rain["1h"] > 10) {
      newNotifications.push("⚠️ Fortes précipitations! Risque d'inondation");
    }
    
    if (currentWeather.main.humidity < 30) {
      newNotifications.push("⚠️ Humidité très basse! Risque de sécheresse");
    }
    
    const next24h = forecastData.list.slice(0, 8);
    const willRain = next24h.some(item => item.weather[0].main === "Rain");
    const willFreeze = next24h.some(item => item.main.temp < 2);
    
    if (willRain) {
      newNotifications.push("☔ Pluie prévue dans les prochaines 24h");
    }
    
    if (willFreeze) {
      newNotifications.push("❄️ Gel prévu dans les prochaines 24h");
    }
    
    setNotifications(newNotifications);
  }, []);

  const fetchWeather = useCallback(async (cityName) => {
    try {
      setLoading(true);
      setError(null);

      const geocodeResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`
      );
      
      if (geocodeResponse.data.length === 0) throw new Error("Ville introuvable");

      const { lat, lon, name } = geocodeResponse.data[0];
      setLatitude(lat);
      setLongitude(lon);
      setCity(name);

      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
        ),
        axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
        )
      ]);

      setWeather(weatherResponse.data);
      setForecast(forecastResponse.data);
      setLastUpdate(new Date());
      checkWeatherAlerts(weatherResponse.data, forecastResponse.data);

      // Simulated agricultural data
      setUvIndex(Math.floor(Math.random() * 10) + 1);
      setEvapotranspiration((Math.random() * 5 + 2).toFixed(1));
      setSoilMoisture(Math.floor(Math.random() * 50) + 50);
      setGrowthDegreeDays(Math.floor(Math.random() * 1000) + 500);
      
    } catch (err) {
      setError(`❌ Erreur: ${err.message || "Impossible de récupérer les données météo"}`);
    } finally {
      setLoading(false);
    }
  }, [checkWeatherAlerts]);

  useEffect(() => {
    fetchWeather("Franceville");
  }, [fetchWeather]);

  const getWeatherIcon = (description, size = 30) => {
    const desc = description.toLowerCase();
    if (desc.includes("nuage")) return <FaCloud size={size} color="#555" />;
    if (desc.includes("pluie")) return <FaCloudRain size={size} color="#1e90ff" />;
    if (desc.includes("neige")) return <FaSnowflake size={size} color="#00bfff" />;
    if (desc.includes("brume")) return <FaSmog size={size} color="#888" />;
    if (desc.includes("soleil") || desc.includes("clair")) return <FaSun size={size} color="#fdb813" />;
    return <FaCloudSun size={size} color="#f4a460" />;
  };

  const groupForecastByDay = () => {
    if (!forecast) return [];
    
    const grouped = {};
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long' });
      
      if (!grouped[day]) {
        grouped[day] = {
          date: date,
          items: [],
          minTemp: Infinity,
          maxTemp: -Infinity,
          conditions: new Set()
        };
      }
      
      grouped[day].items.push(item);
      grouped[day].minTemp = Math.min(grouped[day].minTemp, item.main.temp_min);
      grouped[day].maxTemp = Math.max(grouped[day].maxTemp, item.main.temp_max);
      grouped[day].conditions.add(item.weather[0].description);
    });
    
    return Object.entries(grouped).map(([day, data]) => ({
      day,
      date: data.date,
      minTemp: data.minTemp,
      maxTemp: data.maxTemp,
      conditions: Array.from(data.conditions),
      items: data.items
    }));
  };

  const renderWeatherData = () => {
    if (!weather || !forecast || !latitude || !longitude) return null;
    
    const dailyForecasts = groupForecastByDay();
    const sunrise = new Date(weather.sys.sunrise * 1000).toLocaleTimeString("fr-FR", {hour: '2-digit', minute:'2-digit'});
    const sunset = new Date(weather.sys.sunset * 1000).toLocaleTimeString("fr-FR", {hour: '2-digit', minute:'2-digit'});
    
    const polygonCoords = [
      [latitude - 0.02, longitude - 0.02],
      [latitude - 0.02, longitude + 0.02],
      [latitude + 0.02, longitude + 0.02],
      [latitude + 0.02, longitude - 0.02]
    ];

    const tempHumidityData = {
      labels: forecast.list.slice(0, 8).map(item => 
        new Date(item.dt * 1000).toLocaleTimeString("fr-FR", {hour: '2-digit'})
      ),
      datasets: [
        {
          label: 'Température (°C)',
          data: forecast.list.slice(0, 8).map(item => item.main.temp),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Humidité (%)',
          data: forecast.list.slice(0, 8).map(item => item.main.humidity),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          yAxisID: 'y1',
          type: 'bar'
        }
      ]
    };
    
    const precipitationData = {
      labels: dailyForecasts.slice(0, 5).map(day => day.day.split(' ')[0]),
      datasets: [
        {
          label: 'Précipitations (mm)',
          data: dailyForecasts.slice(0, 5).map(day => 
            day.items.reduce((sum, item) => sum + (item.rain?.['3h'] || 0), 0)
          ),
          backgroundColor: 'rgba(30, 144, 255, 0.5)',
        }
      ]
    };

    return (
      <>
        <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: '#f0f7e9', fontStyle: 'italic' }}>
          <Typography variant="body1" textAlign="center">
            "Une bonne météo agricole est comme un bon conseiller, elle ne contrôle pas vos décisions, mais éclaire votre chemin."
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {weather.name}, {weather.sys.country}
          </Typography>
          <MuiTooltip title="Actualiser">
            <IconButton onClick={() => fetchWeather(city)} color="primary">
              <Refresh />
            </IconButton>
          </MuiTooltip>
        </Box>
        
        {notifications.length > 0 && (
          <Box mb={2}>
            {notifications.map((note, i) => (
              <Alert key={i} severity={note.startsWith("⚠️") ? "warning" : "info"} sx={{ mb: 1 }}>
                {note}
              </Alert>
            ))}
          </Box>
        )}
        
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4} textAlign="center">
              <Typography variant="h2" fontWeight="bold">
                {Math.round(weather.main.temp)}°C
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                {getWeatherIcon(weather.weather[0].description, 40)}
                <Typography variant="h6">
                  {weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Ressenti: {Math.round(weather.main.feels_like)}°C
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaTemperatureLow color="#1e90ff" />
                  <Typography>Min: {Math.round(weather.main.temp_min)}°C</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaTemperatureHigh color="#ff4500" />
                  <Typography>Max: {Math.round(weather.main.temp_max)}°C</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaTint color="#1e90ff" />
                  <Typography>Humidité: {weather.main.humidity}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WiBarometer size={24} color="#555" />
                  <Typography>Pression: {weather.main.pressure} hPa</Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaWind color="#555" />
                  <Typography>Vent: {weather.wind.speed} m/s ({weather.wind.deg}°)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WiSunrise size={24} color="#fdb813" />
                  <Typography>Lever: {sunrise}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WiSunset size={24} color="#ff4500" />
                  <Typography>Coucher: {sunset}</Typography>
                </Box>
                {weather.rain && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WiRaindrop size={24} color="#1e90ff" />
                    <Typography>Pluie: {weather.rain["1h"] || 0} mm/h</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)} 
          sx={{ mb: 2 }}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label={isMobile ? "Prévisions" : "Prévisions 5 jours"} icon={<FaCalendarAlt />} />
          <Tab label={isMobile ? "Graphiques" : "Analyse"} icon={<FaSeedling />} />
          <Tab label={isMobile ? "Carte" : "Carte zone"} icon={<FaMapMarkerAlt />} />
        </Tabs>
        
        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Prévisions pour les 5 prochains jours
            </Typography>
            <Grid container spacing={2}>
              {dailyForecasts.slice(0, 5).map((dayData, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                  <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
                      {dayData.day}
                    </Typography>
                    <Box textAlign="center" my={1}>
                      {getWeatherIcon(dayData.conditions[0], 40)}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Min: {Math.round(dayData.minTemp)}°C
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Max: {Math.round(dayData.maxTemp)}°C
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
                      {dayData.items.slice(0, 4).map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            {new Date(item.dt * 1000).toLocaleTimeString("fr-FR", {hour: '2-digit'})}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getWeatherIcon(item.weather[0].description, 16)}
                            <Typography variant="body2">{Math.round(item.main.temp)}°C</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Évolution des conditions météo
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Température et humidité (24h)
                  </Typography>
                  <Line 
                    data={tempHumidityData}
                    options={{
                      responsive: true,
                      interaction: {
                        mode: 'index',
                        intersect: false,
                      },
                      scales: {
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: {
                            display: true,
                            text: 'Température (°C)'
                          }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: {
                            display: true,
                            text: 'Humidité (%)'
                          },
                          grid: {
                            drawOnChartArea: false,
                          },
                        },
                      }
                    }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Prévisions de précipitations (5 jours)
                  </Typography>
                  <Bar 
                    data={precipitationData}
                    options={{
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Précipitations (mm)'
                          }
                        }
                      }
                    }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Localisation et zone agricole
            </Typography>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Zone verte :</strong> Périmètre agricole recommandé pour cette région
              </Typography>
            </Paper>
            <Box sx={{ height: isMobile ? '300px' : '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
              <MapContainer 
                center={[latitude, longitude]} 
                zoom={isMobile ? 11 : 12} 
                style={{ height: '100%', width: '100%' }}
                touchZoom={true}
                dragging={true}
                zoomControl={true}
                scrollWheelZoom={false}
                doubleClickZoom={true}
              >
                <TileLayer 
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[latitude, longitude]}>
                  <Popup>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {weather.name}, {weather.sys.country}
                    </Typography>
                    <Typography variant="body2">
                      {weather.weather[0].description}
                    </Typography>
                    <Typography variant="body2">
                      Température: {Math.round(weather.main.temp)}°C
                    </Typography>
                  </Popup>
                </Marker>
                <Polygon 
                  positions={polygonCoords} 
                  color="green" 
                  fillOpacity={0.2}
                >
                  <Popup>
                    <Typography variant="body2">
                      Zone agricole recommandée
                    </Typography>
                    <Typography variant="caption">
                      Sol fertile - Conditions climatiques favorables
                    </Typography>
                  </Popup>
                </Polygon>
              </MapContainer>
            </Box>
            <Box mt={1}>
              <Typography variant="caption" color="text.secondary">
                <FaMapMarkerAlt style={{ marginRight: 5 }} />
                Marqueur: Votre localisation | Zone verte: Zone agricole idéale
              </Typography>
            </Box>
          </Box>
        )}

        {/* Agricultural Data Section */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            <FaLeaf style={{ marginRight: 10 }} />
            Données agricoles spécifiques
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WiDaySunny size={24} color="#ff5722" />
                  <Typography variant="subtitle1" ml={1}>
                    Indice UV
                  </Typography>
                </Box>
                <Typography variant="h4" color={uvIndex > 6 ? "error" : "primary"}>
                  {uvIndex}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {uvIndex > 6 ? "Protection nécessaire" : "Exposition modérée"}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Opacity color="primary" />
                  <Typography variant="subtitle1" ml={1}>
                    Évapotranspiration
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {evapotranspiration} mm/jour
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Besoin en irrigation
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FaTintSlash color={soilMoisture < 60 ? "error" : "primary"} />
                  <Typography variant="subtitle1" ml={1}>
                    Humidité du sol
                  </Typography>
                </Box>
                <Typography variant="h4" color={soilMoisture < 60 ? "error" : "primary"}>
                  {soilMoisture}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {soilMoisture < 60 ? "Arrosage recommandé" : "Niveau optimal"}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FaSeedling color="#2e7d32" />
                  <Typography variant="subtitle1" ml={1}>
                    Degrés-jours croissance
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {growthDegreeDays}°C-j
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {growthDegreeDays > 1000 ? "Phase de maturation" : "Phase de croissance"}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Agricultural Recommendations */}
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              <FaSeedling style={{ marginRight: 10 }} />
              Recommandations agricoles
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {weather.main.temp < 5 && (
                <Chip 
                  icon={<FaSnowflake />} 
                  label="Protéger les cultures du gel" 
                  color="warning" 
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              )}
              {uvIndex > 6 && (
                <Chip
                  icon={<WiDaySunny />}
                  label="Ombrer les jeunes plants"
                  color="error"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              )}
              {soilMoisture < 60 && (
                <Chip
                  icon={<FaTint />}
                  label="Irriguer les parcelles"
                  color="info"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              )}
              {weather.wind.speed > 5 && (
                <Chip
                  icon={<WiStrongWind />}
                  label="Protéger contre le vent"
                  color="secondary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        {lastUpdate && (
          <Typography variant="caption" display="block" textAlign="right" mt={2} color="text.secondary">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString("fr-FR")}
          </Typography>
        )}
      </>
    );
  };

  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: "#f5f9f5", 
      borderRadius: "16px", 
      boxShadow: 3, 
      maxWidth: "1200px", 
      m: "20px auto",
      border: "1px solid #e0e0e0"
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#2e7d32' }}>
          🌱 METEO AGRICOLE PREVISIONNELLE
        </Typography>
        <Badge badgeContent={notifications.length} color="warning">
          <Notifications color="action" />
        </Badge>
      </Box>

      <Box mb={3}>
        <TextField
          fullWidth
          label="Rechercher une ville"
          variant="outlined"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchWeather(city)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => fetchWeather(city)}
                  startIcon={<SearchIcon />}
                >
                  Rechercher
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box textAlign="center" py={4}>
          <CircularProgress color="success" size={60} />
          <Typography variant="h6" mt={2}>
            Chargement des données météo...⌛
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        renderWeatherData()
      )}
    </Box>
  );
};

export default MeteoAgricole;