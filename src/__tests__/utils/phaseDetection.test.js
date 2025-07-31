import {
  getPhaseInfo,
  calculateFertilityPercentage,
  calculateDaysUntilNextPhase,
  getPhaseProgress,
  getPredictionConfidence
} from '../../utils/phaseDetection';

describe('Phase Detection', () => {
  describe('getPhaseInfo', () => {
    test('should return complete phase information for menstrual phase', () => {
      const info = getPhaseInfo(3, 28);
      
      expect(info.phase).toBe('menstrual');
      expect(info.fertilityLevel).toBe('very-low');
      expect(info.fertilityPercentage).toBe(5);
      expect(info.daysUntilNextPhase).toBe(3); // 6 - 3 = 3 days
      expect(info.description).toContain('Low energy');
      expect(info.symptoms).toContain('Cramps');
      expect(info.isOvulating).toBe(false);
    });

    test('should return complete phase information for ovulation phase', () => {
      const info = getPhaseInfo(14, 28);
      
      expect(info.phase).toBe('ovulation');
      expect(info.fertilityLevel).toBe('very-high');
      expect(info.fertilityPercentage).toBe(100);
      expect(info.description).toContain('Peak energy');
      expect(info.isOvulating).toBe(true);
      expect(info.ovulationDay).toBe(14);
    });

    test('should handle different cycle lengths', () => {
      const shortCycle = getPhaseInfo(7, 21);
      expect(shortCycle.phase).toBe('ovulation');
      expect(shortCycle.ovulationDay).toBe(7);
      
      const longCycle = getPhaseInfo(21, 35);
      expect(longCycle.phase).toBe('ovulation');
      expect(longCycle.ovulationDay).toBe(21);
    });
  });

  describe('calculateFertilityPercentage', () => {
    test('should return 5% during menstruation', () => {
      expect(calculateFertilityPercentage(1, 28)).toBe(5);
      expect(calculateFertilityPercentage(3, 28)).toBe(5);
      expect(calculateFertilityPercentage(5, 28)).toBe(5);
    });

    test('should return 100% on ovulation day', () => {
      expect(calculateFertilityPercentage(14, 28)).toBe(100);
      expect(calculateFertilityPercentage(7, 21)).toBe(100);
      expect(calculateFertilityPercentage(21, 35)).toBe(100);
    });

    test('should return 95% one day before/after ovulation', () => {
      expect(calculateFertilityPercentage(13, 28)).toBe(95);
      expect(calculateFertilityPercentage(15, 28)).toBe(95);
    });

    test('should calculate high fertility 2-3 days before ovulation', () => {
      expect(calculateFertilityPercentage(11, 28)).toBe(65); // 3 days before
      expect(calculateFertilityPercentage(12, 28)).toBe(70); // 2 days before
    });

    test('should calculate medium fertility in mid-follicular', () => {
      const percentage = calculateFertilityPercentage(8, 28);
      expect(percentage).toBeGreaterThan(20);
      expect(percentage).toBeLessThan(60);
    });

    test('should decline in luteal phase', () => {
      const day17 = calculateFertilityPercentage(17, 28);
      const day20 = calculateFertilityPercentage(20, 28);
      const day26 = calculateFertilityPercentage(26, 28);
      
      expect(day17).toBeGreaterThan(day20);
      expect(day20).toBeGreaterThan(day26);
      expect(day26).toBe(10); // Very low before period
    });
  });

  describe('calculateDaysUntilNextPhase', () => {
    test('should calculate days until end of menstrual phase', () => {
      expect(calculateDaysUntilNextPhase(1, 28, 'menstrual')).toBe(5);
      expect(calculateDaysUntilNextPhase(3, 28, 'menstrual')).toBe(3);
      expect(calculateDaysUntilNextPhase(5, 28, 'menstrual')).toBe(1);
    });

    test('should calculate days until ovulation from follicular', () => {
      expect(calculateDaysUntilNextPhase(7, 28, 'follicular')).toBe(7);
      expect(calculateDaysUntilNextPhase(10, 28, 'follicular')).toBe(4);
    });

    test('should calculate days until end of ovulation', () => {
      expect(calculateDaysUntilNextPhase(14, 28, 'ovulation')).toBe(3);
      expect(calculateDaysUntilNextPhase(15, 28, 'ovulation')).toBe(2);
    });

    test('should calculate days until next period from luteal', () => {
      expect(calculateDaysUntilNextPhase(20, 28, 'luteal')).toBe(9);
      expect(calculateDaysUntilNextPhase(27, 28, 'luteal')).toBe(2);
      expect(calculateDaysUntilNextPhase(28, 28, 'luteal')).toBe(1);
    });
  });

  describe('getPhaseProgress', () => {
    test('should calculate menstrual phase progress', () => {
      expect(getPhaseProgress(1, 28)).toBe(20);
      expect(getPhaseProgress(3, 28)).toBe(60);
      expect(getPhaseProgress(5, 28)).toBe(100);
    });

    test('should calculate follicular phase progress', () => {
      const day7 = getPhaseProgress(7, 28);
      const day10 = getPhaseProgress(10, 28);
      expect(day7).toBeLessThan(day10);
      expect(day7).toBeGreaterThan(0);
      expect(day10).toBeLessThan(100);
    });

    test('should calculate ovulation phase progress', () => {
      expect(getPhaseProgress(14, 28)).toBeCloseTo(33.33, 0);
      expect(getPhaseProgress(15, 28)).toBeCloseTo(66.67, 0);
      expect(getPhaseProgress(16, 28)).toBe(100);
    });

    test('should calculate luteal phase progress', () => {
      const day17 = getPhaseProgress(17, 28);
      const day25 = getPhaseProgress(25, 28);
      expect(day17).toBeLessThan(day25);
      expect(day17).toBeGreaterThan(0);
    });
  });

  describe('getPredictionConfidence', () => {
    test('should return low confidence with insufficient data', () => {
      const confidence = getPredictionConfidence([]);
      expect(confidence.level).toBe('low');
      expect(confidence.percentage).toBe(40);
      expect(confidence.message).toContain('Need more cycle data');
    });

    test('should return high confidence for regular cycles', () => {
      const regularCycles = [
        { cycleLength: 28 },
        { cycleLength: 28 },
        { cycleLength: 29 },
        { cycleLength: 28 },
        { cycleLength: 28 }
      ];
      const confidence = getPredictionConfidence(regularCycles);
      expect(confidence.level).toBe('high');
      expect(confidence.percentage).toBe(90);
      expect(confidence.message).toContain('Very regular');
    });

    test('should return medium confidence for fairly regular cycles', () => {
      const fairlyRegular = [
        { cycleLength: 26 },
        { cycleLength: 28 },
        { cycleLength: 30 },
        { cycleLength: 27 }
      ];
      const confidence = getPredictionConfidence(fairlyRegular);
      expect(confidence.level).toBe('medium');
      expect(confidence.percentage).toBe(70);
    });

    test('should return low confidence for irregular cycles', () => {
      const irregular = [
        { cycleLength: 21 },
        { cycleLength: 35 },
        { cycleLength: 28 },
        { cycleLength: 32 }
      ];
      const confidence = getPredictionConfidence(irregular);
      expect(confidence.level).toBe('low');
      expect(confidence.percentage).toBe(50);
      expect(confidence.message).toContain('Irregular');
    });
  });
});