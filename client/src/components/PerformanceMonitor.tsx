import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Collapse,
  Stack
} from '@mui/material';
import {
  Speed,
  Memory,
  NetworkCheck,
  VisibilityOff
} from '@mui/icons-material';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

// Performance Monitor Component (for development)
const PerformanceMonitor = () => {
  const { metrics, isMonitoring } = usePerformanceMonitor();
  const [visible, setVisible] = useState(false);

  const formatTime = (time: number | undefined) => {
    if (time === undefined) return 'N/A';
    return `${Math.round(time)}ms`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getMemoryUsagePercentage = () => {
    if (!metrics.memoryUsage) return 0;
    return (metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.totalJSHeapSize) * 100;
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !isMonitoring) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: 350
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <IconButton
          onClick={() => setVisible(!visible)}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
          size="small"
        >
          {visible ? <VisibilityOff /> : <Speed />}
        </IconButton>
      </Box>

      <Collapse in={visible}>
        <Paper elevation={8} sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Speed /> Performance Monitor
          </Typography>

          {/* Basic Metrics */}
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Loading Metrics
          </Typography>
          
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">TTFB:</Typography>
              <Typography variant="body2">{formatTime(metrics.ttfb)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">DOM Ready:</Typography>
              <Typography variant="body2">{formatTime(metrics.domContentLoaded)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Load Event:</Typography>
              <Typography variant="body2">{formatTime(metrics.loadEvent)}</Typography>
            </Box>
          </Stack>

          {/* Memory Usage */}
          {metrics.memoryUsage && (
            <>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Memory /> Memory Usage
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {formatBytes(metrics.memoryUsage.usedJSHeapSize)}
                  </Typography>
                  <Typography variant="body2">
                    {getMemoryUsagePercentage().toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={getMemoryUsagePercentage()}
                  color={getMemoryUsagePercentage() > 80 ? 'error' : 'primary'}
                />
                <Typography variant="caption" color="text.secondary">
                  Limit: {formatBytes(metrics.memoryUsage.jsHeapSizeLimit)}
                </Typography>
              </Box>
            </>
          )}

          {/* Performance Tips */}
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NetworkCheck /> Tips
          </Typography>
          <Stack spacing={1}>
            {metrics.ttfb && metrics.ttfb > 1000 && (
              <Alert severity="warning" sx={{ p: 1 }}>
                TTFB is high (&gt;1s). Check server response time.
              </Alert>
            )}
            
            {metrics.loadEvent && metrics.loadEvent > 5000 && (
              <Alert severity="warning" sx={{ p: 1 }}>
                Page load is slow (&gt;5s). Consider code splitting.
              </Alert>
            )}
            
            {getMemoryUsagePercentage() > 80 && (
              <Alert severity="error" sx={{ p: 1 }}>
                High memory usage (&gt;80%). Check for memory leaks.
              </Alert>
            )}
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Development mode only
          </Typography>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default PerformanceMonitor;
