import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  domContentLoaded?: number;
  loadEvent?: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// Performance observer for Core Web Vitals
const observeWebVitals = (callback: (metrics: PerformanceMetrics) => void) => {
  const metrics: PerformanceMetrics = {};

  // Navigation timing
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
    metrics.loadEvent = navigation.loadEventEnd - navigation.fetchStart;
    metrics.ttfb = navigation.responseStart - navigation.fetchStart;
    callback(metrics);
  });

  // Memory info (Chrome only)
  if ('memory' in performance) {
    const memory = (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    if (memory) {
      metrics.memoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
  }

  callback(metrics);
};

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsMonitoring(true);
      observeWebVitals(setMetrics);
    }
  }, []);

  const getScoreColor = (metric: string, value: number) => {
    switch (metric) {
      case 'lcp':
        return value <= 2500 ? 'success' : value <= 4000 ? 'warning' : 'error';
      case 'fid':
        return value <= 100 ? 'success' : value <= 300 ? 'warning' : 'error';
      case 'cls':
        return value <= 0.1 ? 'success' : value <= 0.25 ? 'warning' : 'error';
      case 'fcp':
        return value <= 1800 ? 'success' : value <= 3000 ? 'warning' : 'error';
      case 'ttfb':
        return value <= 800 ? 'success' : value <= 1800 ? 'warning' : 'error';
      default:
        return 'default';
    }
  };

  return {
    metrics,
    isMonitoring,
    getScoreColor
  };
};
