# Performance Monitoring Dashboard

## Overview

The Performance Dashboard provides real-time monitoring of system metrics, service health, and performance analytics.

## Component Location

**Location**: `src/components/PerformanceDashboard.tsx`

## Features

### 1. Real-Time Metrics
- **Response Time**: Average API response time with visual indicator
- **Throughput**: Requests per minute
- **Error Rate**: Percentage of failed requests
- **Cache Hit Rate**: Cache performance percentage
- **Memory Usage**: Current memory consumption
- **CPU Usage**: Current CPU utilization
- **Active Users**: Number of concurrent users

### 2. System Health Monitoring
- Service status indicators (online/offline/degraded)
- Per-service response times
- Health status badge (healthy/degraded/critical)

### 3. Timeframe Selection
- 1 Hour view
- 24 Hours view
- 7 Days view

### 4. Auto-Refresh
- Updates every 5 seconds
- Pull-to-refresh support
- Manual refresh button

## Usage

### Basic Integration
```typescript
import PerformanceDashboard from './components/PerformanceDashboard';

// In your screen/navigation
<PerformanceDashboard />
```

### Access in Navigation
Add to your navigator:
```typescript
import PerformanceDashboard from '../components/PerformanceDashboard';

// In navigation config
{
  name: 'Performance',
  component: PerformanceDashboard,
  options: {
    title: 'Performance Metrics',
  }
}
```

## Metrics Explained

### Response Time
- **< 500ms**: Excellent (Green)
- **500-1000ms**: Good (Amber)
- **> 1000ms**: Needs attention (Red)

### Error Rate
- **< 1%**: Healthy (Green)
- **1-5%**: Degraded (Amber)
- **> 5%**: Critical (Red)

### Resource Usage
- **< 70%**: Healthy (Green)
- **70-90%**: Warning (Amber)
- **> 90%**: Critical (Red)

## Dependencies

### Required Services
- `PerformanceService`: Provides performance metrics
- `MonitoringService`: Provides system health data

### Service Methods Used
```typescript
// PerformanceService
getMetrics(): Promise<PerformanceMetrics>

// MonitoringService
getServiceHealth(): Promise<SystemHealth>
```

## Customization

### Custom Metrics
Edit the `PerformanceMetrics` interface and add new metric cards:

```typescript
interface PerformanceMetrics {
  // ... existing metrics
  customMetric: number;
}
```

### Custom Timeframes
Modify the timeframe options:

```typescript
const timeframes = ['15m', '1h', '24h', '7d', '30d'] as const;
```

### Styling
Customize styles in the `styles` StyleSheet object:
- Colors
- Layout
- Card design
- Metric visualization

## Data Sources

The dashboard pulls data from:
1. **PerformanceService**: Metrics collection
2. **MonitoringService**: Health monitoring
3. **Background jobs**: Periodic metric collection

## Best Practices

1. **Refresh Rate**: Don't update too frequently (current: 5s)
2. **Caching**: Cache metrics to reduce service calls
3. **Error Handling**: Show friendly errors if services unavailable
4. **Loading States**: Show loading indicators during data fetch
5. **Accessibility**: Ensure all metrics are readable and accessible

## Troubleshooting

### Metrics Not Loading
- Check service availability
- Verify service permissions
- Check network connectivity

### Stale Data
- Pull to refresh
- Check service update intervals
- Verify background jobs running

### Performance Issues
- Reduce refresh frequency
- Implement metric caching
- Optimize service queries

---

**Component**: `PerformanceDashboard.tsx`  
**Last Updated**: $(date)  
**Auto-Refresh**: 5 seconds  
**Timeframes**: 1h, 24h, 7d

