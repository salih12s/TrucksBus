import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor, type RootState, type AppDispatch } from "./store";
import { getCurrentUser, clearCredentials } from "./store/authSlice";
import { fetchUnreadCount } from "./store/messagingSlice";
import { getTokenFromStorage } from "./utils/tokenUtils";
import socketService, { SocketService } from "./services/socketService";

// Components
import {
  ErrorBoundary,
  PerformanceMonitor,
  LoadingScreen,
  SplashScreen,
} from "./components/common";
import { PWAStatus } from "./components/pwa";
import { ProtectedRoute } from "./components/auth";

// Pages - Lazy loaded for better performance
const MainLayout = React.lazy(() => import("./pages/MainLayout"));
const AdDetail = React.lazy(() => import("./pages/AdDetail"));
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

// Oto Kurtarıcı ve Taşıyıcı Forms
const TekliAracForm = React.lazy(
  () => import("./components/forms/OtoKurtariciTasiyici/TekliAracForm")
);
const CokluAracForm = React.lazy(
  () => import("./components/forms/OtoKurtariciTasiyici/CokluAracForm")
);

// Dorse Alt Kategoriler
const SilobasForm = React.lazy(
  () => import("./components/forms/Silobas/SilobasForm")
);
const TankerForm = React.lazy(
  () => import("./components/forms/Tanker/TankerForm")
);
const TekstilForm = React.lazy(
  () => import("./components/forms/Tekstil/TekstilForm")
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
const MessagingSystem = React.lazy(
  () => import("./components/messaging/MessagingSystemNew")
);
const AnalyticsDashboard = React.lazy(
  () => import("./components/analytics/AnalyticsDashboard")
);

// Legal Pages
const PrivacyPolicy = React.lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./pages/legal/TermsOfService"));
const KVKK = React.lazy(() => import("./pages/legal/KVKK"));
const ContractsAndRules = React.lazy(
  () => import("./pages/legal/ContractsAndRules")
);
const AccountAgreement = React.lazy(
  () => import("./pages/legal/AccountAgreement")
);
const UsageConditions = React.lazy(
  () => import("./pages/legal/UsageConditions")
);
const PersonalDataProtection = React.lazy(
  () => import("./pages/legal/PersonalDataProtection")
);
const CookiePolicy = React.lazy(() => import("./pages/legal/CookiePolicy"));
const HelpGuide = React.lazy(() => import("./pages/legal/HelpGuide"));

// Admin Components
const AdminLayout = React.lazy(() => import("./admin/components/AdminLayout"));
const AdminDashboard = React.lazy(() => import("./admin/pages/AdminDashboard"));
const PendingAds = React.lazy(() => import("./admin/pages/PendingAds"));
const UsersPage = React.lazy(() => import("./admin/pages/UsersPage"));
const AdminLogsPage = React.lazy(() => import("./admin/pages/AdminLogsPage"));
const FeedbackManagement = React.lazy(
  () => import("./admin/pages/FeedbackManagement")
);
const ComplaintManagement = React.lazy(
  () => import("./admin/pages/ComplaintManagement")
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

// Enhanced Loading component
const LoadingFallback = ({
  message = "Yükleniyor...",
  subMessage = "İçerik hazırlanıyor...",
}: {
  message?: string;
  subMessage?: string;
}) => <LoadingScreen message={message} subMessage={subMessage} />;

function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Token geçerli mi kontrol et
        const validToken = getTokenFromStorage();

        if (!validToken && token) {
          // Token expired ise store'u temizle
          dispatch(clearCredentials());
          setIsInitialized(true);
          return;
        }

        // Token varsa ve user yoksa getCurrentUser çağır
        // (Eğer localStorage'dan user yüklenmediyse)
        if (token && !user && isAuthenticated) {
          const result = await dispatch(getCurrentUser());

          // Eğer getCurrentUser başarısız olursa (token expire vb.) logout yap
          if (getCurrentUser.rejected.match(result)) {
            console.log("Token expired or invalid, clearing credentials...");
            dispatch(clearCredentials());
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Hata durumunda credentials'ları temizle
        dispatch(clearCredentials());
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch, token, user, isAuthenticated]);

  // Initialize socket connection and messaging when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id && isInitialized) {
      // Connect to socket
      socketService.connect(user.id);

      // Fetch initial unread count
      dispatch(fetchUnreadCount());

      // Request notification permission
      SocketService.requestNotificationPermission();

      return () => {
        // Disconnect socket when component unmounts or user logs out
        socketService.disconnect();
      };
    } else if (!isAuthenticated && isInitialized) {
      // Disconnect socket when user logs out
      socketService.disconnect();
    }
  }, [isAuthenticated, user?.id, isInitialized, dispatch]);

  // Eğer henüz initialize olmadıysa loading göster
  if (!isInitialized) {
    return (
      <LoadingScreen
        message="TrucksBus'a Hoş Geldiniz"
        subMessage="Sistem hazırlanıyor..."
      />
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <SplashScreen duration={2000}>
      <Provider store={store}>
        <PersistGate
          loading={
            <LoadingFallback
              message="TrucksBus'a Hoş Geldiniz"
              subMessage="Verileriniz yükleniyor..."
            />
          }
          persistor={persistor}
        >
          <AuthProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <ErrorBoundary>
                <Router>
                  <div className="min-h-screen bg-gray-50">
                    <React.Suspense
                      fallback={
                        <LoadingFallback
                          message="Sayfa Yükleniyor"
                          subMessage="İçerik hazırlanıyor..."
                        />
                      }
                    >
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<MainLayout />} />
                        <Route path="/contact" element={<MainLayout />} />
                        <Route path="/about" element={<MainLayout />} />

                        {/* Avatar Menu Pages - Protected but handled in MainLayout */}
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <MainLayout />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/my-ads"
                          element={
                            <ProtectedRoute>
                              <MainLayout />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/doping"
                          element={
                            <ProtectedRoute>
                              <MainLayout />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/messages"
                          element={
                            <ProtectedRoute>
                              <MainLayout />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/complaints"
                          element={
                            <ProtectedRoute>
                              <MainLayout />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/store"
                          element={
                            <ProtectedRoute>
                              <MainLayout />
                            </ProtectedRoute>
                          }
                        />

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

                        {/* Oto Kurtarıcı ve Taşıyıcı Form Routes */}
                        <Route
                          path="/categories/oto-kurtarici-tasiyici/brands/:brandSlug/models/:modelSlug/variants/tekli-arac/create-ad"
                          element={
                            <ProtectedRoute>
                              <TekliAracForm />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/categories/oto-kurtarici-tasiyici/brands/:brandSlug/models/:modelSlug/variants/coklu-arac/create-ad"
                          element={
                            <ProtectedRoute>
                              <CokluAracForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Alternative route patterns for oto-kurtarici */}
                        <Route
                          path="/categories/oto-kurtarici/brands/:brandSlug/models/:modelSlug/variants/tekli-arac/create-ad"
                          element={
                            <ProtectedRoute>
                              <TekliAracForm />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/categories/oto-kurtarici/brands/:brandSlug/models/:modelSlug/variants/coklu-arac/create-ad"
                          element={
                            <ProtectedRoute>
                              <CokluAracForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Alternative route patterns for tasiyici */}
                        <Route
                          path="/categories/tasiyici/brands/:brandSlug/models/:modelSlug/variants/tekli-arac/create-ad"
                          element={
                            <ProtectedRoute>
                              <TekliAracForm />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/categories/tasiyici/brands/:brandSlug/models/:modelSlug/variants/coklu-arac/create-ad"
                          element={
                            <ProtectedRoute>
                              <CokluAracForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Dorse Form Routes - Damperli Marka Routes */}
                        <Route
                          path="/categories/dorse/brands/damperli/models/hafriyat-tipi/variants/:variantSlug/create-ad"
                          element={
                            <ProtectedRoute>
                              <HafriyatTipiForm />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/categories/dorse/brands/damperli/models/havuz-hardox-tipi/variants/:variantSlug/create-ad"
                          element={
                            <ProtectedRoute>
                              <HavuzHardoxTipiForm />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/categories/dorse/brands/damperli/models/kapakli-tip/variants/:variantSlug/create-ad"
                          element={
                            <ProtectedRoute>
                              <KapakliTipForm />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/categories/dorse/brands/damperli/models/kaya-tipi/variants/:variantSlug/create-ad"
                          element={
                            <ProtectedRoute>
                              <KayaTipiForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Generic dorse routes for other brands */}
                        <Route
                          path="/categories/dorse/brands/:brandSlug/models/:modelSlug/variants/hafriyat-tipi/create-ad"
                          element={
                            <ProtectedRoute>
                              <HafriyatTipiForm />
                            </ProtectedRoute>
                          }
                        />
                        {/* Database slug için alternatif route */}
                        <Route
                          path="/categories/dorse/brands/:brandSlug/models/:modelSlug/variants/hafriyat-tip/create-ad"
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
                        {/* Database slug için alternatif route */}
                        <Route
                          path="/categories/dorse/brands/:brandSlug/models/:modelSlug/variants/havuzhardox-tip/create-ad"
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
                        {/* Database slug için alternatif route */}
                        <Route
                          path="/categories/dorse/brands/:brandSlug/models/:modelSlug/variants/kapakl-tip/create-ad"
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
                        {/* Database slug için alternatif route */}
                        <Route
                          path="/categories/dorse/brands/:brandSlug/models/:modelSlug/variants/kaya-tip/create-ad"
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

                        {/* Dorse Alt Kategoriler - Silobas, Tanker, Tekstil */}
                        <Route
                          path="/categories/dorse/brands/:brandSlug/models/:modelSlug/variants/silobas/create-ad"
                          element={
                            <ProtectedRoute>
                              <SilobasForm />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/categories/dorse/brands/:brandSlug/models/:modelSlug/variants/tanker/create-ad"
                          element={
                            <ProtectedRoute>
                              <TankerForm />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/categories/dorse/brands/:brandSlug/models/:modelSlug/variants/tekstil/create-ad"
                          element={
                            <ProtectedRoute>
                              <TekstilForm />
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
                        {/* Kaya Tipi - hem kaya-tipi hem kaya-tipi variant'larını destekle */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/damperli/models/:modelSlug/variants/kaya-tipi/create-ad"
                          element={
                            <ProtectedRoute>
                              <KaroserKayaTipiForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/categories/karoser-ustyapi/brands/damperli/models/:modelSlug/variants/kaya-tipi/create-ad"
                          element={
                            <ProtectedRoute>
                              <KaroserKayaTipiForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Havuz Hardox Tipi */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/damperli/models/:modelSlug/variants/havuz-hardox-tipi/create-ad"
                          element={
                            <ProtectedRoute>
                              <KaroserHavuzHardoxTipiForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/categories/karoser-ustyapi/brands/damperli/models/:modelSlug/variants/havuz-hardox-tipi/create-ad"
                          element={
                            <ProtectedRoute>
                              <KaroserHavuzHardoxTipiForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Kapaklı Tip */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/damperli/models/:modelSlug/variants/kapakli-tip/create-ad"
                          element={
                            <ProtectedRoute>
                              <KaroserKapakliTipForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/categories/karoser-ustyapi/brands/damperli/models/:modelSlug/variants/kapakli-tip/create-ad"
                          element={
                            <ProtectedRoute>
                              <KaroserKapakliTipForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Ahşap Kasa */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/damperli/models/:modelSlug/variants/ahsap-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <KaroserAhsapKasaForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/categories/karoser-ustyapi/brands/damperli/models/:modelSlug/variants/ahsap-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <KaroserAhsapKasaForm />
                            </ProtectedRoute>
                          }
                        />
                        {/* damperli-grup brand slug'ı ve ahşap-kasa model slug'ı için özel route'lar */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/damperli-grup/models/ahşap-kasa/variants/ahşap-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <KaroserAhsapKasaForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/categories/karoser-ustyapi/brands/damperli-grup/models/ahşap-kasa/variants/ahşap-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <KaroserAhsapKasaForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* karoser-ustyapi pattern'i için Sabit Kabin route'ları */}
                        {/* Açık Kasa */}
                        <Route
                          path="/categories/karoser-ustyapi/brands/sabit-kabin/models/:modelSlug/variants/acik-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <AcikKasaForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/categories/karoser-ustyapi/brands/sabit-kabin/models/:modelSlug/variants/ak-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <AcikKasaForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Kapalı Kasa */}
                        <Route
                          path="/categories/karoser-ustyapi/brands/sabit-kabin/models/:modelSlug/variants/kapali-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <KapaliKasaForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/categories/karoser-ustyapi/brands/sabit-kabin/models/:modelSlug/variants/kk-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <KapaliKasaForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/categories/karoser-ustyapi/brands/sabit-kabin/models/kapal-kasa/variants/kapal-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <KapaliKasaForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Özel Kasa */}
                        <Route
                          path="/categories/karoser-ustyapi/brands/sabit-kabin/models/:modelSlug/variants/ozel-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <OzelKasaForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/categories/karoser-ustyapi/brands/sabit-kabin/models/:modelSlug/variants/oz-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <OzelKasaForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/categories/karoser-ustyapi/brands/sabit-kabin/models/zel-kasa/variants/zel-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <OzelKasaForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Karoser Üst Yapı - Sabit Kabin Routes */}
                        {/* Açık Kasa - hem acik-kasa hem ak-kasa variant'larını destekle */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/sabit-kabin/models/:modelSlug/variants/acik-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <AcikKasaForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/categories/karoser-ust-yapi/brands/sabit-kabin/models/:modelSlug/variants/ak-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <AcikKasaForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Kapalı Kasa - hem kapali-kasa hem kk-kasa variant'larını destekle */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/sabit-kabin/models/:modelSlug/variants/kapali-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <KapaliKasaForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/categories/karoser-ust-yapi/brands/sabit-kabin/models/:modelSlug/variants/kk-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <KapaliKasaForm />
                            </ProtectedRoute>
                          }
                        />
                        {/* kapal-kasa model slug'ı için özel route */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/sabit-kabin/models/kapal-kasa/variants/kapal-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <KapaliKasaForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Özel Kasa - hem ozel-kasa hem oz-kasa variant'larını destekle */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/sabit-kabin/models/:modelSlug/variants/ozel-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <OzelKasaForm />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/categories/karoser-ust-yapi/brands/sabit-kabin/models/:modelSlug/variants/oz-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <OzelKasaForm />
                            </ProtectedRoute>
                          }
                        />
                        {/* zel-kasa model slug'ı için özel route */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/sabit-kabin/models/zel-kasa/variants/zel-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <OzelKasaForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Karoser Üst Yapı - Damperli Brand Route'ları */}
                        {/* Ahşap Kasa (ahap-kasa - Türkçe karakter olmadan) */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/damperli-grup/models/ahap-kasa/variants/ahap-kasa/create-ad"
                          element={
                            <ProtectedRoute>
                              <KaroserAhsapKasaForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Hafriyat Tipi */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/damperli-grup/models/hafriyat-tipi/variants/hafriyat-tipi/create-ad"
                          element={
                            <ProtectedRoute>
                              <HafriyatTipiForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Havuz Hardox Tipi (havuzhardox-tipi - tek kelime) */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/damperli-grup/models/havuzhardox-tipi/variants/havuzhardox-tipi/create-ad"
                          element={
                            <ProtectedRoute>
                              <KaroserHavuzHardoxTipiForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Kapaklı Tip */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/damperli-grup/models/kapakli-tip/variants/kapakli-tip/create-ad"
                          element={
                            <ProtectedRoute>
                              <KaroserKapakliTipForm />
                            </ProtectedRoute>
                          }
                        />

                        {/* Kaya Tipi */}
                        <Route
                          path="/categories/karoser-ust-yapi/brands/damperli-grup/models/kaya-tipi/variants/kaya-tipi/create-ad"
                          element={
                            <ProtectedRoute>
                              <KaroserKayaTipiForm />
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

                        {/* Legal Pages */}
                        <Route
                          path="/privacy-policy"
                          element={<PrivacyPolicy />}
                        />
                        <Route
                          path="/terms-of-service"
                          element={<TermsOfService />}
                        />
                        <Route path="/kvkk" element={<KVKK />} />
                        <Route
                          path="/contracts-and-rules"
                          element={<ContractsAndRules />}
                        />
                        <Route
                          path="/account-agreement"
                          element={<AccountAgreement />}
                        />
                        <Route
                          path="/usage-conditions"
                          element={<UsageConditions />}
                        />
                        <Route
                          path="/personal-data-protection"
                          element={<PersonalDataProtection />}
                        />
                        <Route
                          path="/cookie-policy"
                          element={<CookiePolicy />}
                        />
                        <Route path="/help-guide" element={<HelpGuide />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminLayout />}>
                          <Route index element={<AdminDashboard />} />
                          <Route path="pending-ads" element={<PendingAds />} />
                          <Route path="users" element={<UsersPage />} />
                          <Route path="logs" element={<AdminLogsPage />} />
                          <Route
                            path="feedback"
                            element={<FeedbackManagement />}
                          />
                          <Route
                            path="complaints"
                            element={<ComplaintManagement />}
                          />
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
                    {process.env.NODE_ENV === "development" && (
                      <PerformanceMonitor />
                    )}

                    {/* PWA Status */}
                    <PWAStatus />
                  </div>
                </Router>
              </ErrorBoundary>
            </ThemeProvider>
          </AuthProvider>
        </PersistGate>
      </Provider>
    </SplashScreen>
  );
}

export default App;
