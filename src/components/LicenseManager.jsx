import React, { useState, useEffect } from 'react';
import licenseManager, { LICENSE_TYPES, PREMIUM_FEATURES } from '../utils/licenseManager';

function LicenseManager() {
  const [licenseStatus, setLicenseStatus] = useState(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [message, setMessage] = useState('');
  const [showLicenseInput, setShowLicenseInput] = useState(false);

  useEffect(() => {
    loadLicenseStatus();
  }, []);

  const loadLicenseStatus = async () => {
    await licenseManager.initialize();
    setLicenseStatus(licenseManager.getLicenseStatus());
  };

  const handleActivateLicense = async () => {
    if (!licenseKey.trim()) {
      setMessage('Please enter a license key');
      return;
    }

    setIsActivating(true);
    setMessage('');

    try {
      const result = await licenseManager.activateLicense(licenseKey.trim());
      
      if (result.success) {
        setMessage('License activated successfully!');
        setLicenseKey('');
        setShowLicenseInput(false);
        await loadLicenseStatus();
      } else {
        setMessage(result.error || 'License activation failed');
      }
    } catch (error) {
      setMessage('Activation failed. Please try again.');
      console.error('License activation error:', error);
    } finally {
      setIsActivating(false);
    }
  };

  const handleStartTrial = async () => {
    setIsActivating(true);
    setMessage('');

    try {
      const result = await licenseManager.startTrial(14);
      
      if (result.success) {
        setMessage('14-day trial activated successfully!');
        await loadLicenseStatus();
      } else {
        setMessage(result.error || 'Trial activation failed');
      }
    } catch (error) {
      setMessage('Trial activation failed. Please try again.');
      console.error('Trial activation error:', error);
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your license?')) {
      return;
    }

    const success = await licenseManager.deactivateLicense();
    if (success) {
      setMessage('License deactivated');
      await loadLicenseStatus();
    } else {
      setMessage('Failed to deactivate license');
    }
  };

  const getLicenseTypeDisplay = (type) => {
    switch (type) {
      case LICENSE_TYPES.FREE:
        return { name: 'Free', color: '#666', icon: '🆓' };
      case LICENSE_TYPES.TRIAL:
        return { name: 'Trial', color: '#f39c12', icon: '⏰' };
      case LICENSE_TYPES.PREMIUM:
        return { name: 'Premium', color: '#27ae60', icon: '⭐' };
      default:
        return { name: 'Unknown', color: '#666', icon: '❓' };
    }
  };

  const getFeatureDisplay = (feature) => {
    switch (feature) {
      case PREMIUM_FEATURES.ADVANCED_ANALYTICS:
        return '📊 Advanced Analytics';
      case PREMIUM_FEATURES.EXPORT_OPTIONS:
        return '💾 Enhanced Export Options';
      case PREMIUM_FEATURES.CUSTOM_THEMES:
        return '🎨 Custom Themes';
      case PREMIUM_FEATURES.CLOUD_SYNC:
        return '☁️ Cloud Synchronization';
      case PREMIUM_FEATURES.UNLIMITED_HISTORY:
        return '📚 Unlimited History';
      default:
        return feature;
    }
  };

  if (!licenseStatus) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading license information...</p>
      </div>
    );
  }

  const licenseDisplay = getLicenseTypeDisplay(licenseStatus.type);

  return (
    <div style={{
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      maxWidth: '600px'
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px' }}>License Management</h2>

      {/* Current License Status */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        marginBottom: '20px',
        border: `2px solid ${licenseDisplay.color}20`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>
            {licenseDisplay.icon}
          </span>
          <div>
            <h3 style={{
              margin: '0 0 5px 0',
              color: licenseDisplay.color,
              fontSize: '18px'
            }}>
              {licenseDisplay.name} License
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#666'
            }}>
              {licenseStatus.type === LICENSE_TYPES.TRIAL
                ? `${licenseStatus.trialDaysRemaining} days remaining`
                : licenseStatus.type === LICENSE_TYPES.PREMIUM
                ? 'Full access to all premium features'
                : 'Core features available'
              }
            </p>
          </div>
        </div>

        {/* Premium Features */}
        {licenseStatus.features.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
              Available Features:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {licenseStatus.features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: '14px',
                    color: '#333',
                    padding: '8px 12px',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #ddd'
                  }}
                >
                  {getFeatureDisplay(feature)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* License Actions */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '15px',
          flexWrap: 'wrap'
        }}>
          {licenseStatus.type === LICENSE_TYPES.FREE && (
            <>
              <button
                onClick={() => setShowLicenseInput(!showLicenseInput)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007AFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Activate Premium License
              </button>
              <button
                onClick={handleStartTrial}
                disabled={isActivating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f39c12',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isActivating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: isActivating ? 0.6 : 1
                }}
              >
                {isActivating ? 'Starting...' : 'Start 14-Day Trial'}
              </button>
            </>
          )}

          {(licenseStatus.type === LICENSE_TYPES.PREMIUM || licenseStatus.type === LICENSE_TYPES.TRIAL) && (
            <button
              onClick={handleDeactivate}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Deactivate License
            </button>
          )}
        </div>
      </div>

      {/* License Activation */}
      {showLicenseInput && (
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px solid #007AFF20',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>
            Activate Premium License
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              License Key:
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="MB-PREMIUM-XXXXXXXX-XXXXXXXX"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'Monaco, monospace'
              }}
              disabled={isActivating}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleActivateLicense}
              disabled={isActivating || !licenseKey.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (isActivating || !licenseKey.trim()) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: (isActivating || !licenseKey.trim()) ? 0.6 : 1
              }}
            >
              {isActivating ? 'Activating...' : 'Activate License'}
            </button>
            
            <button
              onClick={() => {
                setShowLicenseInput(false);
                setLicenseKey('');
                setMessage('');
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div style={{
          padding: '15px',
          backgroundColor: message.includes('success') || message.includes('activated') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('success') || message.includes('activated') ? '#c3e6cb' : '#f5c6cb'}`,
          color: message.includes('success') || message.includes('activated') ? '#155724' : '#721c24',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}

      {/* Premium Features Info */}
      <div style={{
        padding: '20px',
        backgroundColor: '#e8f4f8',
        borderRadius: '12px',
        border: '2px solid #bee5eb'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#0c5460' }}>
          💎 Premium Features
        </h3>
        
        <div style={{ display: 'grid', gap: '10px' }}>
          {Object.values(PREMIUM_FEATURES).map((feature, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <span style={{ 
                marginRight: '10px',
                opacity: licenseStatus.features.includes(feature) ? 1 : 0.3
              }}>
                {licenseStatus.features.includes(feature) ? '✅' : '⭕'}
              </span>
              <span style={{ 
                color: licenseStatus.features.includes(feature) ? '#155724' : '#666'
              }}>
                {getFeatureDisplay(feature)}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '15px',
          padding: '12px',
          backgroundColor: '#cce7f0',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#0c5460'
        }}>
          <strong>Note:</strong> Premium features are currently in development. 
          Your license will automatically unlock new features as they become available.
        </div>
      </div>
    </div>
  );
}

export default LicenseManager;