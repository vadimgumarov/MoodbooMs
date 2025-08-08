const { autoUpdater } = require('electron-updater');
const { app, dialog, BrowserWindow } = require('electron');
const path = require('path');

class AutoUpdaterManager {
  constructor() {
    this.window = null;
    this.isCheckingForUpdate = false;
    this.updateAvailable = false;
    this.downloadProgress = 0;
    
    // Configure auto-updater
    autoUpdater.autoDownload = false; // Manual download control
    autoUpdater.autoInstallOnAppQuit = true;
    
    // Set up GitHub releases as update source
    if (process.platform === 'darwin') {
      autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'vadimgumarov',
        repo: 'MoodbooMs',
        releaseType: 'release'
      });
    }
    
    this.setupEventHandlers();
  }

  setWindow(window) {
    this.window = window;
  }

  setupEventHandlers() {
    // Checking for update
    autoUpdater.on('checking-for-update', () => {
      this.isCheckingForUpdate = true;
      console.log('[AutoUpdater] Checking for updates...');
      this.sendStatusToWindow('checking-for-update');
    });

    // Update available
    autoUpdater.on('update-available', (info) => {
      this.isCheckingForUpdate = false;
      this.updateAvailable = true;
      console.log('[AutoUpdater] Update available:', info.version);
      this.sendStatusToWindow('update-available', info);
      
      // Show dialog to user
      const response = dialog.showMessageBoxSync(this.window, {
        type: 'info',
        title: 'Update Available',
        message: `A new version ${info.version} is available. Current version is ${app.getVersion()}.`,
        detail: 'Would you like to download and install it now?',
        buttons: ['Download and Install', 'Later'],
        defaultId: 0,
        cancelId: 1
      });
      
      if (response === 0) {
        this.downloadUpdate();
      }
    });

    // No update available
    autoUpdater.on('update-not-available', (info) => {
      this.isCheckingForUpdate = false;
      console.log('[AutoUpdater] No updates available');
      this.sendStatusToWindow('update-not-available', info);
    });

    // Error checking/downloading
    autoUpdater.on('error', (err) => {
      this.isCheckingForUpdate = false;
      console.error('[AutoUpdater] Error:', err);
      this.sendStatusToWindow('error', err.message);
      
      // Only show error dialog if user manually checked
      if (this.manualCheck) {
        dialog.showErrorBox('Update Error', 
          `Error checking for updates: ${err.message}`);
      }
    });

    // Download progress
    autoUpdater.on('download-progress', (progressObj) => {
      this.downloadProgress = progressObj.percent;
      let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
      logMessage += ` - Downloaded ${progressObj.percent.toFixed(2)}%`;
      logMessage += ` (${progressObj.transferred}/${progressObj.total})`;
      
      console.log('[AutoUpdater]', logMessage);
      this.sendStatusToWindow('download-progress', progressObj);
    });

    // Update downloaded
    autoUpdater.on('update-downloaded', (info) => {
      console.log('[AutoUpdater] Update downloaded');
      this.sendStatusToWindow('update-downloaded', info);
      
      // Show restart dialog
      const response = dialog.showMessageBoxSync(this.window, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded successfully.',
        detail: 'The application will restart to apply the update.',
        buttons: ['Restart Now', 'Restart Later'],
        defaultId: 0,
        cancelId: 1
      });
      
      if (response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  }

  sendStatusToWindow(status, data = null) {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send('update-status', { status, data });
    }
  }

  checkForUpdates(manual = false) {
    if (this.isCheckingForUpdate) {
      console.log('[AutoUpdater] Already checking for updates');
      return;
    }
    
    this.manualCheck = manual;
    
    // Don't check in development mode
    if (process.env.ELECTRON_DEV === 'true') {
      console.log('[AutoUpdater] Skipping update check in development mode');
      if (manual) {
        dialog.showMessageBox(this.window, {
          type: 'info',
          title: 'Development Mode',
          message: 'Auto-update is disabled in development mode.',
          buttons: ['OK']
        });
      }
      return;
    }
    
    autoUpdater.checkForUpdates().catch(err => {
      console.error('[AutoUpdater] Check for updates failed:', err);
    });
  }

  downloadUpdate() {
    console.log('[AutoUpdater] Starting download...');
    autoUpdater.downloadUpdate();
  }

  getUpdateSettings() {
    return {
      autoDownload: autoUpdater.autoDownload,
      autoInstallOnAppQuit: autoUpdater.autoInstallOnAppQuit,
      currentVersion: app.getVersion(),
      updateAvailable: this.updateAvailable,
      downloadProgress: this.downloadProgress
    };
  }

  setAutoDownload(enabled) {
    autoUpdater.autoDownload = enabled;
    console.log(`[AutoUpdater] Auto-download ${enabled ? 'enabled' : 'disabled'}`);
  }

  setAutoInstallOnQuit(enabled) {
    autoUpdater.autoInstallOnAppQuit = enabled;
    console.log(`[AutoUpdater] Auto-install on quit ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = AutoUpdaterManager;