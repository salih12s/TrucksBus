import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { logoutUser } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/common';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Fade,
  Paper
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Add,
  ViewList,
  Message,
  Dashboard as DashboardIcon,
  DirectionsCar,
  Analytics
} from '@mui/icons-material';
import { CreateAdForm, MyAds } from '../components/ads';
import { MessagingSystem } from '../components/messaging';
import { AnalyticsDashboard } from '../components/analytics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'USER': return 'Bireysel Kullanıcı';
      case 'CORPORATE': return 'Kurumsal Kullanıcı';
      case 'ADMIN': return 'Yönetici';
      case 'MODERATOR': return 'Moderatör';
      default: return role || 'Kullanıcı';
    }
  };

  return (
    <>
      <SEO 
        title="Dashboard - TrucksBus"
        description="TrucksBus kullanıcı paneli. İlanlarınızı yönetin, mesajlarınızı görüntüleyin, analitik verilerinizi inceleyin."
        keywords="dashboard, kullanıcı paneli, ilan yönetimi, TrucksBus"
        url="https://trucksbus.com/dashboard"
        type="website"
      />
      <Box sx={{ flexGrow: 1 }}>
      {/* Navigation */}
      <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <DirectionsCar sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
            TrucksBus Dashboard
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Hoş geldiniz, {user?.firstName || user?.email}
            </Typography>
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account menu"
              aria-controls="user-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              TransitionComponent={Fade}
            >
              <MenuItem onClick={handleMenuClose}>
                <AccountCircle sx={{ mr: 2 }} />
                Profil
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 2 }} />
                Çıkış Yap
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {/* User Info Card */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              {user?.firstName?.charAt(0) || user?.email?.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" gutterBottom>
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip 
                  label={getRoleDisplayName(user?.role)} 
                  color="primary" 
                  size="small" 
                />
                <Chip 
                  label={user?.isVerified ? 'Doğrulanmış' : 'Doğrulanmamış'} 
                  color={user?.isVerified ? 'success' : 'warning'} 
                  size="small" 
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                E-posta: {user?.email}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Dashboard Tabs */}
        <Paper elevation={1}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            aria-label="dashboard tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<DashboardIcon />} label="Genel Bakış" />
            <Tab icon={<Add />} label="İlan Ver" />
            <Tab icon={<ViewList />} label="İlanlarım" />
            <Tab icon={<Message />} label="Mesajlar" />
            <Tab icon={<Analytics />} label="Analitik" />
          </Tabs>
          
          {/* Overview Tab */}
          <TabPanel value={currentTab} index={0}>
            <Typography variant="h4" gutterBottom>
              Genel Bakış
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 3 }}>
              <Card sx={{ minWidth: 275, flex: 1 }}>
                <CardContent>
                  <Typography variant="h5" component="div" color="primary.main">
                    Aktif İlanlar
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Yayında olan ilanlarınız
                  </Typography>
                  <Typography variant="h3" component="div">
                    0
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ minWidth: 275, flex: 1 }}>
                <CardContent>
                  <Typography variant="h5" component="div" color="secondary.main">
                    Toplam Görüntülenme
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    İlanlarınızın görüntülenme sayısı
                  </Typography>
                  <Typography variant="h3" component="div">
                    0
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ minWidth: 275, flex: 1 }}>
                <CardContent>
                  <Typography variant="h5" component="div" color="success.main">
                    Mesajlar
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Gelen mesaj sayısı
                  </Typography>
                  <Typography variant="h3" component="div">
                    0
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>
          
          {/* Create Ad Tab */}
          <TabPanel value={currentTab} index={1}>
            <CreateAdForm />
          </TabPanel>
          
          {/* My Ads Tab */}
          <TabPanel value={currentTab} index={2}>
            <MyAds />
          </TabPanel>
          
          {/* Messages Tab */}
          <TabPanel value={currentTab} index={3}>
            <MessagingSystem />
          </TabPanel>
          
          {/* Analytics Tab */}
          <TabPanel value={currentTab} index={4}>
            <AnalyticsDashboard />
          </TabPanel>
        </Paper>
      </Container>
    </Box>
    </>
  );
};

export default Dashboard;
