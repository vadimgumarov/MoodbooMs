import React from 'react';
import MenuBarApp from './components/MenuBarApp';
import { ModeProvider } from './core/contexts/SimpleModeContext';

function App() {
  return (
    <ModeProvider>
      <div className="App">
        <MenuBarApp />
      </div>
    </ModeProvider>
  );
}

export default App;