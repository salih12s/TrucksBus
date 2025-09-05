import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert
} from '@mui/material';
import {
  GetApp,
  Smartphone,
  CloudOff,
  Notifications,
  Speed,
  Storage,
  Close
} from '@mui/icons-material';
import { usePWA, useNetworkStatus } from '../utils/pwa';

interface PWAInstallButtonProps {
  variant?: 'button' | 'fab' | 'chip';
  size?: 'small' | 'medium' | 'large';
  showFeatures?: boolean;
}

const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  size = 'medium',
  showFeatures = true
}) => {
  const [open, setOpen] = React.useState(false);
  const [installing, setInstalling] = React.useState(false);
  
  const {
    isInstallable,
    updateAvailable,
    notificationPermission,
    installApp,
    updateApp,
    requestNotifications
  } = usePWA();

  const { isOnline, connectionType } = useNetworkStatus();

  const handleInstall = async () => {
    if (!isInstallable) return;

    setInstalling(true);
    try {
      const installed = await installApp();
      if (installed) {
        setOpen(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setInstalling(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateApp();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleNotificationRequest = async () => {
    try {
      await requestNotifications();
    } catch (error) {
      console.error('Notification request failed:', error);
    }
  };

  // Don't show if not installable and no update available
  if (!isInstallable && !updateAvailable) {
    return null;
  }

  const features = [
    {
      icon: <CloudOff color="primary" />,
      title: 'Çevrimdışı Kullanım',
      description: 'İnternet olmadan da bazı özellikleri kullanabilirsiniz'
    },
    {
      icon: <Speed color="primary" />,
      title: 'Hızlı Başlatma',
      description: 'Uygulama anında açılır, tarayıcı gecikmesi yok'
    },
    {
      icon: <Notifications color="primary" />,
      title: 'Anlık Bildirimler',
      description: 'Yeni mesajlar ve güncellemeler için bildirim alın'
    },
    {
      icon: <Storage color="primary" />,
      title: 'Otomatik Güncelleme',
      description: 'Uygulama kendini otomatik olarak günceller'
    }
  ];

  const renderButton = () => {
    if (updateAvailable) {
      return (
        <Button
          variant="contained"
          color="warning"
          size={size}
          onClick={handleUpdate}
          startIcon={<GetApp />}
        >
          Güncelle
        </Button>
      );
    }

    if (variant === 'chip') {
      return (
        <Chip
          label="Uygulamayı Yükle"
          color="primary"
          onClick={() => setOpen(true)}
          icon={<GetApp />}
          clickable
        />
      );
    }

    return (
      <Button
        variant={variant === 'fab' ? 'contained' : 'outlined'}
        color="primary"
        size={size}
        onClick={() => setOpen(true)}
        startIcon={<GetApp />}
        sx={variant === 'fab' ? {
          position: 'fixed',
          bottom: 16,
          right: 16,
          borderRadius: '50px',
          minWidth: 'auto',
          padding: 2
        } : {}}
      >
        {variant === 'fab' ? '' : 'Uygulamayı Yükle'}
      </Button>
    );
  };

  return (
    <>
      {renderButton()}
      
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          <Smartphone color="primary" />
          TrucksBus Uygulamasını Yükle
          <Box sx={{ ml: 'auto' }}>
            <Button
              onClick={() => setOpen(false)}
              size="small"
              sx={{ minWidth: 'auto', p: 0.5 }}
            >
              <Close />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              TrucksBus'ı cihazınıza yükleyerek daha iyi bir deneyim yaşayın!
            </Typography>
            
            {!isOnline && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Şu anda çevrimdışısınız. Uygulama yüklendikten sonra çevrimdışı özellikleri kullanabilirsiniz.
              </Alert>
            )}

            {connectionType === 'slow-2g' || connectionType === '2g' ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Yavaş bağlantı tespit edildi. Uygulama yüklendikten sonra daha hızlı çalışacak.
              </Alert>
            ) : null}
          </Box>

          {showFeatures && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Uygulama Özellikleri:
              </Typography>
              <List dense>
                {features.map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {feature.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={feature.title}
                      secondary={feature.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {notificationPermission === 'default' && (
            <Box sx={{ mt: 2 }}>
              <Alert 
                severity="info" 
                action={
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={handleNotificationRequest}
                  >
                    İzin Ver
                  </Button>
                }
              >
                Bildirimler için izin vermeyi unutmayın!
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setOpen(false)}
            color="inherit"
          >
            Daha Sonra
          </Button>
          <Button
            onClick={handleInstall}
            variant="contained"
            disabled={installing || !isInstallable}
            startIcon={installing ? null : <GetApp />}
            sx={{ minWidth: 120 }}
          >
            {installing ? 'Yükleniyor...' : 'Şimdi Yükle'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PWAInstallButton;
