import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        home: "Home",
        about: "About",
        services: "Services",
        contact: "Contact",
        rightsReserved: "All rights reserved.",
      },
    },
    fr: {
      translation: {
        home: "Accueil",
        about: "À propos",
        services: "Services",
        contact: "Contact",
        rightsReserved: "Tous droits réservés.",
      },
    },
  },
  lng: "fr", // Langue par défaut
  fallbackLng: "en", // Langue de secours
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
