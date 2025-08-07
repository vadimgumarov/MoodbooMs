const { notarize } = require('@electron/notarize');
const path = require('path');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  
  // Only notarize on macOS
  if (electronPlatformName !== 'darwin') {
    return;
  }

  // Skip notarization in CI if credentials not available
  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
    console.log('Skipping notarization: Apple credentials not found in environment');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log('Starting notarization process...');
  console.log('App path:', appPath);

  try {
    await notarize({
      appBundleId: 'com.moodbooms.app',
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID, // Optional but recommended
    });
    
    console.log('Notarization completed successfully');
  } catch (error) {
    console.error('Notarization failed:', error);
    
    // Don't fail the build if notarization fails in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Continuing despite notarization failure (development mode)');
    } else {
      throw error;
    }
  }
};