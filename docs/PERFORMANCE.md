# Performance Monitoring Documentation

## Overview
Comprehensive performance monitoring system for MoodBooMs to track app responsiveness, memory usage, and identify performance bottlenecks.

## Features
- ✅ **Startup Time Tracking** - Monitor app launch performance
- ✅ **Memory Leak Detection** - Automatic memory growth monitoring
- ✅ **Render Performance** - React component render time tracking
- ✅ **Performance Budgets** - Automated budget violation alerts
- ✅ **Real-time Dashboard** - Visual performance monitoring (dev only)
- ✅ **Automated Testing** - Performance regression tests
- ✅ **Electron Integration** - Main process performance metrics

## Quick Start

### Viewing Performance Dashboard
```bash
# Start app with performance dashboard
npm run perf:monitor

# Or manually add ?perf to URL
http://localhost:3000/?perf
```

### Running Performance Tests
```bash
# Unit performance tests
npm run test:performance

# E2E performance tests  
npm run e2e:perf

# Bundle analysis
npm run perf:analyze
```

## Performance Budgets

| Metric | Budget | Warning | Description |
|--------|---------|---------|-------------|
| **Startup Time** | 2000ms | 1500ms | Total app launch time |
| **Component Render** | 16.67ms | 10ms | React component render (60fps) |
| **Tab Switch** | 500ms | 300ms | Tab navigation response |
| **Calendar Navigation** | 300ms | 200ms | Month switching time |
| **Data Operations** | 1000ms | 500ms | Save/load operations |
| **Memory Baseline** | 100MB | 80MB | Normal memory usage |
| **Memory Peak** | 200MB | 150MB | Maximum memory usage |
| **Bundle Size** | 50MB | 40MB | Total application size |

## Usage Guide

### Basic Monitoring
```javascript
import performanceMonitor, { measureOperation } from './utils/performance';

// Measure any operation
const result = measureOperation('my-operation', () => {
  // Your code here
  return someExpensiveOperation();
});

// Get performance report
const report = performanceMonitor.getAllMetrics();
```

### React Component Profiling
```javascript
import { Profiler } from 'react';
import { onRenderCallback } from './utils/performance';

function MyComponent() {
  return (
    <Profiler id="MyComponent" onRender={onRenderCallback}>
      {/* Component content */}
    </Profiler>
  );
}
```

### Custom Performance Hook
```javascript
import { usePerformanceMonitoring } from './utils/performance';

function MyComponent() {
  const { measureRender, measureOperation } = usePerformanceMonitoring('MyComponent');
  
  const handleClick = () => {
    measureOperation('button-click', () => {
      // Handle click
    });
  };
  
  return measureRender(() => (
    <button onClick={handleClick}>Click me</button>
  ));
}
```

## Architecture

### Frontend (React)
- **`src/utils/performance.js`** - Main performance monitoring class
- **`src/components/PerformanceDashboard.jsx`** - Live monitoring dashboard
- **`src/tests/performance.test.js`** - Automated performance tests
- **`performance.config.js`** - Budget and configuration

### Backend (Electron)
- **`electron/performance-monitor.js`** - Main process monitoring  
- **`electron/main.js`** - Startup time tracking integration
- **`electron/ipcHandlers.js`** - Performance IPC handlers
- **`electron/preload.js`** - Secure performance API exposure

## Configuration

### Performance Budgets
Edit `performance.config.js` to adjust budgets:

```javascript
module.exports = {
  budgets: {
    'startup-time': {
      budget: 2000,    // 2 seconds max
      warning: 1500,   // Warning at 1.5s
      unit: 'ms'
    },
    // ... other budgets
  }
};
```

### Monitoring Features
```javascript
features: {
  enableInProduction: false,      // Disable in production
  enableMemoryTracking: true,     // Track memory usage
  enableCPUTracking: true,        // Track CPU usage  
  enableRenderTracking: true,     // Track React renders
  enableDetailedLogging: true     // Console logging (dev only)
}
```

## Dashboard Features

### Live Metrics
- **Startup Time** - App launch performance
- **Memory Usage** - Current heap usage with trend chart
- **Render Performance** - Latest component render times
- **Budget Violations** - Real-time alerts for slow operations

### Memory Chart
- Visual memory usage over time
- Automatic leak detection alerts
- Memory growth percentage tracking

### Violation Alerts
- Real-time budget violation notifications
- Performance degradation warnings
- Historical violation log

### Performance Tips
- Built-in optimization recommendations
- Component-specific performance hints
- Memory management best practices

## Testing

### Unit Tests
```bash
# Run all performance tests
npm run test:performance

# Specific test patterns
npm test -- --testNamePattern="render performance"
npm test -- --testNamePattern="memory leak"
```

### E2E Performance Tests
```bash
# All E2E performance tests
npm run e2e:perf

# Specific scenarios
npx playwright test --grep "startup performance"
npx playwright test --grep "memory usage"
```

### Test Coverage
- ✅ Component render performance
- ✅ Navigation timing
- ✅ Memory leak detection  
- ✅ Animation performance (60fps)
- ✅ Bundle size validation
- ✅ Data operation timing
- ✅ Budget violation detection

## Optimization Strategies

### React Performance
```javascript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* expensive rendering */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Use useCallback for stable function references
const handleClick = useCallback(() => {
  // Handle click
}, [dependency]);
```

### Memory Optimization
```javascript
// Clean up event listeners
useEffect(() => {
  const handleResize = () => { /* handler */ };
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// Cancel async operations
useEffect(() => {
  let cancelled = false;
  
  fetchData().then(data => {
    if (!cancelled) {
      setData(data);
    }
  });
  
  return () => {
    cancelled = true;
  };
}, []);
```

### Bundle Optimization
```javascript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Code splitting
const routes = [
  {
    path: '/settings',
    component: lazy(() => import('./Settings'))
  }
];
```

## Alerts & Notifications

### Budget Violations
When performance exceeds budgets:
```
🚨 Performance Budget Violation:
  Metric: calendar-render
  Actual: 25.3ms
  Budget: 16.67ms
  Over by: 8.63ms (152% of budget)
```

### Memory Warnings
```
🧠 Memory Warning (potential-memory-leak):
  Baseline: 45MB
  Current: 95MB  
  Growth: 50MB
```

### Performance Insights
```
⚡ Performance Warning (long-task):
  Duration: 75ms
  Type: JavaScript execution
  Component: Calendar render
```

## Troubleshooting

### Common Issues

#### High Memory Usage
1. **Check for memory leaks** - Review event listeners and async operations
2. **Optimize large datasets** - Use virtualization for long lists
3. **Clean up properly** - Ensure useEffect cleanup functions

#### Slow Renders
1. **Profile components** - Use React DevTools Profiler
2. **Optimize re-renders** - Use React.memo and useMemo
3. **Reduce component size** - Split large components

#### Bundle Size Issues
1. **Analyze bundle** - Run `npm run perf:analyze`
2. **Remove unused code** - Use tree shaking
3. **Lazy load features** - Code splitting for heavy components

### Development Tools
```bash
# Start with performance monitoring
npm run perf:monitor

# View performance dashboard
http://localhost:3000/?perf

# Analyze bundle size
npm run perf:analyze

# Memory profiling (Chrome DevTools)
chrome://inspect -> Memory tab
```

## Performance Checklist

### Before Release
- [ ] All performance tests pass
- [ ] No budget violations in critical paths
- [ ] Memory usage stable over time
- [ ] Bundle size within limits
- [ ] Startup time under 2 seconds
- [ ] 60fps animations maintained
- [ ] No memory leaks detected

### Monitoring in Production
- [ ] Error tracking configured
- [ ] Performance budgets enforced
- [ ] Memory monitoring enabled
- [ ] Crash reporting active
- [ ] User experience metrics collected

## Advanced Usage

### Custom Metrics
```javascript
// Track custom business metrics
performanceMonitor.recordMetric('cycles-calculated', duration);
performanceMonitor.recordMetric('predictions-generated', count);
```

### Performance Observer Integration
```javascript
// Observe long tasks
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.duration > 50) {
        performanceMonitor.recordMetric('long-task', entry.duration);
      }
    });
  });
  
  observer.observe({ entryTypes: ['longtask'] });
}
```

### Electron Main Process Monitoring
```javascript
// In main process
const performanceMonitor = require('./performance-monitor');

app.on('ready', () => {
  performanceMonitor.markStartupPhase('app-ready');
});

// Measure operations
const result = performanceMonitor.measureOperation('heavy-operation', () => {
  return doHeavyWork();
});
```

## Future Enhancements
- [ ] Real user monitoring (RUM)
- [ ] Performance regression detection
- [ ] Automated performance optimization
- [ ] A/B testing for performance
- [ ] Machine learning predictions
- [ ] Performance budgets per user segment