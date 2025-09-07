import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Provider } from "react-redux";
import { store } from "./store";

// Components
import { ErrorBoundary, PerformanceMonitor } from "./components/common";
import { PWAStatus } from "./components/pwa";
import { ProtectedRoute } from "./components/auth";

// Pages - Lazy loaded for better performance
const MainLayout = React.lazy(() => import("./pages/MainLayout"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const AdDetail = React.lazy(() => import("./pages/AdDetail"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const Bookmarks = React.lazy(() => import("./pages/Bookmarks"));
const LoginNew = React.lazy(() => import("./components/auth/LoginNew"));
const RegisterNew = React.lazy(() => import("./components/auth/RegisterNew"));
const RegisterCorporate = React.lazy(
  () => import("./components/auth/RegisterCorporate")
);
const CreateAdForm = React.lazy(() => import("./components/ads/CreateAdForm"));
const CreateMinibusAdForm = React.lazy(
  () => import("./components/ads/CreateMinibusAdForm")
);
const OtobusAdForm = React.lazy(
  () => import("./components/forms/OtobusAdForm")
);
const KamyonAdForm = React.lazy(
  () => import("./components/forms/KamyonAdForm")
);
const CekiciAdForm = React.lazy(
  () => import("./components/forms/CekiciAdForm")
);
const VehicleFormSelector = React.lazy(
  () => import("./components/VehicleFormSelector")
);

// Dorse Forms
const HafriyatTipiForm = React.lazy(
  () => import("./components/forms/Damperli/HafriyatTipiForm")
);
const HavuzHardoxTipiForm = React.lazy(
  () => import("./components/forms/Damperli/HavuzHardoxTipiForm")
);
const KapakliTipForm = React.lazy(
  () => import("./components/forms/Damperli/KapakliTipForm")
);
const KayaTipiForm = React.lazy(
  () => import("./components/forms/Damperli/KayaTipiForm")
);

// Karoser UstYapi Forms
const KamyonRomorkForm = React.lazy(
  () => import("./components/forms/KamyonRomorkForm")
);

// Karoser UstYapi - Damperli Forms
const KaroserKayaTipiForm = React.lazy(
  () => import("./components/forms/KaroserUstyapi/Damperli/KayaTipiForm")
);
const KaroserHavuzHardoxTipiForm = React.lazy(
  () => import("./components/forms/KaroserUstyapi/Damperli/HavuzHardoxTipiForm")
);
const KaroserKapakliTipForm = React.lazy(
  () => import("./components/forms/KaroserUstyapi/Damperli/KapakliTipForm")
);
const KaroserAhsapKasaForm = React.lazy(
  () => import("./components/forms/KaroserUstyapi/Damperli/AhsapKasaForm")
);

// Karoser UstYapi - Sabit Kabin Forms
const AcikKasaForm = React.lazy(
  () => import("./components/forms/KaroserUstyapi/SabitKabin/AcikKasaForm")
);
const KapaliKasaForm = React.lazy(
  () => import("./components/forms/KaroserUstyapi/SabitKabin/KapaliKasaForm")
);
const OzelKasaForm = React.lazy(
  () => import("./components/forms/KaroserUstyapi/SabitKabin/OzelKasaForm")
);

const CategorySelection = React.lazy(
  () => import("./components/ads/CategorySelection")
);
const BrandSelection = React.lazy(
  () => import("./components/ads/BrandSelection")
);
const ModelSelection = React.lazy(
  () => import("./components/ads/ModelSelection")
);
const VariantSelection = React.lazy(
  () => import("./components/ads/VariantSelection")
);
const MyAds = React.lazy(() => import("./pages/MyAds"));
const Doping = React.lazy(() => import("./pages/Doping"));
const MessagingSystem = React.lazy(
  () => import("./components/messaging/MessagingSystem")
);
const Complaints = React.lazy(() => import("./pages/Complaints"));
const AnalyticsDashboard = React.lazy(
  () => import("./components/analytics/AnalyticsDashboard")
);

// Admin Components
const AdminLayout = React.lazy(() => import("./admin/components/AdminLayout"));
const AdminDashboard = React.lazy(() => import("./admin/pages/AdminDashboard"));
const PendingAds = React.lazy(() => import("./admin/pages/PendingAds"));
const UsersPage = React.lazy(() => import("./admin/pages/UsersPage"));
const AdminLogsPage = React.lazy(() => import("./admin/pages/AdminLogsPage"));
const FeedbackManagement = React.lazy(
  () => import("./admin/pages/FeedbackManagement")
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
                  <Route path="/login" element={<LoginNew />} />
                  <Route path="/register" element={<RegisterNew />} />
                  <Route
                    path="/register-corporate"
                    element={<RegisterCorporate />}
                  />
                  <Route path="/ad/:id" element={<AdDetail />} />
                  <Route
                    path="/category-selection"
                    element={<CategorySelection />}
                  />

                  {/* Brand/Model/Variant Selection Routes */}
                  <Route
                    path="/categories/:categorySlug/brands"
                    element={<BrandSelection />}
                  />
                  <Route
                    path="/categories/:categorySlug/brands/:brandSlug/models"
                    element={<ModelSelection />}
                  />
                  <Route
                    path="/categories/:categorySlug/brands/:brandSlug/models/:modelSlug/variants"
                    element={<VariantSelection />}
                  />

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
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/bookmarks"
                    element={
                      <ProtectedRoute>
                        <Bookmarks />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/complaints"
                    element={
                      <ProtectedRoute>
                        <Complaints />
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
                    path="/doping"
                    element={
                      <ProtectedRoute>
                        <Doping />
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

                  {/* Specific vehicle form routes - SPESİFİK ROUTE'LAR ÖNCE GELMELİ */}
                  <Route
                    path="/categories/otobus/brands/:brandSlug/models/:modelSlug/variants/:variantSlug/create-ad"
                    element={
                      <ProtectedRoute>
                        <OtobusAdForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/categories/kamyon-kamyonet/brands/:brandSlug/models/:modelSlug/variants/:variantSlug/create-ad"
                    element={
                      <ProtectedRoute>
                        <KamyonAdForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/categories/cekici/brands/:brandSlug/models/:modelSlug/variants/:variantSlug/create-ad"
                    element={
                      <ProtectedRoute>
                        <CekiciAdForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/categories/minibus-midibus/brands/:brandSlug/models/:modelSlug/variants/:variantSlug/create-ad"
                    element={
                      <ProtectedRoute>
                        <CreateMinibusAdForm />
                      </ProtectedRoute>
                    }
                  />

                  {/* Dorse Form Routes */}
                  <Route
                    path="/categories/dorse/brands/:brandSlug/models/:modelSlug/variants/hafriyat-tipi/create-ad"
                    element={
                      <ProtectedRoute>
                        <HafriyatTipiForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/categories/dorse/brands/:brandSlug/models/:modelSlug/variants/havuz-hardox-tipi/create-ad"
                    element={
                      <ProtectedRoute>
                        <HavuzHardoxTipiForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/categories/dorse/brands/:brandSlug/models/:modelSlug/variants/kapakli-tip/create-ad"
                    element={
                      <ProtectedRoute>
                        <KapakliTipForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/categories/dorse/brands/:brandSlug/models/:modelSlug/variants/kaya-tipi/create-ad"
                    element={
                      <ProtectedRoute>
                        <KayaTipiForm />
                      </ProtectedRoute>
                    }
                  />

                  {/* Damperli-Dorse kategorisi için de aynı route'lar */}
                  <Route
                    path="/categories/damperli-dorse/brands/:brandSlug/models/:modelSlug/variants/hafriyat-tipi/create-ad"
                    element={
                      <ProtectedRoute>
                        <HafriyatTipiForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/categories/damperli-dorse/brands/:brandSlug/models/:modelSlug/variants/havuz-hardox-tipi/create-ad"
                    element={
                      <ProtectedRoute>
                        <HavuzHardoxTipiForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/categories/damperli-dorse/brands/:brandSlug/models/:modelSlug/variants/kapakli-tip/create-ad"
                    element={
                      <ProtectedRoute>
                        <KapakliTipForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/categories/damperli-dorse/brands/:brandSlug/models/:modelSlug/variants/kaya-tipi/create-ad"
                    element={
                      <ProtectedRoute>
                        <KayaTipiForm />
                      </ProtectedRoute>
                    }
                  />

                  {/* Karoser Üst Yapı - Kamyon Römork Route */}
                  <Route
                    path="/categories/karoser-ustyapi/brands/:brandSlug/models/:modelSlug/variants/kamyon-romork/create-ad"
                    element={
                      <ProtectedRoute>
                        <KamyonRomorkForm />
                      </ProtectedRoute>
                    }
                  />

                  {/* Karoser Üst Yapı - Damperli Routes */}
                  <Route
                    path="/categories/karoser-ustyapi/brands/:brandSlug/models/:modelSlug/variants/kaya-tipi/create-ad"
                    element={
                      <ProtectedRoute>
                        <KaroserKayaTipiForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/categories/karoser-ustyapi/brands/:brandSlug/models/:modelSlug/variants/havuz-hardox-tipi/create-ad"
                    element={
                      <ProtectedRoute>
                        <KaroserHavuzHardoxTipiForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/categories/karoser-ustyapi/brands/:brandSlug/models/:modelSlug/variants/kapakli-tip/create-ad"
                    element={
                      <ProtectedRoute>
                        <KaroserKapakliTipForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/categories/karoser-ustyapi/brands/:brandSlug/models/:modelSlug/variants/ahsap-kasa/create-ad"
                    element={
                      <ProtectedRoute>
                        <KaroserAhsapKasaForm />
                      </ProtectedRoute>
                    }
                  />

                  {/* Karoser Üst Yapı - Sabit Kabin Routes */}
                  <Route
                    path="/categories/karoser-ustyapi/brands/:brandSlug/models/:modelSlug/variants/acik-kasa/create-ad"
                    element={
                      <ProtectedRoute>
                        <AcikKasaForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/categories/karoser-ustyapi/brands/:brandSlug/models/:modelSlug/variants/kapali-kasa/create-ad"
                    element={
                      <ProtectedRoute>
                        <KapaliKasaForm />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/categories/karoser-ustyapi/brands/:brandSlug/models/:modelSlug/variants/ozel-kasa/create-ad"
                    element={
                      <ProtectedRoute>
                        <OzelKasaForm />
                      </ProtectedRoute>
                    }
                  />

                  {/* Varyantı olmayan dorse modelleri için model seviyesinde route'lar */}
                  <Route
                    path="/categories/:categorySlug/brands/:brandSlug/models/:modelSlug/create-ad"
                    element={
                      <ProtectedRoute>
                        <VehicleFormSelector />
                      </ProtectedRoute>
                    }
                  />

                  {/* Genel route - En son fallback olarak */}
                  <Route
                    path="/categories/:categorySlug/brands/:brandSlug/models/:modelSlug/variants/:variantSlug/create-ad"
                    element={
                      <ProtectedRoute>
                        <VehicleFormSelector />
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

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="pending-ads" element={<PendingAds />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="logs" element={<AdminLogsPage />} />
                    <Route path="feedback" element={<FeedbackManagement />} />
                    {/* Diğer admin sayfaları buraya eklenecek */}
                  </Route>

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
                          <Link
                            to="/"
                            className="text-blue-600 hover:text-blue-500"
                          >
                            Ana sayfaya dön
                          </Link>
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
                          <Link
                            to="/"
                            className="text-blue-600 hover:text-blue-500"
                          >
                            Ana sayfaya dön
                          </Link>
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
