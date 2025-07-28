import React, { useState, useEffect, useRef } from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Tornado, Heart, Coffee, Candy, IceCream, Cookie, Settings, AlertCircle, Soup, Apple, Fish, Salad, Milk, Cherry, Wheat, Carrot, Egg, Nut, Banana, X } from 'lucide-react';
import Calendar from './Calendar';
import PhaseDetail from './PhaseDetail';
import HistoryView from './HistoryView';
import StatusCard from './StatusCard';
import SettingsPanel from './SettingsPanel';
import { createCycleRecord, completeCycleRecord, addCycleToHistory, calculateCurrentDay, getCurrentPhase } from '../core/utils';
import { modeContent, getRandomPhrase, resetPhraseTracking, getUIText } from '../content/modeContent';

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

// Helper to map phase names to content keys
const getPhaseKey = (phaseName) => {
  const phaseKeyMap = {
    // Queen mode
    'Bloody Hell Week': 'menstrual',
    'Finally Got My Sh*t Together': 'follicular',
    'Horny AF': 'ovulation',
    'Getting Real Tired of This BS': 'luteal',
    'Pre-Chaos Mood Swings': 'lateLuteal',
    'Apocalypse Countdown': 'premenstrual',
    // King mode
    'Code Red Alert': 'menstrual',
    'Safe Zone Active': 'follicular',
    'High Energy Warning': 'ovulation',
    'Patience Level: Low': 'luteal',
    'Volatility Alert': 'lateLuteal',
    'DEFCON 1': 'premenstrual'
  };
  return phaseKeyMap[phaseName] || 'menstrual';
};

const calculatePhase = (startDate, cycleLength = 28, isKingMode = false) => {
  const today = new Date();
  const currentDay = calculateCurrentDay(startDate, today, cycleLength);
  const medicalPhase = getCurrentPhase(currentDay, cycleLength);
  
  // Queen mode content (female first-person perspective)
  const queenMapping = {
    'menstrual': {
      phase: 'Bloody Hell Week',
      icon: CloudLightning,
      description: 'F*ck this sh*t. Where\'s the chocolate?'
    },
    'follicular': {
      phase: 'Finally Got My Sh*t Together',
      icon: Sun,
      description: 'Look at me being a functional human being!'
    },
    'ovulation': {
      phase: 'Horny AF',
      icon: CloudSun,
      description: 'Is it hot in here or is it just my hormones?'
    },
    'luteal': {
      // In luteal phase, check if we're in late luteal for different moods
      phase: currentDay >= cycleLength - 7 ? 'Pre-Chaos Mood Swings' : 'Getting Real Tired of This BS',
      icon: currentDay >= cycleLength - 7 ? CloudRain : Cloud,
      description: currentDay >= cycleLength - 7 
        ? 'Don\'t even look at me wrong today'
        : 'Starting to question my life choices...'
    }
  };
  
  // King mode content (partner/observer perspective)
  const kingMapping = {
    'menstrual': {
      phase: 'Code Red Alert',
      icon: CloudLightning,
      description: 'Approach with chocolate. And caution.'
    },
    'follicular': {
      phase: 'Safe Zone Active',
      icon: Sun,
      description: 'She\'s back! Quick, make plans!'
    },
    'ovulation': {
      phase: 'High Energy Warning',
      icon: CloudSun,
      description: 'Buckle up, cowboy. You\'re needed.'
    },
    'luteal': {
      // In luteal phase, check if we're in late luteal for different moods
      phase: currentDay >= cycleLength - 7 ? 'Volatility Alert' : 'Patience Level: Low',
      icon: currentDay >= cycleLength - 7 ? CloudRain : Cloud,
      description: currentDay >= cycleLength - 7 
        ? 'Emotional turbulence ahead. Fasten seatbelts.'
        : 'Her patience is running low. Proceed carefully.'
    }
  };
  
  // Special case for very late luteal (last 3 days)
  if (currentDay >= cycleLength - 3) {
    return {
      phase: isKingMode ? 'DEFCON 1' : 'Apocalypse Countdown',
      icon: Tornado,
      description: isKingMode 
        ? 'Maximum danger. Bring chocolate. Leave chocolate. Run.'
        : 'If you value your life, bring snacks'
    };
  }
  
  const mapping = isKingMode ? kingMapping : queenMapping;
  return mapping[medicalPhase] || mapping['luteal'];
};

const MenuBarApp = () => {
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
  const [activeTab, setActiveTab] = useState('mood'); // 'mood', 'calendar', 'history', or 'settings'
  const [selectedDate, setSelectedDate] = useState(null);
  const [cycleHistory, setCycleHistory] = useState([]);
  const [preferences, setPreferences] = useState({
    notifications: true,
    theme: 'auto',
    badassMode: false // Default to Queen mode (female perspective)
  });
  
  // Use ref to track previous phase to prevent unnecessary updates
  const previousPhaseRef = useRef('');

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      // Debug logging
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
            // Create initial cycle record if no history exists
            const initialCycle = createCycleRecord(
              new Date(savedCycleData.startDate), 
              savedCycleData.cycleLength || 28
            );
            setCycleHistory([initialCycle]);
            // Save the initial cycle
            await window.electronAPI.store.set('cycleHistory', initialCycle);
          }
          
          if (savedPreferences) {
            setPreferences({
              ...preferences,
              ...savedPreferences,
              badassMode: savedPreferences.badassMode !== undefined ? savedPreferences.badassMode : false
            });
            if (savedPreferences.testMode !== undefined) {
              setTestMode(savedPreferences.testMode);
            }
          }
        } catch (error) {
          console.error('Error loading saved data:', error);
        }
      }
      setIsLoading(false);
      
      // Debug logging
      if (window.electronAPI && window.electronAPI.app) {
        window.electronAPI.app.log('MenuBarApp: Finished loading, isLoading = false');
      }
    };
    
    loadSavedData();
  }, []);

  useEffect(() => {
    if (isLoading) return; // Don't update phase while loading
    
    // Debug logging
    if (window.electronAPI && window.electronAPI.app) {
      window.electronAPI.app.log(`MenuBarApp: Phase update effect triggered, isLoading=${isLoading}`);
    }
    
    // Debounce phase updates to prevent rapid re-renders
    const timer = setTimeout(() => {
      const updatePhaseAndIcon = async () => {
        const phase = calculatePhase(
          testMode ? new Date(new Date().getTime() - testDays * 24 * 60 * 60 * 1000) : cycleData.startDate, 
          cycleData.cycleLength,
          preferences.badassMode === true
        );
        
        // Only update if phase actually changed
        if (previousPhaseRef.current !== phase.phase) {
          previousPhaseRef.current = phase.phase;
          setCurrentPhase(phase);
          
          // Update tray icon via unified API
          if (window.electronAPI && window.electronAPI.tray) {
            if (window.electronAPI.app) {
              window.electronAPI.app.log(`MenuBarApp: Updating phase to "${phase.phase}"`);
            }
            window.electronAPI.tray.updatePhase(phase.phase);
          }
        }
        
        // Always update mood and craving to get new random content
        const mode = preferences.badassMode ? 'king' : 'queen';
        const phaseKey = getPhaseKey(phase.phase);
        const mood = getRandomPhrase(mode, phaseKey, 'moods');
        const craving = getRandomPhrase(mode, phaseKey, 'cravings');
        
        setCurrentMood(mood);
        setCurrentCraving({
          icon: foodIconMap[craving.icon] || Candy,
          text: craving.text
        });
      };
      
      updatePhaseAndIcon();
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer); // Clean up timer
  }, [cycleData.startDate, cycleData.cycleLength, testDays, testMode, isLoading, preferences.badassMode]);

  const handleDateChange = async (newDate) => {
    setCycleData(prev => ({ ...prev, startDate: newDate }));
    
    // Save to store
    if (window.electronAPI && window.electronAPI.store) {
      try {
        await window.electronAPI.store.set('cycleData', {
          startDate: newDate.toISOString(),
          cycleLength: cycleData.cycleLength
        });
      } catch (error) {
        console.error('Error saving cycle data:', error);
      }
    }
  };

  // Handle settings save
  const handleSettingsSave = async (newData) => {
    const { cycleData: newCycleData, preferences: newPreferences } = newData;
    
    // Update cycle data
    setCycleData(newCycleData);
    setPreferences(newPreferences);
    
    // Update test mode state
    if (newPreferences.testMode !== undefined) {
      setTestMode(newPreferences.testMode);
      // Reset test days if test mode is disabled
      if (!newPreferences.testMode) {
        setTestDays(0);
      }
    }
    
    // Save to store
    if (window.electronAPI && window.electronAPI.store) {
      try {
        await window.electronAPI.store.set('cycleData', {
          startDate: newCycleData.startDate.toISOString(),
          cycleLength: newCycleData.cycleLength
        });
        await window.electronAPI.store.set('preferences', newPreferences);
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }
    
    // Go back to mood tab
    setActiveTab('mood');
  };



  const handlePeriodStart = async (date = new Date()) => {
    // Complete the current cycle if exists
    const currentCycle = cycleHistory.find(cycle => 
      new Date(cycle.startDate).getTime() === cycleData.startDate.getTime()
    );
    
    let updatedHistory = [...cycleHistory];
    
    if (currentCycle && !currentCycle.actualLength) {
      // Complete the current cycle
      const completedCycle = completeCycleRecord(currentCycle, date);
      const cycleIndex = updatedHistory.findIndex(c => c.id === currentCycle.id);
      updatedHistory[cycleIndex] = completedCycle;
    }
    
    // Create new cycle record
    const newCycle = createCycleRecord(date, cycleData.cycleLength);
    updatedHistory.unshift(newCycle);
    
    // Update state
    setCycleData(prev => ({ ...prev, startDate: date }));
    setCycleHistory(updatedHistory);
    
    // Save to store
    if (window.electronAPI && window.electronAPI.store) {
      try {
        await window.electronAPI.store.set('cycleData', {
          startDate: date.toISOString(),
          cycleLength: cycleData.cycleLength
        });
        await window.electronAPI.store.set('cycleHistory', newCycle);
      } catch (error) {
        console.error('Error saving cycle data:', error);
      }
    }
  };

  const handleLengthChange = async (newLength) => {
    setCycleData(prev => ({ ...prev, cycleLength: newLength }));
    
    // Save to store
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
    
    // Save to store
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
    
    // Save to store
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


  return (
    <div className="w-96">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">MoodBooMs</h2>
          <div className="flex items-center gap-3">
            {/* Queen/King Mode Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-gray-600">{preferences.badassMode ? 'King' : 'Queen'}</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={preferences.badassMode || false}
                onChange={async (e) => {
                  const newPreferences = {
                    ...preferences,
                    badassMode: e.target.checked
                  };
                  setPreferences(newPreferences);
                  
                  if (window.electronAPI && window.electronAPI.store) {
                    try {
                      await window.electronAPI.store.set('preferences', newPreferences);
                    } catch (error) {
                      console.error('Error saving badass mode:', error);
                    }
                  }
                }}
                className="sr-only"
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${
                preferences.badassMode ? 'bg-purple-500' : 'bg-gray-300'
              }`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                preferences.badassMode ? 'translate-x-4' : ''
              }`}></div>
            </div>
          </label>
          {/* Close Button */}
          <button
            onClick={() => {
              if (window.electronAPI && window.electronAPI.app) {
                window.electronAPI.app.quit();
              }
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Quit MoodBooMs"
          >
            <X className="w-4 h-4" />
          </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('mood')}
            className={`flex-1 py-2 px-3 rounded-md transition-colors text-sm ${
              activeTab === 'mood' 
                ? 'bg-white shadow-sm' 
                : 'hover:bg-gray-200'
            }`}
          >
            {getUIText(preferences.badassMode ? 'king' : 'queen', 'tabs', 'mood')}
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-2 px-3 rounded-md transition-colors text-sm ${
              activeTab === 'calendar' 
                ? 'bg-white shadow-sm' 
                : 'hover:bg-gray-200'
            }`}
          >
            {getUIText(preferences.badassMode ? 'king' : 'queen', 'tabs', 'calendar')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-md transition-colors text-sm ${
              activeTab === 'history' 
                ? 'bg-white shadow-sm' 
                : 'hover:bg-gray-200'
            }`}
          >
            {getUIText(preferences.badassMode ? 'king' : 'queen', 'tabs', 'history')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-3 rounded-md transition-colors text-sm ${
              activeTab === 'settings' 
                ? 'bg-white shadow-sm' 
                : 'hover:bg-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {activeTab === 'mood' ? (
          <div className="space-y-4">
          <StatusCard 
            cycleData={cycleData}
            currentPhase={currentPhase}
            testMode={testMode}
            testDays={testDays}
            isBadassMode={preferences.badassMode !== false}
          />

          <div className="p-3 bg-gray-100 rounded">
            <p className="text-sm font-medium">{preferences.badassMode ? "Her Status:" : "My Mood:"}</p>
            <p className="text-sm italic text-gray-600">{currentMood}</p>
          </div>

          <div className="p-3 bg-gray-100 rounded flex items-center gap-2">
            <p className="text-sm">{preferences.badassMode ? "She Needs:" : "I Need:"}</p>
            <currentCraving.icon className="w-4 h-4" />
            <p className="text-sm italic">{preferences.badassMode ? `Get her ${currentCraving.text}` : `Need ${currentCraving.text} ASAP`}</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={cycleData.startDate.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="flex-1 p-2 border rounded"
            />
          </div>

          {testMode && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Test Mode Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Test Day:</span>
                <input
                  type="range"
                  min="0"
                  max={cycleData.cycleLength}
                  value={testDays}
                  onChange={(e) => setTestDays(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-8 text-right text-sm font-medium">{testDays}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Showing day {testDays} of your cycle (actual: day {calculateCurrentDay(cycleData.startDate, new Date())})
              </p>
            </div>
          )}

        </div>
        ) : activeTab === 'calendar' ? (
          <div className="space-y-4">
            <Calendar 
              cycleStartDate={testMode 
                ? new Date(new Date().getTime() - testDays * 24 * 60 * 60 * 1000) 
                : cycleData.startDate
              }
              cycleLength={cycleData.cycleLength}
              onDateSelect={(date) => setSelectedDate(date)}
              isBadassMode={preferences.badassMode !== false}
            />
            {selectedDate && (
              <div className="border-t pt-4">
                <PhaseDetail
                  selectedDate={selectedDate}
                  cycleStartDate={testMode 
                    ? new Date(new Date().getTime() - testDays * 24 * 60 * 60 * 1000) 
                    : cycleData.startDate
                  }
                  cycleLength={cycleData.cycleLength}
                  isBadassMode={preferences.badassMode !== false}
                />
              </div>
            )}
          </div>
        ) : activeTab === 'history' ? (
          <HistoryView 
            cycleHistory={cycleHistory}
            currentCycleStart={cycleData.startDate}
            onPeriodStart={handlePeriodStart}
            isBadassMode={preferences.badassMode !== false}
          />
        ) : activeTab === 'settings' ? (
          <SettingsPanel
            cycleData={cycleData}
            preferences={preferences}
            onSave={handleSettingsSave}
            onCancel={() => setActiveTab('mood')}
          />
        ) : null}
      </div>
    </div>
  );
};

export default MenuBarApp;