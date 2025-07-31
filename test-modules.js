// Test script to demonstrate module system functionality
const { app } = require('electron');
const Store = require('electron-store');

// Wait for app to be ready
app.whenReady().then(() => {
  const store = new Store();
  
  console.log('\n=== MODULE SYSTEM TEST ===\n');
  
  // Get current module state
  const currentModules = store.get('modules') || {};
  console.log('Current module state:', JSON.stringify(currentModules, null, 2));
  
  // Test 1: Disable Calendar module
  console.log('\nTest 1: Disabling Calendar module...');
  const modulesWithDisabledCalendar = {
    ...currentModules,
    calendar: { ...currentModules.calendar, enabled: false }
  };
  store.set('modules', modulesWithDisabledCalendar);
  console.log('✓ Calendar module disabled');
  
  // Test 2: Disable History module
  console.log('\nTest 2: Disabling History module...');
  const modulesWithDisabledHistory = {
    ...modulesWithDisabledCalendar,
    history: { ...modulesWithDisabledCalendar.history, enabled: false }
  };
  store.set('modules', modulesWithDisabledHistory);
  console.log('✓ History module disabled');
  
  // Test 3: Re-enable all modules
  console.log('\nTest 3: Re-enabling all modules...');
  const allModulesEnabled = {
    mood: { enabled: true },
    calendar: { enabled: true },
    history: { enabled: true },
    phaseDetail: { enabled: true }
  };
  store.set('modules', allModulesEnabled);
  console.log('✓ All modules re-enabled');
  
  console.log('\n=== TEST COMPLETE ===');
  console.log('Please restart the app to see the changes');
  
  app.quit();
});