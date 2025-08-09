# License Verification System

MoodBooMs includes a license verification system that enables premium features while maintaining user privacy and providing offline validation.

## Overview

The license system is designed to:
- Enable premium features for paying users
- Provide trial access to encourage adoption
- Work completely offline (no server validation required)
- Respect user privacy (no personal information in licenses)
- Prevent casual piracy while remaining user-friendly

## License Types

### Free License (Default)
- **Features**: Core cycle tracking, basic calendar view, standard export
- **Limitations**: None for core functionality
- **Duration**: Unlimited

### Trial License
- **Features**: All premium features for limited time
- **Duration**: 14 days (customizable)
- **Activation**: One trial per installation
- **Purpose**: Allow users to experience premium features

### Premium License
- **Features**: All available premium features
- **Duration**: Unlimited (unless time-limited promotional license)
- **Activation**: Requires valid license key

## Premium Features

### Currently Available
- **Advanced Analytics**: 📊 Detailed cycle patterns and insights
- **Enhanced Export**: 💾 Multiple export formats (CSV, JSON, PDF)

### Planned Features
- **Custom Themes**: 🎨 Personalized color schemes and layouts
- **Cloud Sync**: ☁️ Secure cloud backup and multi-device sync
- **Unlimited History**: 📚 No limits on stored cycle history

## License Key Format

License keys use the format: `MB-TYPE-CHECKSUM-DATA`

- **MB**: Product identifier
- **TYPE**: License type (PREMIUM, TRIAL)
- **CHECKSUM**: Validation hash to prevent tampering
- **DATA**: Base64-encoded license information

Example: `MB-PREMIUM-4C9129F3-eyJnZW5lcmF0ZWRPbiI6Ij...`

## Technical Implementation

### Offline Validation
- No internet connection required for license validation
- Uses cryptographic checksums to prevent tampering
- License data encoded in the key itself
- Machine binding prevents sharing (optional)

### Security Features
- **Checksum Validation**: Prevents key modification
- **Expiry Checking**: Automatic expiration for trial licenses
- **Machine Binding**: Optional hardware fingerprinting
- **Format Validation**: Strict key format requirements

### Storage
- Licenses stored in electron-store (encrypted at rest)
- Trial usage tracked to prevent multiple trials
- Machine ID generated for license binding
- Settings persist across app updates

## Usage Examples

### For Users

#### Activating a Premium License
1. Go to Settings → License Management
2. Click "Activate Premium License"
3. Enter license key: `MB-PREMIUM-XXXXXXXX-XXXXXXXX`
4. Click "Activate License"
5. Premium features immediately available

#### Starting a Trial
1. Go to Settings → License Management
2. Click "Start 14-Day Trial"
3. Trial immediately activated
4. All premium features available for 14 days

### For Developers

#### Generating License Keys
```bash
# Generate premium license
node scripts/generate-license.js generate PREMIUM

# Generate 7-day trial
node scripts/generate-license.js generate TRIAL 7

# Validate license key
node scripts/generate-license.js validate MB-PREMIUM-...

# Generate multiple test keys
node scripts/generate-license.js batch 5
```

#### Checking License Status
```javascript
import licenseManager from './utils/licenseManager';

// Initialize license system
await licenseManager.initialize();

// Get current license status
const status = licenseManager.getLicenseStatus();
console.log(`License type: ${status.type}`);
console.log(`Features: ${status.features.join(', ')}`);

// Check specific feature availability
if (licenseManager.hasFeature('advanced_analytics')) {
  // Show advanced analytics
}
```

#### Feature Gates
```javascript
import { PREMIUM_FEATURES } from './utils/licenseManager';

// Component-level feature gating
function AdvancedAnalytics() {
  if (!licenseManager.hasFeature(PREMIUM_FEATURES.ADVANCED_ANALYTICS)) {
    return <PremiumFeaturePrompt feature="Advanced Analytics" />;
  }
  
  return <AdvancedAnalyticsContent />;
}
```

## API Reference

### LicenseManager Class

#### Methods

- `initialize()`: Load and validate current license
- `activateLicense(key)`: Activate a license key
- `startTrial(days)`: Start trial period
- `deactivateLicense()`: Remove current license
- `getLicenseStatus()`: Get current license information
- `hasFeature(feature)`: Check feature availability

#### License Status Object
```javascript
{
  type: 'premium',           // License type
  valid: true,               // Validation status
  features: ['feature1'],    // Available features
  expiryDate: '2025-12-31',  // Expiry (if applicable)
  trialDaysRemaining: 0      // Days left in trial
}
```

### License Generation

#### generateLicenseKey(type, options)
- **type**: 'PREMIUM' or 'TRIAL'
- **options**: Additional license parameters
  - `trialDays`: Trial duration (for TRIAL licenses)
  - `expiryDate`: Custom expiration date
  - `features`: Specific features to enable

#### validateLicenseKey(key)
Returns validation result with license data

## Privacy & Security

### Privacy Protection
- **No Personal Data**: Licenses contain no personal information
- **Anonymous IDs**: Machine binding uses anonymous identifiers
- **Local Storage**: All license data stored locally
- **No Tracking**: License validation doesn't phone home

### Security Measures
- **Checksum Validation**: Prevents key modification
- **Format Verification**: Strict key format requirements
- **Machine Binding**: Optional hardware fingerprinting
- **Offline Validation**: No network dependency

### Limitations
- **Simple Checksum**: Current implementation uses basic checksum (easily upgradeable)
- **No Server Validation**: Pure offline system (by design)
- **Key Sharing**: Machine binding helps but doesn't prevent sharing

## Development vs Production

### Development Mode
- All license features logged to console
- Test keys can be generated freely
- License validation warnings shown
- No machine binding enforcement

### Production Mode
- License validation strictly enforced
- Feature gates prevent unauthorized access
- Machine binding active (if configured)
- Production key validation only

## Deployment Considerations

### Key Distribution
- Premium keys distributed through secure channels
- Trial keys generated on-demand
- Keys should be unique per customer
- Backup key generation for customer support

### Customer Support
- License validation troubleshooting
- Key regeneration for valid customers
- Migration assistance for upgrades
- Feature activation support

## Testing

### Automated Tests
```bash
# Test license generation
npm test -- --testNamePattern="license.*generation"

# Test license validation  
npm test -- --testNamePattern="license.*validation"

# Test feature gates
npm test -- --testNamePattern="premium.*features"
```

### Manual Testing
1. Test license activation flow
2. Verify trial period functionality
3. Check feature gate enforcement
4. Test license deactivation
5. Verify persistence across restarts

## Future Enhancements

### Planned Improvements
- **Server Integration**: Optional online license validation
- **Advanced Encryption**: RSA or similar for key signing
- **License Analytics**: Usage tracking (with consent)
- **Subscription Support**: Time-based recurring licenses
- **Volume Licensing**: Organization/family licenses

### Migration Strategy
- Current license format remains supported
- New features added via versioned license data
- Backward compatibility maintained
- Automatic upgrades for existing licenses

## Troubleshooting

### Common Issues

**License Key Not Accepted**
- Check key format: Must start with `MB-`
- Verify no extra spaces or characters
- Ensure key is complete and not truncated

**Trial Already Used**
- Each installation gets one trial period
- Clear app data to reset (loses all user data)
- Contact support for extended trial

**Features Not Available**
- Restart app after license activation
- Check license status in Settings
- Verify feature is included in license type

**License Deactivation Issues**
- Force deactivation by clearing app data
- Contact support for license transfer
- Check for file permission issues

### Support Information
- License validation errors logged to console
- License status available in Settings
- Machine ID shown for support purposes
- License history preserved in app logs