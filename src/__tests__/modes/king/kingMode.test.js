import {
  kingPhrases,
  getRandomKingPhrase,
  kingPhaseNames,
  kingUIText
} from '../../../../src/modes/king/config/phrases';

import {
  kingTheme,
  getPhaseColor,
  getDangerLevel
} from '../../../../src/modes/king/config/theme';

import {
  kingPersonality,
  getAlertLevel,
  getSurvivalTip,
  getMoodIndicator
} from '../../../../src/modes/king/config/personality';

describe('King Mode Module', () => {
  describe('Phrases Configuration', () => {
    test('should have all required phases', () => {
      const requiredPhases = [
        'menstrual',
        'follicular', 
        'ovulation',
        'luteal',
        'lateLuteal',
        'premenstrual'
      ];
      
      requiredPhases.forEach(phase => {
        expect(kingPhrases[phase]).toBeDefined();
        expect(kingPhrases[phase].name).toBeDefined();
        expect(kingPhrases[phase].description).toBeDefined();
        expect(kingPhrases[phase].moods).toBeInstanceOf(Array);
        expect(kingPhrases[phase].cravings).toBeInstanceOf(Array);
      });
    });
    
    test('should have sufficient moods for each phase', () => {
      Object.keys(kingPhrases).forEach(phase => {
        expect(kingPhrases[phase].moods.length).toBeGreaterThanOrEqual(30);
      });
    });
    
    test('should have sufficient cravings for each phase', () => {
      Object.keys(kingPhrases).forEach(phase => {
        expect(kingPhrases[phase].cravings.length).toBeGreaterThanOrEqual(30);
      });
    });
    
    test('should return random phrases correctly', () => {
      const mood = getRandomKingPhrase('menstrual', 'moods');
      const craving = getRandomKingPhrase('menstrual', 'cravings');
      
      expect(typeof mood).toBe('string');
      expect(kingPhrases.menstrual.moods).toContain(mood);
      
      expect(craving).toHaveProperty('icon');
      expect(craving).toHaveProperty('text');
      expect(kingPhrases.menstrual.cravings).toContainEqual(craving);
    });
    
    test('should have correct phase names', () => {
      expect(kingPhaseNames.menstrual).toBe('Code Red Alert');
      expect(kingPhaseNames.follicular).toBe('Safe Zone Active');
      expect(kingPhaseNames.ovulation).toBe('High Energy Warning');
      expect(kingPhaseNames.luteal).toBe('Patience Level: Low');
      expect(kingPhaseNames.lateLuteal).toBe('Volatility Alert');
      expect(kingPhaseNames.premenstrual).toBe('DEFCON 1');
    });
    
    test('should have King-specific UI text', () => {
      expect(kingUIText.modeToggleOn).toBe('King');
      expect(kingUIText.tabs.mood).toBe('Status');
      expect(kingUIText.tabs.calendar).toBe('Danger Calendar');
      expect(kingUIText.tabs.history).toBe('Survival Log');
    });
  });
  
  describe('Theme Configuration', () => {
    test('should have correct color scheme', () => {
      expect(kingTheme.colors.primary).toBe('#FF6B6B');
      expect(kingTheme.colors.danger).toBe('#DC2626');
      expect(kingTheme.colors.warning).toBe('#F59E0B');
      expect(kingTheme.colors.safe).toBe('#10B981');
    });
    
    test('should return correct phase colors', () => {
      expect(getPhaseColor('menstrual')).toBe('#DC2626');
      expect(getPhaseColor('follicular')).toBe('#10B981');
      expect(getPhaseColor('premenstrual')).toBe('#991B1B');
    });
    
    test('should return correct danger levels', () => {
      expect(getDangerLevel('menstrual')).toBe('danger');
      expect(getDangerLevel('follicular')).toBe('safe');
      expect(getDangerLevel('luteal')).toBe('warning');
      expect(getDangerLevel('premenstrual')).toBe('danger');
    });
    
    test('should have tactical theme elements', () => {
      expect(kingTheme.colors.background).toBe('#1F2937');
      expect(kingTheme.typography.fontFamily.primary).toContain('system-ui');
      expect(kingTheme.cssVariables).toContain('--king-primary');
    });
  });
  
  describe('Personality Configuration', () => {
    test('should have correct personality traits', () => {
      expect(kingPersonality.traits.primary).toBe('Survival Guide');
      expect(kingPersonality.traits.perspective).toBe('Third-person observer');
      expect(kingPersonality.traits.purpose).toBe('Partner protection and guidance');
    });
    
    test('should return correct alert levels', () => {
      expect(getAlertLevel('menstrual')).toBe('critical');
      expect(getAlertLevel('follicular')).toBe('safe');
      expect(getAlertLevel('luteal')).toBe('caution');
      expect(getAlertLevel('premenstrual')).toBe('critical');
    });
    
    test('should return survival tips', () => {
      const tip = getSurvivalTip('menstrual', 'food');
      expect(typeof tip).toBe('string');
      expect(kingPersonality.survivalTips.food.tips).toContain(tip);
    });
    
    test('should return mood indicators', () => {
      expect(getMoodIndicator('menstrual')).toBe('🚨 Mood: Critical');
      expect(getMoodIndicator('follicular')).toBe('😌 Mood: Stable');
      expect(getMoodIndicator('luteal')).toBe('🎭 Mood: Variable');
    });
    
    test('should have phase-specific personality adjustments', () => {
      expect(kingPersonality.phasePersonality.menstrual.alertLevel).toBe('MAXIMUM');
      expect(kingPersonality.phasePersonality.follicular.alertLevel).toBe('MINIMAL');
      expect(kingPersonality.phasePersonality.premenstrual.alertLevel).toBe('CRITICAL');
    });
  });
  
  describe('Module Integration', () => {
    test('should export all necessary functions', () => {
      expect(typeof getRandomKingPhrase).toBe('function');
      expect(typeof getPhaseColor).toBe('function');
      expect(typeof getDangerLevel).toBe('function');
      expect(typeof getAlertLevel).toBe('function');
      expect(typeof getSurvivalTip).toBe('function');
      expect(typeof getMoodIndicator).toBe('function');
    });
    
    test('should handle invalid phase gracefully', () => {
      expect(getRandomKingPhrase('invalid', 'moods')).toBeNull();
      expect(getPhaseColor('invalid')).toBe(kingTheme.colors.primary);
      expect(getDangerLevel('invalid')).toBe('warning');
      expect(getAlertLevel('invalid')).toBe('caution');
    });
    
    test('should have consistent phase handling across configs', () => {
      const phases = Object.keys(kingPhrases);
      
      phases.forEach(phase => {
        // Check that all configs handle the phase
        expect(kingPhaseNames[phase]).toBeDefined();
        expect(getPhaseColor(phase)).toBeDefined();
        expect(getDangerLevel(phase)).toBeDefined();
        expect(getAlertLevel(phase)).toBeDefined();
        expect(getMoodIndicator(phase)).toBeDefined();
      });
    });
  });
  
  describe('Partner Warning System Features', () => {
    test('should have appropriate warning messages', () => {
      const criticalPhases = ['menstrual', 'premenstrual'];
      
      criticalPhases.forEach(phase => {
        const description = kingPhrases[phase].description;
        expect(description.toLowerCase()).toMatch(/danger|caution|warning|alert/);
      });
    });
    
    test('should have survival-focused content', () => {
      // Check for survival language in moods
      const menstrualMoods = kingPhrases.menstrual.moods;
      const survivalTerms = ['survival', 'danger', 'caution', 'warning', 'emergency'];
      
      const hasSurvivalContent = menstrualMoods.some(mood => 
        survivalTerms.some(term => mood.toLowerCase().includes(term))
      );
      
      expect(hasSurvivalContent).toBe(true);
    });
    
    test('should have partner-focused cravings', () => {
      // Check that cravings are framed as partner actions
      const cravings = kingPhrases.menstrual.cravings;
      const partnerTerms = ['delivery', 'offering', 'emergency', 'bribe'];
      
      const hasPartnerFocus = cravings.some(craving => 
        partnerTerms.some(term => craving.text.toLowerCase().includes(term))
      );
      
      expect(hasPartnerFocus).toBe(true);
    });
  });
});