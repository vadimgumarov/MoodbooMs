// Electron main process performance monitoring
const { app } = require('electron');
const fs = require('fs');
const path = require('path');

class ElectronPerformanceMonitor {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      startup: {},
      memory: [],
      operations: {}
    };
    this.isProduction = app.isPackaged;
    this.isDev = process.env.NODE_ENV === 'development';
    
    this.init();
  }

  init() {
    // Mark app start
    this.markStartupPhase('app-start');
    
    // Set up Electron event listeners
    this.setupElectronListeners();
    
    // Start memory monitoring
    this.startMemoryMonitoring();
    
    // Set up periodic reporting
    if (this.isDev) {
      this.startPeriodicReporting();
    }
  }

  setupElectronListeners() {
    app.on('ready', () => {
      this.markStartupPhase('electron-ready');
    });

    app.on('activate', () => {
      this.markStartupPhase('app-activated');
    });

    app.on('browser-window-created', (event, window) => {
      const windowId = window.id;
      this.markStartupPhase(`window-${windowId}-created`);
      
      window.webContents.on('did-finish-load', () => {
        this.markStartupPhase(`window-${windowId}-loaded`);
      });
      
      window.webContents.on('dom-ready', () => {
        this.markStartupPhase(`window-${windowId}-dom-ready`);
        
        // Calculate total startup time
        if (!this.metrics.startup.totalStartupTime) {
          const totalTime = Date.now() - this.startTime;
          this.metrics.startup.totalStartupTime = totalTime;
          
          console.log(`🚀 App startup completed in ${totalTime}ms`);
          
          // Check against budget (2 seconds)
          if (totalTime > 2000) {
            console.warn(`⚠️ Slow startup: ${totalTime}ms > 2000ms budget`);
          }
        }
      });
    });
  }

  markStartupPhase(phase) {
    const now = Date.now();
    this.metrics.startup[phase] = {
      timestamp: now,
      elapsed: now - this.startTime
    };
    
    if (this.isDev) {
      console.log(`📊 Startup phase '${phase}': ${now - this.startTime}ms`);
    }
  }

  startMemoryMonitoring() {
    const collectMemoryStats = () => {
      try {
        const usage = process.memoryUsage();
        const appMetrics = app.getAppMetrics();
        
        const memorySnapshot = {
          timestamp: Date.now(),
          elapsed: Date.now() - this.startTime,
          process: {
            rss: Math.round(usage.rss / 1024 / 1024), // MB
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
            external: Math.round(usage.external / 1024 / 1024)
          },
          app: {
            processCount: appMetrics.length,
            totalMemory: Math.round(
              appMetrics.reduce((total, metric) => {
                return total + (metric.memory?.workingSetSize || 0);
              }, 0) / 1024 / 1024
            )
          }
        };
        
        this.metrics.memory.push(memorySnapshot);
        
        // Keep only last 100 snapshots
        if (this.metrics.memory.length > 100) {
          this.metrics.memory = this.metrics.memory.slice(-100);
        }
        
        // Check for memory leaks
        this.checkMemoryThresholds(memorySnapshot);
        
      } catch (error) {
        console.warn('Failed to collect memory stats:', error);
      }
    };
    
    // Collect initial baseline
    collectMemoryStats();
    
    // Monitor every 30 seconds
    this.memoryInterval = setInterval(collectMemoryStats, 30000);
  }

  checkMemoryThresholds(snapshot) {
    const { heapUsed, rss } = snapshot.process;
    
    // Alert if heap usage exceeds 200MB
    if (heapUsed > 200) {
      console.warn(`🧠 High memory usage: ${heapUsed}MB heap`);
    }
    
    // Alert if RSS exceeds 300MB
    if (rss > 300) {
      console.warn(`🧠 High RSS usage: ${rss}MB`);
    }
    
    // Check for memory growth over time
    if (this.metrics.memory.length > 10) {
      const recent = this.metrics.memory.slice(-10);
      const oldest = recent[0];
      const newest = recent[recent.length - 1];
      const growth = newest.process.heapUsed - oldest.process.heapUsed;
      
      if (growth > 50) { // 50MB growth in last 10 samples
        console.warn(`📈 Memory leak detected: ${growth}MB growth over ${recent.length} samples`);
      }
    }
  }

  measureOperation(name, operation) {
    const startTime = Date.now();
    
    try {
      const result = operation();
      const duration = Date.now() - startTime;
      
      this.recordOperation(name, duration, true);
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordOperation(name, duration, false, error.message);
      throw error;
    }
  }

  recordOperation(name, duration, success, errorMessage = null) {
    if (!this.metrics.operations[name]) {
      this.metrics.operations[name] = [];
    }
    
    this.metrics.operations[name].push({
      duration,
      success,
      error: errorMessage,
      timestamp: Date.now()
    });
    
    // Keep only last 50 operations per type
    if (this.metrics.operations[name].length > 50) {
      this.metrics.operations[name] = this.metrics.operations[name].slice(-50);
    }
    
    if (this.isDev) {
      const status = success ? '✅' : '❌';
      console.log(`${status} Operation '${name}': ${duration}ms${errorMessage ? ` (${errorMessage})` : ''}`);
    }
  }

  startPeriodicReporting() {
    // Generate performance report every 5 minutes in development
    setInterval(() => {
      this.generateReport();
    }, 5 * 60 * 1000);
  }

  generateReport() {
    const report = {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      startup: this.metrics.startup,
      memory: {
        current: this.metrics.memory[this.metrics.memory.length - 1],
        baseline: this.metrics.memory[0],
        samples: this.metrics.memory.length
      },
      operations: {}
    };
    
    // Summarize operations
    Object.entries(this.metrics.operations).forEach(([name, operations]) => {
      const successful = operations.filter(op => op.success);
      const failed = operations.filter(op => !op.success);
      const durations = successful.map(op => op.duration);
      
      report.operations[name] = {
        total: operations.length,
        successful: successful.length,
        failed: failed.length,
        avgDuration: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
        minDuration: durations.length ? Math.min(...durations) : 0,
        maxDuration: durations.length ? Math.max(...durations) : 0
      };
    });
    
    if (this.isDev) {
      console.log('📊 Performance Report:', JSON.stringify(report, null, 2));
    }
    
    // Save report to file in development
    if (this.isDev) {
      this.saveReportToFile(report);
    }
    
    return report;
  }

  saveReportToFile(report) {
    try {
      const reportsDir = path.join(__dirname, '../logs');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `performance-${timestamp}.json`;
      const filepath = path.join(reportsDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      console.log(`💾 Performance report saved: ${filename}`);
      
    } catch (error) {
      console.warn('Failed to save performance report:', error);
    }
  }

  // Get current performance data for IPC
  getPerformanceData() {
    return {
      startup: this.metrics.startup,
      memory: this.metrics.memory.slice(-10), // Recent memory data
      operations: Object.entries(this.metrics.operations).reduce((acc, [name, ops]) => {
        acc[name] = ops.slice(-5); // Recent operations
        return acc;
      }, {}),
      uptime: Date.now() - this.startTime
    };
  }

  cleanup() {
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
  }
}

// Export singleton
const performanceMonitor = new ElectronPerformanceMonitor();

module.exports = performanceMonitor;