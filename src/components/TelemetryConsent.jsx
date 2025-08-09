import React, { useState } from 'react';
import { initializeCrashReporting, recordEvent } from '../utils/crashReporter';

function TelemetryConsent({ onComplete }) {
  const [preferences, setPreferences] = useState({
    crashReporting: false,
    telemetry: false,
  });
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = async () => {
    try {
      // Save preferences
      if (window.electronAPI?.store) {
        await window.electronAPI.store.set('telemetrySettings', {
          ...preferences,
          performanceMonitoring: preferences.crashReporting, // Enable with crash reporting
        });
        
        // Mark consent as given
        await window.electronAPI.store.set('telemetryConsentGiven', true);
        
        // Initialize crash reporting if enabled
        if (preferences.crashReporting) {
          const appVersion = await window.electronAPI.app?.getVersion?.() || '1.0.0';
          
          let userId = localStorage.getItem('anonymous_user_id');
          if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 16);
            localStorage.setItem('anonymous_user_id', userId);
          }
          
          initializeCrashReporting({
            enabled: true,
            userId,
            version: appVersion,
            performanceMonitoring: preferences.crashReporting,
          });
        }
        
        // Record initial preference selection (if telemetry is enabled)
        if (preferences.telemetry) {
          recordEvent('initial_telemetry_consent', {
            crash_reporting: preferences.crashReporting,
            telemetry: preferences.telemetry,
          });
        }
      }
      
      onComplete?.();
    } catch (error) {
      console.warn('Failed to save telemetry preferences:', error);
      onComplete?.(); // Continue anyway
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔒</div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#333' }}>
            Privacy & Crash Reporting
          </h2>
          <p style={{ margin: 0, fontSize: '16px', color: '#666', lineHeight: '1.4' }}>
            Help improve MoodBooMs by sharing anonymous usage data and crash reports
          </p>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px solid #e9ecef'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              cursor: 'pointer',
              marginBottom: '15px'
            }}>
              <input
                type="checkbox"
                checked={preferences.crashReporting}
                onChange={() => handleToggle('crashReporting')}
                style={{ marginRight: '12px', marginTop: '2px' }}
              />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>
                  Enable Crash Reporting
                </div>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                  Automatically report app crashes to help fix bugs. No personal data included.
                </div>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={preferences.telemetry}
                onChange={() => handleToggle('telemetry')}
                style={{ marginRight: '12px', marginTop: '2px' }}
              />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>
                  Enable Anonymous Analytics
                </div>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                  Help improve features by sharing how the app is used. All data is anonymous.
                </div>
              </div>
            </label>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'none',
              border: 'none',
              color: '#007AFF',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '10px',
              padding: '0'
            }}
          >
            {showDetails ? 'Hide details' : 'What data is collected?'}
          </button>

          {showDetails && (
            <div style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: '#fff3cd',
              borderRadius: '6px',
              fontSize: '13px',
              lineHeight: '1.4'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>✅ What we collect:</strong>
                <ul style={{ margin: '5px 0 0 15px', padding: 0 }}>
                  <li>Error messages and stack traces (file paths anonymized)</li>
                  <li>App version and operating system type</li>
                  <li>Feature usage patterns (not your personal data)</li>
                  <li>Performance metrics (load times, memory usage)</li>
                </ul>
              </div>
              <div>
                <strong>❌ What we never collect:</strong>
                <ul style={{ margin: '5px 0 0 15px', padding: 0 }}>
                  <li>Personal information (names, emails)</li>
                  <li>Cycle data (dates, symptoms, moods)</li>
                  <li>Location or IP address</li>
                  <li>File contents or user-entered text</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleSubmit}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '120px'
            }}
          >
            Continue
          </button>
        </div>

        <p style={{
          fontSize: '12px',
          color: '#999',
          textAlign: 'center',
          margin: '15px 0 0 0',
          lineHeight: '1.3'
        }}>
          You can change these preferences anytime in Settings. 
          All data collection is optional and anonymous.
        </p>
      </div>
    </div>
  );
}

export default TelemetryConsent;