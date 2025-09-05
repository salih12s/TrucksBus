// PWA Utilities and Service Worker Management
import { useState, useEffect, useCallback } from 'react';

// Service Worker registration and management
export class PWAManager {
  private static instance: PWAManager;
  private registration: ServiceWorkerRegistration | null = null;
  private installPrompt: BeforeInstallPromptEvent | null = null;

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  async registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.registration = registration;

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      console.log('Service Worker registered successfully');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async unregisterServiceWorker(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      await this.registration.unregister();
      console.log('Service Worker unregistered');
      return true;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  async updateServiceWorker(): Promise<void> {
    if (!this.registration) return;

    if (this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  private notifyUpdateAvailable(): void {
    // Dispatch custom event for update notification
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  // Install prompt handling
  captureInstallPrompt(event: BeforeInstallPromptEvent): void {
    event.preventDefault();
    this.installPrompt = event;
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) return false;

    try {
      const result = await this.installPrompt.prompt();
      const accepted = result.outcome === 'accepted';
      
      this.installPrompt = null;
      return accepted;
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  // Push notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return 'denied';
    }
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.registration) return null;

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.VITE_VAPID_PUBLIC_KEY || ''
        ) as BufferSource
      });

      console.log('Push subscription successful');
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Background sync
  async registerBackgroundSync(tag: string): Promise<void> {
    if (!this.registration) {
      console.log('Background Sync not supported - no registration');
      return;
    }

    // Type assertion for sync manager
    const syncManager = (this.registration as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync;
    
    if (!syncManager) {
      console.log('Background Sync not supported');
      return;
    }

    try {
      await syncManager.register(tag);
      console.log(`Background sync registered: ${tag}`);
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }

  // Offline storage
  async storeOfflineData(storeName: string, data: Record<string, unknown>): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      await store.add({
        ...data,
        timestamp: Date.now(),
        synced: false
      });

      console.log(`Offline data stored: ${storeName}`);
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TrucksBusOffline', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('ads')) {
          db.createObjectStore('ads', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }
}

// React hooks for PWA features
export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const pwaManager = PWAManager.getInstance();

  useEffect(() => {
    // Register service worker
    pwaManager.registerServiceWorker();

    // Listen for install prompt
    const handleInstallPrompt = (event: Event) => {
      pwaManager.captureInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstallable = () => setIsInstallable(true);
    const handleUpdateAvailable = () => setUpdateAvailable(true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pwaManager]);

  const installApp = useCallback(async (): Promise<boolean> => {
    const installed = await pwaManager.showInstallPrompt();
    if (installed) {
      setIsInstallable(false);
    }
    return installed;
  }, [pwaManager]);

  const updateApp = useCallback(async (): Promise<void> => {
    await pwaManager.updateServiceWorker();
    setUpdateAvailable(false);
  }, [pwaManager]);

  const requestNotifications = useCallback(async (): Promise<boolean> => {
    const permission = await pwaManager.requestNotificationPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      await pwaManager.subscribeToPushNotifications();
      return true;
    }
    return false;
  }, [pwaManager]);

  const storeOfflineData = useCallback(async (storeName: string, data: Record<string, unknown>): Promise<void> => {
    await pwaManager.storeOfflineData(storeName, data);
    await pwaManager.registerBackgroundSync(`background-sync-${storeName}`);
  }, [pwaManager]);

  return {
    isInstallable,
    updateAvailable,
    isOnline,
    notificationPermission,
    installApp,
    updateApp,
    requestNotifications,
    storeOfflineData
  };
}

// Offline storage hook
export function useOfflineStorage() {
  const [isSupported] = useState('indexedDB' in window);

  const storeData = useCallback(async (storeName: string, data: Record<string, unknown>): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const pwaManager = PWAManager.getInstance();
      await pwaManager.storeOfflineData(storeName, data);
      return true;
    } catch (error) {
      console.error('Failed to store offline data:', error);
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    storeData
  };
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    const updateConnectionType = () => {
      const connection = (navigator as NavigatorWithConnection).connection;
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    if ('connection' in navigator) {
      (navigator as NavigatorWithConnection).connection?.addEventListener('change', updateConnectionType);
      updateConnectionType();
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      if ('connection' in navigator) {
        (navigator as NavigatorWithConnection).connection?.removeEventListener('change', updateConnectionType);
      }
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowConnection: connectionType === 'slow-2g' || connectionType === '2g'
  };
}

// Type definitions
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavigatorConnection extends EventTarget {
  effectiveType: string;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NavigatorConnection;
}
