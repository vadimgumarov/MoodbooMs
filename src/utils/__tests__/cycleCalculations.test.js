// Unit tests for cycle calculation utilities
import {
  calculateCurrentDay,
  getCurrentPhase,
  getFertilityLevel,
  predictNextPeriod,
  getOvulationWindow,
  calculateAverageCycleLength,
  getCycleProgress,
  getDaysUntilNextPeriod
} from '../cycleCalculations';

describe('Cycle Calculations', () => {
  describe('calculateCurrentDay', () => {
    test('should return 1 on the start date', () => {
      const startDate = new Date('2025-07-26');
      const currentDate = new Date('2025-07-26');
      expect(calculateCurrentDay(startDate, currentDate)).toBe(1);
    });

    test('should calculate correct day mid-cycle', () => {
      const startDate = new Date('2025-07-01');
      const currentDate = new Date('2025-07-15');
      expect(calculateCurrentDay(startDate, currentDate)).toBe(15);
    });

    test('should handle cycle overflow correctly', () => {
      const startDate = new Date('2025-07-01');
      const currentDate = new Date('2025-07-30'); // Day 30
      const cycleLength = 28;
      expect(calculateCurrentDay(startDate, currentDate, cycleLength)).toBe(2); // Day 2 of next cycle
    });

    test('should handle dates in the past', () => {
      const startDate = new Date('2025-08-01');
      const currentDate = new Date('2025-07-26');
      const cycleLength = 28;
      const result = calculateCurrentDay(startDate, currentDate, cycleLength);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(cycleLength);
    });
  });

  describe('getCurrentPhase', () => {
    test('should return menstrual phase for days 1-5', () => {
      expect(getCurrentPhase(1, 28)).toBe('menstrual');
      expect(getCurrentPhase(3, 28)).toBe('menstrual');
      expect(getCurrentPhase(5, 28)).toBe('menstrual');
    });

    test('should return follicular phase for days 6-13', () => {
      expect(getCurrentPhase(6, 28)).toBe('follicular');
      expect(getCurrentPhase(10, 28)).toBe('follicular');
      expect(getCurrentPhase(13, 28)).toBe('follicular');
    });

    test('should return ovulation phase around day 14', () => {
      expect(getCurrentPhase(14, 28)).toBe('ovulation');
      expect(getCurrentPhase(15, 28)).toBe('ovulation');
    });

    test('should return luteal phase for later days', () => {
      expect(getCurrentPhase(17, 28)).toBe('luteal');
      expect(getCurrentPhase(25, 28)).toBe('luteal');
      expect(getCurrentPhase(28, 28)).toBe('luteal');
    });

    test('should adjust ovulation for shorter cycles', () => {
      expect(getCurrentPhase(7, 21)).toBe('ovulation'); // Day 7 for 21-day cycle (21-14=7)
      expect(getCurrentPhase(8, 21)).toBe('ovulation'); // Still in ovulation window
    });

    test('should adjust ovulation for longer cycles', () => {
      expect(getCurrentPhase(21, 35)).toBe('ovulation'); // Day 21 for 35-day cycle
    });
  });

  describe('getFertilityLevel', () => {
    test('should return very low during period', () => {
      expect(getFertilityLevel(1, 28)).toBe('very-low');
      expect(getFertilityLevel(3, 28)).toBe('very-low');
      expect(getFertilityLevel(5, 28)).toBe('very-low');
    });

    test('should return low in early follicular and late luteal', () => {
      expect(getFertilityLevel(6, 28)).toBe('low');
      expect(getFertilityLevel(7, 28)).toBe('low');
      expect(getFertilityLevel(26, 28)).toBe('low');
      expect(getFertilityLevel(28, 28)).toBe('low');
    });

    test('should return high 3 days before ovulation', () => {
      expect(getFertilityLevel(11, 28)).toBe('high'); // 3 days before day 14
      expect(getFertilityLevel(12, 28)).toBe('high');
      expect(getFertilityLevel(13, 28)).toBe('high');
    });

    test('should return very high during ovulation window', () => {
      expect(getFertilityLevel(14, 28)).toBe('very-high');
      expect(getFertilityLevel(15, 28)).toBe('very-high');
      expect(getFertilityLevel(16, 28)).toBe('very-high');
    });

    test('should return medium for other days', () => {
      expect(getFertilityLevel(8, 28)).toBe('medium');
      expect(getFertilityLevel(9, 28)).toBe('medium');
      expect(getFertilityLevel(17, 28)).toBe('medium');
      expect(getFertilityLevel(20, 28)).toBe('medium');
    });
  });

  describe('predictNextPeriod', () => {
    test('should predict next period based on cycle length', () => {
      const startDate = new Date('2025-07-01');
      const cycleLength = 28;
      const nextPeriod = predictNextPeriod(startDate, cycleLength);
      expect(nextPeriod).toEqual(new Date('2025-07-29'));
    });

    test('should handle month boundaries', () => {
      const startDate = new Date('2025-07-20');
      const cycleLength = 30;
      const nextPeriod = predictNextPeriod(startDate, cycleLength);
      expect(nextPeriod).toEqual(new Date('2025-08-19'));
    });

    test('should handle year boundaries', () => {
      const startDate = new Date('2024-12-15');
      const cycleLength = 28;
      const nextPeriod = predictNextPeriod(startDate, cycleLength);
      expect(nextPeriod).toEqual(new Date('2025-01-12'));
    });
  });

  describe('getOvulationWindow', () => {
    test('should return correct ovulation window for 28-day cycle', () => {
      const window = getOvulationWindow(28);
      expect(window.start).toBe(12);
      expect(window.peak).toBe(14);
      expect(window.end).toBe(16);
    });

    test('should adjust for shorter cycles', () => {
      const window = getOvulationWindow(21);
      expect(window.start).toBe(5);
      expect(window.peak).toBe(7);
      expect(window.end).toBe(9);
    });

    test('should adjust for longer cycles', () => {
      const window = getOvulationWindow(35);
      expect(window.start).toBe(19);
      expect(window.peak).toBe(21);
      expect(window.end).toBe(23);
    });
  });

  describe('calculateAverageCycleLength', () => {
    test('should calculate average from history', () => {
      const history = [
        { cycleLength: 28 },
        { cycleLength: 29 },
        { cycleLength: 27 },
        { cycleLength: 28 }
      ];
      expect(calculateAverageCycleLength(history)).toBe(28);
    });

    test('should handle empty history', () => {
      expect(calculateAverageCycleLength([])).toBe(28); // Default
    });

    test('should limit to last 6 cycles', () => {
      const history = [
        { cycleLength: 35 }, // Should be ignored
        { cycleLength: 35 }, // Should be ignored
        { cycleLength: 28 },
        { cycleLength: 29 },
        { cycleLength: 27 },
        { cycleLength: 28 },
        { cycleLength: 29 },
        { cycleLength: 28 }
      ];
      expect(calculateAverageCycleLength(history)).toBe(28);
    });
  });

  describe('getCycleProgress', () => {
    test('should calculate progress percentage', () => {
      expect(getCycleProgress(7, 28)).toBe(25);
      expect(getCycleProgress(14, 28)).toBe(50);
      expect(getCycleProgress(21, 28)).toBe(75);
      expect(getCycleProgress(28, 28)).toBe(100);
    });
  });

  describe('getDaysUntilNextPeriod', () => {
    test('should calculate days remaining', () => {
      expect(getDaysUntilNextPeriod(1, 28)).toBe(28);
      expect(getDaysUntilNextPeriod(14, 28)).toBe(15);
      expect(getDaysUntilNextPeriod(28, 28)).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle minimum cycle length (21 days)', () => {
      expect(getCurrentPhase(1, 21)).toBe('menstrual');
      expect(getCurrentPhase(7, 21)).toBe('ovulation');
      expect(getOvulationWindow(21).peak).toBe(7);
    });

    test('should handle maximum cycle length (35 days)', () => {
      expect(getCurrentPhase(1, 35)).toBe('menstrual');
      expect(getCurrentPhase(21, 35)).toBe('ovulation');
      expect(getOvulationWindow(35).peak).toBe(21);
    });

    test('should handle invalid inputs gracefully', () => {
      // Future dates should still work
      const futureDate = new Date('2026-01-01');
      const pastDate = new Date('2025-01-01');
      expect(calculateCurrentDay(futureDate, pastDate, 28)).toBeGreaterThan(0);
      expect(calculateCurrentDay(futureDate, pastDate, 28)).toBeLessThanOrEqual(28);
    });
  });
});