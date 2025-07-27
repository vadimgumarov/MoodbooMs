const fs = require('fs');
const path = require('path');

// Write a heartbeat file every second while app is running
const heartbeatFile = path.join(__dirname, '..', 'logs', 'menu-heartbeat.txt');

function startHeartbeat() {
  // Write initial heartbeat
  fs.writeFileSync(heartbeatFile, `ALIVE: ${new Date().toISOString()}`);
  
  // Update heartbeat every second
  const heartbeatInterval = setInterval(() => {
    try {
      fs.writeFileSync(heartbeatFile, `ALIVE: ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Failed to write heartbeat:', error);
    }
  }, 1000);
  
  // Clean up on exit
  process.on('exit', () => {
    clearInterval(heartbeatInterval);
    try {
      fs.writeFileSync(heartbeatFile, `CRASHED/EXITED: ${new Date().toISOString()}`);
    } catch (error) {
      // Silent fail
    }
  });
  
  // Handle crashes
  process.on('uncaughtException', (error) => {
    try {
      fs.writeFileSync(heartbeatFile, `CRASHED: ${new Date().toISOString()}\nError: ${error.message}`);
    } catch (e) {
      // Silent fail
    }
  });
}

module.exports = { startHeartbeat };