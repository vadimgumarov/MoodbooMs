const fs = require('fs');
const path = require('path');

// Enhanced crash monitoring with detailed logging
const logsDir = path.join(__dirname, '..', 'logs');
const heartbeatFile = path.join(logsDir, 'menu-heartbeat.txt');
const crashLogFile = path.join(logsDir, `crash-${new Date().toISOString().split('T')[0]}.log`);

let lastRendererHeartbeat = Date.now();
let rendererAlive = false;
let memoryInterval;

function logCrash(message, error = null) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n${error ? `Error: ${error.message}\nStack: ${error.stack}\n` : ''}\n`;
  
  try {
    fs.appendFileSync(crashLogFile, logEntry);
    console.error(logEntry);
  } catch (e) {
    console.error('Failed to write crash log:', e);
  }
}

function logMemoryUsage() {
  const usage = process.memoryUsage();
  const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);
  
  const memoryInfo = `MEMORY: RSS=${mb(usage.rss)}MB, Heap=${mb(usage.heapUsed)}/${mb(usage.heapTotal)}MB, External=${mb(usage.external)}MB`;
  logCrash(memoryInfo);
  
  // Alert if memory is excessive (> 500MB heap)
  if (usage.heapUsed > 500 * 1024 * 1024) {
    logCrash(`WARNING: High memory usage detected! Heap: ${mb(usage.heapUsed)}MB`);
  }
}

function startHeartbeat() {
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Write initial heartbeat
  fs.writeFileSync(heartbeatFile, `STARTED: ${new Date().toISOString()}`);
  logCrash('=== APP STARTED ===');
  
  // Log initial memory usage
  logMemoryUsage();
  
  // Monitor memory every 10 seconds
  memoryInterval = setInterval(() => {
    logMemoryUsage();
  }, 10000);
  
  // Main process heartbeat - every second
  const mainHeartbeat = setInterval(() => {
    try {
      const status = rendererAlive 
        ? `ALIVE: Main + Renderer (${Date.now() - lastRendererHeartbeat}ms ago)`
        : `ALIVE: Main only (Renderer dead for ${Date.now() - lastRendererHeartbeat}ms)`;
      
      fs.writeFileSync(heartbeatFile, `${status} at ${new Date().toISOString()}`);
      
      // Check if renderer is dead (no heartbeat for 5 seconds)
      if (rendererAlive && Date.now() - lastRendererHeartbeat > 5000) {
        rendererAlive = false;
        logCrash('RENDERER PROCESS DIED - No heartbeat for 5 seconds');
      }
    } catch (error) {
      console.error('Failed to write heartbeat:', error);
    }
  }, 1000);
  
  // Process exit handlers
  process.on('exit', (code) => {
    clearInterval(mainHeartbeat);
    clearInterval(memoryInterval);
    const message = `PROCESS EXIT: Code ${code}`;
    fs.writeFileSync(heartbeatFile, `${message} at ${new Date().toISOString()}`);
    logCrash(message);
    logMemoryUsage(); // Log final memory state
  });
  
  // Crash handlers
  process.on('uncaughtException', (error) => {
    clearInterval(mainHeartbeat);
    fs.writeFileSync(heartbeatFile, `CRASHED: ${new Date().toISOString()}`);
    logCrash('UNCAUGHT EXCEPTION', error);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logCrash(`UNHANDLED REJECTION at ${promise}`, { message: reason });
  });
  
  // Signals
  ['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
    process.on(signal, () => {
      clearInterval(mainHeartbeat);
      const message = `RECEIVED ${signal}`;
      fs.writeFileSync(heartbeatFile, `${message} at ${new Date().toISOString()}`);
      logCrash(message);
      process.exit(0);
    });
  });
}

// Update renderer heartbeat
function updateRendererHeartbeat() {
  lastRendererHeartbeat = Date.now();
  if (!rendererAlive) {
    rendererAlive = true;
    logCrash('RENDERER PROCESS ALIVE');
  }
}

// Log renderer crashes
function logRendererCrash(crashData) {
  rendererAlive = false;
  logCrash('RENDERER CRASH REPORT', {
    message: JSON.stringify(crashData, null, 2)
  });
}

module.exports = { 
  startHeartbeat, 
  updateRendererHeartbeat,
  logRendererCrash,
  logCrash
};