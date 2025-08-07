const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');

class AutoUpdaterManager {
  constructor() {
    this.window = null;
    this.updateInfo = null;
    this.updateDownloaded = false;
    
    this.setupAutoUpdater();
  }
  
  setMainWindow(window) {
    this.window = window;
  }
  
  setupAutoUpdater() {
    // Configure auto-updater
    autoUpdater.autoDownload = false; // Don't auto-download, ask user first
    autoUpdater.autoInstallOnAppQuit = true;
    
    // Only check for updates in production
    if (process.env.NODE_ENV === 'development' || process.env.ELECTRON_DEV === 'true') {
      autoUpdater.updateConfigPath = null;
      return;
    }
    
    // Set up event listeners
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...');
      this.sendToRenderer('update-checking');
    });
    
    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info);
      this.updateInfo = info;
      this.sendToRenderer('update-available', {
        version: info.version,
        releaseNotes: info.releaseNotes,
        releaseDate: info.releaseDate
      });
    });
    
    autoUpdater.on('update-not-available', (info) => {
      console.log('Update not available:', info);
      this.sendToRenderer('update-not-available');
    });
    
    autoUpdater.on('error', (err) => {
      console.error('Update error:', err);
      this.sendToRenderer('update-error', { message: err.message });
    });
    
    autoUpdater.on('download-progress', (progressObj) => {
      console.log('Download progress:', progressObj);
      this.sendToRenderer('update-download-progress', {
        percent: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
        bytesPerSecond: progressObj.bytesPerSecond
      });
    });
    
    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded:', info);
      this.updateDownloaded = true;
      this.sendToRenderer('update-downloaded', {
        version: info.version
      });
      
      // Show installation prompt
      this.promptInstallUpdate();
    });
  }
  
  async checkForUpdates(manual = false) {
    try {
      // Skip in development
      if (process.env.NODE_ENV === 'development' || process.env.ELECTRON_DEV === 'true') {
        if (manual) {
          this.sendToRenderer('update-not-available');
        }
        return;
      }
      
      await autoUpdater.checkForUpdates();
    } catch (error) {
      console.error('Error checking for updates:', error);
      this.sendToRenderer('update-error', { message: error.message });
    }
  }
  
  async downloadUpdate() {
    try {
      await autoUpdater.downloadUpdate();
    } catch (error) {
      console.error('Error downloading update:', error);
      this.sendToRenderer('update-error', { message: error.message });
    }
  }
  
  async installUpdate() {
    if (this.updateDownloaded) {
      autoUpdater.quitAndInstall(false, true);
    }
  }
  
  async promptInstallUpdate() {
    if (!this.window) return;
    
    const response = await dialog.showMessageBox(this.window, {
      type: 'info',
      buttons: ['Install Now', 'Install Later'],
      defaultId: 0,
      title: 'Update Ready',
      message: 'A new version has been downloaded',
      detail: `Version ${this.updateInfo?.version} is ready to install. The application will restart to complete the update.`
    });
    
    if (response.response === 0) {
      this.installUpdate();
    }
  }
  
  sendToRenderer(channel, data = null) {
    if (this.window && this.window.webContents) {
      this.window.webContents.send(`auto-updater-${channel}`, data);
    }
  }
}

module.exports = AutoUpdaterManager;