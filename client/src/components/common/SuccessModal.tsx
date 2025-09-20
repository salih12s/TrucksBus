import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Slide,
  useTheme,
} from "@mui/material";
import {
  CheckCircle,
  Close,
  Visibility,
  Home,
  Assignment,
} from "@mui/icons-material";
import type { TransitionProps } from "@mui/material/transitions";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  adId?: string;
  onViewAd?: () => void;
  onGoHome?: () => void;
  onMyAds?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  title,
  message,
  adId,
  onViewAd,
  onGoHome,
  onMyAds,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-labelledby="success-dialog-title"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "visible",
          boxShadow: theme.shadows[24],
        },
      }}
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
          zIndex: 1,
        }}
      >
        <Close />
      </IconButton>

      <DialogContent sx={{ p: 4, textAlign: "center" }}>
        {/* Success Icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle
              sx={{
                fontSize: 80,
                color: "success.main",
                filter: "drop-shadow(0 4px 8px rgba(76, 175, 80, 0.3))",
                animation: "bounce 0.6s ease-in-out",
                "@keyframes bounce": {
                  "0%, 20%, 53%, 80%, 100%": {
                    transform: "translate3d(0,0,0)",
                  },
                  "40%, 43%": {
                    transform: "translate3d(0,-10px,0)",
                  },
                  "70%": {
                    transform: "translate3d(0,-5px,0)",
                  },
                  "90%": {
                    transform: "translate3d(0,-2px,0)",
                  },
                },
              }}
            />
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(45deg, #4CAF50 30%, #81C784 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
          }}
        >
          {title}
        </Typography>

        {/* Message */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 1, lineHeight: 1.6 }}
        >
          {message}
        </Typography>

        {/* Ad ID */}
        {adId && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 4,
              p: 1,
              backgroundColor: "grey.100",
              borderRadius: 1,
              fontFamily: "monospace",
            }}
          >
            İlan ID: {adId}
          </Typography>
        )}

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "center",
            mt: 4,
          }}
        >
          {onViewAd && (
            <Button
              variant="contained"
              onClick={onViewAd}
              startIcon={<Visibility />}
              sx={{
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                color: "white",
                fontWeight: "bold",
                px: 3,
                py: 1.5,
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 8px 2px rgba(33, 203, 243, .4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              İlanı Görüntüle
            </Button>
          )}

          {onMyAds && (
            <Button
              variant="outlined"
              onClick={onMyAds}
              startIcon={<Assignment />}
              sx={{
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: "bold",
                px: 3,
                py: 1.5,
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              İlanlarım
            </Button>
          )}

          {onGoHome && (
            <Button
              variant="outlined"
              onClick={onGoHome}
              startIcon={<Home />}
              sx={{
                borderColor: "grey.400",
                color: "text.secondary",
                px: 3,
                py: 1.5,
                "&:hover": {
                  backgroundColor: "grey.50",
                  borderColor: "grey.600",
                  color: "text.primary",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Ana Sayfa
            </Button>
          )}
        </Box>

        {/* Footer Text */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 3,
            display: "block",
            fontStyle: "italic",
          }}
        >
          İlanınız başarıyla yayınlandı ve diğer kullanıcılar tarafından
          görülebilir.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
