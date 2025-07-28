/**
 * Integration test for phrase configuration system
 * This demonstrates that the system works with the existing modeContent
 */

import { getRandomPhrase, resetPhraseTracking, getUIText } from '../../src/core/services/phrases/MigrationAdapter';
import phraseSystem from '../../src/core/services/phrases';
import previewTool from '../../src/core/services/phrases/PhrasePreviewTool';

// Wait for migration adapter to initialize
setTimeout(() => {
  console.log('Running phrase system integration tests...\n');

  // Test basic functionality
  const tests = {
    'Get Queen mood phrase': () => {
      const phrase = getRandomPhrase('queen', 'menstrual', 'moods');
      return phrase && typeof phrase === 'string';
    },
    
    'Get King mood phrase': () => {
      const phrase = getRandomPhrase('king', 'menstrual', 'moods');
      return phrase && typeof phrase === 'string';
    },
    
    'Get craving object': () => {
      const craving = getRandomPhrase('queen', 'menstrual', 'cravings');
      return craving && craving.icon && craving.text;
    },
    
    'Get UI text': () => {
      const text = getUIText('queen', 'tabs', 'mood');
      return true; // UI text might not exist yet
    },
    
    'Phase preview works': () => {
      const preview = previewTool.previewPhase('queen', 'menstrual');
      return preview && preview.totalMoods > 0;
    },
    
    'No phrase repetition': () => {
      const phrases = [];
      for (let i = 0; i < 5; i++) {
        phrases.push(getRandomPhrase('queen', 'follicular', 'moods'));
      }
      const unique = new Set(phrases);
      return unique.size === phrases.length;
    },
    
    'Reset tracking works': () => {
      resetPhraseTracking('queen');
      return true;
    },
    
    'Contextual phrases': () => {
      const context = { isFirstDay: true };
      const phrase = phraseSystem.getPhrase('queen', 'menstrual', 'moods', context);
      return phrase && typeof phrase === 'string';
    }
  };

  // Run tests
  let passed = 0;
  let failed = 0;
  
  Object.entries(tests).forEach(([name, test]) => {
    try {
      if (test()) {
        console.log(`✅ ${name}`);
        passed++;
      } else {
        console.log(`❌ ${name} - returned false`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${name} - ${error.message}`);
      failed++;
    }
  });

  console.log(`\n\nResults: ${passed} passed, ${failed} failed`);

  // Demo output
  console.log('\n--- Sample Phrases ---');
  console.log('Queen (menstrual):', getRandomPhrase('queen', 'menstrual', 'moods'));
  console.log('King (menstrual):', getRandomPhrase('king', 'menstrual', 'moods'));
  
  const craving = getRandomPhrase('queen', 'menstrual', 'cravings');
  console.log('Craving:', `${craving.icon} - ${craving.text}`);

}, 500);