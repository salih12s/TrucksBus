// import { StrictMode } from 'react' // ❌ DISABLED
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { onCLS, onINP, onFCP, onLCP, onTTFB } from "web-vitals";
import "./index.css";
import "./i18n/config"; // i18n yapılandırması
import App from "./App.tsx";
import { setupChunkErrorHandler } from "./utils/chunkErrorHandler";

// Web Vitals reporting
const reportWebVitals = () => {
  if (process.env.NODE_ENV === "production") {
    onCLS((metric) => {
      console.log("CLS:", metric);
      // Analytics'e gönder
    });
    onINP((metric) => {
      console.log("INP:", metric);
      // Analytics'e gönder
    });
    onFCP((metric) => {
      console.log("FCP:", metric);
      // Analytics'e gönder
    });
    onLCP((metric) => {
      console.log("LCP:", metric);
      // Analytics'e gönder
    });
    onTTFB((metric) => {
      console.log("TTFB:", metric);
      // Analytics'e gönder
    });
  }
};

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

createRoot(document.getElementById("root")!).render(
  // <StrictMode> {/* ❌ DISABLED - Causes double network requests */}
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
  // </StrictMode>
);

// Setup chunk error handler
setupChunkErrorHandler();

// Report web vitals
reportWebVitals();
