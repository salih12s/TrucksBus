import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Provider } from "react-redux";
import { store } from "./store";

// Components
import { ErrorBoundary, PerformanceMonitor } from "./components/common";
import { PWAStatus } from "./components/pwa";
import { ProtectedRoute } from "./components/auth";

// Pages - Lazy loaded for better performance
const Homepage = React.lazy(() => import("./pages/Homepage"));
const MainLayout = React.lazy(() => import("./pages/MainLayout"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const AdDetail = React.lazy(() => import("./pages/AdDetail"));
const Login = React.lazy(() => import("./components/auth/Login"));
const Register = React.lazy(() => import("./components/auth/Register"));
const CreateAdForm = React.lazy(() => import("./components/ads/CreateAdForm"));
const MyAds = React.lazy(() => import("./components/ads/MyAds"));
const MessagingSystem = React.lazy(
  () => import("./components/messaging/MessagingSystem")
);
const AnalyticsDashboard = React.lazy(
  () => import("./components/analytics/AnalyticsDashboard")
);

import "./App.css";

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

// Loading component
const LoadingFallback = ({
  message = "Yükleniyor...",
}: {
  message?: string;
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <React.Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<MainLayout />} />
                  <Route path="/old-homepage" element={<Homepage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/ad/:id" element={<AdDetail />} />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/create-ad"
                    element={
                      <ProtectedRoute>
                        <CreateAdForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/my-ads"
                    element={
                      <ProtectedRoute>
                        <MyAds />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute>
                        <MessagingSystem />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <AnalyticsDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Error Routes */}
                  <Route
                    path="/403"
                    element={
                      <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <h1 className="text-4xl font-bold text-red-600 mb-4">
                            403
                          </h1>
                          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Yetkisiz Erişim
                          </h2>
                          <p className="text-gray-600 mb-4">
                            Bu sayfaya erişim yetkiniz bulunmamaktadır.
                          </p>
                          <a
                            href="/"
                            className="text-blue-600 hover:text-blue-500"
                          >
                            Ana sayfaya dön
                          </a>
                        </div>
                      </div>
                    }
                  />

                  <Route
                    path="*"
                    element={
                      <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            404
                          </h1>
                          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                            Sayfa Bulunamadı
                          </h2>
                          <p className="text-gray-600 mb-4">
                            Aradığınız sayfa mevcut değil.
                          </p>
                          <a
                            href="/"
                            className="text-blue-600 hover:text-blue-500"
                          >
                            Ana sayfaya dön
                          </a>
                        </div>
                      </div>
                    }
                  />
                </Routes>
              </React.Suspense>

              {/* Performance Monitor - Only in development */}
              {process.env.NODE_ENV === "development" && <PerformanceMonitor />}

              {/* PWA Status */}
              <PWAStatus />
            </div>
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
