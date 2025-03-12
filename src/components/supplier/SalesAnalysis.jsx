import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SalesAnalysis = () => {
  // Données de ventes par mois, région et année
  const salesData = [
    { month: 'Jan', region: 'Libreville', sales: 4000, previousYearSales: 3500, target: 4500, year: 2025 },
    { month: 'Jan', region: 'Port-Gentil', sales: 3000, previousYearSales: 2800, target: 3200, year: 2025 },
    { month: 'Jan', region: 'Franceville', sales: 2000, previousYearSales: 1800, target: 2200, year: 2025 },
    { month: 'Fév', region: 'Libreville', sales: 5000, previousYearSales: 4500, target: 4800, year: 2025 },
    { month: 'Fév', region: 'Port-Gentil', sales: 3500, previousYearSales: 3200, target: 3400, year: 2025 },
    { month: 'Fév', region: 'Franceville', sales: 2500, previousYearSales: 2200, target: 2300, year: 2025 },
    // Ajoutez d'autres mois et régions pour 2025 ici...

    // Données pour 2024
    { month: 'Jan', region: 'Libreville', sales: 3800, previousYearSales: 3300, target: 4000, year: 2024 },
    { month: 'Jan', region: 'Port-Gentil', sales: 2800, previousYearSales: 2600, target: 3000, year: 2024 },
    { month: 'Jan', region: 'Franceville', sales: 1800, previousYearSales: 1600, target: 2000, year: 2024 },
    { month: 'Fév', region: 'Libreville', sales: 4800, previousYearSales: 4300, target: 4500, year: 2024 },
    { month: 'Fév', region: 'Port-Gentil', sales: 3300, previousYearSales: 3000, target: 3200, year: 2024 },
    { month: 'Fév', region: 'Franceville', sales: 2300, previousYearSales: 2000, target: 2100, year: 2024 },
    // Ajoutez d'autres mois et régions pour 2024 ici...

    // Données pour 2023
    { month: 'Jan', region: 'Libreville', sales: 3500, previousYearSales: 3000, target: 3800, year: 2023 },
    { month: 'Jan', region: 'Port-Gentil', sales: 2600, previousYearSales: 2400, target: 2800, year: 2023 },
    { month: 'Jan', region: 'Franceville', sales: 1600, previousYearSales: 1400, target: 1800, year: 2023 },
    { month: 'Fév', region: 'Libreville', sales: 4500, previousYearSales: 4000, target: 4200, year: 2023 },
    { month: 'Fév', region: 'Port-Gentil', sales: 3200, previousYearSales: 2900, target: 3000, year: 2023 },
    { month: 'Fév', region: 'Franceville', sales: 2200, previousYearSales: 1900, target: 2000, year: 2023 },
    // Ajoutez d'autres mois et régions pour 2023 ici...
  ];

  // États pour les filtres
  const [period, setPeriod] = useState('monthly');
  const [region, setRegion] = useState('all');
  const [year, setYear] = useState('2025'); // Année en cours par défaut : 2025

  // Données filtrées en fonction des sélections
  const filteredData = salesData
    .filter((entry) => (region === 'all' ? true : entry.region === region))
    .filter((entry) => (year === '2025' ? true : entry.year === parseInt(year)));

  // Données pour le graphique en camembert (répartition des ventes par région)
  const pieData = [
    { name: 'Libreville', value: salesData.reduce((sum, entry) => entry.region === 'Libreville' ? sum + entry.sales : sum, 0) },
    { name: 'Port-Gentil', value: salesData.reduce((sum, entry) => entry.region === 'Port-Gentil' ? sum + entry.sales : sum, 0) },
    { name: 'Franceville', value: salesData.reduce((sum, entry) => entry.region === 'Franceville' ? sum + entry.sales : sum, 0) },
  ];

  // Couleurs pour le graphique en camembert
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  // Exportation en Excel
  const handleExportExcel = () => {
    const data = filteredData.map((entry) => ({
      Mois: entry.month,
      Région: entry.region,
      Ventes: entry.sales,
      'Ventes année précédente': entry.previousYearSales,
      Objectif: entry.target,
      Statut: entry.sales >= entry.target ? 'Atteint' : 'Non atteint',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventes');
    XLSX.writeFile(workbook, 'ventes_gabon.xlsx');
  };

  // Fonction pour déterminer si l'objectif est atteint
  const isTargetAchieved = (sales, target) => sales >= target;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5">Analyse des ventes </Typography>

        {/* Filtres */}
        <Paper sx={{ padding: '20px', marginBottom: '20px', boxShadow: 3, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Période</InputLabel>
                <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                  <MenuItem value="monthly">Mensuel</MenuItem>
                  <MenuItem value="quarterly">Trimestriel</MenuItem>
                  <MenuItem value="yearly">Annuel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Région</InputLabel>
                <Select value={region} onChange={(e) => setRegion(e.target.value)}>
                  <MenuItem value="all">Toutes</MenuItem>
                  <MenuItem value="Libreville">Libreville</MenuItem>
                  <MenuItem value="Port-Gentil">Port-Gentil</MenuItem>
                  <MenuItem value="Franceville">Franceville</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Année</InputLabel>
                <Select value={year} onChange={(e) => setYear(e.target.value)}>
                  <MenuItem value="2025">2025</MenuItem>
                  <MenuItem value="2024">2024</MenuItem>
                  <MenuItem value="2023">2023</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="contained" color="success" onClick={handleExportExcel}>
                Exporter en Excel
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Graphique en barres (Ventes par région) */}
        <Paper sx={{ padding: '20px', marginBottom: '20px', boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Ventes par région</Typography>
          <BarChart width={600} height={300} data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" name="Ventes 2025" />
            <Bar dataKey="previousYearSales" fill="#82ca9d" name="Ventes 2024" />
          </BarChart>
        </Paper>

        {/* Graphique en ligne (Évolution des ventes) */}
        <Paper sx={{ padding: '20px', marginBottom: '20px', boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Évolution des ventes</Typography>
          <LineChart width={600} height={300} data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Ventes 2025" />
            <Line type="monotone" dataKey="previousYearSales" stroke="#82ca9d" name="Ventes 2024" />
          </LineChart>
        </Paper>

        {/* Graphique en camembert (Répartition des ventes par région) */}
        <Paper sx={{ padding: '20px', marginBottom: '20px', boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Répartition des ventes par région</Typography>
          <PieChart width={600} height={300}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </Paper>

        {/* Tableau des ventes avec alertes de performance */}
        <Paper sx={{ padding: '20px', marginBottom: '20px', boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Détail des ventes</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mois</TableCell>
                  <TableCell>Région</TableCell>
                  <TableCell>Ventes</TableCell>
                  <TableCell>Objectif</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.month}</TableCell>
                    <TableCell>{entry.region}</TableCell>
                    <TableCell>{entry.sales}</TableCell>
                    <TableCell>{entry.target}</TableCell>
                    <TableCell>
                      {isTargetAchieved(entry.sales, entry.target) ? (
                        <Tooltip title="Objectif atteint">
                          <CheckCircleIcon color="success" />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Objectif non atteint">
                          <WarningIcon color="error" />
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SalesAnalysis;