// Performance monitoring utilities for MoodBooMs
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.memorySnapshots = [];
    this.renderTimes = [];
    this.isProduction = process.env.NODE_ENV === 'production';
    this.isDev = process.env.NODE_ENV === 'development';
    this.isE2E = process.env.E2E_TESTING === 'true';
    
    // Performance budgets (in milliseconds)
    this.budgets = {
      startup: 2000,          // App startup time
      tabSwitch: 500,         // Tab navigation
      calendarRender: 100,    // Calendar month render
      dataOperation: 1000,    // Save/load operations
      memoryBaseline: 100,    // MB
      memoryPeak: 200,        // MB
      renderFrame: 16.67      // 60fps target
    };
    
    this.init();
  }

  init() {
    // Only enable monitoring in development or when explicitly requested
    if (!this.isDev && !this.isE2E) return;
    
    // Start memory monitoring
    this.startMemoryMonitoring();
    
    // Set up performance observers if available
    if (typeof PerformanceObserver !== 'undefined') {
      this.setupPerformanceObservers();
    }
    
    // Track initial memory baseline
    this.markMemoryBaseline();
  }

  // === Startup Performance ===
  
  markStartup(phase) {
    if (!performance.mark) return;
    
    const markName = `startup-${phase}`;
    performance.mark(markName);
    
    if (phase === 'complete') {
      this.measureStartupTime();
    }
  }

  measureStartupTime() {
    try {
      if (performance.getEntriesByName('startup-begin').length > 0) {
        performance.measure('total-startup', 'startup-begin', 'startup-complete');
        const measure = performance.getEntriesByName('total-startup')[0];
        
        this.recordMetric('startup-time', measure.duration);
        
        if (measure.duration > this.budgets.startup) {
          this.logBudgetViolation('startup-time', measure.duration, this.budgets.startup);
        }
        
        return measure.duration;
      }
    } catch (error) {
      console.warn('Failed to measure startup time:', error);
    }
    return null;
  }

  // === Memory Monitoring ===

  markMemoryBaseline() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      this.memoryBaseline = {
        rss: usage.rss,
        heapTotal: usage.heapTotal,
        heapUsed: usage.heapUsed,
        external: usage.external,
        timestamp: Date.now()
      };
    } else if (performance.memory) {
      this.memoryBaseline = {
        heapUsed: performance.memory.usedJSHeapSize,
        heapTotal: performance.memory.totalJSHeapSize,
        heapLimit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };
    }
  }

  getCurrentMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        rss: Math.round(usage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024)
      };
    } else if (performance.memory) {
      return {
        heapUsed: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        heapTotal: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        heapLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  startMemoryMonitoring() {
    // Take memory snapshots periodically
    const interval = this.isE2E ? 5000 : 30000; // More frequent in E2E tests
    
    this.memoryInterval = setInterval(() => {
      const usage = this.getCurrentMemoryUsage();
      if (usage) {
        this.memorySnapshots.push({
          ...usage,
          timestamp: Date.now()
        });
        
        // Keep only last 100 snapshots
        if (this.memorySnapshots.length > 100) {
          this.memorySnapshots = this.memorySnapshots.slice(-100);
        }
        
        // Check for memory leaks
        this.checkMemoryLeak(usage);
      }
    }, interval);
  }

  checkMemoryLeak(currentUsage) {
    if (!this.memoryBaseline) return;
    
    const heapGrowth = currentUsage.heapUsed - Math.round(this.memoryBaseline.heapUsed / 1024 / 1024);
    
    // Alert if memory has grown significantly
    if (heapGrowth > 50) { // 50MB growth
      this.logMemoryWarning('potential-memory-leak', {
        baseline: Math.round(this.memoryBaseline.heapUsed / 1024 / 1024),
        current: currentUsage.heapUsed,
        growth: heapGrowth
      });
    }
    
    // Check against budget
    if (currentUsage.heapUsed > this.budgets.memoryPeak) {
      this.logBudgetViolation('memory-peak', currentUsage.heapUsed, this.budgets.memoryPeak);
    }
  }

  // === Render Performance ===

  measureRenderTime(componentName, renderFunction) {
    if (!performance.now) return renderFunction();
    
    const startTime = performance.now();
    const result = renderFunction();
    const renderTime = performance.now() - startTime;
    
    this.recordMetric(`render-${componentName}`, renderTime);
    
    if (renderTime > this.budgets.renderFrame) {
      this.logBudgetViolation(`render-${componentName}`, renderTime, this.budgets.renderFrame);
    }
    
    return result;
  }

  // React Profiler callback
  onRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
    this.recordMetric(`react-${id}-${phase}`, actualDuration);
    
    // Log slow renders
    if (actualDuration > this.budgets.renderFrame) {
      this.logBudgetViolation(`react-render-${id}`, actualDuration, this.budgets.renderFrame);
    }
    
    // Track render times
    this.renderTimes.push({
      component: id,
      phase,
      duration: actualDuration,
      timestamp: commitTime
    });
    
    // Keep only recent render times
    if (this.renderTimes.length > 1000) {
      this.renderTimes = this.renderTimes.slice(-1000);
    }
  };

  // === Operation Performance ===

  measureOperation(operationName, operation) {
    if (!performance.now) return operation();
    
    const startTime = performance.now();
    
    // Handle both sync and async operations
    const result = operation();
    
    if (result && typeof result.then === 'function') {
      // Async operation
      return result.then(
        (value) => {
          const duration = performance.now() - startTime;
          this.recordMetric(`operation-${operationName}`, duration);
          this.checkOperationBudget(operationName, duration);
          return value;
        },
        (error) => {
          const duration = performance.now() - startTime;
          this.recordMetric(`operation-${operationName}-error`, duration);
          throw error;
        }
      );
    } else {
      // Sync operation
      const duration = performance.now() - startTime;
      this.recordMetric(`operation-${operationName}`, duration);
      this.checkOperationBudget(operationName, duration);
      return result;
    }
  }

  checkOperationBudget(operationName, duration) {
    let budget;
    
    if (operationName.includes('tab') || operationName.includes('navigation')) {
      budget = this.budgets.tabSwitch;
    } else if (operationName.includes('calendar')) {
      budget = this.budgets.calendarRender;
    } else if (operationName.includes('save') || operationName.includes('load') || operationName.includes('data')) {
      budget = this.budgets.dataOperation;
    }
    
    if (budget && duration > budget) {
      this.logBudgetViolation(`operation-${operationName}`, duration, budget);
    }
  }

  // === Performance Observers ===

  setupPerformanceObservers() {
    try {
      // Observe long tasks (> 50ms)
      if ('PerformanceObserver' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              this.recordMetric('long-task', entry.duration);
              this.logPerformanceWarning('long-task', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              });
            }
          });
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      }
      
      // Observe layout shifts
      if ('LayoutShift' in window) {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          let cumulativeScore = 0;
          
          list.getEntries().forEach((entry) => {
            if (!entry.hadRecentInput) {
              cumulativeScore += entry.value;
            }
          });
          
          if (cumulativeScore > 0.1) { // Poor CLS threshold
            this.logPerformanceWarning('layout-shift', { score: cumulativeScore });
          }
        });
        
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      }
    } catch (error) {
      console.warn('Failed to setup performance observers:', error);
    }
  }

  // === Metrics Storage ===

  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const entries = this.metrics.get(name);
    entries.push({
      value,
      timestamp: Date.now()
    });
    
    // Keep only recent entries
    if (entries.length > 100) {
      entries.splice(0, entries.length - 100);
    }
  }

  getMetrics(name) {
    return this.metrics.get(name) || [];
  }

  getMetricSummary(name) {
    const entries = this.getMetrics(name);
    if (entries.length === 0) return null;
    
    const values = entries.map(e => e.value);
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      recent: values.slice(-10) // Last 10 values
    };
  }

  getAllMetrics() {
    const summary = {};
    
    for (const [name] of this.metrics) {
      summary[name] = this.getMetricSummary(name);
    }
    
    return {
      metrics: summary,
      memory: {
        baseline: this.memoryBaseline,
        current: this.getCurrentMemoryUsage(),
        snapshots: this.memorySnapshots.slice(-10) // Recent snapshots
      },
      renders: this.renderTimes.slice(-20), // Recent renders
      budgets: this.budgets,
      timestamp: Date.now()
    };
  }

  // === Logging ===

  logBudgetViolation(metric, actual, budget) {
    const violation = {
      metric,
      actual: Math.round(actual * 100) / 100,
      budget,
      overBy: Math.round((actual - budget) * 100) / 100,
      percentage: Math.round((actual / budget) * 100),
      timestamp: Date.now()
    };
    
    console.warn(`🚨 Performance Budget Violation:`, violation);
    
    // Store violation for reporting
    this.recordMetric('budget-violations', violation);
  }

  logMemoryWarning(type, data) {
    console.warn(`🧠 Memory Warning (${type}):`, data);
    this.recordMetric('memory-warnings', { type, data, timestamp: Date.now() });
  }

  logPerformanceWarning(type, data) {
    console.warn(`⚡ Performance Warning (${type}):`, data);
    this.recordMetric('performance-warnings', { type, data, timestamp: Date.now() });
  }

  // === Cleanup ===

  destroy() {
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export utilities
export default performanceMonitor;

export const measureStartup = (phase) => performanceMonitor.markStartup(phase);
export const measureOperation = (name, operation) => performanceMonitor.measureOperation(name, operation);
export const measureRender = (component, renderFn) => performanceMonitor.measureRenderTime(component, renderFn);
export const getPerformanceReport = () => performanceMonitor.getAllMetrics();
export const onRenderCallback = performanceMonitor.onRenderCallback;

// React Hook for performance monitoring
export const usePerformanceMonitoring = (componentName) => {
  const measureRender = (renderFn) => {
    return performanceMonitor.measureRenderTime(componentName, renderFn);
  };
  
  const measureOperation = (operationName, operation) => {
    return performanceMonitor.measureOperation(`${componentName}-${operationName}`, operation);
  };
  
  return { measureRender, measureOperation };
};