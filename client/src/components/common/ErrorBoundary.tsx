import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Stack,
  Divider,
} from "@mui/material";
import { ErrorOutline, Refresh, Home, BugReport } from "@mui/icons-material";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service (e.g., Sentry)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, send this to your error monitoring service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Example: Send to monitoring service
    // Sentry.captureException(error, { extra: errorData });
    console.error("Error logged:", errorData);
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleReportBug = () => {
    const subject = encodeURIComponent("TrucksBus Platform - Hata Raporu");
    const body = encodeURIComponent(`
Hata Detayları:
- Mesaj: ${this.state.error?.message || "Bilinmeyen hata"}
- Zaman: ${new Date().toISOString()}
- Sayfa: ${window.location.href}
- Tarayıcı: ${navigator.userAgent}

Lütfen hatayı yeniden oluşturmak için gereken adımları açıklayın:
1. 
2. 
3. 

Ek bilgiler:

    `);

    window.open(
      `mailto:iletisim@trucksbus.com.tr?subject=${subject}&body=${body}`,
    );
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.50",
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 600,
              width: "100%",
              p: 4,
              textAlign: "center",
            }}
          >
            <ErrorOutline
              sx={{
                fontSize: 80,
                color: "error.main",
                mb: 2,
              }}
            />

            <Typography variant="h4" gutterBottom color="error">
              Bir Hata Oluştu
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              Üzgünüz, beklenmeyen bir hata oluştu. Bu durum geliştiricilerimize
              otomatik olarak bildirildi.
            </Typography>

            <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
              <AlertTitle>Hata Detayları</AlertTitle>
              <Typography variant="body2" component="div">
                <strong>Mesaj:</strong>{" "}
                {this.state.error?.message || "Bilinmeyen hata"}
              </Typography>
              <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                <strong>Zaman:</strong> {new Date().toLocaleString("tr-TR")}
              </Typography>
            </Alert>

            <Stack
              spacing={2}
              direction={{ xs: "column", sm: "row" }}
              justifyContent="center"
            >
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReload}
                size="large"
              >
                Sayfayı Yenile
              </Button>

              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={this.handleGoHome}
                size="large"
              >
                Ana Sayfaya Git
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Button
              variant="text"
              startIcon={<BugReport />}
              onClick={this.handleReportBug}
              size="small"
              color="inherit"
            >
              Hata Bildir
            </Button>

            {/* Development mode: Show error details */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <Box sx={{ mt: 3, textAlign: "left" }}>
                <Typography variant="h6" gutterBottom>
                  Geliştirici Bilgileri:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: "grey.100",
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    maxHeight: 200,
                    overflow: "auto",
                  }}
                >
                  <Typography variant="body2" component="pre">
                    {this.state.error.stack}
                  </Typography>

                  {this.state.errorInfo && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" component="pre">
                        {this.state.errorInfo.componentStack}
                      </Typography>
                    </>
                  )}
                </Paper>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
