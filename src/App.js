import React from 'react';
import MenuBarApp from './components/MenuBarApp';
import TestKingMode from './components/TestKingMode';
import { ModeProvider } from './core/contexts/SimpleModeContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  // Toggle this to test the new King mode module
  const testKingMode = false;
  
  return (
    <ErrorBoundary>
      <ModeProvider>
        <div className="App">
          {testKingMode ? <TestKingMode /> : <MenuBarApp />}
        </div>
      </ModeProvider>
    </ErrorBoundary>
  );
}

export default App;