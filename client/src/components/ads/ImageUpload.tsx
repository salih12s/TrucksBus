import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Chip,
  Tooltip,
  Fab
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Edit,
  Star,
  StarBorder,
  RotateLeft,
  RotateRight,
  Crop,
  Close,
  PhotoCamera,
  Collections
} from '@mui/icons-material';

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  isPrimary: boolean;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  progress: number;
}

interface ImageUploadProps {
  maxImages?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  onImagesChange: (images: UploadedImage[]) => void;
  existingImages?: UploadedImage[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  maxImages = 10,
  maxFileSize = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  onImagesChange,
  existingImages = []
}) => {
  const [images, setImages] = useState<UploadedImage[]>(existingImages);
  const [dragActive, setDragActive] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const validateFile = useCallback((file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Desteklenmeyen dosya türü. İzin verilen türler: ${allowedTypes.join(', ')}`;
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Dosya boyutu ${maxFileSize}MB'dan büyük olamaz`;
    }
    return null;
  }, [allowedTypes, maxFileSize]);

  const processImage = useCallback(async (file: File): Promise<UploadedImage> => {
    const validationError = validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const id = generateId();
    const url = URL.createObjectURL(file);
    
    return {
      id,
      file,
      url,
      isPrimary: images.length === 0, // First image is primary by default
      uploading: false,
      uploaded: false,
      progress: 0
    };
  }, [images.length, validateFile]);

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    
    if (fileArray.length > remainingSlots) {
      setError(`En fazla ${maxImages} fotoğraf yükleyebilirsiniz. ${remainingSlots} slot kaldı.`);
      return;
    }

    const newImages: UploadedImage[] = [];
    
    for (const file of fileArray) {
      try {
        const processedImage = await processImage(file);
        newImages.push(processedImage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Dosya işlenirken hata oluştu');
        continue;
      }
    }

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesChange(updatedImages);
    setError(null);
  }, [images, maxImages, onImagesChange, processImage]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id);
    
    // If removed image was primary, make first image primary
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
      updatedImages[0].isPrimary = true;
    }
    
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const setPrimaryImage = (id: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === id
    }));
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const openEditDialog = (image: UploadedImage) => {
    setSelectedImage(image);
    setEditDialogOpen(true);
  };

  const simulateUpload = async (image: UploadedImage) => {
    const updatedImages = images.map(img => 
      img.id === image.id ? { ...img, uploading: true, progress: 0 } : img
    );
    setImages(updatedImages);

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const progressUpdated = images.map(img => 
        img.id === image.id ? { ...img, progress } : img
      );
      setImages(progressUpdated);
    }

    // Mark as uploaded
    const finalImages = images.map(img => 
      img.id === image.id ? { ...img, uploading: false, uploaded: true, progress: 100 } : img
    );
    setImages(finalImages);
    onImagesChange(finalImages);
  };

  const uploadAllImages = async () => {
    const unuploadedImages = images.filter(img => !img.uploaded && !img.uploading);
    
    for (const image of unuploadedImages) {
      await simulateUpload(image);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Fotoğraf Yükleme
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Upload Area */}
      <Paper
        sx={{
          p: 4,
          border: 2,
          borderStyle: 'dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          bgcolor: dragActive ? 'primary.50' : 'grey.50',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          mb: 3,
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'primary.50'
          }
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Fotoğrafları buraya sürükleyin veya tıklayın
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          En fazla {maxImages} fotoğraf, maksimum {maxFileSize}MB
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Desteklenen formatlar: JPEG, PNG, WebP
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" startIcon={<PhotoCamera />} sx={{ mr: 1 }}>
            Fotoğraf Seç
          </Button>
          <Button variant="outlined" startIcon={<Collections />}>
            Galeriden Seç
          </Button>
        </Box>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </Paper>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Yüklenen Fotoğraflar ({images.length}/{maxImages})
            </Typography>
            <Button
              variant="contained"
              onClick={uploadAllImages}
              disabled={images.every(img => img.uploaded)}
              startIcon={<CloudUpload />}
            >
              Tümünü Yükle
            </Button>
          </Box>

          <ImageList cols={4} rowHeight={200} gap={8}>
            {images.map((image) => (
              <ImageListItem key={image.id}>
                <img
                  src={image.url}
                  alt="Preview"
                  loading="lazy"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    borderRadius: 8
                  }}
                />
                
                {/* Upload Progress */}
                {image.uploading && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 2
                  }}>
                    <Typography variant="body2" color="white" sx={{ mb: 1 }}>
                      Yükleniyor... {image.progress}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={image.progress} 
                      sx={{ width: '80%' }}
                    />
                  </Box>
                )}

                {/* Image Actions */}
                <ImageListItemBar
                  sx={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)' }}
                  position="top"
                  actionIcon={
                    <Box>
                      <Tooltip title={image.isPrimary ? "Ana fotoğraf" : "Ana fotoğraf yap"}>
                        <IconButton
                          sx={{ color: 'white' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimaryImage(image.id);
                          }}
                        >
                          {image.isPrimary ? <Star color="warning" /> : <StarBorder />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Düzenle">
                        <IconButton
                          sx={{ color: 'white' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(image);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          sx={{ color: 'white' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(image.id);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />

                {/* Status Chips */}
                <Box sx={{ position: 'absolute', bottom: 8, left: 8 }}>
                  {image.isPrimary && (
                    <Chip 
                      label="Ana" 
                      color="warning" 
                      size="small" 
                      sx={{ mr: 1 }} 
                    />
                  )}
                  {image.uploaded && (
                    <Chip 
                      label="Yüklendi" 
                      color="success" 
                      size="small" 
                    />
                  )}
                  {!image.uploaded && !image.uploading && (
                    <Chip 
                      label="Bekliyor" 
                      color="default" 
                      size="small" 
                    />
                  )}
                </Box>
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      )}

      {/* Image Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Fotoğraf Düzenle
          <IconButton
            onClick={() => setEditDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={selectedImage.url}
                alt="Edit preview"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: 400, 
                  borderRadius: 8,
                  marginBottom: 16
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button startIcon={<RotateLeft />} variant="outlined">
                  Sola Döndür
                </Button>
                <Button startIcon={<RotateRight />} variant="outlined">
                  Sağa Döndür
                </Button>
                <Button startIcon={<Crop />} variant="outlined">
                  Kırp
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Upload All FAB */}
      {images.length > 0 && images.some(img => !img.uploaded) && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 80, right: 16 }}
          onClick={uploadAllImages}
        >
          <CloudUpload />
        </Fab>
      )}
    </Box>
  );
};

export default ImageUpload;
