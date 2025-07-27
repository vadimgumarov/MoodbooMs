const fs = require('fs');
const path = require('path');

const heartbeatFile = path.join(__dirname, 'logs', 'menu-heartbeat.txt');

function checkMenuStatus() {
  try {
    if (!fs.existsSync(heartbeatFile)) {
      console.log('❌ MENU: NOT RUNNING (no heartbeat file)');
      return false;
    }
    
    const content = fs.readFileSync(heartbeatFile, 'utf8');
    
    if (content.startsWith('CRASHED')) {
      console.log('💥 MENU: CRASHED');
      console.log(content);
      return false;
    }
    
    // Check if heartbeat is recent (within last 3 seconds)
    const match = content.match(/ALIVE: (.+)/);
    if (match) {
      const lastHeartbeat = new Date(match[1]);
      const now = new Date();
      const secondsSinceHeartbeat = (now - lastHeartbeat) / 1000;
      
      if (secondsSinceHeartbeat < 3) {
        console.log('✅ MENU: RUNNING');
        return true;
      } else {
        console.log(`❌ MENU: DEAD (no heartbeat for ${Math.round(secondsSinceHeartbeat)}s)`);
        return false;
      }
    }
  } catch (error) {
    console.log('❌ MENU: ERROR checking status:', error.message);
    return false;
  }
}

// Check status
checkMenuStatus();

// If running as a module
module.exports = { checkMenuStatus };