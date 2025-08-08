// Global teardown for E2E tests
const { restoreTestData } = require('./electron-helpers');

module.exports = async config => {
  console.log('🧹 Cleaning up after E2E tests...');
  
  // Restore original user data
  await restoreTestData();
  
  console.log('✅ E2E test cleanup complete');
};