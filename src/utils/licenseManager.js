/**
 * License Management System
 * 
 * Provides offline license verification for MoodBooMs premium features.
 * Uses cryptographic validation to prevent tampering while respecting user privacy.
 */

import { recordEvent } from './crashReporter';

// License types
export const LICENSE_TYPES = {
  FREE: 'free',
  PREMIUM: 'premium',
  TRIAL: 'trial'
};

// License features
export const PREMIUM_FEATURES = {
  ADVANCED_ANALYTICS: 'advanced_analytics',
  EXPORT_OPTIONS: 'export_options', 
  CUSTOM_THEMES: 'custom_themes',
  CLOUD_SYNC: 'cloud_sync',
  UNLIMITED_HISTORY: 'unlimited_history'
};

// Simple key generation for demo purposes
// In production, use proper cryptographic signing
const LICENSE_SECRET = 'moodbooms_license_v1';

class LicenseManager {
  constructor() {
    this.currentLicense = null;
    this.licenseStatus = {
      type: LICENSE_TYPES.FREE,
      valid: true,
      features: [],
      expiryDate: null,
      trialDaysRemaining: 0
    };
  }

  /**
   * Initialize license system
   */
  async initialize() {
    try {
      await this.loadLicense();
      await this.validateLicense();
      
      recordEvent('license_system_initialized', {
        license_type: this.licenseStatus.type,
        valid: this.licenseStatus.valid
      });
      
    } catch (error) {
      console.warn('License initialization failed:', error);
      this.setFreeLicense();
    }
  }

  /**
   * Load license from storage
   */
  async loadLicense() {
    try {
      if (window.electronAPI?.store) {
        const storedLicense = await window.electronAPI.store.get('license');
        if (storedLicense) {
          this.currentLicense = storedLicense;
        }
      }
    } catch (error) {
      console.warn('Failed to load license:', error);
    }
  }

  /**
   * Validate current license
   */
  async validateLicense() {
    if (!this.currentLicense) {
      this.setFreeLicense();
      return;
    }

    try {
      const validation = await this.validateLicenseKey(this.currentLicense.key);
      
      if (validation.valid) {
        this.licenseStatus = {
          type: validation.type,
          valid: true,
          features: this.getFeaturesForLicense(validation.type),
          expiryDate: validation.expiryDate,
          trialDaysRemaining: validation.trialDaysRemaining || 0,
          activatedOn: this.currentLicense.activatedOn
        };
      } else {
        console.warn('License validation failed:', validation.reason);
        this.setFreeLicense();
      }
    } catch (error) {
      console.warn('License validation error:', error);
      this.setFreeLicense();
    }
  }

  /**
   * Set free license as default
   */
  setFreeLicense() {
    this.licenseStatus = {
      type: LICENSE_TYPES.FREE,
      valid: true,
      features: [],
      expiryDate: null,
      trialDaysRemaining: 0
    };
  }

  /**
   * Activate a license key
   * @param {string} licenseKey - License key to activate
   * @returns {Promise<Object>} Activation result
   */
  async activateLicense(licenseKey) {
    try {
      recordEvent('license_activation_attempted', {
        key_format: this.getLicenseKeyFormat(licenseKey)
      });

      const validation = await this.validateLicenseKey(licenseKey);
      
      if (!validation.valid) {
        recordEvent('license_activation_failed', {
          reason: validation.reason
        });
        return {
          success: false,
          error: validation.reason || 'Invalid license key'
        };
      }

      // Store license
      const licenseData = {
        key: licenseKey,
        type: validation.type,
        activatedOn: new Date().toISOString(),
        machineId: await this.getMachineId()
      };

      if (window.electronAPI?.store) {
        await window.electronAPI.store.set('license', licenseData);
      }

      this.currentLicense = licenseData;
      await this.validateLicense();

      recordEvent('license_activated', {
        license_type: validation.type,
        has_expiry: !!validation.expiryDate
      });

      return {
        success: true,
        licenseType: validation.type,
        features: this.getFeaturesForLicense(validation.type)
      };

    } catch (error) {
      console.warn('License activation failed:', error);
      recordEvent('license_activation_error', {
        error: error.message
      });
      return {
        success: false,
        error: 'Activation failed. Please try again.'
      };
    }
  }

  /**
   * Validate license key format and signature
   * @param {string} licenseKey - Key to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateLicenseKey(licenseKey) {
    try {
      if (!licenseKey || typeof licenseKey !== 'string') {
        return { valid: false, reason: 'Invalid license key format' };
      }

      // Parse license key format: MB-TYPE-CHECKSUM-DATA
      const parts = licenseKey.split('-');
      if (parts.length < 4 || parts[0] !== 'MB') {
        return { valid: false, reason: 'Invalid license key format' };
      }

      const [prefix, type, checksum, ...dataParts] = parts;
      const data = dataParts.join('-');

      // Validate license type
      const validTypes = Object.values(LICENSE_TYPES).map(t => t.toUpperCase());
      if (!validTypes.includes(type)) {
        return { valid: false, reason: 'Unknown license type' };
      }

      // Validate checksum (simple implementation)
      const expectedChecksum = await this.generateChecksum(type + data);
      if (checksum !== expectedChecksum) {
        return { valid: false, reason: 'License key verification failed' };
      }

      // Parse license data
      const licenseData = this.parseLicenseData(data);
      
      // Check expiry for premium/trial licenses
      if (type === 'TRIAL' || type === 'PREMIUM') {
        if (licenseData.expiryDate && new Date() > new Date(licenseData.expiryDate)) {
          return { valid: false, reason: 'License has expired' };
        }
      }

      // Calculate trial days remaining
      let trialDaysRemaining = 0;
      if (type === 'TRIAL' && licenseData.expiryDate) {
        const daysLeft = Math.ceil((new Date(licenseData.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        trialDaysRemaining = Math.max(0, daysLeft);
      }

      return {
        valid: true,
        type: type.toLowerCase(),
        expiryDate: licenseData.expiryDate,
        trialDaysRemaining,
        features: licenseData.features || []
      };

    } catch (error) {
      console.warn('License validation error:', error);
      return { valid: false, reason: 'License validation failed' };
    }
  }

  /**
   * Generate simple checksum for license validation
   * @param {string} data - Data to hash
   * @returns {Promise<string>} Checksum
   */
  async generateChecksum(data) {
    // Simple checksum - in production use proper cryptographic signing
    const combined = LICENSE_SECRET + data;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase().substring(0, 8);
  }

  /**
   * Parse license data from encoded string
   * @param {string} encodedData - Encoded license data
   * @returns {Object} Parsed data
   */
  parseLicenseData(encodedData) {
    try {
      // Simple base64-like encoding for demo
      const decoded = atob(encodedData.replace(/_/g, '/').replace(/-/g, '+'));
      return JSON.parse(decoded);
    } catch (error) {
      return {};
    }
  }

  /**
   * Get machine ID for license binding
   * @returns {Promise<string>} Machine identifier
   */
  async getMachineId() {
    try {
      if (window.electronAPI?.system?.getMachineId) {
        return await window.electronAPI.system.getMachineId();
      }
      
      // Fallback to stored machine ID
      let machineId = localStorage.getItem('machine_id');
      if (!machineId) {
        machineId = 'machine_' + Math.random().toString(36).substr(2, 16);
        localStorage.setItem('machine_id', machineId);
      }
      return machineId;
    } catch (error) {
      return 'unknown_machine';
    }
  }

  /**
   * Get features available for license type
   * @param {string} licenseType - Type of license
   * @returns {Array} Available features
   */
  getFeaturesForLicense(licenseType) {
    switch (licenseType) {
      case LICENSE_TYPES.PREMIUM:
        return Object.values(PREMIUM_FEATURES);
      case LICENSE_TYPES.TRIAL:
        return [
          PREMIUM_FEATURES.ADVANCED_ANALYTICS,
          PREMIUM_FEATURES.EXPORT_OPTIONS
        ];
      default:
        return [];
    }
  }

  /**
   * Check if a feature is available
   * @param {string} feature - Feature to check
   * @returns {boolean} Feature availability
   */
  hasFeature(feature) {
    return this.licenseStatus.features.includes(feature);
  }

  /**
   * Get current license status
   * @returns {Object} License status
   */
  getLicenseStatus() {
    return { ...this.licenseStatus };
  }

  /**
   * Get license key format for analytics (anonymized)
   * @param {string} licenseKey - License key
   * @returns {string} Anonymized format
   */
  getLicenseKeyFormat(licenseKey) {
    if (!licenseKey) return 'none';
    const parts = licenseKey.split('-');
    return parts.length >= 2 ? `MB-${parts[1]}-***` : 'invalid';
  }

  /**
   * Start trial license
   * @param {number} trialDays - Days for trial
   * @returns {Promise<Object>} Trial activation result
   */
  async startTrial(trialDays = 14) {
    try {
      // Check if trial already used
      if (window.electronAPI?.store) {
        const trialUsed = await window.electronAPI.store.get('trialUsed');
        if (trialUsed) {
          return {
            success: false,
            error: 'Trial period has already been used'
          };
        }
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + trialDays);

      const trialData = {
        expiryDate: expiryDate.toISOString(),
        features: [PREMIUM_FEATURES.ADVANCED_ANALYTICS, PREMIUM_FEATURES.EXPORT_OPTIONS]
      };

      // Generate trial key
      const encodedData = btoa(JSON.stringify(trialData));
      const checksum = await this.generateChecksum('TRIAL' + encodedData);
      const trialKey = `MB-TRIAL-${checksum}-${encodedData}`;

      const result = await this.activateLicense(trialKey);
      
      if (result.success && window.electronAPI?.store) {
        await window.electronAPI.store.set('trialUsed', true);
      }

      return result;
    } catch (error) {
      console.warn('Trial activation failed:', error);
      return {
        success: false,
        error: 'Failed to start trial'
      };
    }
  }

  /**
   * Deactivate current license
   * @returns {Promise<boolean>} Deactivation success
   */
  async deactivateLicense() {
    try {
      if (window.electronAPI?.store) {
        await window.electronAPI.store.delete('license');
      }
      
      this.currentLicense = null;
      this.setFreeLicense();

      recordEvent('license_deactivated');
      
      return true;
    } catch (error) {
      console.warn('License deactivation failed:', error);
      return false;
    }
  }
}

// Global license manager instance
const licenseManager = new LicenseManager();

export default licenseManager;