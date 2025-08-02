import { differenceInDays, addDays } from 'date-fns';
import { CYCLE } from '../constants';

/**
 * Calculate the current day of the menstrual cycle
 * @param {Date} startDate - First day of last period
 * @param {Date} currentDate - Current date to check
 * @param {number} cycleLength - Length of the cycle (default 28)
 * @returns {number} Current day in cycle (1-cycleLength)
 */
function calculateCurrentDay(startDate, currentDate, cycleLength = CYCLE.DEFAULT_LENGTH) {
  const daysDiff = differenceInDays(currentDate, startDate);
  
  // Handle future start dates
  if (daysDiff < 0) {
    // Calculate how many complete cycles have passed
    const cyclesPassed = Math.floor(Math.abs(daysDiff) / cycleLength);
    const adjustedDiff = daysDiff + ((cyclesPassed + 1) * cycleLength);
    return ((adjustedDiff % cycleLength) + cycleLength) % cycleLength || cycleLength;
  }
  
  // Normal calculation
  const dayInCycle = (daysDiff % cycleLength) + 1;
  return dayInCycle > cycleLength ? 1 : dayInCycle;
}

/**
 * Determine the current phase of the menstrual cycle
 * @param {number} currentDay - Current day in cycle
 * @param {number} cycleLength - Length of the cycle
 * @returns {string} Phase name: 'menstrual', 'follicular', 'ovulation', 'luteal'
 */
function getCurrentPhase(currentDay, cycleLength) {
  // Menstrual phase: Days 1-5
  if (currentDay <= CYCLE.PHASE_DAYS.MENSTRUAL_END) {
    return 'menstrual';
  }
  
  // Calculate ovulation day (14 days before end of cycle)
  const ovulationDay = cycleLength - CYCLE.OVULATION_OFFSET;
  
  // Ovulation window: ovulation day and 2 days after (3 days total)
  if (currentDay >= ovulationDay && currentDay <= ovulationDay + 2 && currentDay > CYCLE.PHASE_DAYS.MENSTRUAL_END) {
    return 'ovulation';
  }
  
  // Follicular phase: After menstrual, before ovulation
  if (currentDay > CYCLE.PHASE_DAYS.MENSTRUAL_END && currentDay < ovulationDay) {
    return 'follicular';
  }
  
  // Luteal phase: After ovulation until end
  return 'luteal';
}

/**
 * Calculate fertility level based on cycle day
 * @param {number} currentDay - Current day in cycle
 * @param {number} cycleLength - Length of the cycle
 * @returns {string} Fertility level: 'very-low', 'low', 'medium', 'high', 'very-high'
 */
function getFertilityLevel(currentDay, cycleLength) {
  // Very low during period
  if (currentDay <= CYCLE.PHASE_DAYS.MENSTRUAL_END) {
    return 'very-low';
  }
  
  const ovulationDay = cycleLength - CYCLE.OVULATION_OFFSET;
  
  // Very high during ovulation window (ovulation day and 2 days after)
  if (currentDay >= ovulationDay && currentDay <= ovulationDay + 2) {
    return 'very-high';
  }
  
  // High 3 days before ovulation
  if (currentDay >= ovulationDay - 3 && currentDay < ovulationDay) {
    return 'high';
  }
  
  // Low in early follicular (days 6-7) and late luteal (last 3 days)
  if ((currentDay >= 6 && currentDay <= 7) || currentDay >= cycleLength - 2) {
    return 'low';
  }
  
  // Medium for all other days
  return 'medium';
}

/**
 * Predict the next period start date
 * @param {Date} lastPeriodStart - Start date of last period
 * @param {number} cycleLength - Length of the cycle
 * @returns {Date} Predicted start date of next period
 */
function predictNextPeriod(lastPeriodStart, cycleLength) {
  return addDays(lastPeriodStart, cycleLength);
}

/**
 * Get ovulation window details
 * @param {number} cycleLength - Length of the cycle
 * @returns {Object} Ovulation window with start, peak, and end days
 */
function getOvulationWindow(cycleLength) {
  const ovulationDay = cycleLength - CYCLE.OVULATION_OFFSET;
  return {
    start: ovulationDay - 2,
    peak: ovulationDay,
    end: ovulationDay + 2
  };
}

/**
 * Calculate average cycle length from history
 * @param {Array} history - Array of previous cycles with cycleLength property
 * @returns {number} Average cycle length (default 28 if no history)
 */
function calculateAverageCycleLength(history) {
  if (!history || history.length === 0) {
    return CYCLE.DEFAULT_LENGTH; // Default cycle length
  }
  
  // Use only the last 6 cycles for average
  const recentCycles = history.slice(-CYCLE.HISTORY_CYCLES_FOR_AVERAGE);
  const sum = recentCycles.reduce((acc, cycle) => acc + cycle.cycleLength, 0);
  return Math.round(sum / recentCycles.length);
}

/**
 * Get cycle progress as percentage
 * @param {number} currentDay - Current day in cycle
 * @param {number} cycleLength - Length of the cycle
 * @returns {number} Progress percentage (0-100)
 */
function getCycleProgress(currentDay, cycleLength) {
  return Math.round((currentDay / cycleLength) * 100);
}

/**
 * Calculate days until next period
 * @param {number} currentDay - Current day in cycle
 * @param {number} cycleLength - Length of the cycle
 * @returns {number} Days until next period
 */
function getDaysUntilNextPeriod(currentDay, cycleLength) {
  return cycleLength - currentDay + 1;
}

/**
 * Calculate the next period date based on cycle history or current cycle
 * @param {Date} currentPeriodStart - Start date of current period
 * @param {number} currentCycleLength - Current cycle length
 * @param {Array} cycleHistory - Array of previous cycles
 * @returns {Date} Predicted next period start date
 */
function calculateNextPeriodDate(currentPeriodStart, currentCycleLength, cycleHistory) {
  const averageCycleLength = calculateAverageCycleLength(cycleHistory);
  const cycleLength = cycleHistory && cycleHistory.length > 0 ? averageCycleLength : currentCycleLength;
  return addDays(currentPeriodStart, cycleLength);
}

/**
 * Calculate the previous period date based on cycle history or current cycle
 * @param {Date} currentPeriodStart - Start date of current period
 * @param {number} currentCycleLength - Current cycle length
 * @param {Array} cycleHistory - Array of previous cycles
 * @returns {Date|null} Previous period start date, or null if none exists
 */
function calculatePreviousPeriodDate(currentPeriodStart, currentCycleLength, cycleHistory) {
  if (!cycleHistory || cycleHistory.length === 0) {
    // No history, calculate based on current cycle length
    return addDays(currentPeriodStart, -currentCycleLength);
  }
  
  // Find the most recent previous cycle
  const sortedHistory = [...cycleHistory].sort((a, b) => 
    new Date(b.startDate) - new Date(a.startDate)
  );
  
  // Find the cycle that comes before the current one
  const currentStartTime = currentPeriodStart.getTime();
  const previousCycle = sortedHistory.find(cycle => 
    new Date(cycle.startDate).getTime() < currentStartTime
  );
  
  if (previousCycle) {
    return new Date(previousCycle.startDate);
  }
  
  // No previous cycle found, calculate based on average
  const averageCycleLength = calculateAverageCycleLength(cycleHistory);
  return addDays(currentPeriodStart, -averageCycleLength);
}

/**
 * Get period navigation info (next/previous dates with metadata)
 * @param {Date} currentPeriodStart - Start date of current period
 * @param {number} currentCycleLength - Current cycle length
 * @param {Array} cycleHistory - Array of previous cycles
 * @returns {Object} Navigation info with next/previous dates and metadata
 */
function getPeriodNavigationInfo(currentPeriodStart, currentCycleLength, cycleHistory) {
  const nextPeriodDate = calculateNextPeriodDate(currentPeriodStart, currentCycleLength, cycleHistory);
  const previousPeriodDate = calculatePreviousPeriodDate(currentPeriodStart, currentCycleLength, cycleHistory);
  
  // Check if dates are based on history or prediction
  const hasHistory = cycleHistory && cycleHistory.length > 0;
  const averageCycleLength = calculateAverageCycleLength(cycleHistory);
  
  return {
    next: {
      date: nextPeriodDate,
      isPredicted: true,
      basedOnHistory: hasHistory,
      cycleLength: hasHistory ? averageCycleLength : currentCycleLength
    },
    previous: {
      date: previousPeriodDate,
      isPredicted: !hasHistory, // If no history, it's predicted; if history exists, it might be actual
      basedOnHistory: hasHistory,
      cycleLength: hasHistory ? averageCycleLength : currentCycleLength
    }
  };
}

/**
 * Get predicted ovulation date for the current cycle
 * @param {Date} cycleStartDate - Start date of current cycle
 * @param {number} cycleLength - Length of the cycle
 * @returns {Date} Predicted ovulation date
 */
function getPredictedOvulationDate(cycleStartDate, cycleLength) {
  // Ovulation typically occurs 14 days before the end of the cycle
  const ovulationDay = cycleLength - CYCLE.OVULATION_OFFSET;
  return addDays(cycleStartDate, ovulationDay - 1); // -1 because ovulation day is 1-indexed
}

/**
 * Get predicted next period date for the current cycle
 * @param {Date} cycleStartDate - Start date of current cycle
 * @param {number} cycleLength - Length of the cycle
 * @returns {Date} Predicted next period start date
 */  
function getPredictedNextPeriodDate(cycleStartDate, cycleLength) {
  return addDays(cycleStartDate, cycleLength);
}

/**
 * Get all prediction dates for calendar highlighting
 * @param {Date} cycleStartDate - Start date of current cycle
 * @param {number} cycleLength - Length of the cycle
 * @param {Array} cycleHistory - Array of previous cycles for confidence calculation
 * @returns {Object} Object containing prediction dates and metadata
 */
function getCalendarPredictions(cycleStartDate, cycleLength, cycleHistory = []) {
  const today = new Date();
  const ovulationDate = getPredictedOvulationDate(cycleStartDate, cycleLength);
  const nextPeriodDate = getPredictedNextPeriodDate(cycleStartDate, cycleLength);
  
  // Calculate confidence based on cycle regularity
  const hasHistory = cycleHistory && cycleHistory.length > 0;
  let confidence = hasHistory ? 'medium' : 'low';
  
  if (hasHistory && cycleHistory.length >= 3) {
    const lengths = cycleHistory.slice(-6).map(cycle => cycle.cycleLength || cycle.length || cycleLength);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    // High confidence if cycles are regular (std dev < 2 days)
    if (stdDev < 2) {
      confidence = 'high';
    } else if (stdDev > 4) {
      confidence = 'low';
    }
  }
  
  return {
    ovulation: {
      date: ovulationDate,
      confidence,
      isPast: ovulationDate < today,
      type: 'ovulation'
    },
    nextPeriod: {
      date: nextPeriodDate,
      confidence,
      isPast: nextPeriodDate < today,
      type: 'period'
    }
  };
}

export {
  calculateCurrentDay,
  getCurrentPhase,
  getFertilityLevel,
  predictNextPeriod,
  getOvulationWindow,
  calculateAverageCycleLength,
  getCycleProgress,
  getDaysUntilNextPeriod,
  calculateNextPeriodDate,
  calculatePreviousPeriodDate,
  getPeriodNavigationInfo,
  getPredictedOvulationDate,
  getPredictedNextPeriodDate,
  getCalendarPredictions
};