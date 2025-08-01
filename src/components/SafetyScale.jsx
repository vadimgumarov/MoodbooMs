import React from 'react';
import { Shield, AlertCircle, AlertTriangle } from 'lucide-react';
import { calculateFertilityPercentage } from '../core/utils';
import { FERTILITY } from '../constants';

const SafetyScale = ({ cycleDay, cycleLength, compact = false }) => {
  const fertilityPercentage = calculateFertilityPercentage(cycleDay, cycleLength);
  
  // Determine safety level based on fertility percentage
  const getSafetyLevel = (percentage) => {
    if (percentage <= FERTILITY.SAFETY_THRESHOLDS.SAFE) return { level: 'safe', color: 'green', icon: Shield };
    if (percentage <= FERTILITY.SAFETY_THRESHOLDS.CAUTION) return { level: 'caution', color: 'yellow', icon: AlertTriangle };
    return { level: 'danger', color: 'red', icon: AlertCircle };
  };
  
  const safety = getSafetyLevel(fertilityPercentage);
  const Icon = safety.icon;
  
  // Color classes based on safety level
  const colorClasses = {
    green: {
      bg: 'bg-success-light',
      fill: 'bg-success',
      text: 'text-success',
      icon: 'text-success'
    },
    yellow: {
      bg: 'bg-warning-light',
      fill: 'bg-warning',
      text: 'text-warning',
      icon: 'text-warning'
    },
    red: {
      bg: 'bg-error-light',
      fill: 'bg-error',
      text: 'text-error',
      icon: 'text-error'
    }
  };
  
  const colors = colorClasses[safety.color];
  
  // Safety messages based on fertility
  const getSafetyMessage = (percentage) => {
    if (percentage <= 10) return "Safe as houses (but still use protection!)";
    if (percentage <= 20) return "Pretty safe, but don't get cocky";
    if (percentage <= 40) return "Proceed with caution, soldier";
    if (percentage <= 60) return "Getting risky - double up!";
    if (percentage <= 80) return "Danger zone! Protection is NOT optional";
    if (percentage <= 95) return "RED ALERT: Baby-making mode activated";
    return "MAXIMUM FERTILITY: Approach with extreme caution";
  };
  
  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded ${colors.bg}`}>
        <Icon className={`w-4 h-4 ${colors.icon}`} />
        <div className="flex-1">
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div 
              className={`h-full ${colors.fill} transition-all duration-300`}
              style={{ width: `${fertilityPercentage}%` }}
            />
          </div>
        </div>
        <span className={`text-tiny font-medium ${colors.text}`}>
          {fertilityPercentage}%
        </span>
      </div>
    );
  }
  
  return (
    <div className={`p-4 rounded-lg ${colors.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${colors.icon}`} />
          <h3 className="text-heading text-primary">Safety Scale</h3>
        </div>
        <span className={`text-small font-bold ${colors.text}`}>
          {fertilityPercentage}% Fertile
        </span>
      </div>
      
      <div className="mb-3">
        <div className="h-4 bg-border rounded-full overflow-hidden">
          <div 
            className={`h-full ${colors.fill} transition-all duration-500 ease-out`}
            style={{ width: `${fertilityPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-tiny text-secondary">
          <span>Safe</span>
          <span>Danger</span>
        </div>
      </div>
      
      <p className={`text-small italic ${colors.text}`}>
        {getSafetyMessage(fertilityPercentage)}
      </p>
      
      <div className="mt-2 pt-2 border-t border-border">
        <p className="text-tiny text-secondary">
          Day {cycleDay} of {cycleLength}-day cycle
        </p>
      </div>
    </div>
  );
};

export default SafetyScale;