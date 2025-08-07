# Code Signing Setup Guide

This guide walks you through setting up code signing for MoodbooMs on macOS and Windows.

## Prerequisites

### macOS
- Apple Developer Account ($99/year)
- Developer ID Application certificate
- macOS device for signing

### Windows
- Code signing certificate from a Certificate Authority (CA)
- Options:
  - EV Certificate (~$300-600/year) - Best, no SmartScreen warnings
  - Standard Certificate (~$100-300/year) - Minimal warnings after reputation builds
  - Self-signed (Free) - Development only, will show warnings

## macOS Setup

### 1. Create Developer ID Certificate

1. Log in to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to Certificates, Identifiers & Profiles
3. Create a new certificate:
   - Type: Developer ID Application
   - Follow the certificate creation wizard
4. Download and install the certificate in Keychain Access

### 2. Get Your Team ID

Your Team ID can be found in:
- Apple Developer Portal → Membership → Team ID
- Or in Keychain Access: Right-click certificate → Get Info → Organizational Unit

### 3. Create App-Specific Password

For notarization, you need an app-specific password:
1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Sign in and go to Security
3. Under App-Specific Passwords, click Generate Password
4. Name it "MoodbooMs Notarization"
5. Save the password securely

### 4. Set Environment Variables

Create a `.env.local` file (never commit this!):
```bash
# Apple Developer credentials
APPLE_ID=your.email@example.com
APPLE_ID_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App-specific password
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_DEVELOPER_NAME="Your Name or Company"
```

### 5. Test Signing Locally

```bash
# Test signing without notarization
npm run dist:mac

# The signed app will be in dist/
# Check signature:
codesign --verify --deep --strict --verbose=2 "dist/MoodbooMs.app"
spctl -a -t exec -vvv "dist/MoodbooMs.app"
```

## Windows Setup

### 1. Obtain a Code Signing Certificate

#### Option A: Purchase from a CA (Recommended for Production)
- DigiCert, Sectigo, or GlobalSign
- Follow their verification process
- Download the .pfx certificate file

#### Option B: Create Self-Signed Certificate (Development Only)
```powershell
# Run in PowerShell as Administrator
$cert = New-SelfSignedCertificate -Type CodeSigning -Subject "CN=MoodbooMs Development" -KeyUsage DigitalSignature -FriendlyName "MoodbooMs Dev Cert" -CertStoreLocation "Cert:\CurrentUser\My" -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")

# Export to .pfx
$password = ConvertTo-SecureString -String "YourPassword" -Force -AsPlainText
Export-PfxCertificate -Cert "cert:\CurrentUser\My\$($cert.Thumbprint)" -FilePath ".\moodbooms-dev.pfx" -Password $password
```

### 2. Set Environment Variables

Add to `.env.local`:
```bash
# Windows signing
WINDOWS_CERT_FILE=./certs/your-certificate.pfx
WINDOWS_CERT_PASSWORD=your-certificate-password
```

### 3. Test Signing

```bash
# Build and sign for Windows
npm run dist:win

# Verify signature (in PowerShell):
Get-AuthenticodeSignature "dist\MoodbooMs Setup *.exe"
```

## GitHub Actions Setup

### 1. Prepare Certificates for CI/CD

#### macOS Certificate
```bash
# Export from Keychain to .p12
# 1. Open Keychain Access
# 2. Find your Developer ID Application certificate
# 3. Right-click → Export
# 4. Save as .p12 with a password

# Convert to base64 for GitHub secrets
base64 -i certificate.p12 | pbcopy
# This copies the base64 string to clipboard
```

#### Windows Certificate
```bash
# Convert .pfx to base64
base64 -i your-certificate.pfx | pbcopy
```

### 2. Add GitHub Secrets

Go to your repository Settings → Secrets and variables → Actions, add:

#### macOS Secrets
- `MACOS_CERTIFICATE`: Base64 encoded .p12 certificate
- `MACOS_CERTIFICATE_PWD`: Password for the .p12 file
- `APPLE_ID`: Your Apple ID email
- `APPLE_ID_PASSWORD`: App-specific password
- `APPLE_TEAM_ID`: Your Apple Team ID
- `APPLE_DEVELOPER_NAME`: Name on the certificate

#### Windows Secrets
- `WINDOWS_CERTIFICATE`: Base64 encoded .pfx certificate
- `WINDOWS_CERTIFICATE_PWD`: Password for the .pfx file

### 3. Trigger Build

Create a new release tag to trigger the workflow:
```bash
git tag v1.0.0
git push origin v1.0.0
```

Or manually trigger from Actions tab → Build and Sign → Run workflow

## Troubleshooting

### macOS Issues

**"Developer cannot be verified"**
- Ensure certificate is valid and not expired
- Check that notarization completed successfully
- Verify Team ID is correct

**Notarization fails**
- Check Apple ID and app-specific password
- Ensure hardened runtime is enabled
- Review entitlements file for issues

**Certificate not found**
```bash
# List available certificates
security find-identity -v -p codesigning
```

### Windows Issues

**"Publisher Unknown" warning**
- Normal for new certificates
- Build reputation by having users download and run
- Consider EV certificate for immediate trust

**Certificate not found**
```powershell
# List certificates
Get-ChildItem -Path Cert:\CurrentUser\My -CodeSigningCert
```

**Timestamp server issues**
- Try alternative servers:
  - http://timestamp.sectigo.com
  - http://timestamp.comodoca.com/authenticode
  - http://time.certum.pl

## Security Best Practices

1. **Never commit certificates or passwords**
   - Use .gitignore for certificate files
   - Use environment variables for passwords

2. **Rotate certificates regularly**
   - Set calendar reminders before expiry
   - Keep backup of old certificates

3. **Use separate certificates for development and production**
   - Self-signed for development
   - CA-issued for production

4. **Secure certificate storage**
   - Use password managers for credentials
   - Store certificates in secure locations
   - Use hardware security modules (HSM) for enterprise

5. **Monitor certificate usage**
   - Check for unauthorized use
   - Review signed binaries regularly

## Certificate Expiration

### Check Certificate Expiration

#### macOS
```bash
# In Keychain Access
security find-certificate -a -p -c "Developer ID Application" | openssl x509 -text | grep "Not After"
```

#### Windows
```powershell
Get-ChildItem -Path Cert:\CurrentUser\My -CodeSigningCert | Select-Object Subject, NotAfter
```

### Renewal Process

1. **30 days before expiration**:
   - Request/purchase new certificate
   - Test signing with new certificate
   
2. **After obtaining new certificate**:
   - Update local environment variables
   - Update GitHub secrets
   - Test full build pipeline
   
3. **Keep old certificate until**:
   - All existing signed apps are updated
   - Or certificate expires

## Additional Resources

- [Apple Developer - Notarizing macOS Software](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [Electron Builder - Code Signing](https://www.electron.build/code-signing)
- [Windows Authenticode Signing](https://docs.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools)
- [@electron/notarize Documentation](https://github.com/electron/notarize)