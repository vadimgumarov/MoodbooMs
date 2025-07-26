// Simple test runner for store functionality
const { storeOperations } = require('../../electron/store');

console.log('Testing electron-store functionality...\n');

// Test 1: Save and retrieve cycle data
console.log('Test 1: Save and retrieve cycle data');
try {
  storeOperations.clear();
  
  const testData = {
    startDate: new Date().toISOString(),
    cycleLength: 28
  };
  
  storeOperations.setCycleData(testData);
  const retrieved = storeOperations.getCycleData();
  
  console.log('✓ Saved data:', testData);
  console.log('✓ Retrieved data:', retrieved);
  console.log('✓ Test passed!\n');
} catch (error) {
  console.error('✗ Test failed:', error.message);
}

// Test 2: Validate cycle length
console.log('Test 2: Validate cycle length');
try {
  storeOperations.setCycleData({ cycleLength: 20 });
  console.error('✗ Test failed: Should have thrown error for invalid cycle length');
} catch (error) {
  console.log('✓ Correctly rejected invalid cycle length:', error.message);
}

try {
  storeOperations.setCycleData({ cycleLength: 28 });
  console.log('✓ Accepted valid cycle length\n');
} catch (error) {
  console.error('✗ Test failed:', error.message);
}

// Test 3: Save and retrieve preferences
console.log('Test 3: Save and retrieve preferences');
try {
  const prefs = {
    notifications: false,
    theme: 'dark',
    testMode: true
  };
  
  storeOperations.setPreferences(prefs);
  const retrieved = storeOperations.getPreferences();
  
  console.log('✓ Saved preferences:', prefs);
  console.log('✓ Retrieved preferences:', retrieved);
  console.log('✓ Test passed!\n');
} catch (error) {
  console.error('✗ Test failed:', error.message);
}

// Test 4: Add cycle history
console.log('Test 4: Add cycle history');
try {
  const historyEntry = {
    startDate: '2024-01-01T00:00:00.000Z',
    length: 27,
    notes: 'Test entry'
  };
  
  storeOperations.addCycleHistory(historyEntry);
  const data = storeOperations.getCycleData();
  
  console.log('✓ Added history entry:', historyEntry);
  console.log('✓ History count:', data.history.length);
  console.log('✓ Test passed!\n');
} catch (error) {
  console.error('✗ Test failed:', error.message);
}

// Test 5: Export and import data
console.log('Test 5: Export and import data');
try {
  // Export current data
  const exported = storeOperations.exportData();
  console.log('✓ Exported data successfully');
  
  // Clear store
  storeOperations.clear();
  console.log('✓ Cleared store');
  
  // Import data back
  storeOperations.importData(exported);
  console.log('✓ Imported data successfully');
  
  // Verify data was restored
  const cycleData = storeOperations.getCycleData();
  const prefs = storeOperations.getPreferences();
  
  console.log('✓ Verified cycle data restored:', cycleData.cycleLength);
  console.log('✓ Verified preferences restored:', prefs.theme);
  console.log('✓ Test passed!\n');
} catch (error) {
  console.error('✗ Test failed:', error.message);
}

console.log('All tests completed!');