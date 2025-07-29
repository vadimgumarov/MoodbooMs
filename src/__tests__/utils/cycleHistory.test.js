import {
  createCycleRecord,
  completeCycleRecord,
  addNoteToDate,
  addSymptomsToDate,
  calculateCycleStatistics,
  getRecentCycles,
  predictNextCycleStart
} from '../cycleHistory';

describe('Cycle History Utilities', () => {
  describe('createCycleRecord', () => {
    test('should create a new cycle record with default values', () => {
      const startDate = new Date('2025-07-01');
      const cycleLength = 28;
      const record = createCycleRecord(startDate, cycleLength);

      expect(record).toMatchObject({
        id: expect.stringContaining('cycle-'),
        startDate: startDate.toISOString(),
        cycleLength: 28,
        actualLength: null,
        endDate: null,
        notes: {},
        symptoms: {},
        createdAt: expect.any(String)
      });
    });

    test('should use custom cycle length', () => {
      const startDate = new Date('2025-07-01');
      const record = createCycleRecord(startDate, 30);
      expect(record.cycleLength).toBe(30);
    });
  });

  describe('completeCycleRecord', () => {
    test('should complete a cycle record with actual length', () => {
      const startDate = new Date('2025-07-01');
      const record = createCycleRecord(startDate, 28);
      const nextStart = new Date('2025-07-27'); // 26 days later

      const completed = completeCycleRecord(record, nextStart);

      expect(completed).toMatchObject({
        ...record,
        endDate: nextStart.toISOString(),
        actualLength: 26,
        completedAt: expect.any(String)
      });
    });
  });

  describe('addNoteToDate', () => {
    test('should add a note to a specific date', () => {
      const record = createCycleRecord(new Date('2025-07-01'), 28);
      const noteDate = new Date('2025-07-05');
      const note = 'Feeling tired today';

      const updated = addNoteToDate(record, noteDate, note);

      expect(updated.notes['2025-07-05']).toBe(note);
    });

    test('should update existing note', () => {
      const record = createCycleRecord(new Date('2025-07-01'), 28);
      const noteDate = new Date('2025-07-05');
      
      let updated = addNoteToDate(record, noteDate, 'First note');
      updated = addNoteToDate(updated, noteDate, 'Updated note');

      expect(updated.notes['2025-07-05']).toBe('Updated note');
    });
  });

  describe('addSymptomsToDate', () => {
    test('should add symptoms to a specific date', () => {
      const record = createCycleRecord(new Date('2025-07-01'), 28);
      const symptomDate = new Date('2025-07-03');
      const symptoms = ['cramps', 'headache', 'fatigue'];

      const updated = addSymptomsToDate(record, symptomDate, symptoms);

      expect(updated.symptoms['2025-07-03']).toEqual(symptoms);
    });
  });

  describe('calculateCycleStatistics', () => {
    test('should return null values for empty history', () => {
      const stats = calculateCycleStatistics([]);
      
      expect(stats).toEqual({
        averageLength: null,
        shortestCycle: null,
        longestCycle: null,
        totalCycles: 0,
        completedCycles: 0,
        cycleRegularity: 'insufficient-data'
      });
    });

    test('should calculate statistics for completed cycles', () => {
      const history = [
        { ...createCycleRecord(new Date('2025-01-01'), 28), actualLength: 28 },
        { ...createCycleRecord(new Date('2025-02-01'), 28), actualLength: 27 },
        { ...createCycleRecord(new Date('2025-03-01'), 28), actualLength: 29 },
        { ...createCycleRecord(new Date('2025-04-01'), 28), actualLength: 28 }
      ];

      const stats = calculateCycleStatistics(history);

      expect(stats).toMatchObject({
        averageLength: 28,
        shortestCycle: 27,
        longestCycle: 29,
        totalCycles: 4,
        completedCycles: 4,
        cycleRegularity: 'very-regular',
        standardDeviation: expect.any(Number)
      });
    });

    test('should identify irregular cycles', () => {
      const history = [
        { ...createCycleRecord(new Date('2025-01-01'), 28), actualLength: 21 },
        { ...createCycleRecord(new Date('2025-02-01'), 28), actualLength: 35 },
        { ...createCycleRecord(new Date('2025-03-01'), 28), actualLength: 25 },
        { ...createCycleRecord(new Date('2025-04-01'), 28), actualLength: 42 }
      ];

      const stats = calculateCycleStatistics(history);
      // Average would be ~30.75, with high variance
      expect(stats.cycleRegularity).toBe('irregular');
    });
  });

  describe('getRecentCycles', () => {
    test('should return last N cycles sorted by date', () => {
      const history = [
        { ...createCycleRecord(new Date('2025-01-01'), 28), id: 'cycle-1' },
        { ...createCycleRecord(new Date('2025-03-01'), 28), id: 'cycle-3' },
        { ...createCycleRecord(new Date('2025-02-01'), 28), id: 'cycle-2' },
        { ...createCycleRecord(new Date('2025-04-01'), 28), id: 'cycle-4' }
      ];

      const recent = getRecentCycles(history, 2);

      expect(recent).toHaveLength(2);
      expect(recent[0].id).toBe('cycle-4');
      expect(recent[1].id).toBe('cycle-3');
    });

    test('should return all cycles if count exceeds history length', () => {
      const history = [
        createCycleRecord(new Date('2025-01-01'), 28),
        createCycleRecord(new Date('2025-02-01'), 28)
      ];

      const recent = getRecentCycles(history, 10);
      expect(recent).toHaveLength(2);
    });
  });

  describe('predictNextCycleStart', () => {
    test('should use average length for prediction when history exists', () => {
      const history = [
        { ...createCycleRecord(new Date('2025-01-01'), 28), actualLength: 28 },
        { ...createCycleRecord(new Date('2025-02-01'), 28), actualLength: 30 },
        { ...createCycleRecord(new Date('2025-03-01'), 28), actualLength: 28 }
      ];

      const currentStart = new Date('2025-04-01');
      const predicted = predictNextCycleStart(history, currentStart);

      // Average is 28.67, rounded to 29
      const expectedDate = new Date('2025-04-30');
      expect(predicted.toDateString()).toBe(expectedDate.toDateString());
    });

    test('should use configured length when no completed cycles', () => {
      const history = [
        createCycleRecord(new Date('2025-04-01'), 30)
      ];

      const currentStart = new Date('2025-04-01');
      const predicted = predictNextCycleStart(history, currentStart);

      const expectedDate = new Date('2025-05-01');
      expect(predicted.toDateString()).toBe(expectedDate.toDateString());
    });

    test('should default to 28 days when no history', () => {
      const currentStart = new Date('2025-04-01');
      const predicted = predictNextCycleStart([], currentStart);

      const expectedDate = new Date('2025-04-29');
      expect(predicted.toDateString()).toBe(expectedDate.toDateString());
    });
  });
});