import { differenceInDays } from 'date-fns';

/**
 * Cycle history management utilities
 */

/**
 * Create a new cycle record
 * @param {Date} startDate - The start date of the cycle
 * @param {number} cycleLength - The configured cycle length
 * @returns {Object} A new cycle record
 */
export function createCycleRecord(startDate, cycleLength = 28) {
  return {
    id: `cycle-${startDate.getTime()}`,
    startDate: startDate.toISOString(),
    cycleLength,
    actualLength: null, // Will be calculated when next cycle starts
    endDate: null, // Will be set when next cycle starts
    notes: {},
    symptoms: {},
    createdAt: new Date().toISOString()
  };
}

/**
 * Complete a cycle record when a new cycle starts
 * @param {Object} cycleRecord - The cycle record to complete
 * @param {Date} nextCycleStart - The start date of the next cycle
 * @returns {Object} Updated cycle record
 */
export function completeCycleRecord(cycleRecord, nextCycleStart) {
  const startDate = new Date(cycleRecord.startDate);
  const actualLength = differenceInDays(nextCycleStart, startDate);
  
  return {
    ...cycleRecord,
    endDate: nextCycleStart.toISOString(),
    actualLength,
    completedAt: new Date().toISOString()
  };
}

/**
 * Add or update a note for a specific date in a cycle
 * @param {Object} cycleRecord - The cycle record
 * @param {Date} date - The date to add note for
 * @param {string} note - The note content
 * @returns {Object} Updated cycle record
 */
export function addNoteToDate(cycleRecord, date, note) {
  const dateKey = date.toISOString().split('T')[0];
  return {
    ...cycleRecord,
    notes: {
      ...cycleRecord.notes,
      [dateKey]: note
    }
  };
}

/**
 * Add or update symptoms for a specific date in a cycle
 * @param {Object} cycleRecord - The cycle record
 * @param {Date} date - The date to add symptoms for
 * @param {Array<string>} symptoms - Array of symptom strings
 * @returns {Object} Updated cycle record
 */
export function addSymptomsToDate(cycleRecord, date, symptoms) {
  const dateKey = date.toISOString().split('T')[0];
  return {
    ...cycleRecord,
    symptoms: {
      ...cycleRecord.symptoms,
      [dateKey]: symptoms
    }
  };
}

/**
 * Calculate cycle statistics from history
 * @param {Array<Object>} cycleHistory - Array of cycle records
 * @returns {Object} Statistics about cycles
 */
export function calculateCycleStatistics(cycleHistory) {
  const completedCycles = cycleHistory.filter(cycle => cycle.actualLength !== null);
  
  if (completedCycles.length === 0) {
    return {
      averageLength: null,
      shortestCycle: null,
      longestCycle: null,
      totalCycles: cycleHistory.length,
      completedCycles: 0,
      cycleRegularity: 'insufficient-data'
    };
  }

  const lengths = completedCycles.map(cycle => cycle.actualLength);
  const averageLength = Math.round(lengths.reduce((sum, len) => sum + len, 0) / lengths.length);
  const shortestCycle = Math.min(...lengths);
  const longestCycle = Math.max(...lengths);
  
  // Calculate standard deviation for regularity
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - averageLength, 2), 0) / lengths.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Determine regularity based on standard deviation
  let cycleRegularity;
  if (standardDeviation < 2) {
    cycleRegularity = 'very-regular';
  } else if (standardDeviation < 4) {
    cycleRegularity = 'regular';
  } else if (standardDeviation < 7) {
    cycleRegularity = 'somewhat-irregular';
  } else {
    cycleRegularity = 'irregular';
  }

  return {
    averageLength,
    shortestCycle,
    longestCycle,
    totalCycles: cycleHistory.length,
    completedCycles: completedCycles.length,
    cycleRegularity,
    standardDeviation: Math.round(standardDeviation * 10) / 10
  };
}

/**
 * Get the last N cycles from history
 * @param {Array<Object>} cycleHistory - Array of cycle records
 * @param {number} count - Number of cycles to return
 * @returns {Array<Object>} Last N cycles
 */
export function getRecentCycles(cycleHistory, count = 6) {
  return cycleHistory
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, count);
}

/**
 * Predict next cycle start date based on history
 * @param {Array<Object>} cycleHistory - Array of cycle records
 * @param {Date} currentCycleStart - Start date of current cycle
 * @returns {Date|null} Predicted next cycle start date
 */
export function predictNextCycleStart(cycleHistory, currentCycleStart) {
  const stats = calculateCycleStatistics(cycleHistory);
  
  if (stats.averageLength === null) {
    // No completed cycles, use configured length
    const currentCycle = cycleHistory.find(
      cycle => new Date(cycle.startDate).getTime() === currentCycleStart.getTime()
    );
    const length = currentCycle?.cycleLength || 28;
    return new Date(currentCycleStart.getTime() + length * 24 * 60 * 60 * 1000);
  }
  
  return new Date(currentCycleStart.getTime() + stats.averageLength * 24 * 60 * 60 * 1000);
}