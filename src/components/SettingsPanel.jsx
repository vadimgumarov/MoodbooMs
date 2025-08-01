import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Calendar, 
  Bell, 
  Save, 
  X,
  Monitor,
  AlertCircle,
  Contrast,
  Power,
  Package,
  ToggleLeft,
  ToggleRight,
  Info,
  RefreshCw
} from 'lucide-react';
import { CYCLE, DEFAULT_PREFERENCES } from '../constants';
import HighContrastToggle from './HighContrastToggle';
import { SuccessMessage, ErrorMessage, LoadingSpinner, Tooltip } from './feedback';
import { useModules } from '../core/contexts';

const SettingsPanel = ({ 
  cycleData, 
  preferences = {}, 
  onSave, 
  onCancel
}) => {
  // Hook for module context
  const { 
    initialized: modulesInitialized,
    getAllModules, 
    isModuleEnabled, 
    toggleModule,
    canEnableModule,
    getDependentModules
  } = useModules();
  
  // Local state for form values
  const [cycleLength, setCycleLength] = useState(cycleData?.cycleLength || CYCLE.DEFAULT_LENGTH);
  const [notifications, setNotifications] = useState(preferences?.notifications ?? DEFAULT_PREFERENCES.notifications);
  const [testMode, setTestMode] = useState(preferences?.testMode || false);
  const [highContrast, setHighContrast] = useState(preferences?.highContrast || false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  
  // Module-specific state
  const [moduleStates, setModuleStates] = useState({});
  const [moduleChanges, setModuleChanges] = useState(false);
  const [moduleError, setModuleError] = useState(null);
  
  // Initialize module states when modules are loaded
  useEffect(() => {
    if (modulesInitialized) {
      const modules = getAllModules();
      const initialStates = {};
      modules.forEach(module => {
        initialStates[module.id] = isModuleEnabled(module.id);
      });
      setModuleStates(initialStates);
    }
  }, [modulesInitialized, getAllModules, isModuleEnabled]);

  // Track if any values have changed
  useEffect(() => {
    const settingsChanged = 
      cycleLength !== (cycleData?.cycleLength || 28) ||
      notifications !== (preferences?.notifications ?? true) ||
      testMode !== (preferences?.testMode || false) ||
      highContrast !== (preferences?.highContrast || false);
    
    // Check for module changes
    const moduleChangesDetected = modulesInitialized && Object.keys(moduleStates).some(moduleId => {
      return moduleStates[moduleId] !== isModuleEnabled(moduleId);
    });
    
    setModuleChanges(moduleChangesDetected);
    setHasChanges(settingsChanged || moduleChangesDetected);
  }, [cycleLength, notifications, testMode, highContrast, cycleData, preferences, moduleStates, modulesInitialized, isModuleEnabled]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    setModuleError(null);
    
    try {
      // Save module changes first if any
      if (moduleChanges) {
        for (const [moduleId, enabled] of Object.entries(moduleStates)) {
          const currentlyEnabled = isModuleEnabled(moduleId);
          if (enabled !== currentlyEnabled) {
            try {
              await toggleModule(moduleId);
            } catch (moduleError) {
              setModuleError(`Failed to ${enabled ? 'enable' : 'disable'} ${getAllModules().find(m => m.id === moduleId)?.name}: ${moduleError.message}`);
              return; // Don't save other settings if module save fails
            }
          }
        }
      }
      
      // Save other settings
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
    
    // Reset module states to current actual states
    if (modulesInitialized) {
      const modules = getAllModules();
      const currentStates = {};
      modules.forEach(module => {
        currentStates[module.id] = isModuleEnabled(module.id);
      });
      setModuleStates(currentStates);
    }
    
    setModuleError(null);
  };

  // Handle module toggle
  const handleModuleToggle = (moduleId) => {
    setModuleError(null);
    setModuleStates(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Reset modules to defaults
  const handleResetModulesToDefaults = () => {
    if (modulesInitialized) {
      const modules = getAllModules();
      const defaultStates = {};
      modules.forEach(module => {
        defaultStates[module.id] = module.defaultEnabled;
      });
      setModuleStates(defaultStates);
      setModuleError(null);
    }
  };

  const handleQuit = async () => {
    try {
      // If there are unsaved changes, prompt to save first
      if (hasChanges) {
        const shouldSave = await window.electronAPI.dialog.showMessageBox({
          type: 'warning',
          buttons: ['Save & Quit', 'Quit Without Saving', 'Cancel'],
          defaultId: 0,
          cancelId: 2,
          title: 'Unsaved Changes',
          message: 'You have unsaved changes. What would you like to do?'
        });

        if (shouldSave.response === 2) {
          // Cancel - don't quit
          return;
        } else if (shouldSave.response === 0) {
          // Save first
          await handleSave();
        }
        // If response === 1, quit without saving
      }

      // Quit the application
      window.electronAPI.app.quit();
    } catch (error) {
      console.error('Error during quit:', error);
      setSaveStatus({
        type: 'error',
        message: 'Failed to quit application. Please try again.'
      });
    }
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

        {/* Modules Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Package className="w-4 h-4" />
            <h3 className="font-medium">Modules</h3>
          </div>
          
          <div className="pl-6 space-y-4">
            {modulesInitialized && getAllModules().map(module => {
              const enabled = moduleStates[module.id] ?? false;
              const { canEnable, missingDependencies } = canEnableModule(module.id);
              const dependentModules = getDependentModules(module.id);
              const hasEnabledDependents = dependentModules.some(dep => moduleStates[dep.id]);
              
              return (
                <div key={module.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Tooltip 
                        content={enabled ? "Click to disable this module" : 
                                (!canEnable && !enabled) ? 
                                `Cannot enable: requires ${missingDependencies.join(', ')}` :
                                "Click to enable this module"}
                      >
                        <button
                          onClick={() => handleModuleToggle(module.id)}
                          disabled={(!canEnable && !enabled) || (enabled && hasEnabledDependents)}
                          className={`flex items-center gap-2 p-1 rounded transition-colors ${
                            enabled 
                              ? 'text-blue-600 hover:text-blue-700' 
                              : 'text-gray-400 hover:text-gray-600'
                          } ${(!canEnable && !enabled) || (enabled && hasEnabledDependents) ? 
                            'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                      </Tooltip>
                      
                      <div>
                        <h4 className="font-medium text-small">{module.name}</h4>
                        <p className="text-tiny text-gray-600">{module.description}</p>
                      </div>
                    </div>
                    
                    {(module.dependencies?.length > 0 || dependentModules.length > 0) && (
                      <Tooltip content={
                        `${module.dependencies?.length > 0 ? 
                          `Requires: ${module.dependencies.map(id => 
                            getAllModules().find(m => m.id === id)?.name).join(', ')}` : ''}${
                          module.dependencies?.length > 0 && dependentModules.length > 0 ? '; ' : ''}${
                          dependentModules.length > 0 ? 
                          `Required by: ${dependentModules.map(m => m.name).join(', ')}` : ''}`
                      }>
                        <Info className="w-4 h-4 text-gray-400" />
                      </Tooltip>
                    )}
                  </div>
                  
                  {/* Show dependency warnings */}
                  {!canEnable && !enabled && missingDependencies.length > 0 && (
                    <div className="flex items-center gap-2 text-amber-600 text-tiny">
                      <AlertCircle className="w-3 h-3" />
                      <span>Requires: {missingDependencies.map(id => 
                        getAllModules().find(m => m.id === id)?.name).join(', ')}</span>
                    </div>
                  )}
                  
                  {enabled && hasEnabledDependents && (
                    <div className="flex items-center gap-2 text-amber-600 text-tiny">
                      <AlertCircle className="w-3 h-3" />
                      <span>Required by: {dependentModules.filter(dep => moduleStates[dep.id]).map(m => m.name).join(', ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleResetModulesToDefaults}
                className="flex items-center gap-2 px-3 py-1 text-tiny border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Reset to Defaults
              </button>
            </div>
            
            {moduleError && (
              <div className="text-tiny text-red-600 mt-2">
                {moduleError}
              </div>
            )}
          </div>
        </div>

        {/* Application Control Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Power className="w-4 h-4" />
            <h3 className="font-medium">Application</h3>
          </div>
          
          <div className="pl-6">
            <button
              onClick={handleQuit}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              <Power className="w-4 h-4" />
              Quit MoodbooM
            </button>
            <p className="text-tiny text-gray-500 mt-2">
              Close the application completely. Use Cmd+Q as a keyboard shortcut.
            </p>
          </div>
        </div>

      </div>

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