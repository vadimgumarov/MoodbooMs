// Performance monitoring configuration and budgets
module.exports = {
  // Performance budgets in milliseconds
  budgets: {
    // App startup time
    'startup-time': {
      budget: 2000,
      warning: 1500,
      unit: 'ms',
      description: 'Total app startup time from launch to interactive'
    },

    // React component render times
    'render-calendar': {
      budget: 16.67, // 60fps
      warning: 10,
      unit: 'ms',
      description: 'Calendar component render time'
    },
    
    'render-status-card': {
      budget: 16.67,
      warning: 10,
      unit: 'ms',
      description: 'Status card component render time'
    },

    // Navigation performance
    'tab-switch': {
      budget: 500,
      warning: 300,
      unit: 'ms',
      description: 'Tab navigation response time'
    },

    'calendar-month-navigation': {
      budget: 300,
      warning: 200,
      unit: 'ms',
      description: 'Calendar month change animation'
    },

    // Data operations
    'data-save': {
      budget: 1000,
      warning: 500,
      unit: 'ms',
      description: 'Settings save operation'
    },

    'data-load': {
      budget: 1000,
      warning: 500,
      unit: 'ms',
      description: 'Data loading from store'
    },

    'data-export': {
      budget: 3000,
      warning: 2000,
      unit: 'ms',
      description: 'Data export operation'
    },

    'data-import': {
      budget: 3000,
      warning: 2000,
      unit: 'ms',
      description: 'Data import operation'
    },

    // Memory usage in MB
    'memory-baseline': {
      budget: 100,
      warning: 80,
      unit: 'MB',
      description: 'Baseline memory usage'
    },

    'memory-peak': {
      budget: 200,
      warning: 150,
      unit: 'MB',
      description: 'Peak memory usage'
    },

    // Bundle size in MB
    'bundle-size': {
      budget: 50,
      warning: 40,
      unit: 'MB',
      description: 'Total application bundle size'
    },

    // Animation performance (FPS)
    'animation-fps': {
      budget: 60,
      warning: 45,
      unit: 'fps',
      description: 'Animation frame rate'
    },

    // Long tasks (should not exceed 50ms)
    'long-task': {
      budget: 50,
      warning: 30,
      unit: 'ms',
      description: 'JavaScript long task duration'
    }
  },

  // Performance metrics to collect
  metrics: {
    // Core Web Vitals
    fcp: 'First Contentful Paint',
    lcp: 'Largest Contentful Paint', 
    fid: 'First Input Delay',
    cls: 'Cumulative Layout Shift',
    
    // Custom metrics
    tti: 'Time to Interactive',
    startup: 'App Startup Time',
    navigation: 'Navigation Response Time',
    memory: 'Memory Usage',
    cpu: 'CPU Usage',
    battery: 'Battery Impact'
  },

  // Thresholds for performance alerts
  thresholds: {
    // Memory leak detection
    memoryGrowth: {
      warning: 20, // 20% growth
      critical: 50 // 50% growth
    },

    // CPU usage
    cpuUsage: {
      warning: 50, // 50% CPU
      critical: 80  // 80% CPU
    },

    // Frame drops
    frameDrops: {
      warning: 5,  // 5 dropped frames
      critical: 10 // 10 dropped frames
    }
  },

  // Monitoring intervals
  intervals: {
    memory: 30000,      // 30 seconds
    cpu: 10000,         // 10 seconds
    performance: 5000,  // 5 seconds
    heartbeat: 1000     // 1 second
  },

  // Feature flags
  features: {
    enableInProduction: false,
    enableMemoryTracking: true,
    enableCPUTracking: true,
    enableRenderTracking: true,
    enableNetworkTracking: false,
    enableBatteryTracking: false,
    enableDetailedLogging: process.env.NODE_ENV === 'development'
  },

  // Report configuration
  reporting: {
    // Console reporting
    console: {
      enabled: process.env.NODE_ENV === 'development',
      level: 'warn' // 'info', 'warn', 'error'
    },

    // File reporting
    file: {
      enabled: true,
      path: './logs/performance',
      format: 'json', // 'json', 'csv'
      maxFiles: 10,
      maxAge: '7d'
    },

    // Remote reporting (future feature)
    remote: {
      enabled: false,
      endpoint: null,
      apiKey: null
    }
  },

  // Performance optimization hints
  optimizations: {
    // React optimizations
    react: {
      useMemo: ['Calendar', 'StatusCard', 'HistoryView'],
      useCallback: ['Navigation', 'DataOperations'],
      lazy: ['Settings', 'StyleGuide', 'HistoryView'],
      profiler: ['Calendar', 'MenuBarApp']
    },

    // Bundle optimizations
    bundle: {
      codesplitting: true,
      treeshaking: true,
      minification: true,
      compression: true
    },

    // Image optimizations
    images: {
      webp: true,
      lazy: true,
      responsive: true,
      compression: 0.8
    }
  },

  // Test configuration
  testing: {
    // Performance test scenarios
    scenarios: [
      {
        name: 'App Startup',
        description: 'Measure app startup time',
        budget: 2000,
        steps: ['launch', 'waitForReady', 'measureTime']
      },
      {
        name: 'Calendar Navigation',
        description: 'Measure calendar month switching',
        budget: 300,
        steps: ['openCalendar', 'navigateMonth', 'measureTime']
      },
      {
        name: 'Data Operations',
        description: 'Measure save/load operations',
        budget: 1000,
        steps: ['changeSettings', 'saveData', 'measureTime']
      },
      {
        name: 'Memory Leak Detection',
        description: 'Check for memory leaks during usage',
        budget: 50, // MB growth
        steps: ['baseline', 'heavyUsage', 'measureGrowth']
      }
    ],

    // Automated performance testing
    automation: {
      enabled: process.env.NODE_ENV === 'test',
      runner: 'playwright', // 'playwright', 'puppeteer'
      timeout: 30000,
      retries: 2
    }
  }
};