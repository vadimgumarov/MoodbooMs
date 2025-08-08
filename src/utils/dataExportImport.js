// Data Export/Import utilities for backup and transfer

const EXPORT_VERSION = '1.0.0';
const SUPPORTED_VERSIONS = ['1.0.0'];

/**
 * Validates the structure of imported data
 */
const validateImportData = (data) => {
  // Check if data is an object
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format: expected object');
  }

  // Check version
  if (!data.version || !SUPPORTED_VERSIONS.includes(data.version)) {
    throw new Error(`Unsupported version: ${data.version}. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`);
  }

  // Check required fields
  if (!data.exportDate) {
    throw new Error('Missing export date');
  }

  if (!data.appVersion) {
    throw new Error('Missing app version');
  }

  // Validate cycle data if present
  if (data.cycleData) {
    if (data.cycleData.cycleLength && (data.cycleData.cycleLength < 21 || data.cycleData.cycleLength > 35)) {
      throw new Error('Cycle length must be between 21 and 35 days');
    }
    
    if (data.cycleData.startDate && !isValidDate(data.cycleData.startDate)) {
      throw new Error('Invalid cycle start date');
    }
  }

  // Validate history if present
  if (data.cycleData?.history && Array.isArray(data.cycleData.history)) {
    data.cycleData.history.forEach((entry, index) => {
      if (!entry.startDate || !isValidDate(entry.startDate)) {
        throw new Error(`Invalid start date in history entry ${index + 1}`);
      }
      if (entry.length && (entry.length < 21 || entry.length > 35)) {
        throw new Error(`Invalid cycle length in history entry ${index + 1}`);
      }
    });
  }

  return true;
};

/**
 * Validates if a string is a valid ISO date
 */
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString === date.toISOString();
};

/**
 * Exports all app data to a JSON object
 */
export const exportData = async () => {
  try {
    // Get all data from electron store
    const cycleData = await window.electronAPI?.store?.get('cycleData');
    const preferences = await window.electronAPI?.store?.get('preferences');
    const appState = await window.electronAPI?.store?.get('appState');
    const appInfo = await window.electronAPI?.app?.getVersion();

    // Create export object
    const exportData = {
      version: EXPORT_VERSION,
      exportDate: new Date().toISOString(),
      appVersion: appInfo || '1.0.0',
      cycleData: cycleData || null,
      preferences: preferences || null,
      appState: {
        ...appState,
        // Don't export certain runtime states
        lastOpened: undefined,
        onboardingCompleted: appState?.onboardingCompleted
      }
    };

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `moodbooms-backup-${timestamp}.json`;

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create blob for download
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Use electron's save dialog if available
    if (window.electronAPI?.dialog?.showSaveDialog) {
      const result = await window.electronAPI.dialog.showSaveDialog({
        title: 'Export MoodBooMs Data',
        defaultPath: filename,
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        // Write file using Node.js fs through IPC
        await window.electronAPI.store.exportToFile(result.filePath, exportData);
        return { success: true, filename: result.filePath };
      } else {
        return { success: false, canceled: true };
      }
    } else {
      // Fallback to browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true, filename };
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Export failed: ${error.message}`);
  }
};

/**
 * Imports data from a JSON file
 */
export const importData = async (file) => {
  try {
    let data;
    
    if (typeof file === 'string') {
      // File path provided (from electron dialog)
      data = await window.electronAPI.store.importFromFile(file);
    } else if (file instanceof File) {
      // File object from browser input
      const text = await file.text();
      data = JSON.parse(text);
    } else {
      throw new Error('Invalid file input');
    }

    // Validate the imported data
    validateImportData(data);

    // Prepare import summary
    const summary = {
      cycleDataImported: !!data.cycleData,
      historyEntries: data.cycleData?.history?.length || 0,
      preferencesImported: !!data.preferences,
      exportDate: data.exportDate,
      appVersion: data.appVersion
    };

    // Import data to store
    if (data.cycleData) {
      await window.electronAPI?.store?.set('cycleData', data.cycleData);
    }
    
    if (data.preferences) {
      // Merge with existing preferences to preserve new settings
      const currentPrefs = await window.electronAPI?.store?.get('preferences') || {};
      const mergedPrefs = { ...currentPrefs, ...data.preferences };
      await window.electronAPI?.store?.set('preferences', mergedPrefs);
    }

    if (data.appState?.onboardingCompleted !== undefined) {
      const currentState = await window.electronAPI?.store?.get('appState') || {};
      await window.electronAPI?.store?.set('appState', {
        ...currentState,
        onboardingCompleted: data.appState.onboardingCompleted
      });
    }

    return { success: true, summary };
  } catch (error) {
    console.error('Import failed:', error);
    throw new Error(`Import failed: ${error.message}`);
  }
};

/**
 * Opens file dialog to select import file
 */
export const selectImportFile = async () => {
  if (window.electronAPI?.dialog?.showOpenDialog) {
    const result = await window.electronAPI.dialog.showOpenDialog({
      title: 'Import MoodBooMs Data',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths?.length > 0) {
      return result.filePaths[0];
    }
  }
  return null;
};

/**
 * Creates a preview of data to be imported
 */
export const previewImportData = async (file) => {
  try {
    let data;
    
    if (typeof file === 'string') {
      data = await window.electronAPI.store.importFromFile(file);
    } else if (file instanceof File) {
      const text = await file.text();
      data = JSON.parse(text);
    } else {
      throw new Error('Invalid file input');
    }

    validateImportData(data);

    return {
      valid: true,
      version: data.version,
      exportDate: data.exportDate,
      appVersion: data.appVersion,
      hasCycleData: !!data.cycleData,
      historyEntries: data.cycleData?.history?.length || 0,
      hasPreferences: !!data.preferences,
      cycleLength: data.cycleData?.cycleLength,
      lastPeriodStart: data.cycleData?.startDate
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};