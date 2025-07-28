import React from 'react';
import MenuBarApp from './components/MenuBarApp';
import TestKingMode from './components/TestKingMode';
import TestPhraseSystem from './components/TestPhraseSystem';
import { ModeProvider } from './core/contexts/SimpleModeContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  // Toggle this to test the new King mode module
  const testKingMode = false;
  // Toggle this to test the phrase configuration system
  const testPhraseSystem = true;
  
  return (
    <ErrorBoundary>
      <ModeProvider>
        <div className="App">
          {testPhraseSystem ? <TestPhraseSystem /> : testKingMode ? <TestKingMode /> : <MenuBarApp />}
        </div>
      </ModeProvider>
    </ErrorBoundary>
  );
}

export default App;