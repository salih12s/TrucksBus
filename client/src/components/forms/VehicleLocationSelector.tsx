import React from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
} from "@mui/material";
import { LocationOn } from "@mui/icons-material";

interface City {
  id: number;
  name: string;
  plateCode: string;
}

interface District {
  id: number;
  name: string;
  cityId: number;
}

interface VehicleLocationSelectorProps {
  formData: {
    cityId: string;
    districtId: string;
  };
  cities: City[];
  districts: District[];
  onInputChange: (field: string, value: string) => void;
}

const VehicleLocationSelector: React.FC<VehicleLocationSelectorProps> = ({
  formData,
  cities,
  districts,
  onInputChange,
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
          <LocationOn sx={{ color: "white", fontSize: 28 }} />
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "white",
          }}
        >
          📍 Konum Bilgileri
        </Typography>
      </Box>

      <Typography
        variant="body2"
        sx={{ mb: 4, opacity: 0.9, fontSize: "1rem" }}
      >
        Aracınızın bulunduğu il ve ilçe bilgilerini seçin
      </Typography>

      {/* İl ve İlçe */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 3,
        }}
      >
        <FormControl
          fullWidth
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.9)",
              "&:hover fieldset": { borderColor: "primary.main" },
              "&.Mui-focused fieldset": { borderColor: "primary.main" },
            },
            "& .MuiInputLabel-root": {
              color: "rgba(0,0,0,0.7)",
              "&.Mui-focused": { color: "primary.main" },
            },
          }}
        >
          <InputLabel>İl</InputLabel>
          <Select
            value={formData.cityId}
            onChange={(e) => onInputChange("cityId", e.target.value)}
            label="İl"
            required
            sx={{
              "& .MuiSelect-select": {
                color: "rgba(0,0,0,0.87)",
              },
            }}
          >
            <MenuItem value="">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                }}
              >
                <span>🏙️</span> İl Seçin
              </Box>
            </MenuItem>
            {cities.map((city) => (
              <MenuItem key={city.id} value={city.id.toString()}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <span>🏙️</span> {city.plateCode} - {city.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          fullWidth
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.9)",
              "&:hover fieldset": { borderColor: "primary.main" },
              "&.Mui-focused fieldset": { borderColor: "primary.main" },
            },
            "& .MuiInputLabel-root": {
              color: "rgba(0,0,0,0.7)",
              "&.Mui-focused": { color: "primary.main" },
            },
          }}
        >
          <InputLabel>İlçe</InputLabel>
          <Select
            value={formData.districtId}
            onChange={(e) => onInputChange("districtId", e.target.value)}
            label="İlçe"
            disabled={!formData.cityId}
            required
            sx={{
              "& .MuiSelect-select": {
                color: formData.cityId
                  ? "rgba(0,0,0,0.87)"
                  : "rgba(0,0,0,0.38)",
              },
            }}
          >
            <MenuItem value="">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                }}
              >
                <span>🏘️</span> İlçe Seçin
              </Box>
            </MenuItem>
            {districts.map((district) => (
              <MenuItem key={district.id} value={district.id.toString()}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <span>🏘️</span> {district.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Seçilen konum özeti */}
      {formData.cityId && formData.districtId && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Seçilen Konum:
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 0.5 }}>
            📍{" "}
            {districts.find((d) => d.id.toString() === formData.districtId)
              ?.name || "İlçe"}{" "}
            /{" "}
            {cities.find((c) => c.id.toString() === formData.cityId)?.name ||
              "İl"}
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default VehicleLocationSelector;
