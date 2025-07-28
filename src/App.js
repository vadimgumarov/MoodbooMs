import React from 'react';
import MenuBarApp from './components/MenuBarApp';
import TestQueenMinimal from './components/TestQueenMinimal';
import { ModeProvider } from './core/contexts/SimpleModeContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  // Toggle this to test Queen mode
  const testQueenMode = false;
  
  return (
    <ErrorBoundary>
      <ModeProvider>
        <div className="App">
          {testQueenMode ? <TestQueenMinimal /> : <MenuBarApp />}
        </div>
      </ModeProvider>
    </ErrorBoundary>
  );
}

export default App;