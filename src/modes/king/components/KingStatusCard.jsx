import React from 'react';
import { Shield, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { calculateCurrentDay } from '../../../core/utils';

const KingStatusCard = ({ cycleData, currentPhase, testMode, testDays }) => {
  const today = new Date();
  const currentDay = calculateCurrentDay(
    testMode ? new Date(today.getTime() - testDays * 24 * 60 * 60 * 1000) : cycleData.startDate, 
    today
  );
  
  const getDangerIcon = (phase) => {
    const criticalPhases = ['Code Red Alert', 'DEFCON 1'];
    if (criticalPhases.includes(phase)) {
      return <AlertTriangle className="w-5 h-5" style={{ color: 'var(--king-danger)' }} />;
    }
    return <Shield className="w-5 h-5" style={{ color: 'var(--king-safe)' }} />;
  };
  
  return (
    <div className="p-4 rounded-lg" style={{ 
      backgroundColor: 'var(--king-surface)',
      border: '1px solid var(--king-border)'
    }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getDangerIcon(currentPhase.phase)}
          <h3 className="font-semibold" style={{ color: 'var(--king-primary)' }}>
            Tactical Assessment
          </h3>
        </div>
        <span className="text-small" style={{ color: 'var(--king-text-secondary)' }}>
          Day {currentDay} of {cycleData.cycleLength}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded" style={{ backgroundColor: 'var(--king-card)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4" style={{ color: 'var(--king-accent)' }} />
            <span className="text-tiny" style={{ color: 'var(--king-text-secondary)' }}>
              Current Phase
            </span>
          </div>
          <p className="font-medium text-small" style={{ color: 'var(--king-text)' }}>
            {currentPhase.phase}
          </p>
        </div>
        
        <div className="p-3 rounded" style={{ backgroundColor: 'var(--king-card)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4" style={{ color: 'var(--king-accent)' }} />
            <span className="text-tiny" style={{ color: 'var(--king-text-secondary)' }}>
              Cycle Started
            </span>
          </div>
          <p className="font-medium text-small" style={{ color: 'var(--king-text)' }}>
            {cycleData.startDate.toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="mt-3 p-2 rounded text-center" style={{ 
        backgroundColor: 'var(--king-card)',
        border: '1px solid var(--king-border)'
      }}>
        <p className="text-tiny" style={{ color: 'var(--king-text)' }}>
          {currentPhase.description}
        </p>
      </div>
    </div>
  );
};

export default KingStatusCard;