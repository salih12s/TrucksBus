import React from 'react';
import {
  Box,
  Chip,
  Snackbar,
  Alert,
  AlertTitle,
  Button,
  Typography,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Wifi,
  WifiOff,
  CloudOff,
  CloudDone,
  Update,
  Close,
  ExpandMore,
  ExpandLess,
  NetworkCheck
} from '@mui/icons-material';
import { usePWA, useNetworkStatus } from '../../utils/pwa';

const PWAStatus: React.FC = () => {
  const [showDetails, setShowDetails] = React.useState(false);
  const [updateDismissed, setUpdateDismissed] = React.useState(false);
  
  const {
    updateAvailable,
    notificationPermission,
    updateApp
  } = usePWA();

  const { isOnline, connectionType, isSlowConnection } = useNetworkStatus();

  const handleUpdate = async () => {
    try {
      await updateApp();
      setUpdateDismissed(true);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const getConnectionIcon = () => {
    if (!isOnline) return <WifiOff color="error" />;
    if (isSlowConnection) return <NetworkCheck color="warning" />;
    return <Wifi color="success" />;
  };

  const getConnectionText = () => {
    if (!isOnline) return 'Çevrimdışı';
    if (isSlowConnection) return `Yavaş (${connectionType})`;
    return `Çevrimiçi (${connectionType})`;
  };

  const getConnectionColor = (): 'error' | 'warning' | 'success' => {
    if (!isOnline) return 'error';
    if (isSlowConnection) return 'warning';
    return 'success';
  };

  return (
    <>
      {/* Update Available Snackbar */}
      <Snackbar
        open={updateAvailable && !updateDismissed}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert 
          severity="info"
          variant="filled"
          action={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button 
                color="inherit" 
                size="small"
                onClick={handleUpdate}
                startIcon={<Update />}
              >
                Güncelle
              </Button>
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setUpdateDismissed(true)}
              >
                <Close />
              </IconButton>
            </Box>
          }
        >
          <AlertTitle>Yeni Sürüm Mevcut</AlertTitle>
          TrucksBus uygulamasının yeni bir sürümü var. Güncellemek ister misiniz?
        </Alert>
      </Snackbar>

      {/* Connection Status - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            zIndex: 1300,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider'
          }}
        >
          <Box
            sx={{
              p: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' }
            }}
            onClick={() => setShowDetails(!showDetails)}
          >
            {getConnectionIcon()}
            <Typography variant="body2" fontSize="0.75rem">
              {getConnectionText()}
            </Typography>
            {showDetails ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </Box>
          
          <Collapse in={showDetails}>
            <Box sx={{ p: 2, pt: 0, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                PWA Status
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={getConnectionIcon()}
                    label={getConnectionText()}
                    size="small"
                    color={getConnectionColor()}
                    variant="outlined"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={isOnline ? <CloudDone /> : <CloudOff />}
                    label={isOnline ? 'Senkron' : 'Offline Mode'}
                    size="small"
                    color={isOnline ? 'success' : 'warning'}
                    variant="outlined"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`Bildirimler: ${
                      notificationPermission === 'granted' ? 'Açık' :
                      notificationPermission === 'denied' ? 'Kapalı' : 'Bekliyor'
                    }`}
                    size="small"
                    color={
                      notificationPermission === 'granted' ? 'success' :
                      notificationPermission === 'denied' ? 'error' : 'warning'
                    }
                    variant="outlined"
                  />
                </Box>

                {updateAvailable && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={<Update />}
                      label="Güncelleme Mevcut"
                      size="small"
                      color="info"
                      variant="outlined"
                      onClick={handleUpdate}
                      clickable
                    />
                  </Box>
                )}
              </Box>
              
              <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
                {isOnline ? 'Tüm özellikler kullanılabilir' : 'Sınırlı özellikler mevcut'}
              </Typography>
            </Box>
          </Collapse>
        </Box>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            py: 1,
            px: 2,
            textAlign: 'center',
            zIndex: 1400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          <WifiOff fontSize="small" />
          <Typography variant="body2">
            İnternet bağlantısı yok - Çevrimdışı modda çalışıyorsunuz
          </Typography>
        </Box>
      )}
    </>
  );
};

export default PWAStatus;
