// Test data fixtures for E2E tests

const testData = {
  // Default cycle data for testing
  defaultCycle: {
    startDate: new Date('2024-01-01').toISOString(),
    cycleLength: 28
  },

  // Various cycle configurations
  cycles: {
    regular: {
      startDate: new Date('2024-01-01').toISOString(),
      cycleLength: 28
    },
    short: {
      startDate: new Date('2024-01-01').toISOString(),
      cycleLength: 21
    },
    long: {
      startDate: new Date('2024-01-01').toISOString(),
      cycleLength: 35
    },
    irregular: {
      startDate: new Date('2024-01-01').toISOString(),
      cycleLength: 30
    }
  },

  // Cycle history for testing predictions
  cycleHistory: [
    {
      id: '1',
      startDate: new Date('2023-10-01').toISOString(),
      cycleLength: 28,
      actualLength: 28
    },
    {
      id: '2',
      startDate: new Date('2023-10-29').toISOString(),
      cycleLength: 28,
      actualLength: 27
    },
    {
      id: '3',
      startDate: new Date('2023-11-25').toISOString(),
      cycleLength: 28,
      actualLength: 29
    },
    {
      id: '4',
      startDate: new Date('2023-12-24').toISOString(),
      cycleLength: 28,
      actualLength: 28
    }
  ],

  // User preferences
  preferences: {
    queen: {
      mode: 'queen',
      testMode: false,
      notifications: true,
      theme: 'auto'
    },
    king: {
      mode: 'king',
      testMode: false,
      notifications: false,
      theme: 'dark'
    },
    testMode: {
      mode: 'queen',
      testMode: true,
      testDay: 14,
      notifications: false,
      theme: 'light'
    }
  },

  // Test selectors for common elements
  selectors: {
    // Tab navigation
    tabs: {
      status: '[role="tab"][aria-label*="Status"]',
      calendar: '[role="tab"][aria-label*="Calendar"]',
      history: '[role="tab"][aria-label*="History"]',
      settings: '[role="tab"][aria-label*="Settings"]'
    },
    
    // Status tab elements
    status: {
      card: '[data-testid="status-card"]',
      phase: '[data-testid="phase-name"]',
      day: '[data-testid="cycle-day"]',
      mood: '[data-testid="mood-message"]',
      craving: '[data-testid="craving"]',
      safetyScale: '[data-testid="safety-scale"]'
    },
    
    // Calendar elements
    calendar: {
      grid: '[role="grid"]',
      monthYear: '[data-testid="month-year"]',
      prevMonth: 'button[aria-label="Previous month"]',
      nextMonth: 'button[aria-label="Next month"]',
      todayButton: 'button[aria-label="Go to today"]',
      dateCell: '[role="gridcell"]',
      selectedDate: '[aria-selected="true"]'
    },
    
    // Settings elements
    settings: {
      modeToggle: '[role="switch"][aria-label*="Mode"]',
      cycleLength: 'input[name="cycleLength"]',
      startDate: 'input[type="date"][name="startDate"]',
      testModeToggle: '[role="switch"][aria-label*="Test Mode"]',
      testDaySlider: 'input[type="range"][name="testDay"]',
      saveButton: 'button:has-text("Save")',
      exportButton: 'button:has-text("Export")',
      importButton: 'button:has-text("Import")'
    },
    
    // Common elements
    common: {
      loading: '[data-testid="loading"]',
      error: '[role="alert"]',
      success: '[data-testid="success-message"]',
      modal: '[role="dialog"]',
      closeButton: 'button[aria-label="Close"]'
    }
  },

  // Expected phase names by mode
  phaseNames: {
    queen: {
      menstrual: 'Bloody Hell Week',
      follicular: 'Finally Got My Sh*t Together',
      ovulation: 'Horny AF',
      luteal: 'Getting Real Tired of This BS',
      lateLuteal: 'Pre-Chaos Mood Swings',
      preMenstrual: 'Apocalypse Countdown'
    },
    king: {
      menstrual: 'Code Red Alert',
      follicular: 'Safe Zone Active',
      ovulation: 'High Energy Warning',
      luteal: 'Patience Level: Low',
      lateLuteal: 'Volatility Alert',
      preMenstrual: 'DEFCON 1'
    }
  },

  // Performance benchmarks
  performance: {
    appLaunch: 3000, // 3 seconds
    windowOpen: 1000, // 1 second
    tabSwitch: 500, // 500ms
    calendarRender: 1000, // 1 second
    settingsSave: 2000, // 2 seconds
    dataExport: 3000, // 3 seconds
    dataImport: 3000 // 3 seconds
  }
};

module.exports = testData;