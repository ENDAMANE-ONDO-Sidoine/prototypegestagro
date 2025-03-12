import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'date', headerName: 'Date', width: 150 },
  { field: 'type', headerName: 'Type de culture / produit', width: 200 },
  { field: 'quantity', headerName: 'Quantité produite', width: 150 },
  { field: 'status', headerName: 'Statut', width: 150 },
];

const ProductionTable = ({ productions }) => {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={productions}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection
      />
    </div>
  );
};

export default ProductionTable;