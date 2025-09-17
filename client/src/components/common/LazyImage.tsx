import React, { useState, useRef, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";

interface LazyImageProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  placeholder?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  style = {},
  onError,
  placeholder = "/placeholder-image.jpg",
  className,
  width = "100%",
  height = "100%",
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgElementRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    const currentRef = imgElementRef.current;

    if (currentRef && window.IntersectionObserver) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.01, // ❗ Daha agresif threshold
          rootMargin: "100px", // ❗ Daha geniş margin - ekrana yaklaşmadan yükle
        }
      );

      observer.observe(currentRef);
    } else {
      // Fallback for older browsers
      setImageSrc(src);
    }

    return () => {
      if (observer && currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsLoading(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setImageSrc(placeholder);
    if (onError) {
      onError(e);
    }
  };

  return (
    <Box
      ref={imgElementRef}
      sx={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
      className={className}
    >
      {isLoading && !isLoaded && (
        <CircularProgress
          size={24}
          sx={{
            position: "absolute",
            zIndex: 1,
          }}
        />
      )}

      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </Box>
  );
};

export default LazyImage;
