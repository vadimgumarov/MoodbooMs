import React, { useState, useEffect } from 'react';
import { Download, AlertCircle, CheckCircle, RefreshCw, Settings } from 'lucide-react';

const UpdateManager = () => {
  const [updateStatus, setUpdateStatus] = useState(null);
  const [updateSettings, setUpdateSettings] = useState({
    autoDownload: false,
    autoInstallOnAppQuit: true,
    currentVersion: '1.0.0'
  });
  const [isChecking, setIsChecking] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load update settings
    loadUpdateSettings();
    
    // Subscribe to update events
    const unsubscribe = window.electronAPI?.updates?.onUpdateStatus((data) => {
      handleUpdateStatus(data);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadUpdateSettings = async () => {
    if (!window.electronAPI?.updates) return;
    
    try {
      const settings = await window.electronAPI.updates.getSettings();
      if (settings) {
        setUpdateSettings(settings);
      }
    } catch (error) {
      console.error('Error loading update settings:', error);
    }
  };

  const handleUpdateStatus = (data) => {
    const { status, data: updateData } = data;
    
    switch (status) {
      case 'checking-for-update':
        setIsChecking(true);
        setUpdateStatus({ type: 'info', message: 'Checking for updates...' });
        break;
        
      case 'update-available':
        setIsChecking(false);
        setUpdateStatus({
          type: 'success',
          message: `New version ${updateData.version} available!`,
          version: updateData.version,
          releaseNotes: updateData.releaseNotes
        });
        break;
        
      case 'update-not-available':
        setIsChecking(false);
        setUpdateStatus({
          type: 'info',
          message: 'You\'re running the latest version!'
        });
        setTimeout(() => setUpdateStatus(null), 3000);
        break;
        
      case 'download-progress':
        setDownloadProgress(updateData.percent);
        setUpdateStatus({
          type: 'progress',
          message: `Downloading update... ${updateData.percent.toFixed(0)}%`,
          progress: updateData.percent
        });
        break;
        
      case 'update-downloaded':
        setDownloadProgress(100);
        setUpdateStatus({
          type: 'success',
          message: 'Update downloaded! Restart to apply.',
          downloaded: true
        });
        break;
        
      case 'error':
        setIsChecking(false);
        setUpdateStatus({
          type: 'error',
          message: `Update error: ${updateData}`
        });
        setTimeout(() => setUpdateStatus(null), 5000);
        break;
        
      default:
        break;
    }
  };

  const checkForUpdates = async () => {
    if (!window.electronAPI?.updates) {
      setUpdateStatus({
        type: 'error',
        message: 'Updates not available in development mode'
      });
      setTimeout(() => setUpdateStatus(null), 3000);
      return;
    }
    
    setIsChecking(true);
    try {
      await window.electronAPI.updates.checkForUpdates();
    } catch (error) {
      console.error('Error checking for updates:', error);
      setIsChecking(false);
    }
  };

  const downloadUpdate = async () => {
    if (!window.electronAPI?.updates) return;
    
    try {
      await window.electronAPI.updates.downloadUpdate();
    } catch (error) {
      console.error('Error downloading update:', error);
    }
  };

  const handleAutoDownloadToggle = async (enabled) => {
    if (!window.electronAPI?.updates) return;
    
    try {
      await window.electronAPI.updates.setAutoDownload(enabled);
      setUpdateSettings(prev => ({ ...prev, autoDownload: enabled }));
    } catch (error) {
      console.error('Error setting auto-download:', error);
    }
  };

  const handleAutoInstallToggle = async (enabled) => {
    if (!window.electronAPI?.updates) return;
    
    try {
      await window.electronAPI.updates.setAutoInstall(enabled);
      setUpdateSettings(prev => ({ ...prev, autoInstallOnAppQuit: enabled }));
    } catch (error) {
      console.error('Error setting auto-install:', error);
    }
  };

  const getStatusIcon = () => {
    if (!updateStatus) return null;
    
    switch (updateStatus.type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'progress':
        return <Download className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />;
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Updates
          </h3>
          <span className="text-xs text-gray-500">
            v{updateSettings.currentVersion}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Update Settings"
          >
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={checkForUpdates}
            disabled={isChecking}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Checking...' : 'Check for Updates'}
          </button>
        </div>
      </div>

      {/* Update Status */}
      {updateStatus && (
        <div className={`
          flex items-center space-x-2 p-2 rounded text-sm
          ${updateStatus.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : ''}
          ${updateStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : ''}
          ${updateStatus.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : ''}
          ${updateStatus.type === 'progress' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        `}>
          {getStatusIcon()}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span>{updateStatus.message}</span>
              {updateStatus.version && !updateStatus.downloaded && (
                <button
                  onClick={downloadUpdate}
                  className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Download
                </button>
              )}
            </div>
            {updateStatus.type === 'progress' && (
              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Auto-download updates
            </label>
            <input
              type="checkbox"
              checked={updateSettings.autoDownload}
              onChange={(e) => handleAutoDownloadToggle(e.target.checked)}
              className="rounded text-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Auto-install on quit
            </label>
            <input
              type="checkbox"
              checked={updateSettings.autoInstallOnAppQuit}
              onChange={(e) => handleAutoInstallToggle(e.target.checked)}
              className="rounded text-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateManager;