import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy load components for better performance
const Homepage = lazy(() => import('../pages/Homepage'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const AdDetail = lazy(() => import('../pages/AdDetail'));
const Login = lazy(() => import('../components/Login'));
const Register = lazy(() => import('../components/Register'));

// Loading component for suspense fallback
const LoadingFallback = ({ message = 'Yükleniyor...' }: { message?: string }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      gap: 2
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body1" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

// Component-specific loading messages
const PageLoadingFallback = ({ page }: { page: string }) => (
  <LoadingFallback message={`${page} yükleniyor...`} />
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          <Suspense fallback={<PageLoadingFallback page="Ana Sayfa" />}>
            <Homepage />
          </Suspense>
        } 
      />
      
      <Route 
        path="/login" 
        element={
          <Suspense fallback={<PageLoadingFallback page="Giriş" />}>
            <Login />
          </Suspense>
        } 
      />
      
      <Route 
        path="/register" 
        element={
          <Suspense fallback={<PageLoadingFallback page="Kayıt" />}>
            <Register />
          </Suspense>
        } 
      />
      
      <Route 
        path="/ad/:id" 
        element={
          <Suspense fallback={<PageLoadingFallback page="İlan Detayı" />}>
            <AdDetail />
          </Suspense>
        } 
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback page="Kontrol Paneli" />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Redirect unknown routes to homepage */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
