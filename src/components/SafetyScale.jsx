import React from 'react';
import { Shield, AlertCircle, AlertTriangle } from 'lucide-react';
import { calculateFertilityPercentage } from '../core/utils';

const SafetyScale = ({ cycleDay, cycleLength, compact = false }) => {
  const fertilityPercentage = calculateFertilityPercentage(cycleDay, cycleLength);
  
  // Determine safety level based on fertility percentage
  const getSafetyLevel = (percentage) => {
    if (percentage <= 20) return { level: 'safe', color: 'green', icon: Shield };
    if (percentage <= 50) return { level: 'caution', color: 'yellow', icon: AlertTriangle };
    return { level: 'danger', color: 'red', icon: AlertCircle };
  };
  
  const safety = getSafetyLevel(fertilityPercentage);
  const Icon = safety.icon;
  
  // Color classes based on safety level
  const colorClasses = {
    green: {
      bg: 'bg-green-100',
      fill: 'bg-green-500',
      text: 'text-green-700',
      icon: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-100',
      fill: 'bg-yellow-500',
      text: 'text-yellow-700',
      icon: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-100',
      fill: 'bg-red-500',
      text: 'text-red-700',
      icon: 'text-red-600'
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
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${colors.fill} transition-all duration-300`}
              style={{ width: `${fertilityPercentage}%` }}
            />
          </div>
        </div>
        <span className={`text-xs font-medium ${colors.text}`}>
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
          <h3 className="font-semibold text-gray-800">Safety Scale</h3>
        </div>
        <span className={`text-sm font-bold ${colors.text}`}>
          {fertilityPercentage}% Fertile
        </span>
      </div>
      
      <div className="mb-3">
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colors.fill} transition-all duration-500 ease-out`}
            style={{ width: `${fertilityPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Safe</span>
          <span>Danger</span>
        </div>
      </div>
      
      <p className={`text-sm italic ${colors.text}`}>
        {getSafetyMessage(fertilityPercentage)}
      </p>
      
      <div className="mt-2 pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          Day {cycleDay} of {cycleLength}-day cycle
        </p>
      </div>
    </div>
  );
};

export default SafetyScale;