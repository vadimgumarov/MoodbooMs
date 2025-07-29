/**
 * Tests for PhraseManager
 */

import phraseManager from '../../../src/core/services/phrases/PhraseManager';

describe('PhraseManager', () => {
  // Sample configuration for testing
  const testConfig = {
    phases: {
      menstrual: {
        name: 'Test Phase',
        description: 'Test Description',
        moods: {
          default: ['Default mood 1', 'Default mood 2', 'Default mood 3'],
          morning: ['Morning mood 1', 'Morning mood 2'],
          evening: ['Evening mood 1', 'Evening mood 2'],
          weekend: ['Weekend mood 1', 'Weekend mood 2'],
          moods: {
            tired: ['Tired mood 1', 'Tired mood 2'],
            energetic: ['Energetic mood 1']
          }
        },
        cravings: [
          { icon: 'Cookie', text: 'chocolate' },
          { icon: 'Pizza', text: 'pizza' },
          { icon: 'IceCream', text: 'ice cream' }
        ],
        contextual: {
          firstDay: ['First day phrase 1', 'First day phrase 2'],
          lastDay: ['Last day phrase 1']
        }
      }
    },
    special: {
      firstDay: ['Special first day 1', 'Special first day 2'],
      ovulation: ['Ovulation special 1']
    },
    ui: {
      tabs: {
        mood: 'Mood Tab'
      }
    }
  };

  beforeEach(() => {
    // Clear any existing configurations and history
    phraseManager.configs = {};
    phraseManager.history = {};
  });

  describe('registerMode', () => {
    test('should register a mode configuration', () => {
      phraseManager.registerMode('test', testConfig);
      
      expect(phraseManager.configs.test).toBeDefined();
      expect(phraseManager.configs.test).toEqual(testConfig);
      expect(phraseManager.history.test).toBeDefined();
    });
  });

  describe('getTimePeriod', () => {
    test('should return correct time period for different hours', () => {
      // Morning: 5am-12pm
      expect(phraseManager.getTimePeriod(new Date('2025-01-01 06:00'))).toBe('morning');
      expect(phraseManager.getTimePeriod(new Date('2025-01-01 11:59'))).toBe('morning');
      
      // Afternoon: 12pm-5pm
      expect(phraseManager.getTimePeriod(new Date('2025-01-01 12:00'))).toBe('afternoon');
      expect(phraseManager.getTimePeriod(new Date('2025-01-01 16:59'))).toBe('afternoon');
      
      // Evening: 5pm-10pm
      expect(phraseManager.getTimePeriod(new Date('2025-01-01 17:00'))).toBe('evening');
      expect(phraseManager.getTimePeriod(new Date('2025-01-01 21:59'))).toBe('evening');
      
      // Night: 10pm-5am
      expect(phraseManager.getTimePeriod(new Date('2025-01-01 22:00'))).toBe('night');
      expect(phraseManager.getTimePeriod(new Date('2025-01-01 04:59'))).toBe('night');
    });
  });

  describe('isWeekend', () => {
    test('should correctly identify weekends', () => {
      // Sunday
      expect(phraseManager.isWeekend(new Date('2025-01-05'))).toBe(true);
      // Monday
      expect(phraseManager.isWeekend(new Date('2025-01-06'))).toBe(false);
      // Friday
      expect(phraseManager.isWeekend(new Date('2025-01-10'))).toBe(false);
      // Saturday
      expect(phraseManager.isWeekend(new Date('2025-01-11'))).toBe(true);
    });
  });

  describe('getPhrase', () => {
    beforeEach(() => {
      phraseManager.registerMode('test', testConfig);
    });

    test('should return a mood phrase', () => {
      const phrase = phraseManager.getPhrase('test', 'menstrual', 'moods');
      
      expect(phrase).toBeDefined();
      expect(typeof phrase).toBe('string');
    });

    test('should return contextual phrases based on time', () => {
      // Morning context
      const morningContext = { currentTime: new Date('2025-01-01 08:00') };
      const morningPhrase = phraseManager.getPhrase('test', 'menstrual', 'moods', morningContext);
      
      // Should be from default or morning phrases
      const validMorningPhrases = [
        ...testConfig.phases.menstrual.moods.default,
        ...testConfig.phases.menstrual.moods.morning
      ];
      expect(validMorningPhrases).toContain(morningPhrase);
    });

    test('should return first day phrases when isFirstDay is true', () => {
      const context = { isFirstDay: true };
      const phrase = phraseManager.getPhrase('test', 'menstrual', 'moods', context);
      
      expect(testConfig.phases.menstrual.contextual.firstDay).toContain(phrase);
    });

    test('should return a craving object', () => {
      const craving = phraseManager.getPhrase('test', 'menstrual', 'cravings');
      
      expect(craving).toBeDefined();
      expect(craving.icon).toBeDefined();
      expect(craving.text).toBeDefined();
    });

    test('should return fallback phrase for missing configuration', () => {
      const phrase = phraseManager.getPhrase('nonexistent', 'menstrual', 'moods');
      
      expect(phrase).toBe("Today's a day, that's for sure");
    });
  });

  describe('phrase history and randomization', () => {
    beforeEach(() => {
      phraseManager.registerMode('test', testConfig);
      phraseManager.maxHistorySize = 3; // Small history for testing
    });

    test('should track phrase history', () => {
      const phrases = [];
      for (let i = 0; i < 5; i++) {
        phrases.push(phraseManager.getPhrase('test', 'menstrual', 'moods'));
      }

      const historyKey = 'test_menstrual_moods';
      expect(phraseManager.history.test[historyKey]).toBeDefined();
      expect(phraseManager.history.test[historyKey].length).toBeLessThanOrEqual(3);
    });

    test('should avoid repeating phrases within history', () => {
      const phrases = [];
      for (let i = 0; i < 3; i++) {
        phrases.push(phraseManager.getPhrase('test', 'menstrual', 'moods'));
      }

      // All phrases should be unique within history size
      const uniquePhrases = new Set(phrases);
      expect(uniquePhrases.size).toBe(phrases.length);
    });

    test('should reset history when all phrases are used', () => {
      // Use a small phrase set
      const smallConfig = {
        phases: {
          test: {
            moods: ['Phrase 1', 'Phrase 2'],
            cravings: []
          }
        }
      };
      
      phraseManager.registerMode('small', smallConfig);
      phraseManager.maxHistorySize = 10; // Larger than phrase count

      const phrases = [];
      for (let i = 0; i < 5; i++) {
        phrases.push(phraseManager.getPhrase('small', 'test', 'moods'));
      }

      // Should have used both phrases multiple times
      expect(phrases.filter(p => p === 'Phrase 1').length).toBeGreaterThan(1);
      expect(phrases.filter(p => p === 'Phrase 2').length).toBeGreaterThan(1);
    });
  });

  describe('getSpecialPhrase', () => {
    beforeEach(() => {
      phraseManager.registerMode('test', testConfig);
    });

    test('should return special event phrases', () => {
      const firstDayPhrase = phraseManager.getSpecialPhrase('test', 'firstDay');
      expect(testConfig.special.firstDay).toContain(firstDayPhrase);

      const ovulationPhrase = phraseManager.getSpecialPhrase('test', 'ovulation');
      expect(testConfig.special.ovulation).toContain(ovulationPhrase);
    });

    test('should return null for missing special phrases', () => {
      const phrase = phraseManager.getSpecialPhrase('test', 'nonexistent');
      expect(phrase).toBeNull();
    });
  });

  describe('getUIText', () => {
    beforeEach(() => {
      phraseManager.registerMode('test', testConfig);
    });

    test('should return UI text', () => {
      const text = phraseManager.getUIText('test', 'tabs', 'mood');
      expect(text).toBe('Mood Tab');
    });

    test('should return empty string for missing UI text', () => {
      const text = phraseManager.getUIText('test', 'tabs', 'nonexistent');
      expect(text).toBe('');
    });
  });

  describe('clearHistory', () => {
    beforeEach(() => {
      phraseManager.registerMode('test', testConfig);
      // Generate some history
      for (let i = 0; i < 3; i++) {
        phraseManager.getPhrase('test', 'menstrual', 'moods');
      }
    });

    test('should clear history for specific mode', () => {
      expect(Object.keys(phraseManager.history.test).length).toBeGreaterThan(0);
      
      phraseManager.clearHistory('test');
      
      expect(Object.keys(phraseManager.history.test).length).toBe(0);
    });

    test('should clear all history when no mode specified', () => {
      phraseManager.registerMode('another', testConfig);
      phraseManager.getPhrase('another', 'menstrual', 'moods');

      expect(Object.keys(phraseManager.history.test).length).toBeGreaterThan(0);
      expect(Object.keys(phraseManager.history.another).length).toBeGreaterThan(0);
      
      phraseManager.clearHistory();
      
      expect(Object.keys(phraseManager.history.test).length).toBe(0);
      expect(Object.keys(phraseManager.history.another).length).toBe(0);
    });
  });

  describe('export/import history', () => {
    beforeEach(() => {
      phraseManager.registerMode('test', testConfig);
      for (let i = 0; i < 3; i++) {
        phraseManager.getPhrase('test', 'menstrual', 'moods');
      }
    });

    test('should export and import history', () => {
      const exported = phraseManager.exportHistory();
      expect(exported.test).toBeDefined();

      // Clear and reimport
      phraseManager.clearHistory();
      expect(Object.keys(phraseManager.history.test).length).toBe(0);

      phraseManager.importHistory(exported);
      expect(phraseManager.history).toEqual(exported);
    });
  });
});