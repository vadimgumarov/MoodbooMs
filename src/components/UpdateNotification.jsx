import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, AlertCircle, CheckCircle, X } from 'lucide-react';

const UpdateNotification = () => {
  const [updateState, setUpdateState] = useState('idle'); // idle, checking, available, downloading, downloaded, error
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!window.electronAPI?.updates) return;

    // Set up event listeners
    const unsubscribeFunctions = [];

    // Update checking
    unsubscribeFunctions.push(
      window.electronAPI.updates.onUpdateChecking(() => {
        setUpdateState('checking');
        setError(null);
      })
    );

    // Update available
    unsubscribeFunctions.push(
      window.electronAPI.updates.onUpdateAvailable((info) => {
        setUpdateState('available');
        setUpdateInfo(info);
        setIsVisible(true);
      })
    );

    // Update not available
    unsubscribeFunctions.push(
      window.electronAPI.updates.onUpdateNotAvailable(() => {
        setUpdateState('idle');
        setTimeout(() => setIsVisible(false), 3000); // Hide after 3 seconds
      })
    );

    // Update error
    unsubscribeFunctions.push(
      window.electronAPI.updates.onUpdateError((error) => {
        setUpdateState('error');
        setError(error.message);
        setIsVisible(true);
      })
    );

    // Download progress
    unsubscribeFunctions.push(
      window.electronAPI.updates.onDownloadProgress((progress) => {
        setUpdateState('downloading');
        setDownloadProgress(progress.percent);
      })
    );

    // Update downloaded
    unsubscribeFunctions.push(
      window.electronAPI.updates.onUpdateDownloaded((info) => {
        setUpdateState('downloaded');
        setUpdateInfo(info);
      })
    );

    // Cleanup function
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe?.());
    };
  }, []);

  const handleDownload = async () => {
    try {
      await window.electronAPI.updates.downloadUpdate();
    } catch (error) {
      setError(error.message);
      setUpdateState('error');
    }
  };

  const handleInstall = () => {
    window.electronAPI.updates.installUpdate();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (updateState) {
      case 'checking':
        return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
      case 'available':
        return <Download className="w-5 h-5 text-green-500" />;
      case 'downloading':
        return <Download className="w-5 h-5 text-blue-500" />;
      case 'downloaded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (updateState) {
      case 'checking':
        return 'Checking for updates...';
      case 'available':
        return `Update available (v${updateInfo?.version})`;
      case 'downloading':
        return 'Downloading update...';
      case 'downloaded':
        return 'Update ready to install';
      case 'error':
        return 'Update failed';
      default:
        return '';
    }
  };

  const getMessage = () => {
    switch (updateState) {
      case 'checking':
        return 'Checking for the latest version...';
      case 'available':
        return 'A new version is available. Download now?';
      case 'downloading':
        return `Downloading... ${Math.round(downloadProgress)}%`;
      case 'downloaded':
        return 'Click to restart and install the update.';
      case 'error':
        return error || 'An error occurred while updating.';
      default:
        return '';
    }
  };

  const getActionButtons = () => {
    switch (updateState) {
      case 'available':
        return (
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
            >
              Download
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm rounded transition-colors"
            >
              Later
            </button>
          </div>
        );
      case 'downloaded':
        return (
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
            >
              Restart & Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm rounded transition-colors"
            >
              Later
            </button>
          </div>
        );
      case 'error':
        return (
          <button
            onClick={handleDismiss}
            className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm rounded transition-colors"
          >
            Dismiss
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-right">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
            {getTitle()}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {getMessage()}
          </p>
          
          {/* Progress bar for downloading */}
          {updateState === 'downloading' && (
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          )}
          
          {/* Action buttons */}
          <div className="mt-3 flex justify-end">
            {getActionButtons()}
          </div>
        </div>
        
        {/* Close button */}
        {(updateState === 'available' || updateState === 'error') && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default UpdateNotification;