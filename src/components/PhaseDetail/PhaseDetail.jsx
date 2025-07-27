import React from 'react';
import { format } from 'date-fns';
import { 
  Heart, 
  Battery, 
  Brain, 
  AlertCircle,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { getPhaseInfo } from '../../utils/phaseDetection';
import { calculateCurrentDay } from '../../utils/cycleCalculations';

const PhaseDetail = ({ selectedDate, cycleStartDate, cycleLength }) => {
  if (!selectedDate || !cycleStartDate) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Select a date to see details</p>
      </div>
    );
  }

  const cycleDay = calculateCurrentDay(cycleStartDate, selectedDate, cycleLength);
  const phaseInfo = getPhaseInfo(cycleDay, cycleLength);

  // Get appropriate icon for the phase
  const getPhaseIcon = () => {
    switch (phaseInfo.phase) {
      case 'menstrual':
        return <Heart className="w-6 h-6 text-red-500" />;
      case 'follicular':
        return <Battery className="w-6 h-6 text-yellow-500" />;
      case 'ovulation':
        return <Heart className="w-6 h-6 text-green-500" />;
      case 'luteal':
        return <Brain className="w-6 h-6 text-gray-500" />;
      default:
        return <Calendar className="w-6 h-6" />;
    }
  };

  // Get fertility color
  const getFertilityColor = () => {
    switch (phaseInfo.fertilityLevel) {
      case 'very-low':
        return 'text-red-600';
      case 'low':
        return 'text-yellow-600';
      case 'medium':
        return 'text-gray-600';
      case 'high':
        return 'text-green-600';
      case 'very-high':
        return 'text-green-700 font-bold';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Date Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        <p className="text-sm text-gray-600">
          Cycle Day {cycleDay}
        </p>
      </div>

      {/* Phase Information */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getPhaseIcon()}
            <span className="font-medium capitalize">{phaseInfo.phase} Phase</span>
          </div>
          <span className="text-sm text-gray-600">
            {phaseInfo.daysUntilNextPhase} days left
          </span>
        </div>

        {/* Fertility Level */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm">Fertility Level</span>
            <span className={`text-sm ${getFertilityColor()}`}>
              {phaseInfo.fertilityLevel.replace('-', ' ').toUpperCase()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                phaseInfo.fertilityPercentage >= 85 ? 'bg-green-500' :
                phaseInfo.fertilityPercentage >= 60 ? 'bg-green-400' :
                phaseInfo.fertilityPercentage >= 30 ? 'bg-gray-400' :
                phaseInfo.fertilityPercentage >= 10 ? 'bg-yellow-400' :
                'bg-red-400'
              }`}
              style={{ width: `${phaseInfo.fertilityPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 text-right">
            {phaseInfo.fertilityPercentage}% chance
          </p>
        </div>
      </div>

      {/* Phase Description */}
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Battery className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Energy</p>
            <p className="text-sm text-gray-600">{phaseInfo.description}</p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Brain className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Mood</p>
            <p className="text-sm text-gray-600">{phaseInfo.mood}</p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Advice</p>
            <p className="text-sm text-gray-600">{phaseInfo.advice}</p>
          </div>
        </div>
      </div>

      {/* Common Symptoms */}
      {phaseInfo.symptoms.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-gray-400" />
            <p className="text-sm font-medium">Common Symptoms</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {phaseInfo.symptoms.map((symptom, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ovulation Indicator */}
      {phaseInfo.isOvulating && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800 font-medium">
            🌟 Peak Fertility Window
          </p>
          <p className="text-xs text-green-700 mt-1">
            This is your most fertile time. Ovulation is expected around day {phaseInfo.ovulationDay}.
          </p>
        </div>
      )}
    </div>
  );
};

export default PhaseDetail;