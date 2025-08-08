import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Calendar, 
  Bell, 
  Save, 
  X,
  Monitor,
  AlertCircle,
  Contrast
} from 'lucide-react';
import { CYCLE, DEFAULT_PREFERENCES } from '../constants';
import HighContrastToggle from './HighContrastToggle';
import { SuccessMessage, ErrorMessage, LoadingSpinner, Tooltip } from './feedback';
import UpdateManager from './UpdateManager';

const SettingsPanel = ({ 
  cycleData, 
  preferences = {}, 
  onSave, 
  onCancel
}) => {
  // Local state for form values
  const [cycleLength, setCycleLength] = useState(cycleData?.cycleLength || CYCLE.DEFAULT_LENGTH);
  const [notifications, setNotifications] = useState(preferences?.notifications ?? DEFAULT_PREFERENCES.notifications);
  const [testMode, setTestMode] = useState(preferences?.testMode || false);
  const [highContrast, setHighContrast] = useState(preferences?.highContrast || false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success' | 'error', message: string }
  
  // Track if any values have changed
  useEffect(() => {
    const changed = 
      cycleLength !== (cycleData?.cycleLength || 28) ||
      notifications !== (preferences?.notifications ?? true) ||
      testMode !== (preferences?.testMode || false) ||
      highContrast !== (preferences?.highContrast || false);
    setHasChanges(changed);
  }, [cycleLength, notifications, testMode, cycleData, preferences]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    
    try {
      await onSave({
        cycleData: {
          ...cycleData,
          cycleLength: cycleLength
        },
        preferences: {
          ...preferences,
          notifications,
          testMode,
          highContrast
        }
      });
      
      setSaveStatus({
        type: 'success',
        message: 'Settings saved successfully!'
      });
      
      // Clear success message after delay
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: 'Failed to save settings. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCycleLength(cycleData?.cycleLength || 28);
    setNotifications(preferences?.notifications ?? true);
    setTestMode(preferences?.testMode || false);
    setHighContrast(preferences?.highContrast || false);
  };


  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <h2 className="text-heading font-semibold">Settings</h2>
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6">
        {/* Cycle Settings Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4" />
            <h3 className="font-medium">Cycle Settings</h3>
          </div>
          
          <div className="pl-6 space-y-3">
            <div>
              <label className="block text-small text-gray-600 mb-2">
                <Tooltip content="Average menstrual cycle length varies from 21-35 days">
                  <span>Cycle Length: {cycleLength} days</span>
                </Tooltip>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-small text-gray-500">{CYCLE.MIN_LENGTH}</span>
                <input
                  type="range"
                  min={CYCLE.MIN_LENGTH}
                  max={CYCLE.MAX_LENGTH}
                  value={cycleLength}
                  onChange={(e) => setCycleLength(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-small text-gray-500">{CYCLE.MAX_LENGTH}</span>
              </div>
              <p className="text-tiny text-gray-500 mt-1">
                Average cycle length is {CYCLE.DEFAULT_LENGTH} days
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
              <span className="text-small">Enable notifications</span>
            </label>
            <p className="text-tiny text-gray-500 mt-1 ml-6">
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
          
          <div className="pl-6 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="rounded"
              />
              <span className="text-small">Enable test mode</span>
            </label>
            <p className="text-tiny text-gray-500 ml-6">
              Test different cycle days without changing your actual start date
            </p>
          </div>
        </div>

        {/* Accessibility Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Contrast className="w-4 h-4" />
            <h3 className="font-medium">Accessibility</h3>
          </div>
          
          <div className="pl-6">
            <HighContrastToggle 
              enabled={highContrast}
              onChange={setHighContrast}
            />
            <p className="text-tiny text-gray-500 mt-1 ml-6">
              Improves visibility with higher contrast colors
            </p>
          </div>
        </div>

      </div>

      {/* Update Manager */}
      <UpdateManager />

      {/* Footer */}
      <div className="border-t p-4">
        {saveStatus && (
          <div className="mb-3">
            {saveStatus.type === 'success' ? (
              <SuccessMessage 
                message={saveStatus.message}
                onDismiss={() => setSaveStatus(null)}
                autoHide={true}
              />
            ) : (
              <ErrorMessage
                error={saveStatus.message}
                onDismiss={() => setSaveStatus(null)}
                onRetry={handleSave}
              />
            )}
          </div>
        )}
        {hasChanges && (
          <div className="flex items-center gap-2 text-amber-600 text-small mb-3">
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
            disabled={!hasChanges || saving}
            className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <LoadingSpinner size="small" inline />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;