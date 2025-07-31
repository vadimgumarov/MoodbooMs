import React, { useState, useEffect, useRef } from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Tornado, Heart, Coffee, Candy, IceCream, Cookie, Settings, AlertCircle, Soup, Apple, Fish, Salad, Milk, Cherry, Wheat, Carrot, Egg, Nut, Banana, X } from 'lucide-react';
import SettingsPanel from './SettingsPanel';
import KingModeIntegration from './KingModeIntegration';
import { createCycleRecord, completeCycleRecord, addCycleToHistory, calculateCurrentDay, getCurrentPhase } from '../core/utils';
import { modeContent, getRandomPhrase, resetPhraseTracking, getUIText } from '../content/modeContent';
import { useMode, MODES } from '../core/contexts/SimpleModeContext';
import { useModules } from '../core/contexts';
import { calculateFertilityPercentage } from '../utils/phaseDetection';
import { CYCLE, DEBOUNCE, TABS, DEFAULT_PREFERENCES } from '../constants';
import { announceToScreenReader, getPhaseAriaLabel } from '../utils/accessibility';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { LoadingSpinner, StatusCardSkeleton, Tooltip, ErrorMessage, SuccessMessage } from './feedback';
import { MoodModule, CalendarModule, HistoryModule } from '../modules';

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
  // Use mode context
  const { currentMode, isKingMode, toggleMode, isSwitching } = useMode();
  // Use module context
  const { getEnabledTabModules, isModuleEnabled } = useModules();
  
  const [cycleData, setCycleData] = useState({
    startDate: new Date(),
    cycleLength: CYCLE.DEFAULT_LENGTH,
    notifications: DEFAULT_PREFERENCES.notifications
  });
  const [currentPhase, setCurrentPhase] = useState({ phase: '', icon: null, description: '' });
  const [currentMood, setCurrentMood] = useState("");
  const [currentCraving, setCurrentCraving] = useState({ icon: Candy, text: "candy" });
  const [testMode, setTestMode] = useState(false);
  const [testDays, setTestDays] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS.MOOD);
  const [cycleHistory, setCycleHistory] = useState([]);
  const [preferences, setPreferences] = useState({
    notifications: true,
    theme: 'auto',
    badassMode: false // Keep for backward compatibility
  });
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);
  
  // Use ref to track previous phase to prevent unnecessary updates
  const previousPhaseRef = useRef('');
  
  // Get dynamic tabs based on enabled modules
  const availableTabs = React.useMemo(() => {
    const tabs = [];
    if (isModuleEnabled('mood')) tabs.push(TABS.MOOD);
    if (isModuleEnabled('calendar')) tabs.push(TABS.CALENDAR);
    if (isModuleEnabled('history')) tabs.push(TABS.HISTORY);
    // Settings is always available
    tabs.push(TABS.SETTINGS);
    return tabs;
  }, [isModuleEnabled]); // Only recalculate when module state changes

  // Enable keyboard navigation for dynamic tabs
  useKeyboardNavigation(
    availableTabs,
    activeTab,
    setActiveTab
  );
  
  // Ensure active tab is still available when modules change
  React.useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      // Default to first available tab or settings
      setActiveTab(availableTabs[0] || TABS.SETTINGS);
    }
  }, [availableTabs.length, activeTab]); // Use length instead of join to avoid creating new strings

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
          currentMode === MODES.KING
        );
        
        // Only update if phase actually changed
        if (previousPhaseRef.current !== phase.phase) {
          previousPhaseRef.current = phase.phase;
          setCurrentPhase(phase);
          
          // Announce phase change to screen readers
          const currentDay = calculateCurrentDay(
            testMode ? new Date(new Date().getTime() - testDays * 24 * 60 * 60 * 1000) : cycleData.startDate,
            new Date()
          );
          announceToScreenReader(getPhaseAriaLabel(phase.phase, currentDay));
          
          // Update tray icon via unified API
          if (window.electronAPI && window.electronAPI.tray) {
            if (window.electronAPI.app) {
              window.electronAPI.app.log(`MenuBarApp: Updating phase to "${phase.phase}"`);
            }
            window.electronAPI.tray.updatePhase(phase.phase);
          }
        }
        
        // Always update mood and craving to get new random content
        const mode = currentMode; // Use mode from context
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
    }, DEBOUNCE.PHASE_UPDATE);
    
    return () => clearTimeout(timer); // Clean up timer
  }, [cycleData.startDate, cycleData.cycleLength, testDays, testMode, isLoading, currentMode]); // Use currentMode instead of isKingMode

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
    setActiveTab(TABS.MOOD);
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
      <div className="responsive-container bg-background">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LoadingSpinner size="small" inline />
              <h2 className="text-heading text-text-primary">MoodbooM</h2>
            </div>
          </div>
          <StatusCardSkeleton />
        </div>
      </div>
    );
  }

  // Calculate fertility percentage for King mode
  const currentDay = calculateCurrentDay(
    testMode ? new Date(new Date().getTime() - testDays * 24 * 60 * 60 * 1000) : cycleData.startDate, 
    new Date()
  );
  const fertility = calculateFertilityPercentage(currentDay, cycleData.cycleLength);

  // If in King mode, use the King mode integration
  if (isKingMode) {
    // Don't render until we have a valid phase
    if (!currentPhase.phase) {
      return (
        <div className="responsive-container p-4 text-center" style={{ backgroundColor: 'var(--king-bg)', color: 'var(--king-text)' }}>
          <p>Loading...</p>
        </div>
      );
    }
    
    return (
      <KingModeIntegration
        currentPhase={currentPhase}
        currentMood={currentMood}
        currentCraving={currentCraving}
        fertility={fertility}
        activeTab={activeTab}
        onTabChange={(tab, value) => {
          if (tab === 'testDays') {
            // Handle test days change
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
          <div className="space-y-4">
            <Calendar 
              cycleStartDate={testMode 
                ? new Date(new Date().getTime() - testDays * 24 * 60 * 60 * 1000) 
                : cycleData.startDate
              }
              cycleLength={cycleData.cycleLength}
              onDateSelect={(date) => setSelectedDate(date)}
            />
            {selectedDate && (
              <div className="border-t pt-4" style={{ borderColor: 'var(--king-border)' }}>
                <PhaseDetail
                  selectedDate={selectedDate}
                  cycleStartDate={testMode 
                    ? new Date(new Date().getTime() - testDays * 24 * 60 * 60 * 1000) 
                    : cycleData.startDate
                  }
                  cycleLength={cycleData.cycleLength}
                    />
              </div>
            )}
          </div>
        ) : activeTab === 'history' ? (
          <HistoryView 
            cycleHistory={cycleHistory}
            currentCycleStart={cycleData.startDate}
            onPeriodStart={handlePeriodStart}
          />
        ) : activeTab === 'settings' ? (
          <SettingsPanel
            cycleData={cycleData}
            preferences={preferences}
            onSave={handleSettingsSave}
            onCancel={() => setActiveTab('mood')}
          />
        ) : null}
      </KingModeIntegration>
    );
  }

  // Regular Queen mode UI
  return (
    <div className="responsive-container bg-background">
      {/* Skip to content link for screen readers */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading text-text-primary">MoodbooM</h2>
          <div className="flex items-center gap-3">
            {/* Queen/King Mode Toggle */}
            <Tooltip content={isKingMode ? "Switch to Queen mode (your perspective)" : "Switch to King mode (partner's perspective)"}>
              <label 
                className={`flex items-center gap-2 ${isSwitching ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
                aria-label={`Mode toggle. Currently in ${isKingMode ? 'King' : 'Queen'} mode`}
              >
                <span className="text-tiny text-text-secondary" aria-hidden="true">{isKingMode ? 'King' : 'Queen'}</span>
            <div className="relative" role="switch" aria-checked={isKingMode}>
              <input
                type="checkbox"
                checked={isKingMode}
                onChange={(e) => {
                  e.stopPropagation();
                  if (!isSwitching) {
                    toggleMode();
                    announceToScreenReader(`Switched to ${!isKingMode ? 'King' : 'Queen'} mode`);
                  }
                }}
                disabled={isSwitching}
                className="sr-only"
                aria-label="Toggle between Queen and King mode"
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${
                isKingMode ? 'bg-primary' : 'bg-border'
              }`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                isKingMode ? 'translate-x-4' : ''
              }`}></div>
            </div>
              </label>
            </Tooltip>
          {/* Close Button */}
          <Tooltip content="Close MoodbooM" position="left">
            <button
              onClick={() => {
                if (window.electronAPI && window.electronAPI.app) {
                  window.electronAPI.app.quit();
                }
              }}
              className="touch-target p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
              aria-label="Close application"
            >
              <X className="w-4 h-4" />
            </button>
          </Tooltip>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-4 bg-surface rounded-lg p-1" role="tablist" aria-label="Navigation tabs" aria-orientation="horizontal">
          {availableTabs.map((tab) => {
            const isSettings = tab === TABS.SETTINGS;
            const isActive = activeTab === tab;
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab}-panel`}
                id={`${tab}-tab`}
                tabIndex={isActive ? 0 : -1}
                className={`touch-target ${isSettings ? '' : 'flex-1'} py-2 px-3 rounded-md transition-colors text-small ${
                  isActive 
                    ? 'bg-background shadow-sm' 
                    : 'hover:bg-background'
                }`}
                aria-label={isSettings ? 'Settings' : undefined}
              >
                {isSettings ? (
                  <Settings className="w-4 h-4" />
                ) : (
                  getUIText(currentMode, 'tabs', tab)
                )}
              </button>
            );
          })}
        </div>

        <main id="main-content">
        {activeTab === 'mood' ? (
          <MoodModule 
            cycleData={cycleData}
            currentPhase={currentPhase}
            testMode={testMode}
            testDays={testDays}
            currentMood={currentMood}
            currentCraving={currentCraving}
            isKingMode={isKingMode}
            onDateChange={handleDateChange}
            onTestDaysChange={setTestDays}
          />
        ) : activeTab === 'calendar' ? (
          <CalendarModule
            cycleData={cycleData}
            testMode={testMode}
            testDays={testDays}
          />
        ) : activeTab === 'history' ? (
          <HistoryModule
            cycleHistory={cycleHistory}
            currentCycleStart={cycleData.startDate}
            onPeriodStart={handlePeriodStart}
          />
        ) : activeTab === 'settings' ? (
          <div role="tabpanel" id="settings-panel" aria-labelledby="settings-tab" tabIndex={0}>
            <SettingsPanel
              cycleData={cycleData}
              preferences={preferences}
              onSave={handleSettingsSave}
              onCancel={() => setActiveTab('mood')}
            />
          </div>
        ) : null}
        </main>
      </div>
    </div>
  );
};

export default MenuBarApp;