# Phrase Configuration System

A flexible, mode-agnostic phrase management system for MoodbooM that supports contextual phrase selection, history tracking, and easy extensibility.

## Overview

The Phrase Configuration System provides:
- **Contextual Phrases**: Different phrases based on time of day, day of week, or special events
- **Smart Randomization**: Avoids repetition by tracking phrase history
- **Mode Independence**: Each mode (Queen/King) has its own configuration
- **Hot Reloading**: Update phrases without restarting (development mode)
- **Migration Support**: Seamless integration with existing phrase system

## Architecture

```
src/core/services/phrases/
├── index.js              # Main API and initialization
├── PhraseManager.js      # Core phrase selection logic
├── PhraseConfigLoader.js # Configuration loading and validation
├── PhrasePreviewTool.js  # Development tool for testing
├── MigrationAdapter.js   # Compatibility with old system
├── types.js             # Type definitions
└── README.md            # This file
```

## Usage

### Basic Usage

```javascript
import phraseSystem from './core/services/phrases';

// Initialize with mode configurations
await phraseSystem.initialize({
  queen: queenConfig,
  king: kingConfig
});

// Get a phrase
const mood = phraseSystem.getPhrase('queen', 'menstrual', 'moods');
const craving = phraseSystem.getPhrase('queen', 'menstrual', 'cravings');

// Get UI text
const tabText = phraseSystem.getUIText('queen', 'tabs', 'mood');
```

### Migration from Old System

The migration adapter provides drop-in compatibility:

```javascript
// Old code - no changes needed!
import { getRandomPhrase, getUIText } from './core/services/phrases/MigrationAdapter';

const mood = getRandomPhrase('queen', 'menstrual', 'moods');
const text = getUIText('queen', 'tabs', 'mood');
```

## Configuration Format

### Phase Configuration

```javascript
{
  phases: {
    menstrual: {
      name: 'Bloody Hell Week',
      description: 'F*ck this sh*t',
      calendarTooltip: 'The Red Wedding',
      
      // Moods with contextual variations
      moods: {
        default: ['Default mood 1', 'Default mood 2'],
        morning: ['Morning mood 1'],
        afternoon: ['Afternoon mood 1'],
        evening: ['Evening mood 1'],
        night: ['Night mood 1'],
        weekend: ['Weekend mood 1'],
        moods: {
          tired: ['Tired mood 1'],
          energetic: ['Energetic mood 1']
        }
      },
      
      // Food cravings
      cravings: [
        { icon: 'Cookie', text: 'entire chocolate factory' },
        { icon: 'Pizza', text: 'all the pizza' }
      ],
      
      // Special contextual phrases
      contextual: {
        firstDay: ['First day of hell'],
        lastDay: ['Finally almost over']
      }
    },
    // ... other phases
  },
  
  // Special event phrases
  special: {
    firstDay: ['New cycle, who dis?'],
    ovulation: ['Peak fertility alert'],
    custom: ['Custom event phrase']
  },
  
  // UI text configuration
  ui: {
    tabs: {
      mood: 'Mood',
      calendar: 'Calendar'
    },
    buttons: {
      save: 'Save',
      cancel: 'Cancel'
    }
  }
}
```

### Time Periods

- **Morning**: 5am - 12pm
- **Afternoon**: 12pm - 5pm
- **Evening**: 5pm - 10pm
- **Night**: 10pm - 5am

## Advanced Features

### Contextual Selection

The system automatically selects phrases based on context:

```javascript
const context = {
  currentTime: new Date(),
  cycleDay: 1,
  phase: 'menstrual',
  isWeekend: true,
  isFirstDay: true,
  mood: 'tired'
};

const phrase = phraseSystem.getPhrase('queen', 'menstrual', 'moods', context);
```

### History Management

Phrases are tracked to avoid repetition:

```javascript
// Clear history for fresh randomization
phraseSystem.clearHistory('queen');

// Export/import for persistence
const history = phraseSystem.exportHistory();
phraseSystem.importHistory(history);
```

### Development Tools

Use the preview tool to test configurations:

```javascript
import previewTool from './core/services/phrases/PhrasePreviewTool';

// Preview all phrases for a phase
const preview = previewTool.previewPhase('queen', 'menstrual');

// Test phrase distribution
const distribution = previewTool.testDistribution('queen', 'menstrual', 'moods', 100);

// Validate configuration coverage
const validation = previewTool.validateCoverage('queen');

// Debug phrase selection
const debug = previewTool.debugPhraseSelection('queen', 'menstrual', {
  isFirstDay: true
});
```

## Creating New Modes

1. Create a configuration file:

```javascript
// src/modes/custom/config/phrases.js
export default {
  phases: {
    menstrual: {
      name: 'Custom Phase Name',
      moods: {
        default: ['Custom mood 1', 'Custom mood 2']
      },
      cravings: [
        { icon: 'Cookie', text: 'custom craving' }
      ]
    },
    // ... other phases
  }
};
```

2. Register the mode:

```javascript
import customConfig from './modes/custom/config/phrases';

await phraseSystem.initialize({
  custom: customConfig
});
```

## Best Practices

1. **Phrase Variety**: Include at least 10-15 moods per phase for good variety
2. **Contextual Phrases**: Add time-specific phrases for better user experience
3. **Consistent Format**: Keep cravings format consistent with icon and text
4. **Test Coverage**: Use preview tool to ensure all contexts have phrases
5. **Migration Path**: Use MigrationAdapter for gradual transition

## Testing

Run the test suite:

```bash
npm test -- tests/unit/phrases/
```

Individual test files:
- `PhraseManager.test.js` - Core functionality tests
- `PhraseConfigLoader.test.js` - Configuration loading tests

## Future Enhancements

- [ ] Database storage for phrases
- [ ] User-contributed phrases
- [ ] Machine learning for personalized selection
- [ ] Multi-language support
- [ ] Phrase analytics and usage tracking