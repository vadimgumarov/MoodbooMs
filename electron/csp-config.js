// Content Security Policy Configuration
const crypto = require('crypto');

// Generate nonce for inline scripts/styles if needed
const generateNonce = () => {
  return crypto.randomBytes(16).toString('base64');
};

// CSP Policies for different environments
const CSP_POLICIES = {
  // Production CSP - Most restrictive
  production: {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"], // Required for Tailwind CSS
    'img-src': ["'self'", "data:"], // data: for inline images
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
    'block-all-mixed-content': []
  },

  // Development CSP - More permissive for hot reload
  development: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-eval'", // Required for React DevTools
      "http://localhost:3000",
      "ws://localhost:3000" // WebSocket for hot reload
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind CSS
      "http://localhost:3000"
    ],
    'img-src': ["'self'", "data:", "http://localhost:3000"],
    'font-src': ["'self'", "http://localhost:3000"],
    'connect-src': [
      "'self'",
      "http://localhost:3000",
      "ws://localhost:3000", // WebSocket for hot reload
      "http://localhost:3001" // React DevTools
    ],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"]
  },

  // Test environment CSP
  test: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-eval'"], // eval needed for some test frameworks
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:"],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"]
  }
};

// Convert policy object to CSP header string
const buildCSPString = (policy) => {
  return Object.entries(policy)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive; // For directives without values
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

// Get CSP policy for current environment
const getCSPPolicy = (environment = process.env.NODE_ENV || 'production') => {
  const policy = CSP_POLICIES[environment] || CSP_POLICIES.production;
  return buildCSPString(policy);
};

// CSP Report handler configuration
const getCSPReportUri = () => {
  // In production, this would be your CSP violation reporting endpoint
  if (process.env.NODE_ENV === 'production') {
    return process.env.CSP_REPORT_URI || null;
  }
  return null; // No reporting in development
};

// Build complete CSP header with reporting
const buildCSPHeader = (environment = process.env.NODE_ENV || 'production') => {
  let cspString = getCSPPolicy(environment);
  
  const reportUri = getCSPReportUri();
  if (reportUri) {
    cspString += `; report-uri ${reportUri}`;
  }
  
  return cspString;
};

// CSP violation handler
const handleCSPViolation = (details) => {
  console.error('CSP Violation:', {
    directive: details.directive,
    blockedURI: details.blockedURI,
    lineNumber: details.lineNumber,
    sourceFile: details.sourceFile,
    timestamp: new Date().toISOString()
  });
  
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production' && process.env.CSP_REPORT_URI) {
    // Send violation report to monitoring service
    // This is a placeholder - implement actual reporting logic
  }
};

// Apply CSP to Electron session
const applyCSPToSession = (session) => {
  const cspHeader = buildCSPHeader();
  
  session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [cspHeader]
      }
    });
  });
  
  // Log CSP for debugging
  console.log('CSP Applied:', cspHeader);
};

// Meta tag CSP for HTML (more limited than header CSP)
const getMetaCSP = (environment = process.env.NODE_ENV || 'production') => {
  const policy = CSP_POLICIES[environment] || CSP_POLICIES.production;
  
  // Meta tag CSP doesn't support all directives
  const metaSupportedDirectives = [
    'default-src',
    'script-src',
    'style-src',
    'img-src',
    'font-src',
    'connect-src',
    'media-src',
    'object-src',
    'base-uri',
    'form-action'
  ];
  
  const metaPolicy = {};
  metaSupportedDirectives.forEach(directive => {
    if (policy[directive]) {
      metaPolicy[directive] = policy[directive];
    }
  });
  
  return buildCSPString(metaPolicy);
};

module.exports = {
  generateNonce,
  getCSPPolicy,
  buildCSPHeader,
  handleCSPViolation,
  applyCSPToSession,
  getMetaCSP,
  CSP_POLICIES
};