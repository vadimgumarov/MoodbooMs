import React from 'react';
import { Calendar, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { calculateCurrentDay, getCurrentPhase, getFertilityLevel } from '../utils/cycleCalculations';
import { calculateFertilityPercentage } from '../utils/phaseDetection';

const StatusCard = ({ cycleData, currentPhase, testMode, testDays }) => {
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
  const phaseDurations = {
    'Bloody Hell Week': 5,
    'Finally Got My Sh*t Together': 8,
    'Horny AF': 3,
    'Getting Real Tired of This BS': 4,
    'Pre-Chaos Mood Swings': 4,
    'Apocalypse Countdown': cycleData.cycleLength - 24
  };
  
  const phaseOrder = [
    'Bloody Hell Week',
    'Finally Got My Sh*t Together', 
    'Horny AF',
    'Getting Real Tired of This BS',
    'Pre-Chaos Mood Swings',
    'Apocalypse Countdown'
  ];
  
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
  const daysUntilNextPhase = phaseDurations[currentPhase.phase] - daysIntoPhase + 1;
  
  // Fertility level to color mapping
  const fertilityColors = {
    'Very Low': 'bg-red-100 text-red-700',
    'Low': 'bg-yellow-100 text-yellow-700',
    'Medium': 'bg-gray-100 text-gray-700',
    'High': 'bg-green-100 text-green-700',
    'Very High': 'bg-emerald-100 text-emerald-700'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
      {/* Header with current phase */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentPhase.icon && <currentPhase.icon className="w-6 h-6 text-gray-700" />}
          <h3 className="font-semibold text-lg">{currentPhase.phase}</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${fertilityColors[fertilityInfo.level]}`}>
          {fertilityInfo.level} Fertility
        </span>
      </div>
      
      {/* Phase description */}
      <p className="text-sm text-gray-600 italic">{currentPhase.description}</p>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Cycle Day</span>
          </div>
          <p className="text-xl font-bold">{cycleDay}/{cycleData.cycleLength}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Target className="w-4 h-4" />
            <span className="text-xs">Fertility</span>
          </div>
          <p className="text-xl font-bold">{fertilityInfo.percentage}%</p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Phase Progress</span>
          <span>{daysIntoPhase} of {phaseDurations[currentPhase.phase]} days</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(daysIntoPhase / phaseDurations[currentPhase.phase]) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Next phase info */}
      <div className="bg-indigo-50 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span className="text-sm text-indigo-700">Next: {nextPhase}</span>
        </div>
        <span className="text-sm font-medium text-indigo-700">
          {daysUntilNextPhase} {daysUntilNextPhase === 1 ? 'day' : 'days'}
        </span>
      </div>
      
      {/* Alert for peak fertility */}
      {fertilityInfo.level === 'Very High' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-700">Peak fertility window!</span>
        </div>
      )}
    </div>
  );
};

export default StatusCard;