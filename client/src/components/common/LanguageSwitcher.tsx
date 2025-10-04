import React from "react";
import { useTranslation } from "react-i18next";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Language as LanguageIcon } from "@mui/icons-material";

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    console.log("🌍 Changing language to:", lng);
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
    console.log("✅ Language changed to:", i18n.language);
    console.log("📦 localStorage:", localStorage.getItem("language"));
    handleClose();
  };

  const currentLanguage = i18n.language || "tr";

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          ml: 1,
          color: "#333",
          padding: "8px",
          borderRadius: "8px",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "#f5f5f5",
            color: "#D34237",
            transform: "scale(1.1)",
          },
        }}
        aria-controls={open ? "language-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <LanguageIcon sx={{ fontSize: 24 }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="language-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => changeLanguage("tr")}
          selected={currentLanguage === "tr"}
        >
          <ListItemIcon>🇹🇷</ListItemIcon>
          <ListItemText>{t("common.turkish")}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => changeLanguage("en")}
          selected={currentLanguage === "en"}
        >
          <ListItemIcon>🇬🇧</ListItemIcon>
          <ListItemText>{t("common.english")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
