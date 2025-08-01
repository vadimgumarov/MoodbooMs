import React from 'react';
import { Calendar, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { calculateCurrentDay, getCurrentPhase, getFertilityLevel, calculateFertilityPercentage } from '../core/utils';

const StatusCard = ({ cycleData, currentPhase, testMode, testDays, isBadassMode = true }) => {
  // Calculate cycle day
  const currentDate = testMode 
    ? new Date(new Date().getTime() - testDays * 24 * 60 * 60 * 1000)
    : new Date();
  
  const cycleDay = calculateCurrentDay(cycleData.startDate, currentDate);
  
  // Get fertility info
  const fertilityLevel = getFertilityLevel(cycleDay, cycleData.cycleLength);
  const fertilityPercentage = calculateFertilityPercentage(cycleDay, cycleData.cycleLength);
  
  // Map fertility level to display name
  const fertilityLevelMap = {
    'very-low': 'Very Low',
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'very-high': 'Very High'
  };
  
  const fertilityInfo = {
    level: fertilityLevelMap[fertilityLevel] || 'Unknown',
    percentage: fertilityPercentage
  };
  
  // Calculate days until next phase
  const badassPhases = {
    'Bloody Hell Week': 5,
    'Finally Got My Sh*t Together': 8,
    'Horny AF': 3,
    'Getting Real Tired of This BS': 4,
    'Pre-Chaos Mood Swings': 4,
    'Apocalypse Countdown': cycleData.cycleLength - 24
  };
  
  const professionalPhases = {
    'Menstruation': 5,
    'Follicular Phase': 8,
    'Ovulation': 3,
    'Luteal Phase': 4,
    'Late Luteal Phase': 4,
    'Pre-Menstrual': cycleData.cycleLength - 24
  };
  
  const phaseDurations = isBadassMode ? badassPhases : professionalPhases;
  
  const badassOrder = [
    'Bloody Hell Week',
    'Finally Got My Sh*t Together', 
    'Horny AF',
    'Getting Real Tired of This BS',
    'Pre-Chaos Mood Swings',
    'Apocalypse Countdown'
  ];
  
  const professionalOrder = [
    'Menstruation',
    'Follicular Phase',
    'Ovulation',
    'Luteal Phase',
    'Late Luteal Phase',
    'Pre-Menstrual'
  ];
  
  const phaseOrder = isBadassMode ? badassOrder : professionalOrder;
  
  const currentPhaseIndex = phaseOrder.indexOf(currentPhase.phase);
  const nextPhaseIndex = (currentPhaseIndex + 1) % phaseOrder.length;
  const nextPhase = phaseOrder[nextPhaseIndex];
  
  // Calculate days remaining in current phase
  let daysIntoPhase = 0;
  let phaseStartDay = 1;
  
  for (let i = 0; i < currentPhaseIndex; i++) {
    phaseStartDay += phaseDurations[phaseOrder[i]];
  }
  
  daysIntoPhase = cycleDay - phaseStartDay + 1;
  const currentPhaseDuration = phaseDurations[currentPhase.phase] || 4; // Default to 4 if phase not found
  const daysUntilNextPhase = Math.max(1, currentPhaseDuration - daysIntoPhase + 1);
  
  // Fertility level to color mapping
  const fertilityColors = {
    'Very Low': 'bg-error-light text-error',
    'Low': 'bg-warning-light text-warning',
    'Medium': 'bg-surface text-secondary',
    'High': 'bg-success-light text-success',
    'Very High': 'bg-success text-white'
  };

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-border p-4 space-y-3">
      {/* Header with current phase */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {currentPhase.icon && <currentPhase.icon className="w-6 h-6 text-primary flex-shrink-0" />}
          <h3 className="text-heading break-words">{currentPhase.phase}</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-tiny font-medium whitespace-nowrap flex-shrink-0 ${fertilityColors[fertilityInfo.level]}`}>
          {fertilityInfo.level} Fertility
        </span>
      </div>
      
      {/* Phase description */}
      <p className="text-small text-secondary italic break-words">{currentPhase.description}</p>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background rounded-lg p-3">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-tiny text-secondary">Cycle Day</span>
          </div>
          <p className="text-title font-bold">{cycleDay}/{cycleData.cycleLength}</p>
        </div>
        
        <div className="bg-background rounded-lg p-3">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <Target className="w-4 h-4" />
            <span className="text-tiny text-secondary">Fertility</span>
          </div>
          <p className="text-title font-bold">{fertilityInfo.percentage}%</p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-tiny text-secondary">
          <span>Phase Progress</span>
          <span>{daysIntoPhase} of {currentPhaseDuration} days</span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (daysIntoPhase / currentPhaseDuration) * 100)}%` }}
          />
        </div>
      </div>
      
      {/* Next phase info */}
      <div className="bg-primary-light rounded-lg p-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-small text-primary break-words">Next: {nextPhase}</span>
        </div>
        <span className="text-small font-medium text-primary whitespace-nowrap flex-shrink-0">
          {daysUntilNextPhase} {daysUntilNextPhase === 1 ? 'day' : 'days'}
        </span>
      </div>
      
      {/* Alert for peak fertility */}
      {fertilityInfo.level === 'Very High' && (
        <div className="bg-warning-light border border-warning rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <span className="text-small text-warning break-words">
            {isBadassMode ? "High energy mode - Handle with care!" : "Peak energy - I could conquer the world!"}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatusCard;