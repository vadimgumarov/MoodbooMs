/**
 * Tests for PhraseConfigLoader
 */

import configLoader from '../../../src/core/services/phrases/PhraseConfigLoader';

describe('PhraseConfigLoader', () => {
  const validConfig = {
    phases: {
      menstrual: {
        name: 'Test Menstrual',
        description: 'Test Description',
        moods: ['Mood 1', 'Mood 2'],
        cravings: [
          { icon: 'Cookie', text: 'chocolate' }
        ]
      },
      follicular: {
        name: 'Test Follicular',
        moods: { default: ['Mood 1'], morning: ['Morning mood'] },
        cravings: [{ icon: 'Pizza', text: 'pizza' }]
      },
      ovulation: {
        name: 'Test Ovulation',
        moods: ['Mood 1'],
        cravings: [{ icon: 'Salad', text: 'salad' }]
      },
      luteal: {
        name: 'Test Luteal',
        moods: ['Mood 1'],
        cravings: [{ icon: 'Bread', text: 'bread' }]
      },
      lateLuteal: {
        name: 'Test Late Luteal',
        moods: ['Mood 1'],
        cravings: [{ icon: 'Coffee', text: 'coffee' }]
      },
      premenstrual: {
        name: 'Test PMS',
        moods: ['Mood 1'],
        cravings: [{ icon: 'Candy', text: 'candy' }]
      }
    },
    ui: {
      tabs: {
        mood: 'Mood'
      }
    }
  };

  beforeEach(() => {
    configLoader.configs.clear();
    configLoader.watchers.clear();
  });

  describe('loadConfig', () => {
    test('should load a valid configuration object', async () => {
      const config = await configLoader.loadConfig('test', validConfig);
      
      expect(config).toEqual(validConfig);
      expect(configLoader.hasConfig('test')).toBe(true);
    });

    test('should reject invalid configuration', async () => {
      const invalidConfig = { invalid: true };
      
      await expect(configLoader.loadConfig('test', invalidConfig))
        .rejects.toThrow('missing or invalid phases');
    });
  });

  describe('validateConfig', () => {
    test('should validate a complete configuration', () => {
      expect(() => configLoader.validateConfig('test', validConfig)).not.toThrow();
    });

    test('should reject config without phases', () => {
      const badConfig = { ...validConfig, phases: undefined };
      
      expect(() => configLoader.validateConfig('test', badConfig))
        .toThrow('missing or invalid phases');
    });

    test('should reject config with missing required phases', () => {
      const incompleteConfig = {
        phases: {
          menstrual: validConfig.phases.menstrual
          // Missing other required phases
        }
      };
      
      expect(() => configLoader.validateConfig('test', incompleteConfig))
        .toThrow("missing phase 'follicular'");
    });

    test('should reject phase without name', () => {
      const badPhaseConfig = {
        ...validConfig,
        phases: {
          ...validConfig.phases,
          menstrual: {
            ...validConfig.phases.menstrual,
            name: undefined
          }
        }
      };
      
      expect(() => configLoader.validateConfig('test', badPhaseConfig))
        .toThrow("phase 'menstrual' missing name");
    });

    test('should reject phase with invalid moods', () => {
      const badMoodsConfig = {
        ...validConfig,
        phases: {
          ...validConfig.phases,
          menstrual: {
            ...validConfig.phases.menstrual,
            moods: 'not an array or object'
          }
        }
      };
      
      expect(() => configLoader.validateConfig('test', badMoodsConfig))
        .toThrow("phase 'menstrual' has invalid moods");
    });

    test('should reject phase with invalid cravings', () => {
      const badCravingsConfig = {
        ...validConfig,
        phases: {
          ...validConfig.phases,
          menstrual: {
            ...validConfig.phases.menstrual,
            cravings: 'not an array'
          }
        }
      };
      
      expect(() => configLoader.validateConfig('test', badCravingsConfig))
        .toThrow("phase 'menstrual' has invalid cravings");
    });

    test('should reject cravings with invalid format', () => {
      const badCravingFormat = {
        ...validConfig,
        phases: {
          ...validConfig.phases,
          menstrual: {
            ...validConfig.phases.menstrual,
            cravings: [{ text: 'missing icon' }]
          }
        }
      };
      
      expect(() => configLoader.validateConfig('test', badCravingFormat))
        .toThrow("phase 'menstrual' has invalid craving format");
    });

    test('should accept both array and object format for moods', () => {
      const arrayMoods = {
        ...validConfig,
        phases: {
          ...validConfig.phases,
          menstrual: {
            ...validConfig.phases.menstrual,
            moods: ['Mood 1', 'Mood 2']
          }
        }
      };
      
      const objectMoods = {
        ...validConfig,
        phases: {
          ...validConfig.phases,
          menstrual: {
            ...validConfig.phases.menstrual,
            moods: {
              default: ['Mood 1'],
              morning: ['Morning mood']
            }
          }
        }
      };
      
      expect(() => configLoader.validateConfig('test', arrayMoods)).not.toThrow();
      expect(() => configLoader.validateConfig('test', objectMoods)).not.toThrow();
    });
  });

  describe('config management', () => {
    test('should get loaded configuration', async () => {
      await configLoader.loadConfig('test', validConfig);
      
      const config = configLoader.getConfig('test');
      expect(config).toEqual(validConfig);
    });

    test('should return undefined for missing configuration', () => {
      const config = configLoader.getConfig('nonexistent');
      expect(config).toBeUndefined();
    });

    test('should check if configuration exists', async () => {
      expect(configLoader.hasConfig('test')).toBe(false);
      
      await configLoader.loadConfig('test', validConfig);
      
      expect(configLoader.hasConfig('test')).toBe(true);
    });

    test('should get all loaded mode names', async () => {
      await configLoader.loadConfig('mode1', validConfig);
      await configLoader.loadConfig('mode2', validConfig);
      
      const modes = configLoader.getLoadedModes();
      expect(modes).toEqual(['mode1', 'mode2']);
    });

    test('should clear all configurations', async () => {
      await configLoader.loadConfig('mode1', validConfig);
      await configLoader.loadConfig('mode2', validConfig);
      
      configLoader.clearAll();
      
      expect(configLoader.getLoadedModes()).toEqual([]);
    });
  });

  describe('mergeConfigs', () => {
    const baseConfig = {
      phases: {
        menstrual: {
          name: 'Base Menstrual',
          moods: ['Base mood 1', 'Base mood 2'],
          cravings: [{ icon: 'Cookie', text: 'base craving' }]
        }
      },
      ui: {
        tabs: {
          mood: 'Base Mood'
        }
      }
    };

    test('should merge phase moods arrays', () => {
      const overrides = {
        phases: {
          menstrual: {
            moods: ['Override mood 1']
          }
        }
      };
      
      const merged = configLoader.mergeConfigs(baseConfig, overrides);
      
      expect(merged.phases.menstrual.moods).toEqual([
        'Base mood 1', 'Base mood 2', 'Override mood 1'
      ]);
    });

    test('should merge contextual moods objects', () => {
      const contextualBase = {
        phases: {
          menstrual: {
            name: 'Base',
            moods: {
              default: ['Default 1'],
              morning: ['Morning 1']
            },
            cravings: []
          }
        }
      };
      
      const overrides = {
        phases: {
          menstrual: {
            moods: {
              morning: ['Morning 2'],
              evening: ['Evening 1']
            }
          }
        }
      };
      
      const merged = configLoader.mergeConfigs(contextualBase, overrides);
      
      expect(merged.phases.menstrual.moods).toEqual({
        default: ['Default 1'],
        morning: ['Morning 2'],
        evening: ['Evening 1']
      });
    });

    test('should merge cravings arrays', () => {
      const overrides = {
        phases: {
          menstrual: {
            cravings: [{ icon: 'Pizza', text: 'override craving' }]
          }
        }
      };
      
      const merged = configLoader.mergeConfigs(baseConfig, overrides);
      
      expect(merged.phases.menstrual.cravings).toHaveLength(2);
      expect(merged.phases.menstrual.cravings[1]).toEqual({
        icon: 'Pizza',
        text: 'override craving'
      });
    });

    test('should add new phases', () => {
      const overrides = {
        phases: {
          follicular: {
            name: 'New Phase',
            moods: ['New mood'],
            cravings: []
          }
        }
      };
      
      const merged = configLoader.mergeConfigs(baseConfig, overrides);
      
      expect(merged.phases.follicular).toBeDefined();
      expect(merged.phases.follicular.name).toBe('New Phase');
    });

    test('should merge UI text', () => {
      const overrides = {
        ui: {
          tabs: {
            calendar: 'Calendar'
          },
          buttons: {
            save: 'Save'
          }
        }
      };
      
      const merged = configLoader.mergeConfigs(baseConfig, overrides);
      
      expect(merged.ui.tabs.mood).toBe('Base Mood');
      expect(merged.ui.tabs.calendar).toBe('Calendar');
      expect(merged.ui.buttons.save).toBe('Save');
    });

    test('should merge special phrases', () => {
      const baseWithSpecial = {
        ...baseConfig,
        special: {
          firstDay: ['Base first day']
        }
      };
      
      const overrides = {
        special: {
          firstDay: ['Override first day'],
          ovulation: ['Ovulation day']
        }
      };
      
      const merged = configLoader.mergeConfigs(baseWithSpecial, overrides);
      
      expect(merged.special).toEqual({
        firstDay: ['Override first day'],
        ovulation: ['Ovulation day']
      });
    });
  });
});