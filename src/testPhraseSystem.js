/**
 * Simple test script to verify phrase system functionality
 * Run this in the browser console to test
 */

// Import the migration adapter which auto-initializes
import { getRandomPhrase, resetPhraseTracking, getUIText } from './core/services/phrases/MigrationAdapter';
import previewTool from './core/services/phrases/PhrasePreviewTool';

console.log('=== Phrase System Test ===');

// Test 1: Get random phrases
console.log('\n1. Testing phrase retrieval:');
try {
  const mood1 = getRandomPhrase('queen', 'menstrual', 'moods');
  console.log('✅ Queen mood:', mood1);
  
  const craving1 = getRandomPhrase('queen', 'menstrual', 'cravings');
  console.log('✅ Queen craving:', craving1);
  
  const mood2 = getRandomPhrase('king', 'menstrual', 'moods');
  console.log('✅ King mood:', mood2);
} catch (error) {
  console.error('❌ Error:', error);
}

// Test 2: UI text
console.log('\n2. Testing UI text:');
try {
  const tabText = getUIText('queen', 'tabs', 'mood');
  console.log('✅ UI text:', tabText || '(not found)');
} catch (error) {
  console.error('❌ Error:', error);
}

// Test 3: Phase preview
console.log('\n3. Testing phase preview:');
try {
  const preview = previewTool.previewPhase('queen', 'menstrual');
  console.log('✅ Phase preview:', preview);
} catch (error) {
  console.error('❌ Error:', error);
}

// Test 4: Distribution test
console.log('\n4. Testing phrase distribution (20 calls):');
try {
  const dist = previewTool.testDistribution('queen', 'menstrual', 'moods', 20);
  console.log('✅ Unique phrases:', dist.totalUnique);
  console.log('Top 3 phrases:');
  dist.distribution.slice(0, 3).forEach(item => {
    console.log(`  - "${item.phrase.substring(0, 50)}..." (${item.count}x)`);
  });
} catch (error) {
  console.error('❌ Error:', error);
}

// Test 5: Coverage validation
console.log('\n5. Testing coverage validation:');
try {
  const coverage = previewTool.validateCoverage('queen');
  console.log('✅ Coverage valid:', coverage.valid);
  if (!coverage.valid) {
    console.log('Issues:', coverage.issues);
  }
} catch (error) {
  console.error('❌ Error:', error);
}

console.log('\n=== Test Complete ===');

// Export for console access
window.phraseTest = {
  getRandomPhrase,
  resetPhraseTracking,
  getUIText,
  previewTool
};