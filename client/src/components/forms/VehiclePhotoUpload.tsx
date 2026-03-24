import React from "react";
import { Box, Typography, Button, Card, Chip } from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";

interface VehiclePhotoUploadProps {
  formData: {
    photos: File[];
    showcasePhoto: File | null;
  };
  showcasePreview: string | null;
  photoPreviews: string[];
  onPhotoUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    isShowcase?: boolean
  ) => void;
  onRemovePhoto: (index: number) => void;
  onRemoveShowcase: () => void;
}

const VehiclePhotoUpload: React.FC<VehiclePhotoUploadProps> = ({
  formData,
  showcasePreview,
  photoPreviews,
  onPhotoUpload,
  onRemovePhoto,
  onRemoveShowcase,
}) => {
  return (
    <Card
      sx={{
        p: 4,
        borderRadius: 4,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)",
          zIndex: 1,
        },
        "& > *": {
          position: "relative",
          zIndex: 2,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box
          sx={{
            background: "rgba(255,255,255,0.2)",
            borderRadius: "50%",
            p: 1.5,
            mr: 2,
          }}
        >
          <PhotoCamera sx={{ color: "white", fontSize: 28 }} />
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "white",
          }}
        >
          📸 Fotoğraflar
        </Typography>
      </Box>

      <Typography
        variant="body2"
        sx={{ mb: 4, opacity: 0.9, fontSize: "1rem" }}
      >
        Kaliteli fotoğraflar ile ilanınızın dikkat çekmesini sağlayın
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 3,
        }}
      >
        {/* Vitrin Fotoğrafı */}
        <Card
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            border: "2px dashed #0284c7",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              borderColor: "primary.main",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: "primary.main",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            🖼️ Vitrin Fotoğrafı
            <Chip label="Zorunlu" color="error" size="small" />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ana fotoğraf olarak kullanılacak en iyi fotoğrafınızı seçin
          </Typography>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="showcase-photo"
            type="file"
            onChange={(e) => onPhotoUpload(e, true)}
          />
          <label htmlFor="showcase-photo">
            <Button
              variant="contained"
              component="span"
              startIcon={<PhotoCamera />}
              sx={{
                borderRadius: 3,
                py: 1.5,
                px: 3,
                fontWeight: 600,
                background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                },
              }}
            >
              Vitrin Fotoğrafı Seç
            </Button>
          </label>

          {/* Vitrin fotoğrafı önizlemesi */}
          {showcasePreview && (
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  position: "relative",
                  display: "inline-block",
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <img
                  src={showcasePreview}
                  alt="Vitrin fotoğrafı önizleme"
                  style={{
                    width: "200px",
                    height: "150px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(0,0,0,0.7)",
                    borderRadius: "50%",
                    p: 0.5,
                    cursor: "pointer",
                    "&:hover": { background: "rgba(0,0,0,0.9)" },
                  }}
                  onClick={onRemoveShowcase}
                >
                  <Typography sx={{ color: "white", fontSize: "14px" }}>
                    ✕
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="caption"
                color="primary"
                sx={{ display: "block", mt: 1 }}
              >
                Vitrin Fotoğrafı ✓
              </Typography>
            </Box>
          )}

          {formData.showcasePhoto && !showcasePreview && (
            <Chip
              label={formData.showcasePhoto.name}
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </Card>

        {/* Diğer Fotoğraflar */}
        <Card
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            border: "2px dashed #64748b",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              borderColor: "primary.main",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: "primary.main",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            📷 Diğer Fotoğraflar
            <Chip label="İsteğe Bağlı" color="info" size="small" />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Aracınızın farklı açılardan fotoğraflarını ekleyin (En fazla 15
            adet)
          </Typography>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="other-photos"
            type="file"
            multiple
            onChange={(e) => onPhotoUpload(e, false)}
          />
          <label htmlFor="other-photos">
            <Button
              variant="outlined"
              component="span"
              startIcon={<PhotoCamera />}
              disabled={formData.photos.length >= 15}
              sx={{
                borderRadius: 3,
                py: 1.5,
                px: 3,
                fontWeight: 600,
              }}
            >
              Fotoğraf Ekle ({formData.photos.length}/15)
            </Button>
          </label>

          {formData.photos.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Yüklenen Fotoğraflar ({formData.photos.length}/15)
              </Typography>

              {/* Fotoğraf önizlemeleri grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: 2,
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {photoPreviews.map((preview, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    <img
                      src={preview}
                      alt={`Fotoğraf ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "80px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        background: "rgba(0,0,0,0.7)",
                        borderRadius: "50%",
                        p: 0.3,
                        cursor: "pointer",
                        "&:hover": { background: "rgba(0,0,0,0.9)" },
                      }}
                      onClick={() => onRemovePhoto(index)}
                    >
                      <Typography sx={{ color: "white", fontSize: "12px" }}>
                        ✕
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Card>
      </Box>
    </Card>
  );
};

export default VehiclePhotoUpload;
