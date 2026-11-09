import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerProfilePage from './pages/FarmerProfilePage';
import LiveWeatherPage from './pages/LiveWeatherPage';
import ForecastPage from './pages/ForecastPage';
import CropManagementPage from './pages/CropManagementPage';
import CropAdvisoryPage from './pages/CropAdvisoryPage';
import WeatherAlertsPage from './pages/WeatherAlertsPage';
import FarmerQueryPage from './pages/FarmerQueryPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ExpertDashboardPage from './pages/ExpertDashboardPage';
import ReportsPage from './pages/ReportsPage';

// Smart Dashboard Redirector
const DashboardRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'expert') return <Navigate to="/expert" replace />;
  return <Navigate to="/farmer-dashboard" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes inside MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/live-weather" element={<LiveWeatherPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/crops" element={<CropManagementPage />} />
          <Route path="/advisory" element={<CropAdvisoryPage />} />
          <Route path="/alerts" element={<WeatherAlertsPage />} />
          <Route path="/reports" element={<ReportsPage />} />

          {/* Farmer Specific */}
          <Route element={<ProtectedRoute allowedRoles={['farmer', 'admin']} />}>
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/profile" element={<FarmerProfilePage />} />
            <Route path="/queries" element={<FarmerQueryPage />} />
          </Route>

          {/* Expert Specific */}
          <Route element={<ProtectedRoute allowedRoles={['expert', 'admin']} />}>
            <Route path="/expert" element={<ExpertDashboardPage />} />
            <Route path="/expert/queries" element={<ExpertDashboardPage />} />
          </Route>

          {/* Admin Specific */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminDashboardPage />} />
            <Route path="/admin/analytics" element={<AdminDashboardPage />} />
            <Route path="/admin/logs" element={<AdminDashboardPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
