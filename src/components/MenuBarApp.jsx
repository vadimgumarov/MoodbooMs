import React, { useState, useEffect } from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Tornado, Heart, Coffee, Candy, IceCream, Cookie } from 'lucide-react';
import Calendar from './Calendar';
import PhaseDetail from './PhaseDetail';
import HistoryView from './HistoryView';
import { createCycleRecord, completeCycleRecord, addCycleToHistory } from '../utils/cycleHistory';

const moodMessages = {
  'Bloody Hell Week': [
    "Warning: Will cry at pet food commercials",
    "Current status: Wrapped in blanket burrito",
    "Accepting chocolate-based bribes only",
    "Don't talk to me until I've had my 5th painkiller",
    "Today's mood: Everything hurts and I'm dying"
  ],
  'Finally Got My Sh*t Together': [
    "Look who's wearing real pants today!",
    "Productivity level: Actually answered emails",
    "Today's goal: World domination (or laundry)",
    "Finally remembered to buy groceries",
    "Energy level: Could actually make dinner"
  ],
  'Horny AF': [
    "Everyone looking like a snack today",
    "BRB downloading dating apps again",
    "Is it hot in here or is it just everyone?",
    "Warning: May slide into DMs",
    "Looking respectfully 👀"
  ],
  'Getting Real Tired of This BS': [
    "Tolerance for BS: -9000",
    "Don't test me, I will cry",
    "Current status: Questioning all life choices",
    "Energy level: Running on spite",
    "Just need a nap... or 7"
  ],
  'Pre-Chaos Mood Swings': [
    "Simultaneously want hugs and murder",
    "Drama level: Reality TV worthy",
    "Current mood: Unhinged",
    "Warning: May bite",
    "Emotional stability who?"
  ],
  'Apocalypse Countdown': [
    "Accepting offerings by the door only",
    "Current status: One minor inconvenience away from losing it",
    "Do not perceive me",
    "Warning: Might set something on fire",
    "Distance from sanity: Astronomical"
  ]
};

const getRandomMood = (phase) => {
  const moods = moodMessages[phase] || [];
  return moods[Math.floor(Math.random() * moods.length)] || "Loading sass...";
};

const getRandomFood = () => {
  const foods = [
    { icon: Candy, text: "an entire bag of gummy bears" },
    { icon: Cookie, text: "ALL the cookies" },
    { icon: Coffee, text: "a venti coffee with 12 espresso shots" },
    { icon: IceCream, text: "ice cream for breakfast" },
    { icon: Candy, text: "chocolate. Just chocolate. Only chocolate" },
    { icon: Cookie, text: "raw cookie dough straight from the tube" },
    { icon: Coffee, text: "anything with caffeine, literally anything" },
    { icon: IceCream, text: "a gallon of rocky road" },
    { icon: Candy, text: "an entire box of chocolates meant for sharing" },
    { icon: Cookie, text: "grandma's secret recipe cookies" },
    { icon: Coffee, text: "enough coffee to worry a doctor" },
    { icon: IceCream, text: "every flavor in the ice cream shop" }
  ];
  return foods[Math.floor(Math.random() * foods.length)];
};

const calculatePhase = (startDate, cycleLength = 28) => {
  const today = new Date();
  const start = new Date(startDate);
  const daysDiff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const currentDay = daysDiff % cycleLength;

  if (currentDay < 5) return { 
    phase: 'Bloody Hell Week', 
    icon: CloudLightning,
    description: 'F*ck this sh*t. Where\'s the chocolate?'
  };
  if (currentDay < 14) return { 
    phase: 'Finally Got My Sh*t Together', 
    icon: Sun,
    description: 'Look at me being a functional human being!'
  };
  if (currentDay < 17) return { 
    phase: 'Horny AF', 
    icon: CloudSun,
    description: 'Is it hot in here or is it just my hormones?'
  };
  if (currentDay < 21) return { 
    phase: 'Getting Real Tired of This BS', 
    icon: Cloud,
    description: 'Starting to question my life choices...'
  };
  if (currentDay < 25) return { 
    phase: 'Pre-Chaos Mood Swings', 
    icon: CloudRain,
    description: 'Don\'t even look at me wrong today'
  };
  return { 
    phase: 'Apocalypse Countdown', 
    icon: Tornado,
    description: 'If you value your life, bring snacks'
  };
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
  const [activeTab, setActiveTab] = useState('mood'); // 'mood', 'calendar', or 'history'
  const [selectedDate, setSelectedDate] = useState(null);
  const [cycleHistory, setCycleHistory] = useState([]);

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
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
            if (window.electronAPI && window.electronAPI.store) {
              await window.electronAPI.store.set('cycleHistory', initialCycle);
            }
          }
          
          if (savedPreferences?.testMode !== undefined) {
            setTestMode(savedPreferences.testMode);
          }
        } catch (error) {
          console.error('Error loading saved data:', error);
        }
      }
      setIsLoading(false);
    };
    
    loadSavedData();
  }, []);

  useEffect(() => {
    const phase = calculatePhase(
      testMode ? new Date(new Date().getTime() - testDays * 24 * 60 * 60 * 1000) : cycleData.startDate, 
      cycleData.cycleLength
    );
    setCurrentPhase(phase);
    setCurrentMood(getRandomMood(phase.phase));
    setCurrentCraving(getRandomFood());
    
    // Update tray icon via IPC
    if (window.electronAPI && window.electronAPI.tray) {
      window.electronAPI.tray.updatePhase(phase.phase);
    }
  }, [cycleData, testDays, testMode]);

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
            Mood
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-2 px-3 rounded-md transition-colors text-sm ${
              activeTab === 'calendar' 
                ? 'bg-white shadow-sm' 
                : 'hover:bg-gray-200'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-md transition-colors text-sm ${
              activeTab === 'history' 
                ? 'bg-white shadow-sm' 
                : 'hover:bg-gray-200'
            }`}
          >
            History
          </button>
        </div>

        {activeTab === 'mood' ? (
          <div className="space-y-4">
          <div className="p-3 bg-gray-100 rounded">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {currentPhase.icon && <currentPhase.icon className="w-5 h-5" />}
                <span className="font-bold">{currentPhase.phase}</span>
              </div>
              <p className="text-sm text-gray-600 italic">{currentPhase.description}</p>
            </div>
          </div>

          <div className="p-3 bg-gray-100 rounded">
            <p className="text-sm font-medium">Today's Mood:</p>
            <p className="text-sm italic text-gray-600">{currentMood}</p>
          </div>

          <div className="p-3 bg-gray-100 rounded flex items-center gap-2">
            <p className="text-sm">Current Craving:</p>
            <currentCraving.icon className="w-4 h-4" />
            <p className="text-sm italic">Need {currentCraving.text} ASAP</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={cycleData.startDate.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="flex-1 p-2 border rounded"
            />
          </div>

          <div className="flex items-center gap-2">
            <span>Cycle Length:</span>
            <input
              type="number"
              min="21"
              max="35"
              value={cycleData.cycleLength}
              onChange={(e) => handleLengthChange(parseInt(e.target.value))}
              className="w-16 p-2 border rounded"
            />
            <span>days</span>
          </div>

          <div className="mt-4 p-3 bg-gray-100 rounded">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={testMode}
                onChange={(e) => handleTestModeChange(e.target.checked)}
                className="rounded"
              />
              <span>Test Mode</span>
            </div>
            
            {testMode && (
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max={cycleData.cycleLength}
                  value={testDays}
                  onChange={(e) => setTestDays(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-8 text-right">{testDays}d</span>
              </div>
            )}
          </div>
        </div>
        ) : (
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
              <div className="border-t pt-4">
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
        ) : null}
      </div>
    </div>
  );
};

export default MenuBarApp;