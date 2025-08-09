import React, { useState, useEffect } from 'react';
import { initializeCrashReporting, getCrashReportingStatus, recordEvent } from '../utils/crashReporter';

function TelemetrySettings() {
  const [settings, setSettings] = useState({
    crashReporting: false,
    telemetry: false,
    performanceMonitoring: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState({ initialized: false, development: true });

  useEffect(() => {
    loadSettings();
    setStatus(getCrashReportingStatus());
  }, []);

  const loadSettings = async () => {
    try {
      if (window.electronAPI?.store) {
        const storedSettings = await window.electronAPI.store.get('telemetrySettings') || {};
        setSettings({
          crashReporting: storedSettings.crashReporting || false,
          telemetry: storedSettings.telemetry || false,
          performanceMonitoring: storedSettings.performanceMonitoring || false,
        });
      }
    } catch (error) {
      console.warn('Failed to load telemetry settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      if (window.electronAPI?.store) {
        await window.electronAPI.store.set('telemetrySettings', newSettings);
        
        // Reinitialize crash reporting with new settings
        if (newSettings.crashReporting) {
          const appVersion = await window.electronAPI.app?.getVersion?.() || '1.0.0';
          const userId = await generateAnonymousUserId();
          
          initializeCrashReporting({
            enabled: true,
            userId,
            version: appVersion,
            performanceMonitoring: newSettings.performanceMonitoring,
          });
        }
        
        // Record settings change
        recordEvent('telemetry_settings_changed', {
          crash_reporting: newSettings.crashReporting,
          telemetry: newSettings.telemetry,
          performance_monitoring: newSettings.performanceMonitoring,
        });
      }
    } catch (error) {
      console.warn('Failed to save telemetry settings:', error);
    }
  };

  const generateAnonymousUserId = async () => {
    // Generate a stable anonymous ID based on machine info (no PII)
    try {
      if (window.electronAPI?.system?.getMachineId) {
        return await window.electronAPI.system.getMachineId();
      }
      
      // Fallback: use a random ID stored locally
      let userId = localStorage.getItem('anonymous_user_id');
      if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 16);
        localStorage.setItem('anonymous_user_id', userId);
      }
      return userId;
    } catch (error) {
      return 'anonymous_user';
    }
  };

  const handleToggle = async (settingName) => {
    const newSettings = {
      ...settings,
      [settingName]: !settings[settingName],
    };
    
    setSettings(newSettings);
    await saveSettings(newSettings);
    setStatus(getCrashReportingStatus());
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading telemetry settings...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      maxWidth: '600px'
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Privacy & Telemetry Settings</h2>
      
      <p style={{ 
        fontSize: '14px', 
        color: '#666', 
        marginBottom: '20px',
        lineHeight: '1.4'
      }}>
        Help improve MoodBooMs by sharing anonymous usage data and crash reports. 
        All data is anonymized and no personal information is collected.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '15px 0',
          borderBottom: '1px solid #eee'
        }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
              Crash Reporting
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: '#666',
              maxWidth: '400px'
            }}>
              Automatically report app crashes and errors to help fix bugs. 
              No personal data is included in crash reports.
            </p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.crashReporting}
              onChange={() => handleToggle('crashReporting')}
              style={{ marginRight: '8px' }}
            />
            <span style={{ 
              fontSize: '14px',
              color: settings.crashReporting ? '#007AFF' : '#666'
            }}>
              {settings.crashReporting ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '15px 0',
          borderBottom: '1px solid #eee'
        }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
              Anonymous Usage Analytics
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: '#666',
              maxWidth: '400px'
            }}>
              Help improve the app by sharing how features are used. 
              All data is anonymous and no cycle or personal data is collected.
            </p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.telemetry}
              onChange={() => handleToggle('telemetry')}
              style={{ marginRight: '8px' }}
            />
            <span style={{ 
              fontSize: '14px',
              color: settings.telemetry ? '#007AFF' : '#666'
            }}>
              {settings.telemetry ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '15px 0'
        }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
              Performance Monitoring
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: '#666',
              maxWidth: '400px'
            }}>
              Monitor app performance to identify and fix slowdowns. 
              Only technical performance data is collected.
            </p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.performanceMonitoring}
              onChange={() => handleToggle('performanceMonitoring')}
              disabled={!settings.crashReporting}
              style={{ 
                marginRight: '8px',
                opacity: settings.crashReporting ? 1 : 0.5
              }}
            />
            <span style={{ 
              fontSize: '14px',
              color: settings.performanceMonitoring ? '#007AFF' : '#666',
              opacity: settings.crashReporting ? 1 : 0.5
            }}>
              {settings.performanceMonitoring ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>
      </div>

      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}>
          What data is collected?
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.4' }}>
          <li>Error messages and stack traces (with file paths anonymized)</li>
          <li>App version and operating system information</li>
          <li>Feature usage patterns (which buttons are clicked, not what data is entered)</li>
          <li>Performance metrics (load times, memory usage)</li>
        </ul>
        
        <h4 style={{ margin: '15px 0 8px 0', fontSize: '14px', color: '#333' }}>
          What data is NOT collected?
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.4' }}>
          <li>Personal information (names, emails, addresses)</li>
          <li>Cycle data (dates, symptoms, moods)</li>
          <li>File contents or user-entered text</li>
          <li>Location or IP address</li>
        </ul>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: status.development ? '#fff3cd' : '#d4edda',
        border: `1px solid ${status.development ? '#ffeaa7' : '#c3e6cb'}`,
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <strong>Status:</strong> 
        {status.development ? 
          ' Development mode - telemetry data is only logged locally' : 
          ` Crash reporting is ${status.initialized ? 'active' : 'inactive'}`
        }
      </div>
    </div>
  );
}

export default TelemetrySettings;