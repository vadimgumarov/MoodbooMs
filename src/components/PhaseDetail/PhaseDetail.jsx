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
      <div className="p-4 text-center text-secondary">
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
        return <Heart className="w-6 h-6 text-error" />;
      case 'follicular':
        return <Battery className="w-6 h-6 text-warning" />;
      case 'ovulation':
        return <Heart className="w-6 h-6 text-success" />;
      case 'luteal':
        return <Brain className="w-6 h-6 text-secondary" />;
      default:
        return <Calendar className="w-6 h-6" />;
    }
  };

  // Get fertility color
  const getFertilityColor = () => {
    switch (phaseInfo.fertilityLevel) {
      case 'very-low':
        return 'text-error';
      case 'low':
        return 'text-warning';
      case 'medium':
        return 'text-secondary';
      case 'high':
        return 'text-success';
      case 'very-high':
        return 'text-success font-bold';
      default:
        return 'text-secondary';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Date Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        <p className="text-sm text-secondary">
          Cycle Day {cycleDay}
        </p>
      </div>

      {/* Phase Information */}
      <div className="bg-surface rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getPhaseIcon()}
            <span className="font-medium capitalize">
              {phaseInfo.phase === 'menstrual' ? 'Bloody Hell Week' :
              phaseInfo.phase === 'follicular' ? 'Finally Got My Sh*t Together' :
              phaseInfo.phase === 'ovulation' ? 'Horny AF' :
              phaseInfo.phase === 'luteal' ? 'Getting Real Tired of This BS' :
              'Unknown Phase'}
            </span>
          </div>
          <span className="text-sm text-secondary">
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
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                phaseInfo.fertilityPercentage >= 85 ? 'bg-success' :
                phaseInfo.fertilityPercentage >= 60 ? 'bg-success-light' :
                phaseInfo.fertilityPercentage >= 30 ? 'bg-secondary' :
                phaseInfo.fertilityPercentage >= 10 ? 'bg-warning' :
                'bg-error'
              }`}
              style={{ width: `${phaseInfo.fertilityPercentage}%` }}
            />
          </div>
          <p className="text-xs text-secondary text-right">
            {phaseInfo.fertilityPercentage}% chance
          </p>
        </div>
      </div>

      {/* Phase Description */}
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Battery className="w-5 h-5 text-secondary mt-0.5" />
          <div>
            <p className="text-sm font-medium">Energy</p>
            <p className="text-sm text-secondary">{phaseInfo.description}</p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Brain className="w-5 h-5 text-secondary mt-0.5" />
          <div>
            <p className="text-sm font-medium">Mood</p>
            <p className="text-sm text-secondary">{phaseInfo.mood}</p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <TrendingUp className="w-5 h-5 text-secondary mt-0.5" />
          <div>
            <p className="text-sm font-medium">Advice</p>
            <p className="text-sm text-secondary">{phaseInfo.advice}</p>
          </div>
        </div>
      </div>

      {/* Common Symptoms */}
      {phaseInfo.symptoms.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-secondary" />
            <p className="text-sm font-medium">Common Symptoms</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {phaseInfo.symptoms.map((symptom, index) => (
              <span 
                key={index}
                className="text-xs bg-surface text-secondary px-2 py-1 rounded-full"
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ovulation Indicator */}
      {phaseInfo.isOvulating && (
        <div className="bg-success-light border border-success rounded-lg p-3">
          <p className="text-sm text-success font-medium">
            🌟 Peak Fertility Window
          </p>
          <p className="text-xs text-success mt-1">
            This is your most fertile time. Ovulation is expected around day {phaseInfo.ovulationDay}.
          </p>
        </div>
      )}
    </div>
  );
};

export default PhaseDetail;