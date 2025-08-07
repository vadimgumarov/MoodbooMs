const { app } = require('electron');
const { storeOperations } = require('./store');
const crypto = require('crypto');

class Analytics {
  constructor() {
    this.enabled = false;
    this.userId = null;
    this.sessionId = null;
    this.events = [];
    this.initializeIds();
  }

  initializeIds() {
    // Get or create anonymous user ID
    let appState = storeOperations.getAppState();
    
    if (!appState.anonymousId) {
      // Generate a random anonymous ID
      appState.anonymousId = crypto.randomBytes(16).toString('hex');
      storeOperations.set('appState.anonymousId', appState.anonymousId);
    }
    
    this.userId = appState.anonymousId;
    this.sessionId = crypto.randomBytes(8).toString('hex');
  }

  init() {
    // Check if user has opted in to analytics
    const preferences = storeOperations.getPreferences();
    this.enabled = preferences.analytics !== false; // Default to enabled
    
    if (this.enabled) {
      console.log('Analytics enabled');
      this.trackEvent('app_started', {
        version: app.getVersion(),
        platform: process.platform,
        arch: process.arch,
      });
    } else {
      console.log('Analytics disabled by user preference');
    }
  }

  trackEvent(eventName, properties = {}) {
    if (!this.enabled) return;

    const event = {
      event: eventName,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        app_version: app.getVersion(),
        platform: process.platform,
        session_duration: this.getSessionDuration(),
      },
    };

    // Filter out any sensitive data
    this.sanitizeEvent(event);

    // Store event locally (in production, would send to analytics service)
    this.events.push(event);
    
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }

    // In production, this would send to an analytics service
    // this.sendToAnalyticsService(event);
  }

  sanitizeEvent(event) {
    // Remove any potentially sensitive data
    const sensitiveKeys = ['password', 'email', 'token', 'secret', 'key'];
    
    const sanitize = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    };

    sanitize(event.properties);
  }

  trackPageView(pageName, properties = {}) {
    this.trackEvent('page_viewed', {
      page_name: pageName,
      ...properties,
    });
  }

  trackFeatureUsage(featureName, properties = {}) {
    this.trackEvent('feature_used', {
      feature_name: featureName,
      ...properties,
    });
  }

  trackError(errorMessage, errorStack, properties = {}) {
    if (!this.enabled) return;

    // Don't track errors that contain sensitive information
    const sanitizedMessage = this.sanitizeErrorMessage(errorMessage);
    
    this.trackEvent('error_occurred', {
      error_message: sanitizedMessage,
      error_stack: errorStack?.substring(0, 500), // Limit stack trace length
      ...properties,
    });
  }

  sanitizeErrorMessage(message) {
    if (!message) return 'Unknown error';
    
    // Remove file paths that might contain usernames
    let sanitized = message.replace(/\/Users\/[^\/]+/g, '/Users/***');
    sanitized = sanitized.replace(/C:\\Users\\[^\\]+/g, 'C:\\Users\\***');
    
    return sanitized;
  }

  trackTiming(category, variable, timeInMs, label) {
    this.trackEvent('timing', {
      category,
      variable,
      time_ms: timeInMs,
      label,
    });
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    
    // Save preference
    const preferences = storeOperations.getPreferences();
    preferences.analytics = enabled;
    storeOperations.setPreferences(preferences);
    
    if (!enabled) {
      // Clear any pending events
      this.events = [];
    }
  }

  isEnabled() {
    return this.enabled;
  }

  getSessionDuration() {
    // Return session duration in seconds
    // This is a simplified implementation
    return Math.floor(process.uptime());
  }

  flush() {
    if (!this.enabled || this.events.length === 0) return;

    // In production, this would batch send events to analytics service
    console.log(`Flushing ${this.events.length} analytics events`);
    
    // Clear events after sending
    this.events = [];
  }

  // Standard events for the app
  trackAppLifecycle(event) {
    const lifecycleEvents = {
      'app-launched': 'app_launched',
      'app-quit': 'app_quit',
      'window-opened': 'window_opened',
      'window-closed': 'window_closed',
      'update-available': 'update_available',
      'update-installed': 'update_installed',
    };

    if (lifecycleEvents[event]) {
      this.trackEvent(lifecycleEvents[event]);
    }
  }

  trackUserAction(action, details = {}) {
    const userActions = {
      'cycle-date-changed': 'cycle_date_changed',
      'cycle-length-changed': 'cycle_length_changed',
      'mode-toggled': 'mode_toggled',
      'notification-toggled': 'notification_toggled',
      'data-exported': 'data_exported',
      'data-imported': 'data_imported',
      'settings-changed': 'settings_changed',
    };

    if (userActions[action]) {
      this.trackEvent(userActions[action], details);
    }
  }
}

// Singleton instance
const analytics = new Analytics();

module.exports = analytics;