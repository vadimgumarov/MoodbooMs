import React, { useState, useRef } from 'react';
import { Download, Upload, FileJson, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { exportData, importData, selectImportFile, previewImportData } from '../utils/dataExportImport';
import { LoadingSpinner } from './feedback';

const DataManagement = ({ onDataImported }) => {
  const [exportStatus, setExportStatus] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus(null);
    
    try {
      const result = await exportData();
      
      if (result.success) {
        if (result.canceled) {
          setExportStatus({
            type: 'info',
            message: 'Export canceled'
          });
        } else {
          setExportStatus({
            type: 'success',
            message: `Data exported successfully${result.filename ? ` to ${result.filename.split('/').pop()}` : ''}`
          });
        }
      }
    } catch (error) {
      setExportStatus({
        type: 'error',
        message: error.message || 'Export failed'
      });
    } finally {
      setIsExporting(false);
      // Clear status after 5 seconds
      setTimeout(() => setExportStatus(null), 5000);
    }
  };

  const handleImportClick = async () => {
    // Try to use Electron's file dialog if available
    if (window.electronAPI?.dialog) {
      const filePath = await selectImportFile();
      if (filePath) {
        await handleImportFile(filePath);
      }
    } else {
      // Fallback to browser file input
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleImportFile(file);
    }
    // Reset input
    event.target.value = '';
  };

  const handleImportFile = async (file) => {
    setIsImporting(true);
    setImportStatus(null);
    setImportPreview(null);
    
    try {
      // First preview the data
      const preview = await previewImportData(file);
      
      if (!preview.valid) {
        setImportStatus({
          type: 'error',
          message: preview.error || 'Invalid file format'
        });
        return;
      }
      
      setImportPreview(preview);
      
      // Show confirmation dialog
      const confirmMessage = `Import data from ${new Date(preview.exportDate).toLocaleDateString()}?\n\n` +
        `This will replace your current data:\n` +
        `• Cycle data: ${preview.hasCycleData ? 'Yes' : 'No'}\n` +
        `• History entries: ${preview.historyEntries}\n` +
        `• Preferences: ${preview.hasPreferences ? 'Yes' : 'No'}`;
      
      if (!window.confirm(confirmMessage)) {
        setImportStatus({
          type: 'info',
          message: 'Import canceled'
        });
        return;
      }
      
      // Perform the import
      const result = await importData(file);
      
      if (result.success) {
        setImportStatus({
          type: 'success',
          message: 'Data imported successfully'
        });
        
        // Notify parent component to reload data
        if (onDataImported) {
          setTimeout(() => {
            onDataImported();
          }, 1000);
        }
      }
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: error.message || 'Import failed'
      });
    } finally {
      setIsImporting(false);
      setImportPreview(null);
      // Clear status after 5 seconds
      setTimeout(() => setImportStatus(null), 5000);
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    
    switch (status.type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-2">
        <FileJson className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Data Management
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExporting ? (
            <LoadingSpinner size="small" inline />
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span className="text-sm">Export Data</span>
            </>
          )}
        </button>

        {/* Import Button */}
        <button
          onClick={handleImportClick}
          disabled={isImporting}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isImporting ? (
            <LoadingSpinner size="small" inline />
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span className="text-sm">Import Data</span>
            </>
          )}
        </button>

        {/* Hidden file input for browser fallback */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Export Status */}
      {exportStatus && (
        <div className={`
          flex items-center space-x-2 p-2 rounded text-sm
          ${exportStatus.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : ''}
          ${exportStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : ''}
          ${exportStatus.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : ''}
        `}>
          {getStatusIcon(exportStatus)}
          <span>{exportStatus.message}</span>
        </div>
      )}

      {/* Import Status */}
      {importStatus && (
        <div className={`
          flex items-center space-x-2 p-2 rounded text-sm
          ${importStatus.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : ''}
          ${importStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : ''}
          ${importStatus.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : ''}
        `}>
          {getStatusIcon(importStatus)}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Import Preview */}
      {importPreview && importPreview.valid && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs space-y-1">
          <div className="font-medium text-gray-700 dark:text-gray-300">Import Preview:</div>
          <div className="text-gray-600 dark:text-gray-400">
            <div>Export Date: {new Date(importPreview.exportDate).toLocaleDateString()}</div>
            <div>App Version: {importPreview.appVersion}</div>
            {importPreview.hasCycleData && (
              <div>Cycle Length: {importPreview.cycleLength} days</div>
            )}
            {importPreview.historyEntries > 0 && (
              <div>History Entries: {importPreview.historyEntries}</div>
            )}
          </div>
        </div>
      )}

      {/* Info Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>• Export creates a backup of all your data</p>
        <p>• Import replaces your current data with the imported file</p>
        <p>• Data is stored locally in JSON format</p>
      </div>
    </div>
  );
};

export default DataManagement;