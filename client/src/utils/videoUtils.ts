// Video compression and processing utilities

export interface VideoCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxSizeMB?: number;
}

export const compressVideo = async (
  file: File,
  options: VideoCompressionOptions = {}
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const { maxWidth = 1280, maxHeight = 720, maxSizeMB = 25 } = options; // Eğer dosya zaten küçükse sıkıştırma yapma
    if (file.size <= maxSizeMB * 1024 * 1024) {
      resolve(file);
      return;
    }

    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas context not supported"));
      return;
    }

    video.crossOrigin = "anonymous";
    video.muted = true;

    video.onloadedmetadata = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { videoWidth, videoHeight } = video;

      if (videoWidth > maxWidth) {
        videoHeight = (videoHeight * maxWidth) / videoWidth;
        videoWidth = maxWidth;
      }

      if (videoHeight > maxHeight) {
        videoWidth = (videoWidth * maxHeight) / videoHeight;
        videoHeight = maxHeight;
      }

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Create MediaRecorder for compression
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8,opus",
        videoBitsPerSecond: 1000000, // 1 Mbps
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: "video/webm" });
        const compressedFile = new File(
          [compressedBlob],
          file.name.replace(/\.[^/.]+$/, ".webm"),
          {
            type: "video/webm",
            lastModified: Date.now(),
          }
        );

        console.log("🎥 Video compressed:", {
          originalSize: (file.size / 1024 / 1024).toFixed(2) + "MB",
          compressedSize: (compressedFile.size / 1024 / 1024).toFixed(2) + "MB",
          compressionRatio:
            ((1 - compressedFile.size / file.size) * 100).toFixed(1) + "%",
        });

        resolve(compressedFile);
      };

      mediaRecorder.onerror = (event) => {
        reject(new Error("MediaRecorder error: " + event));
      };

      // Start recording and play video
      let currentTime = 0;
      const duration = video.duration;
      const frameRate = 30;
      const frameInterval = 1 / frameRate;

      const drawFrame = () => {
        if (currentTime >= duration) {
          mediaRecorder.stop();
          return;
        }

        video.currentTime = currentTime;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        currentTime += frameInterval;

        setTimeout(drawFrame, 1000 / frameRate);
      };

      video.onseeked = () => {
        if (currentTime === 0) {
          mediaRecorder.start();
          drawFrame();
        }
      };

      video.currentTime = 0;
    };

    video.onerror = () => {
      reject(new Error("Video loading failed"));
    };

    // Load video
    const url = URL.createObjectURL(file);
    video.src = url;
    video.load();
  });
};

export const validateVideoFile = (file: File): boolean => {
  const validTypes = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/avi",
    "video/mov",
  ];
  return validTypes.includes(file.type) || file.type.startsWith("video/");
};

export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      reject(new Error("Error loading video metadata"));
    };

    video.src = URL.createObjectURL(file);
  });
};

export const createVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas context not supported"));
      return;
    }

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      video.currentTime = 1; // Get frame at 1 second
    };

    video.onseeked = () => {
      ctx.drawImage(video, 0, 0);
      const thumbnail = canvas.toDataURL("image/jpeg", 0.7);
      resolve(thumbnail);
    };

    video.onerror = () => {
      reject(new Error("Error creating video thumbnail"));
    };

    video.src = URL.createObjectURL(file);
  });
};
