#!/usr/bin/env node

/**
 * License Key Generator for MoodBooMs
 * 
 * This script generates valid license keys for testing and development.
 * In production, license keys should be generated securely on a server.
 */

const crypto = require('crypto');

// License secret (should match the one in licenseManager.js)
const LICENSE_SECRET = 'moodbooms_license_v1';

// License types
const LICENSE_TYPES = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  TRIAL: 'TRIAL'
};

/**
 * Generate checksum for license validation
 * @param {string} data - Data to hash
 * @returns {string} Checksum
 */
function generateChecksum(data) {
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
 * Generate a license key
 * @param {string} type - License type (PREMIUM, TRIAL)
 * @param {Object} options - License options
 * @returns {string} Generated license key
 */
function generateLicenseKey(type, options = {}) {
  const licenseData = {
    generatedOn: new Date().toISOString(),
    version: '1.0.0',
    ...options
  };

  // Add expiry date for trial licenses
  if (type === LICENSE_TYPES.TRIAL) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (options.trialDays || 14));
    licenseData.expiryDate = expiryDate.toISOString();
  }

  // Encode license data
  const encodedData = Buffer.from(JSON.stringify(licenseData)).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Generate checksum
  const checksum = generateChecksum(type + encodedData);

  // Format: MB-TYPE-CHECKSUM-DATA
  return `MB-${type}-${checksum}-${encodedData}`;
}

/**
 * Validate a license key
 * @param {string} licenseKey - Key to validate
 * @returns {Object} Validation result
 */
function validateLicenseKey(licenseKey) {
  try {
    const parts = licenseKey.split('-');
    if (parts.length < 4 || parts[0] !== 'MB') {
      return { valid: false, reason: 'Invalid format' };
    }

    const [prefix, type, checksum, ...dataParts] = parts;
    const data = dataParts.join('-');

    // Validate checksum
    const expectedChecksum = generateChecksum(type + data);
    if (checksum !== expectedChecksum) {
      return { valid: false, reason: 'Invalid checksum' };
    }

    // Decode data
    const decodedData = Buffer.from(
      data.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString('utf-8');
    
    const licenseData = JSON.parse(decodedData);

    return {
      valid: true,
      type: type.toLowerCase(),
      data: licenseData
    };
  } catch (error) {
    return { valid: false, reason: 'Parse error' };
  }
}

// Command line interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'generate':
    case 'gen': {
      const type = args[1]?.toUpperCase() || 'PREMIUM';
      const trialDays = parseInt(args[2]) || 14;

      if (!Object.values(LICENSE_TYPES).includes(type)) {
        console.error('Invalid license type. Use: PREMIUM, TRIAL');
        process.exit(1);
      }

      const options = {};
      if (type === 'TRIAL') {
        options.trialDays = trialDays;
      }

      const licenseKey = generateLicenseKey(type, options);
      
      console.log('Generated License Key:');
      console.log('=====================');
      console.log(licenseKey);
      console.log('');
      console.log(`Type: ${type}`);
      
      if (type === 'TRIAL') {
        console.log(`Trial Days: ${trialDays}`);
      }
      
      break;
    }

    case 'validate':
    case 'val': {
      const licenseKey = args[1];
      if (!licenseKey) {
        console.error('Please provide a license key to validate');
        process.exit(1);
      }

      const result = validateLicenseKey(licenseKey);
      
      console.log('License Key Validation:');
      console.log('======================');
      console.log(`Key: ${licenseKey}`);
      console.log(`Valid: ${result.valid}`);
      
      if (result.valid) {
        console.log(`Type: ${result.type}`);
        console.log('Data:');
        console.log(JSON.stringify(result.data, null, 2));
      } else {
        console.log(`Reason: ${result.reason}`);
      }
      
      break;
    }

    case 'batch': {
      const count = parseInt(args[1]) || 5;
      
      console.log(`Generating ${count} test license keys:`);
      console.log('=====================================');
      
      // Generate premium keys
      console.log('\nPremium Keys:');
      for (let i = 0; i < Math.ceil(count / 2); i++) {
        const key = generateLicenseKey('PREMIUM');
        console.log(`${i + 1}. ${key}`);
      }
      
      // Generate trial keys
      console.log('\nTrial Keys (14 days):');
      for (let i = 0; i < Math.floor(count / 2); i++) {
        const key = generateLicenseKey('TRIAL', { trialDays: 14 });
        console.log(`${i + 1}. ${key}`);
      }
      
      break;
    }

    default:
      console.log('MoodBooMs License Key Generator');
      console.log('===============================');
      console.log('');
      console.log('Usage:');
      console.log('  node generate-license.js generate [PREMIUM|TRIAL] [days]');
      console.log('  node generate-license.js validate <license-key>');
      console.log('  node generate-license.js batch [count]');
      console.log('');
      console.log('Examples:');
      console.log('  node generate-license.js generate PREMIUM');
      console.log('  node generate-license.js generate TRIAL 30');
      console.log('  node generate-license.js validate MB-PREMIUM-...');
      console.log('  node generate-license.js batch 10');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateLicenseKey,
  validateLicenseKey,
  LICENSE_TYPES
};