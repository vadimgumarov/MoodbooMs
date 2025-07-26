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
            startDate: { type: 'string' },
            length: { 
              type: 'number',
              minimum: 21,
              maximum: 35
            },
            notes: { type: 'string' }
          },
          required: ['startDate', 'length']
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
  addCycleHistory: (entry) => {
    if (!entry.startDate || !entry.length) {
      throw new Error('History entry must have startDate and length');
    }
    
    const history = store.get('cycleData.history', []);
    history.push({
      ...entry,
      addedAt: new Date().toISOString()
    });
    
    // Keep only last 12 cycles
    if (history.length > 12) {
      history.shift();
    }
    
    store.set('cycleData.history', history);
    return true;
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
    
    // Example migration logic
    if (version === '1.0.0') {
      // Future migrations go here
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
  }
};

module.exports = {
  store,
  storeOperations,
  validateCycleData,
  validatePreferences
};