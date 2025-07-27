# Cycle Calculations Documentation

## Overview

The `cycleCalculations.js` module provides comprehensive menstrual cycle tracking calculations based on medical standards. It handles phase detection, fertility windows, and predictions for cycles ranging from 21 to 35 days.

## Core Concepts

### Cycle Phases

1. **Menstrual Phase** (Days 1-5)
   - The period itself
   - Fertility: Very Low

2. **Follicular Phase** (Days 6 to ovulation-1)
   - Egg development phase
   - Fertility: Low to Medium, increasing as ovulation approaches

3. **Ovulation Phase** (3 days: ovulation day + 2 days)
   - Egg release and peak fertility
   - Calculated as: cycle length - 14 days
   - Fertility: Very High

4. **Luteal Phase** (After ovulation until end)
   - Post-ovulation phase, typically 14 days
   - Fertility: Medium to Low

### Fertility Levels

- **Very Low**: During menstruation (days 1-5)
- **Low**: Early follicular (days 6-7) and late luteal (last 3 days)
- **Medium**: Mid-follicular and early luteal phases
- **High**: 3 days before ovulation
- **Very High**: Ovulation window (ovulation day + 2 days)

## API Reference

### calculateCurrentDay(startDate, currentDate, cycleLength)
Calculates which day of the cycle it currently is.

```javascript
const currentDay = calculateCurrentDay(
  new Date('2025-07-01'), // Last period start
  new Date('2025-07-15'), // Today
  28                      // Cycle length
); // Returns: 15
```

### getCurrentPhase(currentDay, cycleLength)
Determines the current phase based on cycle day.

```javascript
const phase = getCurrentPhase(14, 28); // Returns: 'ovulation'
const phase = getCurrentPhase(3, 28);  // Returns: 'menstrual'
```

### getFertilityLevel(currentDay, cycleLength)
Calculates fertility risk level for pregnancy planning.

```javascript
const fertility = getFertilityLevel(14, 28); // Returns: 'very-high'
const fertility = getFertilityLevel(3, 28);  // Returns: 'very-low'
```

### predictNextPeriod(lastPeriodStart, cycleLength)
Predicts the start date of the next period.

```javascript
const nextPeriod = predictNextPeriod(
  new Date('2025-07-01'),
  28
); // Returns: Date object for 2025-07-29
```

### getOvulationWindow(cycleLength)
Returns detailed ovulation window information.

```javascript
const window = getOvulationWindow(28);
// Returns: { start: 11, peak: 14, end: 16 }
```

### calculateAverageCycleLength(history)
Calculates average cycle length from historical data.

```javascript
const avg = calculateAverageCycleLength([
  { cycleLength: 28 },
  { cycleLength: 29 },
  { cycleLength: 27 }
]); // Returns: 28
```

### getCycleProgress(currentDay, cycleLength)
Returns cycle completion percentage.

```javascript
const progress = getCycleProgress(14, 28); // Returns: 50
```

### getDaysUntilNextPeriod(currentDay, cycleLength)
Calculates days remaining until next period.

```javascript
const daysLeft = getDaysUntilNextPeriod(20, 28); // Returns: 9
```

## Medical Accuracy

This module follows standard medical calculations:
- Ovulation occurs approximately 14 days before the next period
- The luteal phase is relatively constant at 14 days
- Cycle length variations primarily affect the follicular phase
- Fertility window includes ovulation day and 2 days after
- High fertility begins 3 days before ovulation

## Usage Example

```javascript
const {
  calculateCurrentDay,
  getCurrentPhase,
  getFertilityLevel,
  predictNextPeriod
} = require('./cycleCalculations');

// User's cycle data
const lastPeriodStart = new Date('2025-07-01');
const cycleLength = 28;
const today = new Date();

// Calculate current status
const currentDay = calculateCurrentDay(lastPeriodStart, today, cycleLength);
const phase = getCurrentPhase(currentDay, cycleLength);
const fertility = getFertilityLevel(currentDay, cycleLength);
const nextPeriod = predictNextPeriod(lastPeriodStart, cycleLength);

console.log(`Day ${currentDay} of your cycle`);
console.log(`Current phase: ${phase}`);
console.log(`Fertility level: ${fertility}`);
console.log(`Next period: ${nextPeriod.toDateString()}`);
```

## Testing

The module includes comprehensive unit tests covering:
- All calculation functions
- Edge cases (21-day and 35-day cycles)
- Date boundary handling (month/year transitions)
- Invalid input handling

Run tests with: `npm test src/utils/__tests__/cycleCalculations.test.js`