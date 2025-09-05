import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'
import './index.css'
import App from './App.tsx'

// Web Vitals reporting  
const reportWebVitals = () => {
  if (process.env.NODE_ENV === 'production') {
    onCLS((metric) => {
      console.log('CLS:', metric);
      // Analytics'e gönder
    });
    onINP((metric) => {
      console.log('INP:', metric);
      // Analytics'e gönder
    });
    onFCP((metric) => {
      console.log('FCP:', metric);
      // Analytics'e gönder
    });
    onLCP((metric) => {
      console.log('LCP:', metric);
      // Analytics'e gönder
    });
    onTTFB((metric) => {
      console.log('TTFB:', metric);
      // Analytics'e gönder
    });
  }
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)

// Report web vitals
reportWebVitals();
