const { storeOperations, validateCycleData, validatePreferences } = require('../../electron/store');

describe('Store Operations', () => {
  beforeEach(() => {
    // Clear store before each test
    storeOperations.clear();
  });

  describe('Cycle Data Operations', () => {
    test('should save and retrieve cycle data', () => {
      const cycleData = {
        startDate: '2024-01-01T00:00:00.000Z',
        cycleLength: 28
      };
      
      storeOperations.setCycleData(cycleData);
      const retrieved = storeOperations.getCycleData();
      
      expect(retrieved.startDate).toBe(cycleData.startDate);
      expect(retrieved.cycleLength).toBe(cycleData.cycleLength);
    });

    test('should validate cycle length range', () => {
      expect(() => {
        storeOperations.setCycleData({ cycleLength: 20 });
      }).toThrow('Cycle length must be between 21 and 35 days');
      
      expect(() => {
        storeOperations.setCycleData({ cycleLength: 36 });
      }).toThrow('Cycle length must be between 21 and 35 days');
      
      // Valid lengths should not throw
      expect(() => {
        storeOperations.setCycleData({ cycleLength: 21 });
        storeOperations.setCycleData({ cycleLength: 35 });
      }).not.toThrow();
    });

    test('should validate date format', () => {
      expect(() => {
        storeOperations.setCycleData({ startDate: 'invalid-date' });
      }).toThrow('Invalid start date format');
    });

    test('should merge cycle data updates', () => {
      storeOperations.setCycleData({ startDate: '2024-01-01T00:00:00.000Z' });
      storeOperations.setCycleData({ cycleLength: 30 });
      
      const data = storeOperations.getCycleData();
      expect(data.startDate).toBe('2024-01-01T00:00:00.000Z');
      expect(data.cycleLength).toBe(30);
    });
  });

  describe('Cycle History Operations', () => {
    test('should add entries to cycle history', () => {
      const entry = {
        startDate: '2024-01-01T00:00:00.000Z',
        length: 28,
        notes: 'Regular cycle'
      };
      
      storeOperations.addCycleHistory(entry);
      const data = storeOperations.getCycleData();
      
      expect(data.history).toHaveLength(1);
      expect(data.history[0]).toMatchObject(entry);
      expect(data.history[0].addedAt).toBeDefined();
    });

    test('should validate required fields in history entry', () => {
      expect(() => {
        storeOperations.addCycleHistory({ startDate: '2024-01-01' });
      }).toThrow('History entry must have startDate and length');
      
      expect(() => {
        storeOperations.addCycleHistory({ length: 28 });
      }).toThrow('History entry must have startDate and length');
    });

    test('should maintain maximum 12 history entries', () => {
      // Add 13 entries
      for (let i = 0; i < 13; i++) {
        storeOperations.addCycleHistory({
          startDate: `2024-${String(i + 1).padStart(2, '0')}-01T00:00:00.000Z`,
          length: 28
        });
      }
      
      const data = storeOperations.getCycleData();
      expect(data.history).toHaveLength(12);
      // First entry should be removed
      expect(data.history[0].startDate).toBe('2024-02-01T00:00:00.000Z');
    });
  });

  describe('Preferences Operations', () => {
    test('should save and retrieve preferences', () => {
      const prefs = {
        notifications: false,
        theme: 'dark',
        language: 'es'
      };
      
      storeOperations.setPreferences(prefs);
      const retrieved = storeOperations.getPreferences();
      
      expect(retrieved.notifications).toBe(false);
      expect(retrieved.theme).toBe('dark');
      expect(retrieved.language).toBe('es');
    });

    test('should validate theme values', () => {
      expect(() => {
        storeOperations.setPreferences({ theme: 'invalid' });
      }).toThrow('Invalid theme: must be light, dark, or auto');
    });

    test('should merge preference updates', () => {
      storeOperations.setPreferences({ notifications: false });
      storeOperations.setPreferences({ theme: 'dark' });
      
      const prefs = storeOperations.getPreferences();
      expect(prefs.notifications).toBe(false);
      expect(prefs.theme).toBe('dark');
    });
  });

  describe('General Store Operations', () => {
    test('should check if key exists', () => {
      storeOperations.set('testKey', 'testValue');
      
      expect(storeOperations.has('testKey')).toBe(true);
      expect(storeOperations.has('nonExistentKey')).toBe(false);
    });

    test('should delete specific keys', () => {
      storeOperations.set('testKey', 'testValue');
      expect(storeOperations.has('testKey')).toBe(true);
      
      storeOperations.delete('testKey');
      expect(storeOperations.has('testKey')).toBe(false);
    });

    test('should clear all data', () => {
      storeOperations.setCycleData({ cycleLength: 30 });
      storeOperations.setPreferences({ notifications: false });
      
      storeOperations.clear();
      
      expect(storeOperations.get('cycleData')).toBeUndefined();
      expect(storeOperations.get('preferences')).toBeUndefined();
    });

    test('should reset to default values', () => {
      storeOperations.setCycleData({ cycleLength: 30 });
      storeOperations.setPreferences({ notifications: false });
      
      storeOperations.reset();
      
      const cycleData = storeOperations.getCycleData();
      const prefs = storeOperations.getPreferences();
      
      // Should have default values
      expect(cycleData.cycleLength).toBe(28);
      expect(prefs.notifications).toBe(true);
    });
  });

  describe('Export/Import Operations', () => {
    test('should export all data', () => {
      const testData = {
        cycleData: { cycleLength: 30 },
        preferences: { theme: 'dark' }
      };
      
      storeOperations.setCycleData(testData.cycleData);
      storeOperations.setPreferences(testData.preferences);
      
      const exported = storeOperations.exportData();
      
      expect(exported.data).toBeDefined();
      expect(exported.exportedAt).toBeDefined();
      expect(exported.version).toBeDefined();
      expect(exported.data.cycleData.cycleLength).toBe(30);
      expect(exported.data.preferences.theme).toBe('dark');
    });

    test('should import data successfully', () => {
      const importData = {
        data: {
          cycleData: {
            startDate: '2024-01-01T00:00:00.000Z',
            cycleLength: 32,
            history: []
          },
          preferences: {
            notifications: false,
            theme: 'light'
          }
        },
        exportedAt: '2024-01-01T00:00:00.000Z',
        version: '1.0.0'
      };
      
      storeOperations.importData(importData);
      
      const cycleData = storeOperations.getCycleData();
      const prefs = storeOperations.getPreferences();
      
      expect(cycleData.cycleLength).toBe(32);
      expect(prefs.theme).toBe('light');
    });

    test('should reject invalid import data', () => {
      expect(() => {
        storeOperations.importData(null);
      }).toThrow('Invalid import data format');
      
      expect(() => {
        storeOperations.importData({ notData: {} });
      }).toThrow('Invalid import data format');
    });
  });

  describe('Validation Functions', () => {
    test('validateCycleData should validate input', () => {
      expect(() => validateCycleData(null)).toThrow('Invalid cycle data: must be an object');
      expect(() => validateCycleData('string')).toThrow('Invalid cycle data: must be an object');
      
      expect(() => validateCycleData({ startDate: 'invalid' })).toThrow('Invalid start date format');
      expect(() => validateCycleData({ cycleLength: 15 })).toThrow('Cycle length must be between 21 and 35 days');
      
      expect(validateCycleData({ cycleLength: 28 })).toBe(true);
    });

    test('validatePreferences should validate input', () => {
      expect(() => validatePreferences(null)).toThrow('Invalid preferences: must be an object');
      expect(() => validatePreferences('string')).toThrow('Invalid preferences: must be an object');
      
      expect(() => validatePreferences({ theme: 'purple' })).toThrow('Invalid theme: must be light, dark, or auto');
      
      expect(validatePreferences({ theme: 'dark' })).toBe(true);
    });
  });
});