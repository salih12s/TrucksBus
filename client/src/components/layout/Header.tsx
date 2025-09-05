import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#313B4C",
        boxShadow: "none",
        borderBottom: "1px solid #444",
      }}
    >
        <Toolbar sx={{ px: 3 }}>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <img
              src="/Trucksbus.png"
              alt="TrucksBus"
              style={{ height: 40, marginRight: 12 }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: "bold",
                fontSize: "1.5rem",
              }}
            >
              <span style={{ color: "white" }}>Alın Satın </span>
              <span style={{ color: "#D34237" }}>Trucksbus.com</span>
              <span style={{ color: "white" }}> ile Mutlu Kalın</span>
            </Typography>
          </Box>

          {/* Right side buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Login button */}
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

            {/* Post Ad button */}
            <Button
              variant="contained"
              component={RouterLink}
              to="/create-ad"
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

            {/* Register button */}
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
          </Box>
        </Toolbar>
    </AppBar>
  );
};

export default Header;
