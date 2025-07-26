import { differenceInDays, addDays } from 'date-fns';

/**
 * Calculate the current day of the menstrual cycle
 * @param {Date} startDate - First day of last period
 * @param {Date} currentDate - Current date to check
 * @param {number} cycleLength - Length of the cycle (default 28)
 * @returns {number} Current day in cycle (1-cycleLength)
 */
function calculateCurrentDay(startDate, currentDate, cycleLength = 28) {
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
  if (currentDay <= 5) {
    return 'menstrual';
  }
  
  // Calculate ovulation day (14 days before end of cycle)
  const ovulationDay = cycleLength - 14;
  
  // Ovulation window: ovulation day and 2 days after (3 days total)
  if (currentDay >= ovulationDay && currentDay <= ovulationDay + 2 && currentDay > 5) {
    return 'ovulation';
  }
  
  // Follicular phase: After menstrual, before ovulation
  if (currentDay > 5 && currentDay < ovulationDay) {
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
  if (currentDay <= 5) {
    return 'very-low';
  }
  
  const ovulationDay = cycleLength - 14;
  
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
  const ovulationDay = cycleLength - 14;
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
    return 28; // Default cycle length
  }
  
  // Use only the last 6 cycles for average
  const recentCycles = history.slice(-6);
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

export {
  calculateCurrentDay,
  getCurrentPhase,
  getFertilityLevel,
  predictNextPeriod,
  getOvulationWindow,
  calculateAverageCycleLength,
  getCycleProgress,
  getDaysUntilNextPeriod
};