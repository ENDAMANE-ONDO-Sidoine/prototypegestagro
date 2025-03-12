import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import DashboardFarmer from "./pages/DashboardFarmer";
import DashboardBuyer from "./pages/DashboardBuyer";
import DashboardSupplier from "./pages/DashboardSupplier";
import DashboardTransporter from "./pages/DashboardTransporter";
import DashboardAgronomist from "./pages/DashboardAgronomist";
import DashboardNGO from "./pages/DashboardNGO";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import Navbar from "./layouts/Navbar";
import Footer from "./layouts/Footer";
import PrivateRoute from "./components/PrivateRoute";
import ThemeProvider from "./utils/ThemeProvider"; // Importez ThemeProvider

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || null);

  // Synchronise l'état avec localStorage
  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
    localStorage.setItem("userRole", userRole);
  }, [isAuthenticated, userRole]);

  return (
    <ThemeProvider>
      <Router>
        <AppContent
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          setIsAuthenticated={setIsAuthenticated}
          setUserRole={setUserRole}
        />
      </Router>
    </ThemeProvider>
  );
}

// Composant AppContent pour gérer la logique de rendu
function AppContent({ isAuthenticated, userRole, setIsAuthenticated, setUserRole }) {
  const location = useLocation();

  // Vérifie si l'utilisateur est sur une page de tableau de bord
  const isDashboardPage = location.pathname.startsWith("/dashboard");

  return (
    <div className="app-container">
      {/* Masquer la Navbar sur les pages de tableau de bord */}
      {!isDashboardPage && (
        <Navbar
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          handleLogout={() => {
            setIsAuthenticated(false);
            setUserRole(null);
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("userRole");
          }}
        />
      )}

      <div className="main-content">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/login"
            element={
              <LoginPage
                setAuth={setIsAuthenticated}
                setUserRole={setUserRole}
              />
            }
          />

          {/* Routes protégées */}
          {dashboardRoutes.map(({ path, component }) => (
            <Route
              key={path}
              path={`/dashboard/${path}`}
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  {component}
                </PrivateRoute>
              }
            />
          ))}

          {/* Route 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {/* Masquer le Footer sur les pages de tableau de bord */}
      {!isDashboardPage && <Footer />}
    </div>
  );
}

// Liste des rôles et leurs dashboards associés
const dashboardRoutes = [
  { path: "farmer", component: <DashboardFarmer /> },
  { path: "buyer", component: <DashboardBuyer /> },
  { path: "supplier", component: <DashboardSupplier /> },
  { path: "transporter", component: <DashboardTransporter /> },
  { path: "agronomist", component: <DashboardAgronomist /> },
  { path: "ngo", component: <DashboardNGO /> },
];

export default App;