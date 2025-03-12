import React from 'react';
import { Button } from '@mui/material';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

const ExportAnalysis = ({ data }) => {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productions");
    XLSX.writeFile(wb, "productions.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des productions", 10, 10);
    data.forEach((item, index) => {
      doc.text(`${item.date} - ${item.type} - ${item.quantity} - ${item.status}`, 10, 20 + (index * 10));
    });
    doc.save("productions.pdf");
  };

  return (
    <div>
      <Button onClick={exportToExcel}>Exporter en Excel</Button>
      <Button onClick={exportToPDF}>Exporter en PDF</Button>
    </div>
  );
};

export default ExportAnalysis;