#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Code Signing Setup...\n');

const checks = {
  'Build configuration': false,
  'Entitlements files': false,
  'Notarization script': false,
  'GitHub workflow': false,
  'Environment template': false,
  'Build scripts': false
};

// Check package.json build configuration
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.build && 
      packageJson.build.mac && 
      packageJson.build.win &&
      packageJson.build.afterSign) {
    checks['Build configuration'] = true;
    console.log('✅ Build configuration found in package.json');
    
    // Check for distribution scripts
    if (packageJson.scripts['dist:mac'] && 
        packageJson.scripts['dist:win'] &&
        packageJson.scripts['dist:linux']) {
      checks['Build scripts'] = true;
      console.log('✅ Distribution scripts configured');
    } else {
      console.log('❌ Missing distribution scripts');
    }
  } else {
    console.log('❌ Build configuration incomplete in package.json');
  }
} catch (error) {
  console.log('❌ Could not read package.json');
}

// Check entitlements files
const entitlementsPath = path.join('build-resources', 'entitlements.mac.plist');
const entitlementsInheritPath = path.join('build-resources', 'entitlements.mac.inherit.plist');

if (fs.existsSync(entitlementsPath) && fs.existsSync(entitlementsInheritPath)) {
  checks['Entitlements files'] = true;
  console.log('✅ macOS entitlements files found');
} else {
  console.log('❌ Missing entitlements files');
}

// Check notarization script
const notarizePath = path.join('scripts', 'notarize.js');
if (fs.existsSync(notarizePath)) {
  checks['Notarization script'] = true;
  console.log('✅ Notarization script found');
} else {
  console.log('❌ Missing notarization script');
}

// Check GitHub workflow
const workflowPath = path.join('.github', 'workflows', 'build-and-sign.yml');
if (fs.existsSync(workflowPath)) {
  checks['GitHub workflow'] = true;
  console.log('✅ GitHub Actions workflow configured');
} else {
  console.log('❌ Missing GitHub workflow');
}

// Check environment template
if (fs.existsSync('.env.example')) {
  checks['Environment template'] = true;
  console.log('✅ Environment template (.env.example) found');
} else {
  console.log('❌ Missing .env.example');
}

// Check for actual environment file (should not exist in repo)
if (fs.existsSync('.env.local')) {
  console.log('⚠️  .env.local found (good for local testing, never commit!)');
} else {
  console.log('ℹ️  No .env.local found (create from .env.example for local signing)');
}

// Summary
console.log('\n📊 Summary:');
const passedChecks = Object.values(checks).filter(v => v).length;
const totalChecks = Object.keys(checks).length;

if (passedChecks === totalChecks) {
  console.log(`✅ All ${totalChecks} checks passed! Code signing setup is complete.`);
  console.log('\n📝 Next steps:');
  console.log('1. Copy .env.example to .env.local');
  console.log('2. Add your Apple Developer credentials');
  console.log('3. Obtain code signing certificates');
  console.log('4. Configure GitHub secrets for CI/CD');
  console.log('5. Test with: npm run dist:mac (on macOS)');
} else {
  console.log(`⚠️  ${passedChecks}/${totalChecks} checks passed`);
  console.log('\nFailed checks:');
  Object.entries(checks).forEach(([check, passed]) => {
    if (!passed) {
      console.log(`  - ${check}`);
    }
  });
}

process.exit(passedChecks === totalChecks ? 0 : 1);