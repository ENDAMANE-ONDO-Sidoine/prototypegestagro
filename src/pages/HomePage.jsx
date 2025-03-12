import React from 'react';
import { useTheme } from '../utils/ThemeProvider'; // Chemin corrigé
import HeroSection from '../components/sections/HeroSection';
import ServicesSection from '../components/sections/ServicesSection';
import PartnersSection from '../components/sections/PartnersSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';

const HomePage = () => {
  const { darkMode } = useTheme();

  return (
    <div className={darkMode ? 'dark-mode' : 'light-mode'}>
      <HeroSection />
      <ServicesSection />
      <PartnersSection />
      <TestimonialsSection />
    </div>
  );
};

export default HomePage;