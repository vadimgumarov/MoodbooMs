import React from 'react';
import MenuBarApp from './components/MenuBarApp';
import TestKingMode from './components/TestKingMode';
import TestPhraseSystem from './components/TestPhraseSystem';
import { AppProviders } from './core/contexts';
import ErrorBoundary from './components/ErrorBoundary';
import { useDarkMode } from './hooks/useDarkMode';

function App() {
  // Toggle this to test the new King mode module
  const testKingMode = false;
  // Toggle this to test the phrase configuration system
  const testPhraseSystem = false;
  
  // Dark mode management
  const [isDark] = useDarkMode();
  
  return (
    <ErrorBoundary>
      <AppProviders themeVariant={isDark ? 'dark' : 'light'}>
        <div className="App">
          {testPhraseSystem ? <TestPhraseSystem /> : testKingMode ? <TestKingMode /> : <MenuBarApp />}
        </div>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;