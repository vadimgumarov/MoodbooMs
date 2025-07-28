// Enhanced crash logger for React app
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRASH: 'CRASH'
};

class CrashLogger {
  constructor() {
    this.logs = [];
    this.startTime = Date.now();
    this.componentStack = [];
    
    // Send heartbeat to main process every 500ms
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 500);
    
    // Catch React errors
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handleRejection.bind(this));
  }
  
  log(level, message, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      uptime: Date.now() - this.startTime,
      componentStack: [...this.componentStack]
    };
    
    this.logs.push(entry);
    
    // Keep only last 100 logs in memory
    if (this.logs.length > 100) {
      this.logs.shift();
    }
    
    // Send to console
    console.log(`[${level}] ${message}`, data);
    
    // Send to main process
    this.sendToMain('app-log', entry);
    
    // If it's a crash, send all recent logs
    if (level === LOG_LEVELS.CRASH) {
      this.sendCrashReport();
    }
  }
  
  pushComponent(componentName) {
    this.componentStack.push(componentName);
    this.log(LOG_LEVELS.DEBUG, `Entering component: ${componentName}`);
  }
  
  popComponent(componentName) {
    this.componentStack.pop();
    this.log(LOG_LEVELS.DEBUG, `Exiting component: ${componentName}`);
  }
  
  handleError(event) {
    this.log(LOG_LEVELS.ERROR, 'Window error caught', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack || event.error
    });
  }
  
  handleRejection(event) {
    this.log(LOG_LEVELS.ERROR, 'Unhandled rejection', {
      reason: event.reason,
      promise: event.promise
    });
  }
  
  sendHeartbeat() {
    this.sendToMain('heartbeat', {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      componentStack: this.componentStack,
      lastLog: this.logs[this.logs.length - 1]
    });
  }
  
  sendCrashReport() {
    this.sendToMain('crash-report', {
      logs: this.logs,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      componentStack: this.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }
  
  sendToMain(channel, data) {
    if (window.electronAPI && window.electronAPI.dev && window.electronAPI.dev.log) {
      window.electronAPI.dev.log({
        channel,
        data
      });
    }
  }
  
  destroy() {
    clearInterval(this.heartbeatInterval);
    window.removeEventListener('error', this.handleError);
    window.removeEventListener('unhandledrejection', this.handleRejection);
  }
}

// Create singleton instance
const crashLogger = new CrashLogger();

// Export logger functions
export const logger = {
  debug: (message, data) => crashLogger.log(LOG_LEVELS.DEBUG, message, data),
  info: (message, data) => crashLogger.log(LOG_LEVELS.INFO, message, data),
  warn: (message, data) => crashLogger.log(LOG_LEVELS.WARN, message, data),
  error: (message, data) => crashLogger.log(LOG_LEVELS.ERROR, message, data),
  crash: (message, data) => crashLogger.log(LOG_LEVELS.CRASH, message, data),
  pushComponent: (name) => crashLogger.pushComponent(name),
  popComponent: (name) => crashLogger.popComponent(name),
  sendCrashReport: () => crashLogger.sendCrashReport()
};

// Log app startup
logger.info('React app starting', {
  timestamp: new Date().toISOString(),
  url: window.location.href
});

export default logger;