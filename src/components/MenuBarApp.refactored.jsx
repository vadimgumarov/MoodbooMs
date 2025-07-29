/**
 * MenuBarApp - Refactored with Mode Abstraction Layer
 * 
 * This is a refactored version of MenuBarApp that uses the new component
 * abstraction layer for cleaner mode-specific behavior handling.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Tornado, Heart, Coffee, Candy, IceCream, Cookie, Settings, AlertCircle, Soup, Apple, Fish, Salad, Milk, Cherry, Wheat, Carrot, Egg, Nut, Banana, X } from 'lucide-react';
import Calendar from './Calendar';
import PhaseDetail from './PhaseDetail';
import HistoryView from './HistoryView';
import StatusCard from './StatusCard';
import SettingsPanel from './SettingsPanel';
import KingModeIntegration from './KingModeIntegration';
import { createCycleRecord, completeCycleRecord, addCycleToHistory, calculateCurrentDay, getCurrentPhase } from '../core/utils';
import { modeContent, getRandomPhrase, resetPhraseTracking, getUIText } from '../content/modeContent';
import { useMode, MODES } from '../core/contexts/SimpleModeContext';
import { calculateFertilityPercentage } from '../utils/phaseDetection';
import { 
  useModeAwareProps, 
  getModePhaseInfo,
  ModeConditional,
  ModeText 
} from '../core/components/abstractions';

// Icon mapping for food items
const foodIconMap = {
  'Soup': Soup,
  'Apple': Apple,
  'Fish': Fish,
  'Salad': Salad,
  'Milk': Milk,
  'Cherry': Cherry,
  'Wheat': Wheat,
  'Coffee': Coffee,
  'Carrot': Carrot,
  'Egg': Egg,
  'Nut': Nut,
  'Banana': Banana,
  'Cookie': Cookie,
  'IceCream': IceCream,
  'Candy': Candy
};

// Phase icon mapping
const phaseIconMap = {
  menstrual: CloudLightning,
  follicular: Sun,
  ovulation: CloudSun,
  luteal: Cloud,
  lateLuteal: CloudRain,
  premenstrual: Tornado
};

const MenuBarApp = () => {
  // Use mode context and abstraction layer
  const { currentMode, isKingMode, toggleMode, isSwitching } = useMode();
  const modeProps = useModeAwareProps();
  
  const [cycleData, setCycleData] = useState({
    startDate: new Date(),
    cycleLength: 28,
    notifications: true
  });
  const [currentPhase, setCurrentPhase] = useState({ phase: '', icon: null, description: '' });
  const [currentMood, setCurrentMood] = useState("");
  const [currentCraving, setCurrentCraving] = useState({ icon: Candy, text: "candy" });
  const [testMode, setTestMode] = useState(false);
  const [testDays, setTestDays] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mood');
  const [selectedDate, setSelectedDate] = useState(null);
  const [cycleHistory, setCycleHistory] = useState([]);
  const [preferences, setPreferences] = useState({
    notifications: true,
    theme: 'auto',
    badassMode: false // Keep for backward compatibility
  });
  
  // Use ref to track previous phase to prevent unnecessary updates
  const previousPhaseRef = useRef('');

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      if (window.electronAPI && window.electronAPI.app) {
        window.electronAPI.app.log('MenuBarApp: Starting to load saved data');
      }
      
      if (window.electronAPI && window.electronAPI.store) {
        try {
          const savedCycleData = await window.electronAPI.store.get('cycleData');
          const savedPreferences = await window.electronAPI.store.get('preferences');
          const savedHistory = await window.electronAPI.store.get('cycleHistory');
          
          if (savedCycleData) {
            setCycleData({
              startDate: new Date(savedCycleData.startDate),
              cycleLength: savedCycleData.cycleLength || 28,
              notifications: savedPreferences?.notifications ?? true
            });
          }
          
          if (savedHistory && Array.isArray(savedHistory)) {
            setCycleHistory(savedHistory);
          } else if (savedCycleData) {
            const initialCycle = createCycleRecord(
              new Date(savedCycleData.startDate), 
              savedCycleData.cycleLength || 28
            );
            setCycleHistory([initialCycle]);
            await window.electronAPI.store.set('cycleHistory', initialCycle);
          }
          
          if (savedPreferences) {
            setPreferences({
              ...preferences,
              ...savedPreferences
            });
            if (savedPreferences.testMode !== undefined) {
              setTestMode(savedPreferences.testMode);
            }
          }
        } catch (error) {
          console.error('Error loading saved data:', error);
        }
      }
      
      if (window.electronAPI && window.electronAPI.app) {
        window.electronAPI.app.log('MenuBarApp: Finished loading, isLoading = false');
      }
      
      setIsLoading(false);
    };
    
    loadSavedData();
  }, []);

  // Update phase and icon when cycle data or test mode changes
  useEffect(() => {
    if (isLoading) return;
    
    if (window.electronAPI && window.electronAPI.app) {
      window.electronAPI.app.log('MenuBarApp: Phase update effect triggered, isLoading=' + isLoading);
    }
    
    const timer = setTimeout(() => {
      const currentDate = testMode 
        ? new Date(new Date().getTime() - testDays * 24 * 60 * 60 * 1000)
        : new Date();
      
      const currentDay = calculateCurrentDay(cycleData.startDate, currentDate);
      const medicalPhase = getCurrentPhase(currentDay, cycleData.cycleLength);
      
      // Use the new abstraction to get mode-specific phase info
      const phaseInfo = getModePhaseInfo(medicalPhase, currentMode);
      const phaseIcon = phaseIconMap[medicalPhase] || Cloud;
      
      const newPhase = {
        phase: phaseInfo.displayName,
        icon: phaseIcon,
        description: modeProps.getUIText(`${medicalPhase}Description`)
      };
      
      if (newPhase.phase !== previousPhaseRef.current) {
        previousPhaseRef.current = newPhase.phase;
        setCurrentPhase(newPhase);
        
        // Update mood and craving
        const newMood = getRandomPhrase(currentMode, medicalPhase, 'mood');
        const newCraving = getRandomPhrase(currentMode, medicalPhase, 'craving');
        setCurrentMood(newMood);
        setCurrentCraving(newCraving);
        
        // Send phase update to main process
        if (window.electronAPI && window.electronAPI.tray) {
          if (window.electronAPI.app) {
            window.electronAPI.app.log(`MenuBarApp: Updating phase to "${newPhase.phase}"`);
          }
          window.electronAPI.tray.updatePhase(newPhase.phase);
        }
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [cycleData, testDays, testMode, isLoading, currentMode, modeProps, isSwitching]);

  // Handle various state updates
  const handleDateChange = async (newStartDate) => {
    setCycleData(prev => ({ ...prev, startDate: newStartDate }));
    
    if (window.electronAPI && window.electronAPI.store) {
      try {
        await window.electronAPI.store.set('cycleData', {
          startDate: newStartDate.toISOString(),
          cycleLength: cycleData.cycleLength
        });
        
        const existingRecord = cycleHistory[cycleHistory.length - 1];
        if (existingRecord && !existingRecord.endDate) {
          const updatedRecord = completeCycleRecord(existingRecord, newStartDate);
          const newHistory = [...cycleHistory.slice(0, -1), updatedRecord];
          
          const newCycle = createCycleRecord(newStartDate, cycleData.cycleLength);
          newHistory.push(newCycle);
          
          setCycleHistory(newHistory);
          await window.electronAPI.store.set('cycleHistory', newHistory);
        }
      } catch (error) {
        console.error('Error saving cycle data:', error);
      }
    }
  };

  const handlePeriodStart = (startDate) => {
    const newCycle = createCycleRecord(startDate, cycleData.cycleLength);
    const newHistory = addCycleToHistory(cycleHistory, newCycle);
    setCycleHistory(newHistory);
    setCycleData(prev => ({ ...prev, startDate }));
    
    if (window.electronAPI && window.electronAPI.store) {
      window.electronAPI.store.set('cycleData', {
        startDate: startDate.toISOString(),
        cycleLength: cycleData.cycleLength
      });
      window.electronAPI.store.set('cycleHistory', newHistory);
    }
  };

  const handleLengthChange = async (newLength) => {
    setCycleData(prev => ({ ...prev, cycleLength: newLength }));
    
    if (window.electronAPI && window.electronAPI.store) {
      try {
        await window.electronAPI.store.set('cycleData', {
          startDate: cycleData.startDate.toISOString(),
          cycleLength: newLength
        });
      } catch (error) {
        console.error('Error saving cycle data:', error);
      }
    }
  };

  const toggleNotifications = async () => {
    const newNotificationState = !cycleData.notifications;
    setCycleData(prev => ({ ...prev, notifications: newNotificationState }));
    
    if (window.electronAPI && window.electronAPI.store) {
      try {
        await window.electronAPI.store.set('preferences', {
          notifications: newNotificationState
        });
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    }
  };

  const handleTestModeChange = async (enabled) => {
    setTestMode(enabled);
    
    if (window.electronAPI && window.electronAPI.store) {
      try {
        await window.electronAPI.store.set('preferences', {
          testMode: enabled
        });
      } catch (error) {
        console.error('Error saving test mode:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-80">
        <div className="p-4 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Calculate fertility percentage
  const currentDay = calculateCurrentDay(
    testMode ? new Date(new Date().getTime() - testDays * 24 * 60 * 60 * 1000) : cycleData.startDate, 
    new Date()
  );
  const fertility = calculateFertilityPercentage(currentDay, cycleData.cycleLength);

  // If in King mode, use the King mode integration
  if (isKingMode) {
    return (
      <KingModeIntegration
        currentPhase={currentPhase}
        currentMood={currentMood}
        currentCraving={currentCraving}
        fertility={fertility}
        activeTab={activeTab}
        onTabChange={(tab, value) => {
          if (tab === 'testDays') {
            setTestDays(value);
          } else {
            setActiveTab(tab);
          }
        }}
        cycleData={cycleData}
        testMode={testMode}
        testDays={testDays}
        onDateChange={handleDateChange}
        onModeToggle={toggleMode}
        isKingMode={isKingMode}
        isSwitching={isSwitching}
        onQuit={() => {
          if (window.electronAPI && window.electronAPI.app) {
            window.electronAPI.app.quit();
          }
        }}
        onSettingsClick={() => setActiveTab('settings')}
      >
        {/* Pass the regular content for calendar, history, and settings tabs */}
        {activeTab === 'calendar' ? (
          <Calendar 
            cycleStartDate={cycleData.startDate} 
            cycleLength={cycleData.cycleLength}
            onDateSelect={setSelectedDate}
            isBadassMode={modeProps.isBadassMode}
          />
        ) : activeTab === 'history' ? (
          <HistoryView 
            cycleHistory={cycleHistory}
            currentCycleStart={cycleData.startDate}
            onPeriodStart={handlePeriodStart}
            isBadassMode={modeProps.isBadassMode}
          />
        ) : activeTab === 'settings' ? (
          <SettingsPanel
            cycleData={cycleData}
            preferences={preferences}
            testMode={testMode}
            onDateChange={handleDateChange}
            onLengthChange={handleLengthChange}
            onNotificationToggle={toggleNotifications}
            onTestModeChange={handleTestModeChange}
            onSave={async (newPrefs) => {
              setPreferences(newPrefs);
              if (window.electronAPI && window.electronAPI.store) {
                await window.electronAPI.store.set('preferences', newPrefs);
              }
            }}
            onReset={() => {
              setPreferences({
                notifications: true,
                theme: 'auto',
                badassMode: false
              });
            }}
          />
        ) : null}
      </KingModeIntegration>
    );
  }

  // Queen mode rendering
  return (
    <div className="w-[420px] max-h-[650px] overflow-hidden">
      <div className={modeProps.getModeStyle('headerBg')}>
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              MoodbooM
              <button
                onClick={toggleMode}
                disabled={isSwitching}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 ${
                  isKingMode ? 'bg-blue-700' : 'bg-pink-500'
                } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={modeProps.getModeValue("Switch to King mode", "Switch to Queen mode")}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isKingMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </h1>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('settings')}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                title="Settings"
              >
                <Settings size={18} className="text-white" />
              </button>
              <button 
                onClick={() => {
                  if (window.electronAPI && window.electronAPI.app) {
                    window.electronAPI.app.quit();
                  }
                }}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                title={modeProps.getUIText('quitTooltip')}
              >
                <X size={18} className="text-white" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            {['mood', 'calendar', 'history', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <ModeText 
                  queenText={tab.charAt(0).toUpperCase() + tab.slice(1)}
                  kingText={tab === 'mood' ? 'Status' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-white">
        <ModeConditional
          queen={
            activeTab === 'mood' && (
              <>
                <div className="mb-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <currentPhase.icon className="w-8 h-8" />
                    <h2 className="text-xl font-bold">{currentPhase.phase}</h2>
                  </div>
                  <p className="text-gray-600">{currentPhase.description}</p>
                </div>

                <StatusCard 
                  cycleData={cycleData}
                  currentPhase={currentPhase}
                  testMode={testMode}
                  testDays={testDays}
                  isBadassMode={modeProps.isBadassMode}
                />

                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-700 mb-1">
                      {modeProps.getUIText('moodLabel')}
                    </p>
                    <p className="text-purple-900">{currentMood || 'Loading mood...'}</p>
                  </div>
                  
                  <div className="p-3 bg-pink-50 rounded-lg">
                    <p className="text-sm font-medium text-pink-700 mb-1">
                      {modeProps.getUIText('cravingLabel')}
                    </p>
                    <div className="flex items-center gap-2">
                      {currentCraving.icon && (
                        <currentCraving.icon className="w-5 h-5 text-pink-600" />
                      )}
                      <p className="text-pink-900">{currentCraving.text || 'Loading cravings...'}</p>
                    </div>
                  </div>
                </div>

                {testMode && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm font-medium text-yellow-700">Test Mode Active</p>
                    </div>
                    <div>
                      <label className="text-xs text-yellow-600">Test Day: {testDays}</label>
                      <input
                        type="range"
                        min="0"
                        max={cycleData.cycleLength}
                        value={testDays}
                        onChange={(e) => setTestDays(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </>
            )
          }
          fallback={
            <>
              {activeTab === 'calendar' && (
                <>
                  <Calendar 
                    cycleStartDate={cycleData.startDate} 
                    cycleLength={cycleData.cycleLength}
                    onDateSelect={setSelectedDate}
                    isBadassMode={modeProps.isBadassMode}
                  />
                  {selectedDate && (
                    <PhaseDetail
                      selectedDate={selectedDate}
                      cycleStartDate={cycleData.startDate}
                      cycleLength={cycleData.cycleLength}
                      isBadassMode={modeProps.isBadassMode}
                    />
                  )}
                </>
              )}
              
              {activeTab === 'history' && (
                <HistoryView 
                  cycleHistory={cycleHistory}
                  currentCycleStart={cycleData.startDate}
                  onPeriodStart={handlePeriodStart}
                  isBadassMode={modeProps.isBadassMode}
                />
              )}
              
              {activeTab === 'settings' && (
                <SettingsPanel
                  cycleData={cycleData}
                  preferences={preferences}
                  testMode={testMode}
                  onDateChange={handleDateChange}
                  onLengthChange={handleLengthChange}
                  onNotificationToggle={toggleNotifications}
                  onTestModeChange={handleTestModeChange}
                  onSave={async (newPrefs) => {
                    setPreferences(newPrefs);
                    if (window.electronAPI && window.electronAPI.store) {
                      await window.electronAPI.store.set('preferences', newPrefs);
                    }
                  }}
                  onReset={() => {
                    setPreferences({
                      notifications: true,
                      theme: 'auto',
                      badassMode: false
                    });
                  }}
                />
              )}
            </>
          }
        />
      </div>
    </div>
  );
};

export default MenuBarApp;