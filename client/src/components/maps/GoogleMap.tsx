import React, { useState, useEffect } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Box, Typography, CircularProgress } from "@mui/material";
import { LocationOn } from "@mui/icons-material";

interface MapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  height?: number;
  cityName?: string;
  districtName?: string;
}

interface GoogleMapComponentProps extends MapProps {
  style: React.CSSProperties;
}

// Google Maps bileşeni
const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  center,
  zoom,
  style,
  cityName,
  districtName,
}) => {
  const [map, setMap] = useState<google.maps.Map>();
  const [marker, setMarker] = useState<google.maps.Marker>();
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      setMap(newMap);

      // Marker ekle
      const newMarker = new window.google.maps.Marker({
        position: center,
        map: newMap,
        title: `${cityName} / ${districtName}`,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="#1976d2"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(30, 30),
        },
      });

      // Info window ekle
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: Roboto, sans-serif;">
            <h4 style="margin: 0 0 8px 0; color: #1976d2;">${cityName} / ${districtName}</h4>
            <p style="margin: 0; color: #666; font-size: 14px;">📍 İlan konumu</p>
          </div>
        `,
      });

      newMarker.addListener("click", () => {
        infoWindow.open(newMap, newMarker);
      });

      setMarker(newMarker);
    }
  }, [ref, map, center, zoom, cityName, districtName]);

  // Center değiştiğinde haritayı güncelle
  useEffect(() => {
    if (map && marker) {
      map.setCenter(center);
      marker.setPosition(center);
    }
  }, [map, marker, center]);

  return <div ref={ref} style={style} />;
};

// Loading component
const MapLoading: React.FC = () => (
  <Box
    sx={{
      height: 250,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
      borderRadius: 1,
    }}
  >
    <Box textAlign="center">
      <CircularProgress size={40} sx={{ mb: 2, color: "#1976d2" }} />
      <Typography variant="body2" color="text.secondary">
        Harita yükleniyor...
      </Typography>
    </Box>
  </Box>
);

// Error component
const MapError: React.FC<{ error: string }> = ({ error }) => (
  <Box
    sx={{
      height: 250,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#ffebee",
      borderRadius: 1,
      border: "1px solid #ffcdd2",
    }}
  >
    <Box textAlign="center">
      <LocationOn sx={{ fontSize: 48, color: "#f44336", mb: 1 }} />
      <Typography variant="body2" color="error" gutterBottom>
        Harita yüklenemedi
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {error}
      </Typography>
    </Box>
  </Box>
);

// Render fonksiyonu
const render = (status: Status): React.ReactElement => {
  if (status === Status.LOADING) return <MapLoading />;
  if (status === Status.FAILURE)
    return <MapError error="Google Maps API yüklenemedi" />;
  return <MapError error="Bilinmeyen hata" />;
};

// Ana Google Maps wrapper component
const GoogleMap: React.FC<MapProps> = ({
  center,
  zoom,
  height = 250,
  cityName = "Konum",
  districtName = "",
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <MapError error="Google Maps API key bulunamadı. Lütfen .env dosyasını kontrol edin." />
    );
  }

  return (
    <Wrapper apiKey={apiKey} render={render} libraries={["places"]}>
      <GoogleMapComponent
        center={center}
        zoom={zoom}
        style={{ height: `${height}px`, width: "100%", borderRadius: "8px" }}
        cityName={cityName}
        districtName={districtName}
      />
    </Wrapper>
  );
};

export default GoogleMap;
