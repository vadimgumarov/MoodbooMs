/**
 * Crash Reporter and Privacy-First Telemetry
 * 
 * This module handles error reporting and basic telemetry while respecting user privacy.
 * All telemetry is opt-in and anonymized.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize Sentry only if user has opted in and we have a DSN
let sentryInitialized = false;

/**
 * Initialize crash reporting system
 * @param {Object} config - Configuration options
 * @param {boolean} config.enabled - Whether crash reporting is enabled
 * @param {string} config.userId - Anonymous user ID (hashed)
 * @param {string} config.version - App version
 */
export function initializeCrashReporting(config = {}) {
  // Skip in development unless explicitly enabled
  if (isDevelopment && !config.forceDevelopment) {
    console.log('Crash reporting disabled in development');
    return;
  }

  // Skip if user hasn't opted in
  if (!config.enabled) {
    console.log('Crash reporting disabled by user preference');
    return;
  }

  try {
    // Use a test DSN for now - replace with actual DSN when ready
    const SENTRY_DSN = process.env.SENTRY_DSN || 'test-dsn';
    
    if (SENTRY_DSN === 'test-dsn') {
      console.log('Crash reporting: Using mock mode (no DSN configured)');
      return;
    }

    // Dynamic import to avoid errors if Sentry fails to load
    import('@sentry/electron').then((Sentry) => {
      Sentry.init({
        dsn: SENTRY_DSN,
        
        // Only capture unhandled errors and crashes
        integrations: [
          new Sentry.Integrations.MainProcessSentry(),
          new Sentry.Integrations.RendererProcessSentry(),
        ],
        
        // Privacy settings
        beforeSend(event) {
          // Remove any potential PII from error reports
          return sanitizeErrorEvent(event);
        },
        
        // Performance monitoring (optional)
        tracesSampleRate: config.performanceMonitoring ? 0.1 : 0,
        
        // Release tracking
        release: config.version || '1.0.0',
        environment: isDevelopment ? 'development' : 'production',
        
        // User context (anonymized)
        initialScope: {
          user: {
            id: config.userId || 'anonymous',
          },
          tags: {
            platform: process.platform,
            arch: process.arch,
          },
        },
      });

      sentryInitialized = true;
      console.log('Crash reporting initialized');
      
      // Report successful initialization
      recordEvent('crash_reporting_initialized', {
        platform: process.platform,
        version: config.version,
      });
      
    }).catch((error) => {
      console.warn('Failed to initialize crash reporting:', error.message);
    });
    
  } catch (error) {
    console.warn('Crash reporting initialization failed:', error.message);
  }
}

/**
 * Sanitize error events to remove PII
 * @param {Object} event - Sentry event
 * @returns {Object} Sanitized event
 */
function sanitizeErrorEvent(event) {
  if (!event) return null;
  
  // Remove or mask file paths that might contain usernames
  if (event.exception && event.exception.values) {
    event.exception.values.forEach(exception => {
      if (exception.stacktrace && exception.stacktrace.frames) {
        exception.stacktrace.frames.forEach(frame => {
          if (frame.filename) {
            // Replace user paths with generic markers
            frame.filename = frame.filename
              .replace(/\/Users\/[^\/]+/g, '/Users/[USER]')
              .replace(/C:\\Users\\[^\\]+/g, 'C:\\Users\\[USER]')
              .replace(/\/home\/[^\/]+/g, '/home/[USER]');
          }
        });
      }
    });
  }
  
  // Remove any request data that might contain sensitive info
  delete event.request;
  
  // Remove breadcrumbs that might contain sensitive data
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.filter(crumb => 
      !crumb.message || !crumb.message.includes('password')
    );
  }
  
  return event;
}

/**
 * Record a telemetry event (privacy-respecting)
 * @param {string} eventName - Name of the event
 * @param {Object} properties - Event properties (will be anonymized)
 */
export function recordEvent(eventName, properties = {}) {
  try {
    // In development, just log to console
    if (isDevelopment) {
      console.log(`[Telemetry] ${eventName}:`, properties);
      return;
    }
    
    // If Sentry is initialized, use it for events
    if (sentryInitialized) {
      import('@sentry/electron').then((Sentry) => {
        Sentry.addBreadcrumb({
          category: 'user-action',
          message: eventName,
          data: sanitizeProperties(properties),
          level: 'info',
        });
      });
    }
    
    // Also store locally for offline analysis (limited retention)
    storeLocalEvent(eventName, properties);
    
  } catch (error) {
    console.warn('Failed to record telemetry event:', error.message);
  }
}

/**
 * Report an error manually
 * @param {Error} error - Error to report
 * @param {Object} context - Additional context
 */
export function reportError(error, context = {}) {
  try {
    console.error('Reporting error:', error);
    
    if (isDevelopment) {
      console.error(`[Error Report] ${error.message}:`, context);
      return;
    }
    
    if (sentryInitialized) {
      import('@sentry/electron').then((Sentry) => {
        Sentry.withScope((scope) => {
          // Add context
          Object.keys(context).forEach(key => {
            scope.setTag(key, context[key]);
          });
          
          // Capture the error
          Sentry.captureException(error);
        });
      });
    }
    
    // Store locally as backup
    storeLocalError(error, context);
    
  } catch (reportingError) {
    console.warn('Failed to report error:', reportingError.message);
  }
}

/**
 * Sanitize properties to remove potential PII
 * @param {Object} properties - Properties to sanitize
 * @returns {Object} Sanitized properties
 */
function sanitizeProperties(properties) {
  const sanitized = {};
  
  Object.keys(properties).forEach(key => {
    const value = properties[key];
    
    // Skip properties that might contain PII
    if (typeof value === 'string' && (
      key.toLowerCase().includes('name') ||
      key.toLowerCase().includes('email') ||
      key.toLowerCase().includes('path') ||
      value.includes('@') ||
      value.includes('/Users/') ||
      value.includes('C:\\Users\\')
    )) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (typeof value === 'string' && value.length < 100) {
      sanitized[key] = value;
    } else {
      sanitized[key] = typeof value;
    }
  });
  
  return sanitized;
}

/**
 * Store event locally for offline analysis
 * @param {string} eventName - Event name
 * @param {Object} properties - Event properties
 */
function storeLocalEvent(eventName, properties) {
  try {
    // Use localStorage in renderer, or a simple file system in main
    if (typeof window !== 'undefined' && window.localStorage) {
      const events = JSON.parse(localStorage.getItem('telemetry_events') || '[]');
      
      // Keep only last 100 events to limit storage
      if (events.length >= 100) {
        events.shift();
      }
      
      events.push({
        event: eventName,
        properties: sanitizeProperties(properties),
        timestamp: Date.now(),
      });
      
      localStorage.setItem('telemetry_events', JSON.stringify(events));
    }
  } catch (error) {
    // Fail silently for local storage
  }
}

/**
 * Store error locally for offline analysis
 * @param {Error} error - Error to store
 * @param {Object} context - Error context
 */
function storeLocalError(error, context) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const errors = JSON.parse(localStorage.getItem('local_errors') || '[]');
      
      // Keep only last 50 errors
      if (errors.length >= 50) {
        errors.shift();
      }
      
      errors.push({
        message: error.message,
        stack: error.stack ? error.stack.substring(0, 1000) : null, // Limit stack trace size
        context: sanitizeProperties(context),
        timestamp: Date.now(),
      });
      
      localStorage.setItem('local_errors', JSON.stringify(errors));
    }
  } catch (error) {
    // Fail silently for local storage
  }
}

/**
 * Get crash reporting status
 * @returns {Object} Status information
 */
export function getCrashReportingStatus() {
  return {
    initialized: sentryInitialized,
    development: isDevelopment,
  };
}

/**
 * Set user context for error reports
 * @param {Object} userContext - User context (anonymized)
 */
export function setUserContext(userContext) {
  if (sentryInitialized) {
    import('@sentry/electron').then((Sentry) => {
      Sentry.setUser({
        id: userContext.id || 'anonymous',
        // Don't include email or other PII
      });
      
      Sentry.setTags(sanitizeProperties(userContext));
    });
  }
}

// Setup global error handlers
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    reportError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
      type: 'unhandled_rejection',
    });
  });
  
  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    reportError(event.error || new Error(event.message), {
      type: 'global_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
}