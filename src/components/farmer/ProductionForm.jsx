import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';

const ProductionForm = ({ onAddProduction }) => {
  const [date, setDate] = useState(DateTime.now());
  const [type, setType] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProduction({ date, type, quantity, status });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <form onSubmit={handleSubmit}>
        <DatePicker
          label="Date"
          value={date}
          onChange={(newValue) => setDate(newValue)}
          renderInput={(params) => <TextField {...params} />}
        />
        <TextField
          label="Type de culture / produit"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <TextField
          label="Quantité produite"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <MenuItem value="récolté">Récolté</MenuItem>
          <MenuItem value="en cours">En cours</MenuItem>
          <MenuItem value="perdu">Perdu</MenuItem>
        </Select>
        <Button type="submit" variant="contained">
          Ajouter
        </Button>
      </form>
    </LocalizationProvider>
  );
};

export default ProductionForm;