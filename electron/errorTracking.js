const Sentry = require('@sentry/electron');
const { app } = require('electron');
const { storeOperations } = require('./store');

class ErrorTracker {
  constructor() {
    this.initialized = false;
  }

  init() {
    // Check if user has opted out of error tracking
    const preferences = storeOperations.getPreferences();
    if (preferences.errorTracking === false) {
      console.log('Error tracking disabled by user preference');
      return;
    }

    // Only initialize in production
    if (process.env.NODE_ENV !== 'production' && !process.env.SENTRY_DSN) {
      console.log('Error tracking disabled in development');
      return;
    }

    try {
      Sentry.init({
        dsn: process.env.SENTRY_DSN || '',
        environment: process.env.NODE_ENV || 'development',
        release: app.getVersion(),
        autoSessionTracking: true,
        
        // Privacy-focused configuration
        beforeSend(event, hint) {
          // Remove any potentially sensitive data
          if (event.user) {
            // Only keep anonymous ID
            event.user = {
              id: event.user.id || 'anonymous'
            };
          }

          // Remove any paths that might contain username
          if (event.contexts?.device) {
            delete event.contexts.device.name;
          }

          // Filter out sensitive environment variables
          if (event.extra?.environment) {
            const sensitiveKeys = ['PASSWORD', 'TOKEN', 'SECRET', 'KEY', 'APPLE_ID'];
            Object.keys(event.extra.environment).forEach(key => {
              if (sensitiveKeys.some(sensitive => key.includes(sensitive))) {
                delete event.extra.environment[key];
              }
            });
          }

          // Don't send events for certain non-critical errors
          const error = hint.originalException;
          if (error?.message?.includes('net::ERR_INTERNET_DISCONNECTED')) {
            return null; // Don't report network errors
          }

          return event;
        },

        // Performance monitoring (10% sample rate)
        tracesSampleRate: 0.1,
        
        // Session replay disabled for privacy
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,

        // Integrations
        integrations: [
          new Sentry.Integrations.MainProcessSession(),
        ],
      });

      this.initialized = true;
      console.log('Error tracking initialized');
    } catch (error) {
      console.error('Failed to initialize error tracking:', error);
    }
  }

  captureException(error, context = {}) {
    if (!this.initialized) return;

    Sentry.captureException(error, {
      extra: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    });
  }

  captureMessage(message, level = 'info', context = {}) {
    if (!this.initialized) return;

    Sentry.captureMessage(message, level, {
      extra: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    });
  }

  setUser(userId) {
    if (!this.initialized) return;

    // Only set anonymous user ID
    Sentry.setUser({
      id: userId,
    });
  }

  addBreadcrumb(breadcrumb) {
    if (!this.initialized) return;

    Sentry.addBreadcrumb({
      ...breadcrumb,
      timestamp: Date.now() / 1000,
    });
  }

  flush(timeout = 2000) {
    if (!this.initialized) return Promise.resolve();
    return Sentry.flush(timeout);
  }

  close(timeout = 2000) {
    if (!this.initialized) return Promise.resolve();
    return Sentry.close(timeout);
  }
}

// Singleton instance
const errorTracker = new ErrorTracker();

module.exports = errorTracker;