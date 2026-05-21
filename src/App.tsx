import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import BuyerLogin from './pages/BuyerLogin';
import AdminDashboard from './pages/AdminDashboard';
import BuyerDashboard from './pages/BuyerDashboard';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/buyer-login" element={<BuyerLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
