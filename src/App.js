import React from 'react';
import MenuBarApp from './components/MenuBarApp';
import TestKingMode from './components/TestKingMode';
import TestPhraseSystem from './components/TestPhraseSystem';
import StyleGuide from './components/StyleGuide/StyleGuide';
import UpdateNotification from './components/UpdateNotification';
// import { ModeProvider } from './core/contexts/SimpleModeContext';
import { AppProviders } from './core/contexts';
import ErrorBoundary from './components/ErrorBoundary';
import { useDarkMode } from './hooks/useDarkMode';
import './utils/crashLogger'; // Initialize crash logger with heartbeat

function App() {
  // Toggle this to test the new King mode module
  const testKingMode = false;
  // Toggle this to test the phrase configuration system
  const testPhraseSystem = false;
  // Toggle this to view the style guide (development only)
  const showStyleGuide = process.env.NODE_ENV === 'development' && 
    window.location.search.includes('styleguide');
  
  // Dark mode management
  const [isDark] = useDarkMode();
  
  // High contrast mode state
  const [highContrast, setHighContrast] = React.useState(false);
  
  // Load high contrast preference
  React.useEffect(() => {
    const loadHighContrast = async () => {
      if (window.electronAPI && window.electronAPI.store) {
        const preferences = await window.electronAPI.store.get('preferences');
        if (preferences?.highContrast) {
          setHighContrast(preferences.highContrast);
        }
      }
    };
    loadHighContrast();
  }, []);
  
  // Apply high contrast class to body
  React.useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);
  
  return (
    <ErrorBoundary>
      <AppProviders themeVariant={isDark ? 'dark' : 'light'}>
        <div className="App">
          {showStyleGuide ? <StyleGuide /> : 
           testPhraseSystem ? <TestPhraseSystem /> : 
           testKingMode ? <TestKingMode /> : 
           <MenuBarApp />}
          <UpdateNotification />
        </div>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;