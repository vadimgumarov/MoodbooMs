import React from 'react';
import MenuBarApp from './components/MenuBarApp';
import TestKingMode from './components/TestKingMode';
import TestPhraseSystem from './components/TestPhraseSystem';
import StyleGuide from './components/StyleGuide/StyleGuide';
// import { ModeProvider } from './core/contexts/SimpleModeContext';
import { AppProviders } from './core/contexts';
import ErrorBoundary from './components/ErrorBoundary';
import { useDarkMode } from './hooks/useDarkMode';
import './utils/crashLogger'; // Initialize crash logger with heartbeat
import { initializeCrashReporting, recordEvent } from './utils/crashReporter';

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
  
  // Initialize crash reporting
  React.useEffect(() => {
    const initTelemetry = async () => {
      try {
        if (window.electronAPI?.store) {
          const telemetrySettings = await window.electronAPI.store.get('telemetrySettings') || {};
          
          if (telemetrySettings.crashReporting) {
            const appVersion = await window.electronAPI.app?.getVersion?.() || '1.0.0';
            
            // Generate anonymous user ID
            let userId = localStorage.getItem('anonymous_user_id');
            if (!userId) {
              userId = 'user_' + Math.random().toString(36).substr(2, 16);
              localStorage.setItem('anonymous_user_id', userId);
            }
            
            initializeCrashReporting({
              enabled: true,
              userId,
              version: appVersion,
              performanceMonitoring: telemetrySettings.performanceMonitoring || false,
            });
            
            // Record app startup
            recordEvent('app_startup', {
              version: appVersion,
              platform: navigator.platform,
              user_agent: navigator.userAgent.split(' ')[0], // Just the browser/engine
            });
          }
        }
      } catch (error) {
        console.warn('Failed to initialize telemetry:', error);
      }
    };
    
    initTelemetry();
  }, []);
  
  return (
    <ErrorBoundary>
      <AppProviders themeVariant={isDark ? 'dark' : 'light'}>
        <div className="App">
          {showStyleGuide ? <StyleGuide /> : 
           testPhraseSystem ? <TestPhraseSystem /> : 
           testKingMode ? <TestKingMode /> : 
           <MenuBarApp />}
        </div>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;