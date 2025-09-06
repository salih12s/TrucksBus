import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { ProtectedRoute } from "../components/auth";
import MainLayout from "@/pages/MainLayout";

// Lazy load components for better performance

const Dashboard = lazy(() => import("../pages/Dashboard"));
const AdDetail = lazy(() => import("../pages/AdDetail"));
const CategorySelection = lazy(() =>
  import("../components/ads").then((module) => ({
    default: module.CategorySelection,
  }))
);
const CreateAdForm = lazy(() =>
  import("../components/ads").then((module) => ({
    default: module.CreateAdForm,
  }))
);
const LoginNew = lazy(() =>
  import("../components/auth").then((module) => ({ default: module.LoginNew }))
);
const RegisterNew = lazy(() =>
  import("../components/auth").then((module) => ({
    default: module.RegisterNew,
  }))
);
const RegisterCorporate = lazy(() =>
  import("../components/auth").then((module) => ({
    default: module.RegisterCorporate,
  }))
);

// Loading component for suspense fallback
const LoadingFallback = ({
  message = "Yükleniyor...",
}: {
  message?: string;
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh",
      gap: 2,
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
            <MainLayout />
          </Suspense>
        }
      />

      <Route
        path="/login"
        element={
          <Suspense fallback={<PageLoadingFallback page="Giriş" />}>
            <LoginNew />
          </Suspense>
        }
      />

      <Route
        path="/register"
        element={
          <Suspense fallback={<PageLoadingFallback page="Kayıt" />}>
            <RegisterNew />
          </Suspense>
        }
      />

      <Route
        path="/register-corporate"
        element={
          <Suspense fallback={<PageLoadingFallback page="Kurumsal Kayıt" />}>
            <RegisterCorporate />
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

      <Route path="/category-selection" element={<CategorySelection />} />

      <Route
        path="/create-ad"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoadingFallback page="İlan Oluştur" />}>
              <CreateAdForm />
            </Suspense>
          </ProtectedRoute>
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
