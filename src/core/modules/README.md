# Module System

The module system allows users to enable/disable features in MoodbooM to customize their experience.

## Architecture

### Core Components

1. **Module Registry** (`registry.js`)
   - Central registry of all available modules
   - Manages module state and dependencies
   - Handles persistence

2. **Module Context** (`ModuleContext.js`)
   - React Context for module state
   - Provides hooks for components
   - Manages state updates and persistence

3. **Module Types** (`types.js`)
   - TypeScript-like type definitions
   - Module interfaces and constants

## Usage

### In Components

```javascript
import { useModules } from '../../core/contexts';
import { MODULE_IDS } from '../../core/modules/types';

function MyComponent() {
  const { isModuleEnabled, toggleModule } = useModules();
  
  // Check if a module is enabled
  if (!isModuleEnabled(MODULE_IDS.CALENDAR)) {
    return null; // Don't render if calendar is disabled
  }
  
  // Toggle a module
  const handleToggle = async () => {
    try {
      await toggleModule(MODULE_IDS.HISTORY);
    } catch (error) {
      // Handle dependency errors
      console.error(error.message);
    }
  };
  
  return <div>Component content</div>;
}
```

### Dynamic Tabs

```javascript
function TabNavigation() {
  const { getEnabledTabModules } = useModules();
  
  const tabs = getEnabledTabModules();
  
  return (
    <div>
      {tabs.map(tab => (
        <button key={tab.id}>{tab.tabName}</button>
      ))}
    </div>
  );
}
```

## Available Modules

### Core Modules (enabled by default)
- **mood**: Mood tracking with phase info and cravings
- **calendar**: Monthly calendar with fertility colors
- **history**: Cycle history and statistics

### Display Modules
- **phaseDetail**: Detailed phase info (depends on calendar)

## Module Dependencies

Some modules depend on others:
- `phaseDetail` requires `calendar` to be enabled

The system prevents:
- Enabling a module without its dependencies
- Disabling a module that others depend on

## Module Configuration

Each module can have its own configuration:

```javascript
const { getModuleConfig, updateModuleConfig } = useModules();

// Get config
const calendarConfig = getModuleConfig(MODULE_IDS.CALENDAR);
// { showFertilityColors: true, showPhaseLabels: true }

// Update config
updateModuleConfig(MODULE_IDS.CALENDAR, {
  showFertilityColors: false
});
```

## Adding New Modules

1. Add module ID to `types.js`
2. Define module in `registry.js`
3. Implement module component
4. Register in appropriate location

Example:
```javascript
// In registry.js
export const moduleDefinitions = {
  // ... existing modules
  myNewModule: {
    id: 'myNewModule',
    name: 'My New Feature',
    description: 'Description of the feature',
    category: MODULE_CATEGORIES.ADVANCED,
    defaultEnabled: false,
    tabName: 'New Tab', // Optional
    dependencies: [], // Optional
    config: {
      // Module-specific config
    }
  }
};
```

## Persistence

Module state is automatically saved to electron-store:
- Which modules are enabled/disabled
- Module-specific configurations
- Last toggle timestamps

The state is restored on app startup.