import { 
  QueenMode,
  queenPhrases,
  getRandomQueenPhrase,
  queenPhaseNames,
  queenTheme,
  getPhaseColor,
  getFertilityColor,
  queenPersonality,
  getQueenResponse,
  getQueenMoodLevel
} from '../../../../src/modes/queen';

describe('Queen Mode Module', () => {
  describe('Module Structure', () => {
    test('should export QueenMode configuration object', () => {
      expect(QueenMode).toBeDefined();
      expect(QueenMode.id).toBe('queen');
      expect(QueenMode.name).toBe('Queen');
    });

    test('should have all required properties', () => {
      expect(QueenMode.config).toBeDefined();
      expect(QueenMode.components).toBeDefined();
      expect(QueenMode.helpers).toBeDefined();
      expect(QueenMode.features).toBeDefined();
      expect(QueenMode.initialize).toBeDefined();
      expect(QueenMode.cleanup).toBeDefined();
    });

    test('should have correct features list', () => {
      expect(QueenMode.features).toContain('sarcastic-humor');
      expect(QueenMode.features).toContain('dark-comedy');
      expect(QueenMode.features).toContain('first-person-perspective');
    });
  });

  describe('Phrases Configuration', () => {
    test('should have phrases for all phases', () => {
      const phases = ['menstrual', 'follicular', 'ovulation', 'luteal', 'lateLuteal', 'premenstrual'];
      phases.forEach(phase => {
        expect(queenPhrases[phase]).toBeDefined();
        expect(queenPhrases[phase].name).toBeDefined();
        expect(queenPhrases[phase].description).toBeDefined();
        expect(queenPhrases[phase].moods).toBeInstanceOf(Array);
        expect(queenPhrases[phase].cravings).toBeInstanceOf(Array);
      });
    });

    test('should have correct phase names', () => {
      expect(queenPhaseNames.menstrual).toBe('Bloody Hell Week');
      expect(queenPhaseNames.follicular).toBe('Finally Got My Sh*t Together');
      expect(queenPhaseNames.ovulation).toBe('Horny AF');
      expect(queenPhaseNames.luteal).toBe('Getting Real Tired of This BS');
      expect(queenPhaseNames.lateLuteal).toBe('Pre-Chaos Mood Swings');
      expect(queenPhaseNames.premenstrual).toBe('Apocalypse Countdown');
    });

    test('should have at least 30 moods per phase', () => {
      Object.values(queenPhrases).forEach(phase => {
        expect(phase.moods.length).toBeGreaterThanOrEqual(30);
      });
    });

    test('should have at least 30 cravings per phase', () => {
      Object.values(queenPhrases).forEach(phase => {
        expect(phase.cravings.length).toBeGreaterThanOrEqual(30);
      });
    });

    test('getRandomQueenPhrase should return a mood', () => {
      const mood = getRandomQueenPhrase('menstrual', 'moods');
      expect(mood).toBeDefined();
      expect(typeof mood).toBe('string');
      expect(queenPhrases.menstrual.moods).toContain(mood);
    });

    test('getRandomQueenPhrase should return a craving', () => {
      const craving = getRandomQueenPhrase('follicular', 'cravings');
      expect(craving).toBeDefined();
      expect(craving.icon).toBeDefined();
      expect(craving.text).toBeDefined();
    });
  });

  describe('Theme Configuration', () => {
    test('should have complete color palette', () => {
      expect(queenTheme.colors.primary).toBe('#FF1744');
      expect(queenTheme.colors.secondary).toBe('#D500F9');
      expect(queenTheme.colors.accent).toBe('#FF6E40');
    });

    test('should have phase-specific colors', () => {
      const phases = ['menstrual', 'follicular', 'ovulation', 'luteal', 'lateLuteal', 'premenstrual'];
      phases.forEach(phase => {
        expect(queenTheme.colors.phases[phase]).toBeDefined();
      });
    });

    test('getPhaseColor should return correct colors', () => {
      expect(getPhaseColor('menstrual')).toBe('#B71C1C');
      expect(getPhaseColor('follicular')).toBe('#4CAF50');
      expect(getPhaseColor('unknown')).toBe('#FF1744'); // Should return primary
    });

    test('getFertilityColor should return correct colors based on percentage', () => {
      expect(getFertilityColor(90)).toBe(queenTheme.colors.fertility.veryHigh);
      expect(getFertilityColor(70)).toBe(queenTheme.colors.fertility.high);
      expect(getFertilityColor(40)).toBe(queenTheme.colors.fertility.medium);
      expect(getFertilityColor(15)).toBe(queenTheme.colors.fertility.low);
      expect(getFertilityColor(5)).toBe(queenTheme.colors.fertility.veryLow);
    });
  });

  describe('Personality Configuration', () => {
    test('should have correct personality traits', () => {
      expect(queenPersonality.traits.name).toBe('Queen');
      expect(queenPersonality.traits.attitude).toBe('sarcastic');
      expect(queenPersonality.traits.humor).toBe('dark');
      expect(queenPersonality.traits.filterLevel).toBe(0);
    });

    test('should have communication preferences', () => {
      expect(queenPersonality.communication.perspective).toBe('first-person');
      expect(queenPersonality.communication.profanityLevel).toBe('high');
      expect(queenPersonality.communication.sarcasmLevel).toBe('maximum');
    });

    test('getQueenResponse should return easter eggs', () => {
      const response = getQueenResponse('how are you', 'menstrual');
      expect(response).toBe("How do you think I am? Look at the phase.");
    });

    test('getQueenMoodLevel should return phase-adjusted levels', () => {
      const menstrualMood = getQueenMoodLevel('menstrual');
      expect(menstrualMood.patience).toBe(0); // 50 + (-100) = 0
      expect(menstrualMood.murderousIntent).toBe(80);
      
      const follicularMood = getQueenMoodLevel('follicular');
      expect(follicularMood.patience).toBe(70); // 50 + 20
    });
  });

  describe('Module Lifecycle', () => {
    test('initialize should return active status', () => {
      const result = QueenMode.initialize();
      expect(result.status).toBe('active');
      expect(result.message).toContain('Queen mode is ready');
      expect(result.personality).toEqual(queenPersonality.traits);
    });

    test('cleanup should return inactive status', () => {
      const result = QueenMode.cleanup();
      expect(result.status).toBe('inactive');
      expect(result.message).toContain('Queen mode has abdicated');
    });
  });

  describe('Components Export', () => {
    test('should export QueenModeWrapper component', () => {
      expect(QueenMode.components.Wrapper).toBeDefined();
    });

    test('should export QueenPhaseDisplay component', () => {
      expect(QueenMode.components.PhaseDisplay).toBeDefined();
    });
  });

  describe('Helper Functions', () => {
    test('should have all helper functions', () => {
      expect(QueenMode.helpers.getRandomPhrase).toBeDefined();
      expect(QueenMode.helpers.getPhaseColor).toBeDefined();
      expect(QueenMode.helpers.getFertilityColor).toBeDefined();
      expect(QueenMode.helpers.getMoodLevel).toBeDefined();
      expect(QueenMode.helpers.getResponse).toBeDefined();
    });
  });
});