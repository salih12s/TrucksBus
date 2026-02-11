import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  HourglassEmpty as HourglassIcon,
  Report as ReportIcon,
  Feedback as FeedbackIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Home as HomeManageIcon,
  AccountCircle,
  ExitToApp,
  Refresh,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { logoutUser } from "../../store/authSlice";

const drawerWidth = 280;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
  {
    text: "Anasayfa Yönetimi",
    icon: <HomeManageIcon />,
    path: "/admin/homepage",
  },
  { text: "Tüm İlanlar", icon: <AssignmentIcon />, path: "/admin/all-ads" },
  {
    text: "Onay Bekleyen İlanlar",
    icon: <HourglassIcon />,
    path: "/admin/pending-ads",
  },
  { text: "Şikayet Yönetimi", icon: <ReportIcon />, path: "/admin/complaints" },
  {
    text: "Geri Bildirim Yönetimi",
    icon: <FeedbackIcon />,
    path: "/admin/feedback",
  },
  { text: "Kullanıcılar", icon: <PeopleIcon />, path: "/admin/users" },
  { text: "Activity Logs", icon: <SecurityIcon />, path: "/admin/logs" },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Admin kontrolü
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Giriş yapmamış veya admin değilse anasayfaya yönlendir
    if (!isAuthenticated || user?.role !== "ADMIN") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = useCallback(async () => {
    try {
      // Redux üzerinden logout işlemi
      await dispatch(logoutUser()).unwrap();
      // LocalStorage'ı temizle
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Login sayfasına yönlendir
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Hata olsa bile çıkış yap
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    }
  }, [dispatch, navigate]);

  // Admin session timeout (30 dakika)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(
        () => {
          alert("Oturum süreniz doldu. Güvenlik için çıkış yapılıyor.");
          handleLogout();
        },
        30 * 60 * 1000,
      ); // 30 dakika
    };

    const handleActivity = () => {
      resetTimeout();
    };

    // Initial timeout
    resetTimeout();

    // Event listeners for user activity
    document.addEventListener("mousedown", handleActivity);
    document.addEventListener("keydown", handleActivity);
    document.addEventListener("scroll", handleActivity);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleActivity);
      document.removeEventListener("keydown", handleActivity);
      document.removeEventListener("scroll", handleActivity);
    };
  }, [handleLogout]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          width: { xs: 0, md: drawerWidth },
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#0F2027",
            color: "white",
          },
        }}
      >
        {/* Admin Panel Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
            Admin Panel
          </Typography>
        </Box>

        {/* Menu Items */}
        <List sx={{ mt: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                selected={location.pathname === item.path}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  "&.Mui-selected": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.15)",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontSize: "0.9rem",
                      fontWeight:
                        location.pathname === item.path ? "bold" : "normal",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#f5f5f5",
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {/* Top Header */}
        <AppBar
          position="sticky"
          elevation={1}
          sx={{
            backgroundColor: "#0F2027",
            zIndex: (theme) => theme.zIndex.drawer - 1,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ color: "white" }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  fontSize: { xs: "1rem", md: "1.25rem" },
                }}
              >
                TruckBus Admin
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                color="inherit"
                onClick={refreshPage}
                sx={{ color: "white" }}
              >
                <Refresh />
              </IconButton>

              <IconButton
                color="inherit"
                onClick={handleMenuClick}
                sx={{ color: "white" }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  <AccountCircle />
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToApp fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Çıkış Yap</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
