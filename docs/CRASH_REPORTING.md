# Crash Reporting & Telemetry

MoodBooMs includes an optional crash reporting and telemetry system designed to help improve app reliability and user experience while maintaining strict privacy standards.

## Privacy-First Approach

### What We Collect (Only with User Consent)
- **Error Information**: Stack traces with file paths anonymized
- **App Version**: Current version number for debugging context
- **Platform Information**: OS type and architecture (no personal details)
- **Performance Metrics**: Load times and memory usage patterns
- **Feature Usage**: Which features are used (not what data is entered)

### What We NEVER Collect
- Personal information (names, emails, addresses)
- Cycle data (dates, symptoms, moods, notes)
- File contents or user-entered text
- Location data or IP addresses
- Browser history or other app data

## Technical Implementation

### Crash Reporting Service
- Uses Sentry for professional-grade error tracking
- All data is sanitized before transmission
- File paths are anonymized (e.g., `/Users/[USER]/...`)
- Breadcrumbs filtered for sensitive content

### React Error Boundaries
- Catches and reports React component errors
- Provides user-friendly recovery options
- Offers retry functionality before requiring app restart
- Development mode shows detailed error information

### Local Storage Fallback
- Stores crash data locally when offline
- Limited retention (last 50 errors, 100 events)
- Used for debugging when network is unavailable

## User Control

### Opt-In System
All telemetry is **opt-in only**:
1. First-time users see privacy notice
2. Users can enable/disable at any time
3. Settings are preserved across updates
4. Can be completely disabled

### Granular Controls
Users can control:
- **Crash Reporting**: Error and crash data
- **Usage Analytics**: Feature usage patterns
- **Performance Monitoring**: App performance metrics

### Settings Location
Telemetry preferences are stored in:
- **Key**: `telemetrySettings`
- **Structure**:
  ```json
  {
    "crashReporting": false,
    "telemetry": false, 
    "performanceMonitoring": false
  }
  ```

## Development vs Production

### Development Mode
- All telemetry data is logged to console only
- No network transmission occurs
- Full error details shown in error boundaries
- Mock Sentry DSN used

### Production Mode
- Only enabled if user opts in
- Data transmitted to configured Sentry project
- Sanitized error information only
- User-friendly error messages

## Integration Points

### React Components
```javascript
import { useErrorHandler, withErrorBoundary } from './components/ErrorBoundary';
import { recordEvent, reportError } from './utils/crashReporter';

// Manual error reporting
const reportError = useErrorHandler();
reportError(new Error('Something went wrong'), { context: 'feature_x' });

// Wrap components with error boundary
export default withErrorBoundary(MyComponent, {
  name: 'MyComponent',
  userFriendlyMessage: 'This feature is temporarily unavailable'
});

// Record usage events
recordEvent('feature_used', { feature: 'calendar_view' });
```

### Electron Main Process
```javascript
// In main process
const { crashReporter } = require('electron');

// Configure Electron's built-in crash reporter
crashReporter.start({
  productName: 'MoodBooMs',
  companyName: 'MoodBooMs',
  submitURL: '', // Only if user opts in
  uploadToServer: false // Default to false
});
```

## Data Sanitization

### Automatic PII Removal
- File paths: `/Users/[USER]/...` → `/Users/[REDACTED]/...`
- Email patterns: `user@domain.com` → `[REDACTED]`
- Long strings: Truncated to prevent accidental data inclusion
- Breadcrumbs: Filtered for password/sensitive fields

### Stack Trace Cleaning
- Line numbers and function names preserved
- File paths anonymized
- External library references kept for debugging
- Source maps not uploaded to prevent code exposure

## Error Categories

### Automatic Reporting
- **React Errors**: Component rendering failures
- **Unhandled Exceptions**: JavaScript runtime errors
- **Promise Rejections**: Async operation failures
- **App Crashes**: Electron main process crashes

### Manual Reporting
- **Feature Errors**: User action failures
- **Data Corruption**: Invalid state detection
- **Performance Issues**: Identified bottlenecks

## Analytics Events

### App Lifecycle
- `app_startup`: Application launched
- `app_shutdown`: Application closed
- `feature_used`: Feature interaction
- `error_recovered`: Error boundary retry success

### User Actions (Privacy-Safe)
- `mode_switched`: Queen/King mode toggle
- `view_changed`: Tab navigation
- `settings_updated`: Preference changes
- `export_data`: Data export initiated

## Configuration

### Environment Variables
```bash
# Production Sentry DSN (set in CI/CD)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# Development mode override
NODE_ENV=development  # Disables telemetry transmission
```

### Build Configuration
```json
{
  "scripts": {
    "build": "react-scripts build && cp -r electron build/",
    "build:prod": "GENERATE_SOURCEMAP=false npm run build"
  }
}
```

## Testing

### Manual Testing
```javascript
// Test error boundary
throw new Error('Test error for error boundary');

// Test crash reporting
reportError(new Error('Test crash report'));

// Test telemetry
recordEvent('test_event', { test: true });
```

### Automated Testing
- Error boundary rendering tests
- Telemetry opt-in/opt-out flows
- Data sanitization validation
- Offline storage functionality

## Compliance

### Privacy Regulations
- **GDPR**: Right to data portability and deletion
- **CCPA**: Transparent data collection disclosure
- **COPPA**: No data from users under 13

### Data Retention
- **Crash Reports**: 30 days maximum
- **Analytics Events**: Aggregated only, no individual tracking
- **Local Storage**: Auto-cleanup after 90 days

## Monitoring

### Success Metrics
- Error rate reduction over time
- Feature adoption rates
- Performance improvements
- User retention correlation

### Privacy Metrics
- Opt-in rates
- Data sanitization effectiveness
- Zero PII incidents
- User feedback sentiment

## Future Enhancements

### Planned Features
- Real-time performance monitoring
- Feature flag integration
- A/B testing framework
- Offline analytics sync

### Security Improvements
- End-to-end encryption for crash reports
- Certificate pinning for network security
- Additional PII detection patterns
- Automated privacy compliance checks