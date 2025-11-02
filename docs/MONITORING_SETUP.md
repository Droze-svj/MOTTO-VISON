# Production Monitoring Setup Guide

## Overview

This guide explains how to set up production monitoring, error tracking, and analytics for MOTTO.

## Error Tracking (Sentry)

### Setup

1. **Create Sentry Account**
   - Go to https://sentry.io
   - Create a new project
   - Select "React Native" or "React" platform
   - Copy your DSN

2. **Install Sentry SDK**
   ```bash
   npm install @sentry/react-native
   # or for web
   npm install @sentry/react
   ```

3. **Configure Sentry**
   ```typescript
   // src/utils/monitoring.ts
   import * as Sentry from '@sentry/react-native';
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
     enableAutoSessionTracking: true,
   });
   ```

4. **Add Environment Variables**
   ```env
   SENTRY_DSN=your-sentry-dsn-here
   NODE_ENV=production
   ```

### Usage

The monitoring service is already integrated. Use it like:

```typescript
import monitoring from '../utils/monitoring';

// Capture errors
try {
  // some code
} catch (error) {
  monitoring.captureError(error, { userId: 'user123' });
}

// Capture events
monitoring.captureEvent('user_login', { method: 'email' });

// Set user context
monitoring.setUser('user123', { email: 'user@example.com' });

// Add breadcrumbs
monitoring.addBreadcrumb('User clicked button', 'ui', { button: 'submit' });
```

## Analytics (Optional)

### Google Analytics

1. **Install**
   ```bash
   npm install react-ga4
   ```

2. **Initialize**
   ```typescript
   import ReactGA from 'react-ga4';
   
   ReactGA.initialize('GA_MEASUREMENT_ID');
   ```

3. **Track Events**
   ```typescript
   ReactGA.event({
     category: 'User',
     action: 'Login',
     label: 'Email',
   });
   ```

### Mixpanel (Alternative)

1. **Install**
   ```bash
   npm install mixpanel-browser
   ```

2. **Initialize**
   ```typescript
   import mixpanel from 'mixpanel-browser';
   
   mixpanel.init('MIXPANEL_TOKEN');
   ```

## Performance Monitoring

### New Relic

1. **Install**
   ```bash
   npm install newrelic
   ```

2. **Configure**
   ```javascript
   require('newrelic');
   ```

### Custom Performance Tracking

Already integrated via `monitoring.capturePerformance()`:

```typescript
const start = Date.now();
// ... operation ...
const duration = Date.now() - start;
monitoring.capturePerformance('api_call', duration, { endpoint: '/api/chat' });
```

## Backend Monitoring

### Application Performance Monitoring

1. **Add to Backend** (`backend/main_improved.py`)
   ```python
   from sentry_sdk.integrations.fastapi import FastApiIntegration
   import sentry_sdk
   
   sentry_sdk.init(
       dsn=os.getenv("SENTRY_DSN"),
       integrations=[FastApiIntegration()],
       traces_sample_rate=1.0,
   )
   ```

2. **Install Sentry for Python**
   ```bash
   pip install sentry-sdk[fastapi]
   ```

### Logging

Configure structured logging:

```python
import logging
from pythonjsonlogger import jsonlogger

logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
```

## Dashboard Setup

The Performance Dashboard component is already created:
- Location: `src/components/PerformanceDashboard.tsx`
- Shows: Response times, error rates, resource usage
- Updates: Every 5 seconds

Add to your navigation to access it.

## Alerts Configuration

### Sentry Alerts

1. Go to Sentry Dashboard
2. Create alert rules:
   - Error rate > 5%
   - New issues
   - Slow performance (>1s)
   - Low memory warnings

### Custom Alerts

Set up alerts for:
- API response time > 1000ms
- Error rate > 1%
- Memory usage > 90%
- CPU usage > 80%

## Best Practices

1. **Don't Log Sensitive Data**
   - Never log passwords, tokens, or PII
   - Use data scrubbing in Sentry

2. **Use Appropriate Log Levels**
   - Error: Critical issues
   - Warning: Potential issues
   - Info: Important events
   - Debug: Development only

3. **Set Up Sampling**
   - Don't capture 100% of events in production
   - Use tracesSampleRate: 0.1 (10%)

4. **Monitor Regularly**
   - Check dashboards daily
   - Set up email/Slack alerts
   - Review error trends weekly

5. **User Privacy**
   - Anonymize user IDs when possible
   - Respect user privacy settings
   - Comply with GDPR/CCPA

## Monitoring Checklist

- [ ] Sentry configured and initialized
- [ ] Error tracking working
- [ ] Performance monitoring active
- [ ] Alerts configured
- [ ] Dashboards accessible
- [ ] Backend monitoring set up
- [ ] Log aggregation working
- [ ] User privacy respected

## Troubleshooting

### Errors Not Showing in Sentry
- Check DSN is correct
- Verify network connectivity
- Check Sentry project settings
- Review rate limits

### Performance Issues
- Reduce sample rate
- Filter out noisy events
- Optimize logging

### Missing Context
- Add more breadcrumbs
- Set user context properly
- Include relevant metadata

---

**Last Updated**: $(date)  
**Monitoring Service**: `src/utils/monitoring.ts`  
**Dashboard**: `src/components/PerformanceDashboard.tsx`

