cat > src/components/MenuBarApp.jsx << 'EOL'
import React, { useState, useEffect } from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Tornado, Heart, Coffee, Candy, IceCream, Cookie } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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

  useEffect(() => {
    const phase = calculatePhase(
      testMode ? new Date(new Date().getTime() - testDays * 24 * 60 * 60 * 1000) : cycleData.startDate, 
      cycleData.cycleLength
    );
    setCurrentPhase(phase);
    setCurrentMood(getRandomMood(phase.phase));
    setCurrentCraving(getRandomFood());
  }, [cycleData, testDays, testMode]);

  const handleDateChange = (newDate) => {
    setCycleData(prev => ({ ...prev, startDate: newDate }));
  };

  const handleLengthChange = (newLength) => {
    setCycleData(prev => ({ ...prev, cycleLength: newLength }));
  };

  const toggleNotifications = () => {
    setCycleData(prev => ({ ...prev, notifications: !prev.notifications }));
  };

  return (
    <Card className="w-80">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">CycleAware</h2>
        </div>

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
                onChange={(e) => setTestMode(e.target.checked)}
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
      </CardContent>
    </Card>
  );
};

export default MenuBarApp;
EOL