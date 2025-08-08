const Store = require('electron-store');

// Define the schema with defaults and validation
const schema = {
  cycleData: {
    type: 'object',
    properties: {
      startDate: {
        type: 'string',
        default: new Date().toISOString()
      },
      cycleLength: {
        type: 'number',
        minimum: 21,
        maximum: 35,
        default: 28
      },
      history: {
        type: 'array',
        default: [],
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            startDate: { type: 'string' },
            cycleLength: { 
              type: 'number',
              minimum: 21,
              maximum: 35
            },
            actualLength: { 
              type: ['number', 'null'],
              minimum: 1,
              maximum: 60
            },
            endDate: { type: ['string', 'null'] },
            notes: { 
              type: 'object',
              default: {}
            },
            symptoms: { 
              type: 'object',
              default: {}
            },
            createdAt: { type: 'string' },
            completedAt: { type: ['string', 'null'] }
          },
          required: ['id', 'startDate', 'cycleLength', 'createdAt']
        }
      }
    }
  },
  preferences: {
    type: 'object',
    properties: {
      notifications: {
        type: 'boolean',
        default: true
      },
      notificationDays: {
        type: 'array',
        default: [1, 14], // Day 1 (period start) and Day 14 (ovulation)
        items: {
          type: 'number',
          minimum: 1,
          maximum: 35
        }
      },
      theme: {
        type: 'string',
        enum: ['light', 'dark', 'auto'],
        default: 'auto'
      },
      language: {
        type: 'string',
        default: 'en'
      },
      testMode: {
        type: 'boolean',
        default: false
      },
      mode: {
        type: 'string',
        enum: ['queen', 'king'],
        default: 'queen'
      },
      badassMode: {
        type: 'boolean',
        default: false
      }
    }
  },
  appState: {
    type: 'object',
    properties: {
      lastOpened: {
        type: 'string',
        default: new Date().toISOString()
      },
      version: {
        type: 'string',
        default: '1.0.0'
      },
      onboardingCompleted: {
        type: 'boolean',
        default: false
      }
    }
  }
};

// Create store instance with encryption
const store = new Store({
  schema,
  name: 'moodbooms-data',
  encryptionKey: 'moodbooms-2024', // In production, use a more secure key
  clearInvalidConfig: true
});

// Helper functions for data validation
const validateCycleData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid cycle data: must be an object');
  }
  
  if (data.startDate && !Date.parse(data.startDate)) {
    throw new Error('Invalid start date format');
  }
  
  if (data.cycleLength !== undefined) {
    const length = Number(data.cycleLength);
    if (isNaN(length) || length < 21 || length > 35) {
      throw new Error('Cycle length must be between 21 and 35 days');
    }
  }
  
  return true;
};

const validatePreferences = (prefs) => {
  if (!prefs || typeof prefs !== 'object') {
    throw new Error('Invalid preferences: must be an object');
  }
  
  if (prefs.theme && !['light', 'dark', 'auto'].includes(prefs.theme)) {
    throw new Error('Invalid theme: must be light, dark, or auto');
  }
  
  if (prefs.mode && !['queen', 'king'].includes(prefs.mode)) {
    throw new Error('Invalid mode: must be queen or king');
  }
  
  return true;
};

// Store operations with validation
const storeOperations = {
  // Get operations
  getCycleData: () => store.get('cycleData'),
  getPreferences: () => store.get('preferences'),
  getAppState: () => store.get('appState'),
  get: (key) => store.get(key),
  getAll: () => store.store,
  
  // Set operations with validation
  setCycleData: (data) => {
    validateCycleData(data);
    const currentData = store.get('cycleData', {});
    store.set('cycleData', { ...currentData, ...data });
    return true;
  },
  
  setPreferences: (prefs) => {
    validatePreferences(prefs);
    const currentPrefs = store.get('preferences', {});
    store.set('preferences', { ...currentPrefs, ...prefs });
    return true;
  },
  
  set: (key, value) => {
    store.set(key, value);
    return true;
  },
  
  // History operations
  getCycleHistory: () => store.get('cycleData.history', []),
  
  addCycleToHistory: (cycleRecord) => {
    if (!cycleRecord.id || !cycleRecord.startDate || !cycleRecord.cycleLength) {
      throw new Error('Cycle record must have id, startDate and cycleLength');
    }
    
    const history = store.get('cycleData.history', []);
    
    // Check if cycle already exists
    const existingIndex = history.findIndex(cycle => cycle.id === cycleRecord.id);
    if (existingIndex >= 0) {
      // Update existing cycle
      history[existingIndex] = cycleRecord;
    } else {
      // Add new cycle
      history.push(cycleRecord);
    }
    
    // Sort by start date (newest first)
    history.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    // Keep only last 24 cycles
    if (history.length > 24) {
      history.pop();
    }
    
    store.set('cycleData.history', history);
    return true;
  },
  
  updateCycleInHistory: (cycleId, updates) => {
    const history = store.get('cycleData.history', []);
    const cycleIndex = history.findIndex(cycle => cycle.id === cycleId);
    
    if (cycleIndex === -1) {
      throw new Error(`Cycle with id ${cycleId} not found`);
    }
    
    history[cycleIndex] = { ...history[cycleIndex], ...updates };
    store.set('cycleData.history', history);
    return history[cycleIndex];
  },
  
  // Delete operations
  delete: (key) => {
    store.delete(key);
    return true;
  },
  
  clear: () => {
    store.clear();
    return true;
  },
  
  // Utility operations
  has: (key) => store.has(key),
  
  reset: () => {
    store.reset(...Object.keys(schema));
    return true;
  },
  
  // Migration for future schema changes
  migrate: () => {
    const version = store.get('appState.version', '1.0.0');
    
    // Migrate from badassMode to mode field
    const preferences = store.get('preferences', {});
    if (preferences.badassMode !== undefined && preferences.mode === undefined) {
      // Convert badassMode (true = king, false = queen) to mode field
      preferences.mode = preferences.badassMode ? 'king' : 'queen';
      store.set('preferences', preferences);
      console.log(`Migrated badassMode (${preferences.badassMode}) to mode (${preferences.mode})`);
    }
    
    // Update version
    if (version === '1.0.0') {
      store.set('appState.version', '1.0.1');
    }
    
    return true;
  },
  
  // Export/Import functionality
  exportData: () => {
    return {
      data: store.store,
      exportedAt: new Date().toISOString(),
      version: store.get('appState.version')
    };
  },
  
  importData: (importedData) => {
    if (!importedData || !importedData.data) {
      throw new Error('Invalid import data format');
    }
    
    // Validate imported data against schema
    try {
      // Clear existing data
      store.clear();
      
      // Import new data
      Object.entries(importedData.data).forEach(([key, value]) => {
        store.set(key, value);
      });
      
      return true;
    } catch (error) {
      // Restore from backup if import fails
      store.reset(...Object.keys(schema));
      throw new Error(`Import failed: ${error.message}`);
    }
  },
  
  // File-based export/import
  exportToFile: async (filePath, data) => {
    const fs = require('fs').promises;
    try {
      const jsonString = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, jsonString, 'utf8');
      return true;
    } catch (error) {
      throw new Error(`Failed to export to file: ${error.message}`);
    }
  },
  
  importFromFile: async (filePath) => {
    const fs = require('fs').promises;
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      return data;
    } catch (error) {
      throw new Error(`Failed to import from file: ${error.message}`);
    }
  }
};

module.exports = {
  store,
  storeOperations,
  validateCycleData,
  validatePreferences
};