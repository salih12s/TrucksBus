import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useSiteSettings } from "../../hooks/useSiteSettings";
import { logoutUser } from "../../store/authSlice";
import FeedbackModal from "../modals/FeedbackModal";
import NotificationDropdown from "../NotificationDropdown";
import LanguageSwitcher from "../common/LanguageSwitcher";

interface HeaderProps {
  favoritesCount?: number;
}

const Header: React.FC<HeaderProps> = ({ favoritesCount = 0 }) => {
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const { t } = useTranslation(); // i18n hook
  const { settings } = useSiteSettings();

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
        backgroundColor: settings.headerBgColor || "#D7D7D5",
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
              transform: "translateY(-50%) scale(1.02)",
            },
          }}
          onClick={() => navigate("/")}
        >
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontWeight: "bold",
              fontSize: isMobile ? "0.9rem" : isTablet ? "1.1rem" : "1.3rem",
              color: "#333",
              marginRight: isMobile ? 0.5 : 1,
              display: isMobile ? "none" : "block",
            }}
          >
            {settings.sloganLeft || "Alın Satın"}
          </Typography>
          <img
            src={settings.logoUrl || "/LogoNew.jpeg"}
            alt="TrucksBus"
            style={{
              height: isMobile ? 42 : isTablet ? 52 : 62,
              marginBottom: isMobile ? 2 : 5,
              marginRight: isMobile ? 0.5 : -8,
              marginLeft: isMobile ? 0.5 : -8,
              transition: "all 0.3s ease",
              borderRadius: "8px",
            }}
          />
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontWeight: "bold",
              fontSize: isMobile ? "0.9rem" : isTablet ? "1.1rem" : "1.3rem",
              color: "#333",
              marginLeft: isMobile ? 0.5 : 1,
              display: isMobile ? "none" : "block",
            }}
          >
            {settings.sloganRight || "ile Mutlu Kalın"}
          </Typography>
        </Box>

        {/* Right side content */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 0.2 : isTablet ? 0.5 : 0.8,
            marginLeft: "auto", // Push to right
            marginRight: isMobile ? 0.5 : isTablet ? 2 : 3,
            position: "relative",
            zIndex: 2,
          }}
        >
          {isAuthenticated ? (
            <>
              {/* Authenticated user toolbar */}
              <IconButton
                color="inherit"
                size={isMobile ? "small" : "medium"}
                sx={{
                  color: "#333",
                  padding: isMobile ? "4px" : "8px",
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
                <MessageIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
              </IconButton>

              <NotificationDropdown />

              <IconButton
                color="inherit"
                size={isMobile ? "small" : "medium"}
                sx={{
                  color: "#333",
                  padding: isMobile ? "4px" : "8px",
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
                      fontSize: isMobile ? "0.6rem" : "0.75rem",
                      minWidth: isMobile ? 16 : 20,
                      height: isMobile ? 16 : 20,
                    },
                  }}
                >
                  <BookmarkIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
                </Badge>
              </IconButton>

              <IconButton
                color="inherit"
                size={isMobile ? "small" : "medium"}
                sx={{
                  color: "#333",
                  padding: isMobile ? "4px" : "8px",
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
                <FeedbackIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
              </IconButton>

              {/* Post Ad button - responsive */}
              <Button
                variant="contained"
                component={RouterLink}
                to="/category-selection"
                size="small"
                sx={{
                  backgroundColor: "#D34237",
                  color: "white",
                  ml: 0.5,
                  fontSize: isMobile ? "0.65rem" : "0.85rem",
                  padding: isMobile ? "4px 8px" : "8px 16px",
                  minWidth: "auto",
                  minHeight: isMobile ? "28px" : "36px",
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
                {isMobile ? "İlan" : t("common.createAd")}
              </Button>

              {/* User Avatar */}
              {(user || isLoading) && (
                <IconButton
                  onClick={handleAvatarClick}
                  size="small"
                  sx={{
                    ml: 0.5,
                    padding: isMobile ? "2px" : "6px",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "#D34237",
                      width: isMobile ? 28 : 36,
                      height: isMobile ? 28 : 36,
                      fontSize: isMobile ? "0.7rem" : "0.9rem",
                      boxShadow: "0 2px 8px rgba(211, 66, 55, 0.3)",
                    }}
                  >
                    {isLoading ? "..." : getUserInitials()}
                  </Avatar>
                </IconButton>
              )}

              {/* Dil Değiştirme */}
              <LanguageSwitcher />

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
                  <ListItemText>Öne Çık</ListItemText>
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
                to="/login-selection"
                sx={{
                  color: "#000",
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: 400,
                  padding: isMobile ? "6px 8px" : "8px 16px",
                  textTransform: "none",
                  ml: isMobile ? 0.5 : 1,
                  minWidth: "auto",
                }}
              >
                {isMobile ? "Giriş" : "Giriş Yap"}
              </Button>

              <Button
                color="inherit"
                component={RouterLink}
                to="/membership-selection"
                sx={{
                  color: "#000",
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: 400,
                  padding: isMobile ? "6px 8px" : "8px 16px",
                  textTransform: "none",
                  ml: isMobile ? 0.5 : 1,
                  minWidth: "auto",
                }}
              >
                {isMobile ? "Üye Ol" : "Üye Ol"}
              </Button>

              <Button
                variant="contained"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/login");
                  } else {
                    navigate("/category-selection");
                  }
                }}
                sx={{
                  backgroundColor: "#fdeaea",
                  color: "#dc3545",
                  fontSize: isMobile ? "10px" : "12px",
                  fontWeight: 600,
                  padding: isMobile ? "4px 8px" : "4px 12px",
                  textTransform: "none",
                  ml: 0.5,
                  borderRadius: "4px",
                  border: "1px solid #dc3545",
                  minWidth: "auto",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    backgroundColor: "#f8d7da",
                  },
                }}
              >
                {isMobile ? "İlan Ver" : "Ücretsiz İlan Ver"}
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
