/**
 * Module System Demo Component
 * 
 * Temporary component to demonstrate module system functionality
 * This will be removed once modules are integrated into the main app
 */

import React from 'react';
import { useModules } from '../core/contexts';
import { MODULE_IDS } from '../core/modules/types';

const ModuleDemo = () => {
  const {
    initialized,
    loading,
    getAllModules,
    isModuleEnabled,
    toggleModule,
    canEnableModule,
    getDependentModules
  } = useModules();

  if (loading) {
    return <div className="p-4">Loading modules...</div>;
  }

  if (!initialized) {
    return <div className="p-4">Module system not initialized</div>;
  }

  const handleToggle = async (moduleId) => {
    try {
      await toggleModule(moduleId);
    } catch (error) {
      alert(error.message);
    }
  };

  const modules = getAllModules();

  return (
    <div className="p-4 space-y-4">
      <div className="bg-blue-100 p-3 rounded">
        <h3 className="font-bold text-blue-900">Module System Demo</h3>
        <p className="text-sm text-blue-700">
          This demonstrates the module system. Toggle modules below:
        </p>
      </div>

      <div className="space-y-2">
        {modules.map(module => {
          const enabled = isModuleEnabled(module.id);
          const { canEnable, missingDependencies } = canEnableModule(module.id);
          const dependents = getDependentModules(module.id);
          const enabledDependents = dependents.filter(d => isModuleEnabled(d.id));

          return (
            <div
              key={module.id}
              className={`p-3 border rounded ${
                enabled ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{module.name}</h4>
                  <p className="text-sm text-gray-600">{module.description}</p>
                  
                  {module.dependencies && module.dependencies.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Requires: {module.dependencies.join(', ')}
                    </p>
                  )}
                  
                  {!enabled && !canEnable && (
                    <p className="text-xs text-red-600 mt-1">
                      Missing dependencies: {missingDependencies.join(', ')}
                    </p>
                  )}
                  
                  {enabled && enabledDependents.length > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Required by: {enabledDependents.map(d => d.name).join(', ')}
                    </p>
                  )}
                  
                  {module.tabName && (
                    <p className="text-xs text-blue-600 mt-1">
                      Adds tab: "{module.tabName}"
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => handleToggle(module.id)}
                  disabled={!enabled && !canEnable}
                  className={`ml-3 px-3 py-1 rounded text-sm font-medium transition-colors ${
                    enabled
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : canEnable
                      ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is a demo component. The actual module 
          toggles will be in the Settings panel.
        </p>
      </div>
    </div>
  );
};

export default ModuleDemo;