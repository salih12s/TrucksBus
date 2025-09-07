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

const Header: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

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
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#313B4C",
        boxShadow: "none",
        borderBottom: "1px solid #444",
      }}
    >
      <Toolbar sx={{ px: 3, position: "relative" }}>
        {/* Logo - Absolute positioned */}
        <Box
          sx={{
            position: "absolute",
            left: 20,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <img
            src="/Trucksbus.png"
            alt="TrucksBus"
            style={{
              height: 120, // Büyütüldü (40'tan 55'e)
              filter: "brightness(0) invert(1)", // Beyaz renk
              marginRight: 16,
            }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              fontSize: "1.5rem",
              marginLeft: 2, // Yazıyı sağa kaydır
            }}
          >
            <span style={{ color: "white" }}>Alın Satın </span>
            <span style={{ color: "#D34237" }}>Trucksbus.com</span>
            <span style={{ color: "white" }}> ile Mutlu Kalın</span>
          </Typography>
        </Box>

        {/* Right side content */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
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
                sx={{ color: "white" }}
                onClick={() => navigate("/messages")}
              >
                <Badge badgeContent={3} color="error">
                  <MessageIcon />
                </Badge>
              </IconButton>

              <NotificationDropdown />

              <IconButton
                color="inherit"
                sx={{ color: "white" }}
                onClick={() => navigate("/bookmarks")}
              >
                <BookmarkIcon />
              </IconButton>

              <IconButton
                color="inherit"
                sx={{ color: "white" }}
                onClick={() => setFeedbackModalOpen(true)}
              >
                <FeedbackIcon />
              </IconButton>

              {/* Post Ad button - always visible */}
              <Button
                variant="contained"
                component={RouterLink}
                to="/category-selection"
                sx={{
                  backgroundColor: "#D34237",
                  color: "white",
                  ml: 1,
                  "&:hover": {
                    backgroundColor: "#B73429",
                  },
                }}
              >
                İlan Ver
              </Button>

              {/* User Avatar */}
              <IconButton onClick={handleAvatarClick} sx={{ ml: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: "#D34237",
                    width: 40,
                    height: 40,
                    fontSize: "0.9rem",
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </IconButton>

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
                    <ListItemText>Mağazam</ListItemText>
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
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Giriş Yap
              </Button>

              <Button
                variant="contained"
                component={RouterLink}
                to="/category-selection"
                sx={{
                  backgroundColor: "#D34237",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#B73429",
                  },
                }}
              >
                İlan Ver
              </Button>

              <Button
                variant="outlined"
                component={RouterLink}
                to="/register"
                sx={{
                  borderColor: "white",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "white",
                  },
                }}
              >
                Kayıt Ol
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
