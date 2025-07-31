/**
 * Mood Module
 * 
 * Displays current phase, mood messages, and food cravings
 */

import React from 'react';
import { useModules } from '../core/contexts';
import { MODULE_IDS } from '../core/modules/types';
import StatusCard from '../components/StatusCard';
import { calculateCurrentDay } from '../core/utils';
import { AlertCircle } from 'lucide-react';

const MoodModule = ({ 
  cycleData, 
  currentPhase, 
  testMode, 
  testDays,
  currentMood,
  currentCraving,
  isKingMode,
  onDateChange,
  onTestDaysChange
}) => {
  const { isModuleEnabled } = useModules();
  
  // Check if mood module is enabled
  if (!isModuleEnabled(MODULE_IDS.MOOD)) {
    return null;
  }

  return (
    <div className="space-y-4" role="tabpanel" id="mood-panel" aria-labelledby="mood-tab" tabIndex={0}>
      <StatusCard 
        cycleData={cycleData}
        currentPhase={currentPhase}
        testMode={testMode}
        testDays={testDays}
      />

      <div className="p-3 bg-surface rounded">
        <p className="text-small font-medium">{isKingMode ? "Her Status:" : "My Mood:"}</p>
        <p className="text-small italic text-text-secondary break-words">{currentMood}</p>
      </div>

      <div className="p-3 bg-surface rounded">
        <div className="flex items-start gap-2">
          <p className="text-small font-medium flex-shrink-0">{isKingMode ? "She Needs:" : "I Need:"}</p>
          <currentCraving.icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="text-small italic break-words">{isKingMode ? `Get her ${currentCraving.text}` : `Need ${currentCraving.text} ASAP`}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={cycleData.startDate.toISOString().split('T')[0]}
          onChange={(e) => onDateChange(new Date(e.target.value))}
          className="flex-1 p-2 border rounded"
          aria-label="Cycle start date"
        />
      </div>

      {testMode && (
        <TestModeIndicator 
          testDays={testDays}
          cycleLength={cycleData.cycleLength}
          actualDay={calculateCurrentDay(cycleData.startDate, new Date())}
          onTestDaysChange={onTestDaysChange}
        />
      )}
    </div>
  );
};

// Test mode indicator component
const TestModeIndicator = ({ testDays, cycleLength, actualDay, onTestDaysChange }) => {
  
  return (
    <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-4 h-4 text-warning" />
        <span className="text-small font-medium text-warning">Test Mode Active</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-small text-text-secondary">Test Day:</span>
        <input
          type="range"
          min="0"
          max={cycleLength}
          value={testDays}
          onChange={(e) => onTestDaysChange(parseInt(e.target.value))}
          className="flex-1"
          aria-label="Test day slider"
          aria-valuemin="0"
          aria-valuemax={cycleLength}
          aria-valuenow={testDays}
        />
        <span className="w-8 text-right text-small font-medium" aria-live="polite">{testDays}</span>
      </div>
      <p className="text-tiny text-text-muted mt-1">
        Showing day {testDays} of your cycle (actual: day {actualDay})
      </p>
    </div>
  );
};

export default MoodModule;