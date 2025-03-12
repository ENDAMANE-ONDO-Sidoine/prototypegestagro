import React, { useState } from 'react';
import SidebarSupplier from '../components/supplier/SidebarSupplier';
import Summary from '../components/supplier/Summary';
import ProductManagement from '../components/supplier/ProductManagement';
import OrderTracking from '../components/supplier/OrderTracking';
import StockManagement from '../components/supplier/StockManagement';
import CustomerManagement from '../components/supplier/CustomerManagement';
import SalesAnalysis from '../components/supplier/SalesAnalysis';
import { Grid } from '@mui/material';

const DashboardSupplier = () => {
  const [selectedSection, setSelectedSection] = useState('summary');

  const renderSection = () => {
    switch (selectedSection) {
      case 'summary':
        return <Summary />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderTracking />;
      case 'stock':
        return <StockManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'sales':
        return <SalesAnalysis />;
      default:
        return <Summary />;
    }
  };

  return (
    <Grid container>
      <Grid item xs={2}>
        <SidebarSupplier onSelectSection={setSelectedSection} />
      </Grid>
      <Grid item xs={10} style={{ padding: '20px' }}>
        {renderSection()}
      </Grid>
    </Grid>
  );
};

export default DashboardSupplier;