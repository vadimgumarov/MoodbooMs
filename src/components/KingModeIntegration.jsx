import React from 'react';
import KingModeWrapper from '../modes/king/components/KingModeWrapper';
import KingPhaseDisplay from '../modes/king/components/KingPhaseDisplay';
import { getRandomKingPhrase, kingPhrases } from '../modes/king/config/phrases';
import { Calendar, Clock, History, Settings, X, AlertCircle } from 'lucide-react';
import '../modes/king/components/KingMode.css';

// Map medical phase names to King mode phase keys
const phaseNameToKey = {
  'Code Red Alert': 'menstrual',
  'Safe Zone Active': 'follicular',
  'High Energy Warning': 'ovulation',
  'Patience Level: Low': 'luteal',
  'Volatility Alert': 'lateLuteal',
  'DEFCON 1': 'premenstrual'
};

const KingModeIntegration = ({ 
  currentPhase, 
  currentMood, 
  currentCraving, 
  fertility,
  activeTab,
  onTabChange,
  cycleData,
  testMode,
  testDays,
  onDateChange,
  onModeToggle,
  isKingMode,
  isSwitching,
  onQuit,
  onSettingsClick,
  children 
}) => {
  // Log what we're receiving
  console.log('KingModeIntegration props:', { currentPhase, activeTab });
  
  // Safety check for currentPhase
  if (!currentPhase || !currentPhase.phase) {
    console.error('KingModeIntegration: currentPhase is invalid:', currentPhase);
    return <div style={{ color: 'var(--king-text)' }}>Loading phase data...</div>;
  }
  
  // Get the phase key from the phase name
  const phaseKey = phaseNameToKey[currentPhase.phase] || 'menstrual';
  console.log('Phase mapping:', currentPhase.phase, '->', phaseKey);
  
  const phaseData = kingPhrases[phaseKey];
  
  // Safety check
  if (!phaseData) {
    console.error('KingModeIntegration: Invalid phase key:', phaseKey, 'from phase:', currentPhase.phase);
    console.error('Available phase keys:', Object.keys(kingPhrases));
    console.error('Phase name to key mapping:', phaseNameToKey);
    return <div style={{ color: 'var(--king-text)' }}>Error: Invalid phase data</div>;
  }
  
  // Use the passed mood/craving or get random ones
  const mood = currentMood || getRandomKingPhrase(phaseKey, 'moods');
  const craving = currentCraving || getRandomKingPhrase(phaseKey, 'cravings');
  
  return (
    <KingModeWrapper>
      <div className="king-mode-app w-96">
        {/* Header */}
        <div className="p-4" style={{ backgroundColor: 'var(--king-surface)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--king-primary)' }}>
              MoodBooMs
            </h2>
            <div className="flex items-center gap-3">
              {/* Queen/King Mode Toggle */}
              <label className={`flex items-center gap-2 ${isSwitching ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}>
                <span className="text-xs" style={{ color: 'var(--king-text-secondary)' }}>
                  {isKingMode ? 'King' : 'Queen'}
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isKingMode}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (!isSwitching) {
                        onModeToggle();
                      }
                    }}
                    disabled={isSwitching}
                    className="sr-only"
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${
                    isKingMode ? 'bg-red-600' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    isKingMode ? 'translate-x-4' : ''
                  }`}></div>
                </div>
              </label>
              {/* Close Button */}
              <button
                onClick={onQuit}
                className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                style={{ color: 'var(--king-text-secondary)' }}
                title="Quit MoodBooMs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--king-bg)' }}>
            <button
              onClick={() => onTabChange('mood')}
              className={`flex-1 py-2 px-3 rounded-md transition-colors text-sm ${
                activeTab === 'mood' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Status
            </button>
            <button
              onClick={() => onTabChange('calendar')}
              className={`flex-1 py-2 px-3 rounded-md transition-colors text-sm ${
                activeTab === 'calendar' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Danger Calendar
            </button>
            <button
              onClick={() => onTabChange('history')}
              className={`flex-1 py-2 px-3 rounded-md transition-colors text-sm ${
                activeTab === 'history' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Survival Log
            </button>
            <button
              onClick={() => onTabChange('settings')}
              className={`py-2 px-3 rounded-md transition-colors text-sm ${
                activeTab === 'settings' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4" style={{ backgroundColor: 'var(--king-bg)' }}>
          {activeTab === 'mood' ? (
            <div className="space-y-4">
              <KingPhaseDisplay 
                phase={{
                  phase: phaseKey,
                  description: phaseData.description
                }}
                mood={mood}
                craving={craving}
                fertility={fertility || 50}
              />
              
              {/* Period Start Date Input */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={cycleData.startDate.toISOString().split('T')[0]}
                  onChange={(e) => onDateChange(new Date(e.target.value))}
                  className="flex-1 p-2 rounded text-sm"
                  style={{ 
                    backgroundColor: 'var(--king-surface)',
                    border: '1px solid var(--king-border)',
                    color: 'var(--king-text)'
                  }}
                />
              </div>

              {/* Test Mode */}
              {testMode && (
                <div className="p-3 rounded" style={{ 
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid var(--king-warning)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4" style={{ color: 'var(--king-warning)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--king-warning)' }}>
                      Test Mode Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'var(--king-text-secondary)' }}>
                      Test Day:
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={cycleData.cycleLength}
                      value={testDays}
                      onChange={(e) => onTabChange('testDays', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-8 text-right text-sm font-medium" style={{ color: 'var(--king-text)' }}>
                      {testDays}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--king-text-secondary)' }}>
                    Simulating day {testDays} of cycle
                  </p>
                </div>
              )}
            </div>
          ) : (
            // For other tabs, render the children (existing components)
            <div className="king-mode-tab-content">
              {children}
            </div>
          )}
        </div>
      </div>
    </KingModeWrapper>
  );
};

export default KingModeIntegration;