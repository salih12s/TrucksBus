import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Message as MessageIcon,
  Bookmark as BookmarkIcon,
  Feedback as FeedbackIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  Store as StoreIcon,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { logoutUser } from "../../store/authSlice";
import FeedbackModal from "../modals/FeedbackModal";
import NotificationDropdown from "../NotificationDropdown";

interface HeaderProps {
  favoritesCount?: number;
}

const Header: React.FC<HeaderProps> = ({ favoritesCount = 0 }) => {
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );
  const { unreadCount } = useAppSelector((state) => state.messaging);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    handleMenuClose();
    navigate("/login");
  };

  const getUserInitials = () => {
    // User bilgisi yükleniyorsa veya henüz yoksa boş döndür
    if (isLoading || !user) {
      return "";
    }

    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || "?";
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar
        sx={{
          px: 1,
          py: 0.4,
          minHeight: "64px !important",
          position: "relative",
        }}
      >
        {/* Logo - Absolute positioned */}
        <Box
          sx={{
            position: "absolute",
            left: isMobile ? 12 : isTablet ? 16 : 24, // Ortaya yaklaştır
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            zIndex: 1,
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-50%) scale(1.05)",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
            },
          }}
          onClick={() => navigate("/")}
        >
          <img
            src="/Trucksbus.png"
            alt="TrucksBus"
            style={{
              height: isMobile ? 42 : isTablet ? 52 : 62,
              marginRight: isMobile ? 6 : 12,
              transition: "all 0.3s ease",
            }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              fontSize: isMobile ? "0.9rem" : isTablet ? "1.1rem" : "1.3rem",
              marginLeft: isMobile ? 1 : 2,
              transition: "all 0.3s ease",
              display: isMobile ? "none" : "block",
            }}
          >
            <span style={{ color: "#333" }}>Alın Satın </span>
            <span style={{ color: "#D34237" }}>Trucksbus.com</span>
            <span style={{ color: "#333" }}> ile Mutlu Kalın</span>
          </Typography>
        </Box>

        {/* Right side content */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 0.3 : isTablet ? 0.5 : 0.8,
            marginLeft: "auto", // Push to right
            marginRight: isMobile ? 1 : isTablet ? 2 : 3, // Ortaya yaklaştır
            position: "relative",
            zIndex: 2,
          }}
        >
          {isAuthenticated ? (
            <>
              {/* Authenticated user toolbar */}
              <IconButton
                color="inherit"
                sx={{
                  color: "#333",
                  padding: isMobile ? "6px" : "8px",
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    color: "#D34237",
                    transform: "scale(1.1)",
                  },
                }}
                onClick={() => navigate("/messages")}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <MessageIcon sx={{ fontSize: isMobile ? 22 : 24 }} />
                </Badge>
              </IconButton>

              <NotificationDropdown />

              <IconButton
                color="inherit"
                sx={{
                  color: "#333",
                  padding: isMobile ? "6px" : "8px",
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    color: "#D34237",
                    transform: "scale(1.1)",
                  },
                }}
                onClick={() => navigate("/bookmarks")}
              >
                <Badge
                  badgeContent={favoritesCount}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#D34237",
                      color: "white",
                    },
                  }}
                >
                  <BookmarkIcon sx={{ fontSize: isMobile ? 22 : 24 }} />
                </Badge>
              </IconButton>

              <IconButton
                color="inherit"
                sx={{
                  color: "#333",
                  padding: isMobile ? "6px" : "8px",
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    color: "#D34237",
                    transform: "scale(1.1)",
                  },
                }}
                onClick={() => setFeedbackModalOpen(true)}
              >
                <FeedbackIcon sx={{ fontSize: isMobile ? 22 : 24 }} />
              </IconButton>

              {/* Post Ad button - responsive */}
              <Button
                variant="contained"
                component={RouterLink}
                to="/category-selection"
                sx={{
                  backgroundColor: "#D34237",
                  color: "white",
                  ml: 1,
                  fontSize: isMobile ? "0.75rem" : "0.85rem",
                  padding: isMobile ? "6px 12px" : "8px 16px",
                  minWidth: isMobile ? "auto" : "70px",
                  minHeight: isMobile ? "32px" : "36px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#B73429",
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 12px rgba(211, 66, 55, 0.3)",
                  },
                }}
              >
                {isMobile ? "İlan" : "İlan Ver"}
              </Button>

              {/* User Avatar */}
              {(user || isLoading) && (
                <IconButton
                  onClick={handleAvatarClick}
                  sx={{
                    ml: 1,
                    padding: "6px",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "#D34237",
                      width: isMobile ? 32 : 36,
                      height: isMobile ? 32 : 36,
                      fontSize: isMobile ? "0.8rem" : "0.9rem",
                      boxShadow: "0 2px 8px rgba(211, 66, 55, 0.3)",
                    }}
                  >
                    {isLoading ? "..." : getUserInitials()}
                  </Avatar>
                </IconButton>
              )}

              {/* User Menu */}
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
                sx={{ mt: 1 }}
              >
                {/* User info header */}
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>

                <Divider />

                {/* Menu items */}
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/profile");
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profil</ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/my-ads");
                  }}
                >
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>İlanlarım</ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/doping");
                  }}
                >
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Doping</ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/messages");
                  }}
                >
                  <ListItemIcon>
                    <MessageIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mesajlarım</ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/complaints");
                  }}
                >
                  <ListItemIcon>
                    <FeedbackIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Şikayetlerim</ListItemText>
                </MenuItem>

                {/* Corporate users get extra menu item */}
                {user?.role === "CORPORATE" && (
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate("/store");
                    }}
                  >
                    <ListItemIcon>
                      <StoreIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Dükkanım</ListItemText>
                  </MenuItem>
                )}

                <Divider />

                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Çıkış Yap</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              {/* Non-authenticated user buttons */}
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                sx={{
                  color: "#333",
                  fontSize: "12px",
                  fontWeight: 500,
                  padding: "4px 8px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.05)",
                  },
                }}
              >
                Giriş Yap / Üye Ol
              </Button>

              <Button
                variant="contained"
                component={RouterLink}
                to="/category-selection"
                sx={{
                  backgroundColor: "#fdeaea",
                  color: "#dc3545",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "4px 12px",
                  textTransform: "none",
                  ml: 0.5,
                  borderRadius: "4px",
                  border: "1px solid #dc3545",
                  "&:hover": {
                    backgroundColor: "#f8d7da",
                  },
                }}
              >
                Ücretsiz İlan Ver
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />
    </AppBar>
  );
};

export default Header;
