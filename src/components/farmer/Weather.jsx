import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Divider,
  TextField,
  InputAdornment,
  IconButton
} from "@mui/material";
import { FaCloudSun, FaCloudRain, FaSnowflake, FaSun, FaCloud, FaSmog } from "react-icons/fa";
import { Search as SearchIcon } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';

// Clé API OpenWeatherMap (remplacez par votre propre clé)
const API_KEY = "36eac51bdab037d164a23ae2e9a2d3ac"; 

const Meteo = () => {
  const [city, setCity] = useState("Franceville"); // Stocke le nom de la ville recherchée
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather(city);
  }, [city]);

  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      setError(null);

      // Requête pour la météo actuelle et les prévisions
      const geocodeResponse = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`);
      const { lat, lon } = geocodeResponse.data[0];
      setLatitude(lat);
      setLongitude(lon);

      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
      );

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
      );

      setWeather(weatherResponse.data);
      setForecast(forecastResponse.data);
      setLoading(false);
    } catch (err) {
      setError("Impossible de récupérer les données météo. Vérifiez le nom de la ville et réessayez.");
      setLoading(false);
    }
  };

  // Fonction pour choisir une icône en fonction de la météo
  const getWeatherIcon = (description) => {
    if (description.includes("nuage")) return <FaCloud size={30} color="#555" />;
    if (description.includes("pluie")) return <FaCloudRain size={30} color="#1e90ff" />;
    if (description.includes("neige")) return <FaSnowflake size={30} color="#00bfff" />;
    if (description.includes("brume")) return <FaSmog size={30} color="#888" />;
    if (description.includes("soleil") || description.includes("clair")) return <FaSun size={30} color="#fdb813" />;
    return <FaCloudSun size={30} color="#f4a460" />;
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#e7f4e8", borderRadius: "8px", boxShadow: 2, maxWidth: "100%", m: "auto" }}>
      <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
        🌤 Météo Agricole
      </Typography>

      <Box mb={2} textAlign="center">
        <TextField
          label="Recherche ville"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          sx={{ width: "100%", maxWidth: 400 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => fetchWeather(city)}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box textAlign="center">
          <CircularProgress color="success" />
          <Typography>Chargement des données météo...</Typography>
        </Box>
      ) : error ? (
        <Typography color="error" textAlign="center">
          {error}
        </Typography>
      ) : (
        weather && latitude && longitude && (
          <>
            {/* Météo actuelle */}
            <Box textAlign="center" mb={2}>
              <Typography variant="h6">
                {weather.name}, {weather.sys.country}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {Math.round(weather.main.temp)}°C {getWeatherIcon(weather.weather[0].description)}
              </Typography>
              <Typography variant="body1">
                {weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                💨 Vent : {weather.wind.speed} m/s | 💧 Humidité : {weather.main.humidity}%
              </Typography>
            </Box>

            <Divider />

            {/* Prévisions météo sur 3 jours */}
            <Box mt={2}>
              <Typography variant="h6" textAlign="center" gutterBottom>
                Prévisions sur 3 jours
              </Typography>
              <Grid container spacing={2}>
                {forecast &&
                  forecast.list.slice(0, 24 * 3).map((item, index) => {
                    // Extraire la date et l'heure
                    const date = new Date(item.dt * 1000);
                    const day = date.toLocaleDateString("fr-FR", { weekday: "long" });
                    const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

                    return (
                      <Grid item xs={12} sm={4} key={index}>
                        <Box textAlign="center">
                          <Typography variant="body2" fontWeight="bold">
                            {day}
                          </Typography>
                          <Typography variant="body2">{time}</Typography>
                          {getWeatherIcon(item.weather[0].description)}
                          <Typography variant="body2">{Math.round(item.main.temp)}°C</Typography>
                        </Box>
                      </Grid>
                    );
                  })}
              </Grid>
            </Box>

            {/* Carte avec les prévisions météo */}
            <Box mt={4}>
              <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: "400px", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[latitude, longitude]}>
                  <Popup>
                    <Typography variant="h6">{city}</Typography>
                    <Typography variant="subtitle1">Coordonnées : {latitude}, {longitude}</Typography>
                    <Typography>Température actuelle : {weather.main.temp} °C</Typography>
                    <Typography>Humidité : {weather.main.humidity} %</Typography>
                    <Typography>Condition : {weather.weather[0].description}</Typography>
                  </Popup>
                </Marker>
              </MapContainer>
            </Box>
          </>
        )
      )}
    </Box>
  );
};

export default Meteo;
