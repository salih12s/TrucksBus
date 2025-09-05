import { useState, useEffect, useCallback, useRef } from 'react';

// Cache storage interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheEntry<unknown>>();
  private subscribers = new Map<string, Set<() => void>>();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void { // Default 5 minutes
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
    
    this.cache.set(key, entry);
    this.notifySubscribers(key);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.notifySubscribers(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.notifySubscribers(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.notifySubscribers(key);
  }

  clear(): void {
    this.cache.clear();
    // Notify all subscribers
    this.subscribers.forEach((callbacks) => {
      callbacks.forEach(callback => callback());
    });
  }

  subscribe(key: string, callback: () => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  private notifySubscribers(key: string): void {
    const callbacks = this.subscribers.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      subscribers: this.subscribers.size
    };
  }
}

// Hook for using cached data
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
    onError?: (error: Error) => void;
  } = {}
) {
  const { ttl = 5 * 60 * 1000, enabled = true, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const cacheManager = CacheManager.getInstance();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    // Check cache first
    if (!forceRefresh && cacheManager.has(key)) {
      const cachedData = cacheManager.get<T>(key);
      if (cachedData) {
        setData(cachedData);
        setError(null);
        return cachedData;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setData(result);
      cacheManager.set(key, result, ttl);
      return result;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl, enabled, onError, cacheManager]);

  const invalidate = useCallback(() => {
    cacheManager.delete(key);
    setData(null);
  }, [key, cacheManager]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Subscribe to cache changes
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = cacheManager.subscribe(key, () => {
      const cachedData = cacheManager.get<T>(key);
      setData(cachedData);
    });

    return unsubscribe;
  }, [key, enabled, cacheManager]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    isStale: data ? !cacheManager.has(key) : false
  };
}

// Hook for cache statistics (useful for debugging)
export function useCacheStats() {
  const [stats, setStats] = useState(CacheManager.getInstance().getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(CacheManager.getInstance().getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}

// Utility functions
export const cacheUtils = {
  clearAll: () => CacheManager.getInstance().clear(),
  getStats: () => CacheManager.getInstance().getStats(),
  invalidate: (key: string) => CacheManager.getInstance().delete(key),
  
  // Prefetch data
  prefetch: async <T>(key: string, fetcher: () => Promise<T>, ttl?: number) => {
    const cache = CacheManager.getInstance();
    if (!cache.has(key)) {
      try {
        const data = await fetcher();
        cache.set(key, data, ttl);
        return data;
      } catch (error) {
        console.error(`Prefetch failed for key: ${key}`, error);
        throw error;
      }
    }
    return cache.get<T>(key);
  }
};

export default CacheManager;
