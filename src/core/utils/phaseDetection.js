import { 
  getCurrentPhase, 
  getFertilityLevel, 
  getOvulationWindow 
} from './cycleCalculations';

// Phase-specific descriptions and advice
const PHASE_DESCRIPTIONS = {
  menstrual: {
    energy: 'Low energy, rest is important',
    mood: 'May feel tired or emotional',
    advice: 'Be gentle with yourself, use heat for cramps',
    symptoms: ['Cramps', 'Fatigue', 'Bloating', 'Headaches']
  },
  follicular: {
    energy: 'Energy increasing, good for new projects',
    mood: 'Optimistic and creative',
    advice: 'Great time to start new activities',
    symptoms: ['Increased energy', 'Better focus', 'Clearer skin']
  },
  ovulation: {
    energy: 'Peak energy and confidence',
    mood: 'Social and outgoing',
    advice: 'Best time for important meetings or dates',
    symptoms: ['Increased libido', 'Cervical mucus changes', 'Mild cramping']
  },
  luteal: {
    energy: 'Energy declining, need more rest',
    mood: 'May experience mood swings',
    advice: 'Practice self-care, reduce stress',
    symptoms: ['PMS symptoms', 'Breast tenderness', 'Food cravings', 'Irritability']
  }
};

// Fertility percentage mapping
const FERTILITY_PERCENTAGES = {
  'very-low': { min: 0, max: 10, typical: 5 },
  'low': { min: 10, max: 30, typical: 20 },
  'medium': { min: 30, max: 60, typical: 45 },
  'high': { min: 60, max: 85, typical: 72 },
  'very-high': { min: 85, max: 100, typical: 95 }
};

/**
 * Get detailed phase information including fertility percentage
 * @param {number} cycleDay - Current day in cycle
 * @param {number} cycleLength - Total cycle length
 * @returns {Object} Detailed phase information
 */
export function getPhaseInfo(cycleDay, cycleLength) {
  const phase = getCurrentPhase(cycleDay, cycleLength);
  const fertilityLevel = getFertilityLevel(cycleDay, cycleLength);
  const ovulationWindow = getOvulationWindow(cycleLength);
  
  // Calculate fertility percentage based on proximity to ovulation
  const fertilityPercentage = calculateFertilityPercentage(cycleDay, cycleLength);
  
  // Calculate days until next phase
  const daysUntilNextPhase = calculateDaysUntilNextPhase(cycleDay, cycleLength, phase);
  
  // Get phase-specific information
  const phaseDesc = PHASE_DESCRIPTIONS[phase] || {};
  
  return {
    phase,
    fertilityLevel,
    fertilityPercentage,
    daysUntilNextPhase,
    description: phaseDesc.energy || '',
    mood: phaseDesc.mood || '',
    advice: phaseDesc.advice || '',
    symptoms: phaseDesc.symptoms || [],
    ovulationDay: ovulationWindow.peak,
    isOvulating: cycleDay >= ovulationWindow.start && cycleDay <= ovulationWindow.end
  };
}

/**
 * Calculate precise fertility percentage based on cycle day
 * @param {number} cycleDay - Current day in cycle
 * @param {number} cycleLength - Total cycle length
 * @returns {number} Fertility percentage (0-100)
 */
export function calculateFertilityPercentage(cycleDay, cycleLength) {
  const ovulationDay = cycleLength - 14;
  const daysFromOvulation = Math.abs(cycleDay - ovulationDay);
  
  // During menstruation (days 1-5)
  if (cycleDay <= 5) {
    return 5;
  }
  
  // Peak fertility on ovulation day
  if (cycleDay === ovulationDay) {
    return 100;
  }
  
  // Very high fertility 1 day before/after ovulation
  if (daysFromOvulation === 1) {
    return 95;
  }
  
  // High fertility 2-3 days before ovulation
  if (cycleDay >= ovulationDay - 3 && cycleDay < ovulationDay) {
    const daysBeforeOvulation = ovulationDay - cycleDay;
    return 80 - daysBeforeOvulation * 5; // 75, 70, 65 for days 13, 12, 11
  }
  
  // Medium fertility in mid-follicular phase
  if (cycleDay > 5 && cycleDay < ovulationDay - 3) {
    const progress = (cycleDay - 5) / (ovulationDay - 8);
    return Math.round(20 + progress * 40);
  }
  
  // Declining fertility in luteal phase
  if (cycleDay > ovulationDay + 1) {
    const daysAfterOvulation = cycleDay - ovulationDay;
    const remaining = cycleLength - cycleDay;
    
    if (remaining <= 3) {
      return 10; // Very low before period
    }
    
    return Math.max(10, 60 - daysAfterOvulation * 5);
  }
  
  return 20; // Default low fertility
}

/**
 * Calculate days until the next phase begins
 * @param {number} cycleDay - Current day in cycle
 * @param {number} cycleLength - Total cycle length
 * @param {string} currentPhase - Current phase name
 * @returns {number} Days until next phase
 */
export function calculateDaysUntilNextPhase(cycleDay, cycleLength, currentPhase) {
  const ovulationDay = cycleLength - 14;
  
  switch (currentPhase) {
    case 'menstrual':
      return Math.max(0, 6 - cycleDay); // Menstrual ends after day 5
    
    case 'follicular':
      return Math.max(0, ovulationDay - cycleDay); // Until ovulation starts
    
    case 'ovulation':
      return Math.max(0, ovulationDay + 3 - cycleDay); // 3-day window
    
    case 'luteal':
      return Math.max(0, cycleLength - cycleDay + 1); // Until next period
    
    default:
      return 0;
  }
}

/**
 * Get phase progression percentage (how far through current phase)
 * @param {number} cycleDay - Current day in cycle
 * @param {number} cycleLength - Total cycle length
 * @returns {number} Progress percentage (0-100)
 */
export function getPhaseProgress(cycleDay, cycleLength) {
  const phase = getCurrentPhase(cycleDay, cycleLength);
  const ovulationDay = cycleLength - 14;
  
  switch (phase) {
    case 'menstrual':
      return Math.min(100, (cycleDay / 5) * 100);
    
    case 'follicular':
      const follicularLength = ovulationDay - 6;
      const follicularDay = cycleDay - 5;
      return Math.min(100, (follicularDay / follicularLength) * 100);
    
    case 'ovulation':
      const ovulationProgress = cycleDay - ovulationDay + 1;
      return Math.min(100, (ovulationProgress / 3) * 100);
    
    case 'luteal':
      const lutealStart = ovulationDay + 2;
      const lutealLength = cycleLength - lutealStart + 1;
      const lutealDay = cycleDay - lutealStart + 1;
      return Math.min(100, (lutealDay / lutealLength) * 100);
    
    default:
      return 0;
  }
}

/**
 * Get confidence level for predictions based on cycle regularity
 * @param {Array} cycleHistory - Array of previous cycle lengths
 * @returns {Object} Confidence level and variance
 */
export function getPredictionConfidence(cycleHistory = []) {
  if (!cycleHistory || cycleHistory.length < 3) {
    return {
      level: 'low',
      percentage: 40,
      message: 'Need more cycle data for accurate predictions'
    };
  }
  
  // Calculate standard deviation
  const lengths = cycleHistory.map(c => c.cycleLength);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, length) => {
    return sum + Math.pow(length - mean, 2);
  }, 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  
  // Determine confidence based on variance
  if (stdDev <= 1) {
    return {
      level: 'high',
      percentage: 90,
      message: 'Very regular cycles, predictions are reliable'
    };
  } else if (stdDev <= 3) {
    return {
      level: 'medium',
      percentage: 70,
      message: 'Fairly regular cycles, predictions are good'
    };
  } else {
    return {
      level: 'low',
      percentage: 50,
      message: 'Irregular cycles, predictions may vary'
    };
  }
}