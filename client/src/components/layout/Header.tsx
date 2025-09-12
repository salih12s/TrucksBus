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
  TextField,
  InputAdornment,
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
  Search as SearchIcon,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { logoutUser } from "../../store/authSlice";
import FeedbackModal from "../modals/FeedbackModal";
import NotificationDropdown from "../NotificationDropdown";

interface HeaderProps {
  favoritesCount?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  favoritesCount = 0,
  searchTerm = "",
  onSearchChange,
  showSearch = false,
}) => {
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
          px: 2,
          py: 0.5,
          minHeight: "56px !important",
          position: "relative",
        }}
      >
        {/* Logo - Absolute positioned */}
        <Box
          sx={{
            position: "absolute",
            left: 12,
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
              height: isMobile ? 45 : isTablet ? 55 : 65,
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

        {/* Search Bar - Center */}
        {showSearch && !isMobile && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              px: isMobile ? 1 : isTablet ? 2 : 4,
              mx: isMobile ? 0.5 : isTablet ? 1 : 2,
              ml: { xs: 0, sm: 4, md: 32, lg: 64 },
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder={isMobile ? "Ara..." : "Araç ara..."}
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#D34237" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: isMobile ? 250 : isTablet ? 350 : 400,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: 25,
                  fontSize: isMobile ? "0.75rem" : "0.8rem",
                  height: isMobile ? 32 : 36,
                  transition: "all 0.3s ease",
                  border: "2px solid transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  },
                  "&.Mui-focused": {
                    backgroundColor: "white",
                    border: "2px solid #D34237",
                    boxShadow: "0 4px 12px rgba(211, 66, 55, 0.2)",
                  },
                  "& fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputBase-input": {
                  padding: "8px 12px",
                  "&::placeholder": {
                    color: "#666",
                    opacity: 0.8,
                  },
                },
              }}
            />
          </Box>
        )}

        {/* Right side content */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 0.3 : isTablet ? 0.5 : 1,
            marginLeft: "auto", // Push to right
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
                  padding: isMobile ? "4px" : "6px",
                }}
                onClick={() => navigate("/messages")}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <MessageIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
                </Badge>
              </IconButton>

              <NotificationDropdown />

              <IconButton
                color="inherit"
                sx={{
                  color: "#333",
                  padding: isMobile ? "4px" : "6px",
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
                  <BookmarkIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
                </Badge>
              </IconButton>

              <IconButton
                color="inherit"
                sx={{
                  color: "#333",
                  padding: isMobile ? "4px" : "6px",
                }}
                onClick={() => setFeedbackModalOpen(true)}
              >
                <FeedbackIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
              </IconButton>

              {/* Post Ad button - responsive */}
              <Button
                variant="contained"
                component={RouterLink}
                to="/category-selection"
                sx={{
                  backgroundColor: "#D34237",
                  color: "white",
                  ml: 0.5,
                  fontSize: isMobile ? "0.7rem" : "0.8rem",
                  padding: isMobile ? "3px 6px" : "4px 12px",
                  minWidth: isMobile ? "auto" : "60px",
                  minHeight: isMobile ? "28px" : "32px",
                  "&:hover": {
                    backgroundColor: "#B73429",
                  },
                }}
              >
                {isMobile ? "İlan" : "İlan Ver"}
              </Button>

              {/* User Avatar */}
              {(user || isLoading) && (
                <IconButton
                  onClick={handleAvatarClick}
                  sx={{ ml: 0.5, padding: "4px" }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "#D34237",
                      width: isMobile ? 28 : 32,
                      height: isMobile ? 28 : 32,
                      fontSize: isMobile ? "0.7rem" : "0.8rem",
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
                  backgroundColor: "#FFD700",
                  color: "#333",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "4px 12px",
                  textTransform: "none",
                  ml: 0.5,
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: "#FFC107",
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
