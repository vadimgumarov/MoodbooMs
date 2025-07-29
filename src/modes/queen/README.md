# Queen Mode Module

## Overview
Queen Mode is the BadAss personality module for MoodbooM, featuring a first-person female perspective with sarcastic black humor and zero filter. This module provides all Queen-specific functionality including phrases, themes, and personality configurations.

## Structure

```
/modes/queen/
├── components/           # React components
│   ├── QueenModeWrapper.jsx    # Main wrapper with theme application
│   └── QueenPhaseDisplay.jsx   # Phase-specific display component
├── config/              # Configuration files
│   ├── phrases.js       # BadAss phrases and cravings
│   ├── theme.js         # Visual theme and styling
│   └── personality.js   # Personality traits and behaviors
├── assets/              # Queen-specific assets (if needed)
├── index.js            # Module entry point
└── README.md           # This file
```

## Usage

### Basic Import
```javascript
import QueenMode from './modes/queen';

// Initialize Queen mode
const result = QueenMode.initialize();
// Output: { status: 'active', message: 'Queen mode is ready to reign', ... }
```

### Using Components
```javascript
import { QueenModeWrapper, QueenPhaseDisplay } from './modes/queen';

// Wrap your app content
<QueenModeWrapper>
  <QueenPhaseDisplay 
    currentPhase="menstrual"
    cycleDay={2}
    fertilityPercentage={5}
    onMoodChange={(mood) => console.log('New mood:', mood)}
  />
</QueenModeWrapper>
```

### Using Configuration
```javascript
import { 
  queenPhrases, 
  queenTheme, 
  queenPersonality,
  getRandomQueenPhrase 
} from './modes/queen';

// Get a random mood for current phase
const mood = getRandomQueenPhrase('luteal', 'moods');

// Get phase color
const color = queenTheme.colors.phases.menstrual; // '#B71C1C'
```

## Features

### Phase Names
- **Menstrual**: "Bloody Hell Week"
- **Follicular**: "Finally Got My Sh*t Together"
- **Ovulation**: "Horny AF"
- **Luteal**: "Getting Real Tired of This BS"
- **Late Luteal**: "Pre-Chaos Mood Swings"
- **Premenstrual**: "Apocalypse Countdown"

### Personality Traits
- **Perspective**: First-person female
- **Attitude**: Sarcastic
- **Humor**: Dark/Black
- **Filter Level**: 0 (No filter)
- **Profanity**: High
- **Sarcasm**: Maximum

### Special Features
- Mood level indicators (patience, sarcasm, murder likelihood)
- Phase-specific warnings
- Easter egg responses
- Dynamic theme with bold colors
- Attitude-based animations

## Theme

Queen mode uses a bold, dramatic theme:
- **Primary**: #FF1744 (Bold red)
- **Secondary**: #D500F9 (Electric purple)
- **Accent**: #FF6E40 (Fiery orange)
- **Background**: #1A1A1A (Dark)

## API Reference

### QueenMode Object
```javascript
{
  id: 'queen',
  name: 'Queen',
  config: { phrases, theme, personality },
  components: { Wrapper, PhaseDisplay },
  helpers: { ... },
  features: [...],
  initialize: () => {},
  cleanup: () => {}
}
```

### Helper Functions
- `getRandomQueenPhrase(phase, type)` - Get random phrase
- `getPhaseColor(phase)` - Get phase-specific color
- `getFertilityColor(percentage)` - Get fertility indicator color
- `getQueenMoodLevel(phase)` - Get mood levels for phase
- `getQueenResponse(trigger, phase)` - Get special responses

## Testing

Run tests with:
```bash
npm test -- tests/unit/modes/queen/queenMode.test.js
```

## Notes
- All content is extracted from the original modeContent.js
- Module is self-contained and can be loaded independently
- Designed to work with the core mode switching system
- Maintains phrase tracking to avoid repetition