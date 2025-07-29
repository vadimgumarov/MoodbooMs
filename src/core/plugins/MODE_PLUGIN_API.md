# Mode Plugin API Documentation

## Overview

The MoodBooMs Mode Plugin System allows developers to create custom modes that change the personality, appearance, and language of the app. Each mode is a self-contained plugin that can be loaded, activated, and switched at runtime.

## Quick Start

1. Copy the mode template from `src/core/plugins/template/mode-template.js`
2. Customize the required properties (id, name, config, theme, phrases)
3. Register your mode with the ModeLoader
4. Test your mode using the validator

## Plugin Structure

### Required Properties

#### `id` (string)
Unique identifier for your mode. Must be lowercase, no spaces.
```javascript
id: 'zen'
```

#### `name` (string)
Display name shown to users.
```javascript
name: 'Zen Mode'
```

#### `description` (string)
Brief description of the mode's personality.
```javascript
description: 'Peaceful, mindful cycle tracking with gentle wisdom'
```

#### `version` (string)
Semantic version number (major.minor.patch).
```javascript
version: '1.0.0'
```

#### `author` (string)
Creator's name or organization.
```javascript
author: 'Your Name'
```

### Configuration Object

#### `config.phaseNames`
Custom names for each cycle phase.
```javascript
config: {
  phaseNames: {
    menstrual: 'Moon Time',
    follicular: 'Spring Awakening',
    ovulation: 'Full Bloom',
    luteal: 'Autumn Harvest',
    lateLuteal: 'Waning Light',
    premenstrual: 'Inner Storm'
  }
}
```

#### `config.uiText`
Customize UI labels and text.
```javascript
uiText: {
  moodLabel: 'Inner State',
  cravingLabel: 'Body Wisdom',
  calendarTitle: 'Lunar Journey',
  calendarDescription: 'Follow your natural rhythm',
  historyTitle: 'Past Cycles',
  settingsTitle: 'Preferences'
}
```

#### `config.features`
Toggle mode features on/off.
```javascript
features: {
  showMoodMessages: true,
  showCravings: true,
  showFertilityInfo: false,
  enableAnimations: true,
  enableSounds: false
}
```

### Theme Object

Defines the visual appearance of your mode.

```javascript
theme: {
  name: 'My Mode Theme',
  mode: 'mymode',
  
  colors: {
    // Primary colors
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    tertiary: '#EC4899',
    
    // Base colors
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    
    // Phase-specific colors
    phases: {
      menstrual: '#DC2626',
      follicular: '#F59E0B',
      ovulation: '#10B981',
      luteal: '#8B5CF6',
      lateLuteal: '#6366F1',
      premenstrual: '#EC4899'
    }
  },
  
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    sizes: { /* font sizes */ },
    weights: { /* font weights */ }
  },
  
  spacing: { /* spacing scale */ },
  borderRadius: { /* radius values */ },
  shadows: { /* shadow definitions */ },
  transitions: { /* transition timings */ },
  animations: { /* animation names */ }
}
```

### Phrases Object

Contains all text content for your mode.

```javascript
phrases: {
  phrases: {
    menstrual: {
      moods: [
        "Mood message 1",
        "Mood message 2",
        // ... at least 10 messages
      ],
      cravings: [
        "Craving message 1",
        "Craving message 2",
        // ... at least 10 messages
      ]
    },
    // ... repeat for all 6 phases
  },
  minPhrasesPerPhase: 10
}
```

### Optional Properties

#### `darkTheme`
Dark mode variant of your theme.
```javascript
darkTheme: {
  ...theme,
  colors: {
    ...theme.colors,
    background: '#121212',
    text: '#FFFFFF'
  }
}
```

#### `components`
Custom React components for your mode.
```javascript
components: {
  Wrapper: MyModeWrapper,
  PhaseDisplay: MyPhaseDisplay,
  CalendarView: MyCalendarView,
  SettingsPanel: MySettingsPanel
}
```

#### `onActivate` / `onDeactivate`
Lifecycle hooks called when mode is activated/deactivated.
```javascript
onActivate: async () => {
  console.log('Mode activated');
  // Initialize mode-specific features
},

onDeactivate: async () => {
  console.log('Mode deactivated');
  // Cleanup
}
```

#### `settings`
Custom settings for your mode.
```javascript
settings: {
  intensity: {
    type: 'slider',
    label: 'Intensity Level',
    min: 1,
    max: 10,
    default: 5,
    description: 'Adjust the intensity'
  }
}
```

#### `utils`
Utility functions specific to your mode.
```javascript
utils: {
  calculateMoodScore: (phase) => {
    // Custom logic
    return score;
  }
}
```

#### `requirements`
Specify mode requirements.
```javascript
requirements: {
  minAppVersion: '1.0.0',
  dependencies: ['core-mode-id']
}
```

## Mode Registration

### Registering a Mode

```javascript
import modeRegistry from '@moodbooms/mode-registry';
import { MyModePlugin } from './my-mode/plugin';

// Register the mode
const result = await modeRegistry.register(MyModePlugin);

if (result.success) {
  console.log('Mode registered:', result.modeId);
} else {
  console.error('Registration failed:', result.error);
}
```

### Activating a Mode

```javascript
// Activate a registered mode
const activation = await modeRegistry.activate('mymode');

if (activation.success) {
  console.log('Mode activated:', activation.mode.name);
}
```

## Mode Validation

Use the built-in validator to check your mode:

```javascript
import { validateMode } from '@moodbooms/mode-validator';

const validation = await validateMode(MyModePlugin);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

## Best Practices

1. **Unique Identity**: Choose a unique ID that won't conflict with other modes
2. **Complete Phrases**: Provide at least 10 phrases per phase (60 total minimum)
3. **Accessible Colors**: Ensure good contrast ratios in your theme
4. **Test Both Themes**: If providing dark mode, test both light and dark variants
5. **Meaningful Names**: Use phase names that match your mode's personality
6. **Error Handling**: Handle errors gracefully in lifecycle hooks
7. **Performance**: Keep components lightweight and optimize renders

## Example Modes

### Queen Mode
- Bold, empowering language
- Vibrant pink/purple colors
- Unapologetic personality

### King Mode  
- Strategic, informative approach
- Professional blue/gray colors
- Partner-focused perspective

### Zen Mode
- Peaceful, mindful language
- Calming teal/mint colors
- Meditation-inspired wisdom

## Distribution

### NPM Package
```json
{
  "name": "@moodbooms/mode-zen",
  "version": "1.0.0",
  "main": "plugin.js",
  "moodbooms": {
    "type": "mode",
    "modeId": "zen"
  }
}
```

### Direct Installation
Place your mode folder in:
- macOS/Linux: `~/Library/Application Support/MoodBooMs/modes/`
- Windows: `%APPDATA%/MoodBooMs/modes/`

## Troubleshooting

### Common Issues

1. **Mode not loading**: Check console for validation errors
2. **Missing phrases**: Ensure at least 10 phrases per phase
3. **Theme not applying**: Verify color values are valid CSS
4. **Components not rendering**: Check component exports and imports

### Debug Mode

Enable debug logging:
```javascript
window.MOODBOOMS_DEBUG = true;
```

## API Reference

### ModeRegistry Methods

- `register(mode)` - Register a new mode
- `unregister(modeId)` - Remove a mode
- `activate(modeId)` - Activate a mode
- `deactivate(modeId)` - Deactivate current mode
- `getMode(modeId)` - Get mode by ID
- `getAllModes()` - List all registered modes
- `isActive(modeId)` - Check if mode is active

### Events

Listen for mode changes:
```javascript
modeRegistry.addListener((event) => {
  switch(event.type) {
    case 'mode-registered':
    case 'mode-activated':
    case 'mode-deactivated':
      // Handle event
  }
});
```

## Support

For questions and support:
- GitHub Issues: https://github.com/moodbooms/mode-plugins
- Documentation: https://docs.moodbooms.com/modes
- Examples: https://github.com/moodbooms/mode-examples