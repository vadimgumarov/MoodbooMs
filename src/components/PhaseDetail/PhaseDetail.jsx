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
import { useMode } from '../../core/contexts/SimpleModeContext';

const PhaseDetail = ({ selectedDate, cycleStartDate, cycleLength }) => {
  const { isKingMode } = useMode();
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
        <h3 className="text-heading font-semibold">
          {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        <p className="text-small text-secondary">
          Cycle Day {cycleDay}
        </p>
      </div>

      {/* Phase Information */}
      <div className="bg-surface rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getPhaseIcon()}
            <span className="font-medium capitalize">
              {isKingMode ? (
                phaseInfo.phase === 'menstrual' ? 'Code Red Alert' :
                phaseInfo.phase === 'follicular' ? 'Safe Zone Active' :
                phaseInfo.phase === 'ovulation' ? 'High Energy Warning' :
                phaseInfo.phase === 'luteal' ? 'Patience Level: Low' :
                'Unknown Phase'
              ) : (
                phaseInfo.phase === 'menstrual' ? 'Bloody Hell Week' :
                phaseInfo.phase === 'follicular' ? 'Finally Got My Sh*t Together' :
                phaseInfo.phase === 'ovulation' ? 'Horny AF' :
                phaseInfo.phase === 'luteal' ? 'Getting Real Tired of This BS' :
                'Unknown Phase'
              )}
            </span>
          </div>
          <span className="text-small text-secondary">
            {phaseInfo.daysUntilNextPhase} days left
          </span>
        </div>

        {/* Fertility Level */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-small">Fertility Level</span>
            <span className={`text-small ${getFertilityColor()}`}>
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
          <p className="text-tiny text-secondary text-right">
            {phaseInfo.fertilityPercentage}% chance
          </p>
        </div>
      </div>

      {/* Phase Description */}
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Battery className="w-5 h-5 text-secondary mt-0.5" />
          <div>
            <p className="text-small font-medium">{isKingMode ? 'Her Energy Status' : 'Energy'}</p>
            <p className="text-small text-secondary">
              {isKingMode ? 
                (phaseInfo.phase === 'menstrual' ? "She's running on fumes and chocolate" :
                 phaseInfo.phase === 'follicular' ? "She's back! Energy levels rising fast" :
                 phaseInfo.phase === 'ovulation' ? "Peak performance mode - she's unstoppable" :
                 phaseInfo.phase === 'luteal' ? "Battery draining, proceed with caution" :
                 phaseInfo.description)
                : phaseInfo.description}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Brain className="w-5 h-5 text-secondary mt-0.5" />
          <div>
            <p className="text-small font-medium">{isKingMode ? 'Mood Forecast' : 'Mood'}</p>
            <p className="text-small text-secondary">
              {isKingMode ?
                (phaseInfo.phase === 'menstrual' ? "Emotional volcano - approach with chocolate offerings" :
                 phaseInfo.phase === 'follicular' ? "Surprisingly reasonable - make your requests now" :
                 phaseInfo.phase === 'ovulation' ? "Flirty and fun - enjoy while it lasts" :
                 phaseInfo.phase === 'luteal' ? "Irritability rising - choose your words wisely" :
                 phaseInfo.mood)
                : phaseInfo.mood}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <TrendingUp className="w-5 h-5 text-secondary mt-0.5" />
          <div>
            <p className="text-small font-medium">{isKingMode ? 'Survival Strategy' : 'Advice'}</p>
            <p className="text-small text-secondary">
              {isKingMode ?
                (phaseInfo.phase === 'menstrual' ? "Stock up on supplies: chocolate, heating pads, and patience" :
                 phaseInfo.phase === 'follicular' ? "Perfect time for date nights and important discussions" :
                 phaseInfo.phase === 'ovulation' ? "Clear your schedule - she's got plans" :
                 phaseInfo.phase === 'luteal' ? "Keep snacks handy and arguments minimal" :
                 phaseInfo.advice)
                : phaseInfo.advice}
            </p>
          </div>
        </div>
      </div>

      {/* Common Symptoms */}
      {phaseInfo.symptoms.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-secondary" />
            <p className="text-small font-medium">{isKingMode ? 'Warning Signs' : 'Common Symptoms'}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {phaseInfo.symptoms.map((symptom, index) => (
              <span 
                key={index}
                className="text-tiny bg-surface text-secondary px-2 py-1 rounded-full"
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
          <p className="text-small text-success font-medium">
            🌟 Peak Fertility Window
          </p>
          <p className="text-tiny text-success mt-1">
            This is your most fertile time. Ovulation is expected around day {phaseInfo.ovulationDay}.
          </p>
        </div>
      )}
    </div>
  );
};

export default PhaseDetail;