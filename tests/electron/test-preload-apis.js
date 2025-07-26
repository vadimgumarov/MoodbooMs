// Test script to verify all preload APIs are working
// Run this in the browser console when the app is running

async function testPreloadAPIs() {
  console.log('🧪 Testing Electron Preload APIs...\n');
  
  // Check if electronAPI exists
  if (!window.electronAPI) {
    console.error('❌ window.electronAPI not found!');
    return;
  }
  
  console.log('✅ window.electronAPI exists');
  
  // Test each API category
  const apis = [
    'tray', 'window', 'store', 'system', 
    'notifications', 'app', 'dialog', 'updates', 'dev'
  ];
  
  for (const api of apis) {
    if (window.electronAPI[api]) {
      console.log(`✅ electronAPI.${api} exists`);
    } else {
      console.error(`❌ electronAPI.${api} not found!`);
    }
  }
  
  console.log('\n📋 Testing specific functions:');
  
  // Test system APIs
  try {
    const platform = await window.electronAPI.system.getPlatform();
    console.log(`✅ Platform: ${platform}`);
    
    const locale = await window.electronAPI.system.getLocale();
    console.log(`✅ Locale: ${locale}`);
    
    const theme = await window.electronAPI.system.getTheme();
    console.log(`✅ Theme: ${theme}`);
  } catch (error) {
    console.error('❌ System API error:', error);
  }
  
  // Test app APIs
  try {
    const version = await window.electronAPI.app.getVersion();
    console.log(`✅ App version: ${version}`);
  } catch (error) {
    console.error('❌ App API error:', error);
  }
  
  // Test window APIs
  try {
    const isVisible = await window.electronAPI.window.isVisible();
    console.log(`✅ Window visible: ${isVisible}`);
    
    const position = await window.electronAPI.window.getPosition();
    console.log(`✅ Window position: [${position[0]}, ${position[1]}]`);
  } catch (error) {
    console.error('❌ Window API error:', error);
  }
  
  // Test store APIs (will return placeholder values for now)
  try {
    const hasKey = await window.electronAPI.store.has('test');
    console.log(`✅ Store has 'test' key: ${hasKey}`);
  } catch (error) {
    console.error('❌ Store API error:', error);
  }
  
  console.log('\n✨ Preload API test complete!');
}

// Instructions
console.log('To test the preload APIs, run: testPreloadAPIs()');

// Auto-run if in development
if (window.location.hostname === 'localhost') {
  testPreloadAPIs();
}