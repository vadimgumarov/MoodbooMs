import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Calendar, 
  Bell, 
  Save, 
  X,
  Monitor,
  AlertCircle
} from 'lucide-react';

const SettingsPanel = ({ 
  cycleData, 
  preferences = {}, 
  onSave, 
  onCancel
}) => {
  // Local state for form values
  const [cycleLength, setCycleLength] = useState(cycleData?.cycleLength || 28);
  const [notifications, setNotifications] = useState(preferences?.notifications ?? true);
  const [testMode, setTestMode] = useState(preferences?.testMode || false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Track if any values have changed
  useEffect(() => {
    const changed = 
      cycleLength !== (cycleData?.cycleLength || 28) ||
      notifications !== (preferences?.notifications ?? true) ||
      testMode !== (preferences?.testMode || false);
    setHasChanges(changed);
  }, [cycleLength, notifications, testMode, cycleData, preferences]);

  const handleSave = () => {
    onSave({
      cycleData: {
        ...cycleData,
        cycleLength: cycleLength
      },
      preferences: {
        ...preferences,
        notifications,
        testMode
      }
    });
  };

  const handleReset = () => {
    setCycleLength(cycleData?.cycleLength || 28);
    setNotifications(preferences?.notifications ?? true);
    setTestMode(preferences?.testMode || false);
  };


  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Settings</h2>
        </div>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Cycle Settings Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4" />
            <h3 className="font-medium">Cycle Settings</h3>
          </div>
          
          <div className="pl-6 space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Cycle Length: {cycleLength} days
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">21</span>
                <input
                  type="range"
                  min="21"
                  max="35"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">35</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Average cycle length is 28 days
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Bell className="w-4 h-4" />
            <h3 className="font-medium">Notifications</h3>
          </div>
          
          <div className="pl-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Enable notifications</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Get reminders for period start and ovulation
            </p>
          </div>
        </div>

        {/* Test Mode Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Monitor className="w-4 h-4" />
            <h3 className="font-medium">Test Mode</h3>
          </div>
          
          <div className="pl-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Enable test mode</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Test different cycle days without changing your actual start date
            </p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t p-4">
        {hasChanges && (
          <div className="flex items-center gap-2 text-amber-600 text-sm mb-3">
            <AlertCircle className="w-4 h-4" />
            <span>You have unsaved changes</span>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;