// Chunk loading error handler
export function setupChunkErrorHandler() {
  // Global error handler for chunk loading errors
  window.addEventListener('error', (event) => {
    const { message, filename } = event;
    
    // Chunk loading error'larını yakala
    const isChunkError = message && (
      message.includes('Loading chunk') ||
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Loading CSS chunk') ||
      message.includes('ChunkLoadError')
    );

    const isChunkFile = filename && (
      filename.includes('assets/') ||
      filename.includes('-[hash]') ||
      filename.includes('.chunk.')
    );

    if (isChunkError || isChunkFile) {
      console.warn('🔄 Chunk loading error detected, reloading page...', {
        message,
        filename,
        stack: event.error?.stack
      });
      
      // Cache'i temizle ve sayfayı yenile
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => registration.unregister());
        });
      }
      
      // Browser cache'ini de temizle
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      // Sayfa yenile
      window.location.reload();
      return;
    }
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    if (error && typeof error === 'object') {
      const isChunkError = error.message && (
        error.message.includes('Loading chunk') ||
        error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('Loading CSS chunk')
      );
      
      if (isChunkError) {
        console.warn('🔄 Chunk loading promise rejection detected, reloading page...', error);
        event.preventDefault(); // Prevent default error handling
        window.location.reload();
      }
    }
  });
}

// Cache management utilities
export function clearBrowserCache() {
  // Clear localStorage
  try {
    localStorage.clear();
  } catch (e) {
    console.warn('Could not clear localStorage:', e);
  }

  // Clear sessionStorage  
  try {
    sessionStorage.clear();
  } catch (e) {
    console.warn('Could not clear sessionStorage:', e);
  }

  // Clear Service Worker caches
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });
  }

  // Clear Cache API
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
}

// Force reload with cache clear
export function forceReloadWithCacheClear() {
  clearBrowserCache();
  
  // Hard reload
  window.location.href = window.location.href + '?t=' + Date.now();
}