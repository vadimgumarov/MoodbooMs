import React from 'react';
import { reportError, recordEvent } from '../utils/crashReporter';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    
    // Store error details
    this.setState({
      error,
      errorInfo,
    });
    
    // Log to electron if available
    if (window.electronAPI?.app?.log) {
      window.electronAPI.app.log(`REACT ERROR: ${error.toString()}`);
      window.electronAPI.app.log(`Component Stack: ${errorInfo.componentStack}`);
    }
    
    // Report error to crash reporting service
    reportError(error, {
      component_stack: errorInfo.componentStack,
      error_boundary: this.props.name || 'ErrorBoundary',
      retry_count: this.state.retryCount,
      props_context: this.props.context || 'unknown',
    });
    
    // Record telemetry event
    recordEvent('react_error_boundary_triggered', {
      error_message: error.message,
      error_name: error.name,
      component: this.props.name || 'unknown',
      retry_count: this.state.retryCount,
    });
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
    
    recordEvent('error_boundary_retry', {
      retry_count: this.state.retryCount + 1,
      component: this.props.name || 'unknown',
    });
  };

  handleReload = () => {
    recordEvent('error_boundary_reload', {
      component: this.props.name || 'unknown',
    });
    
    // Reload the entire app
    if (window.electronAPI && window.electronAPI.app) {
      window.electronAPI.app.relaunch();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry, this.handleReload);
      }

      // Default fallback UI
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#ff6b6b', 
          color: 'white',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '10px' }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h2 style={{ margin: '0' }}>Oops! Something went wrong</h2>
          </div>
          
          <p style={{ margin: '0 0 15px 0' }}>
            {this.props.userFriendlyMessage || 
             "MoodBooMs encountered an unexpected error and needs to recover."}
          </p>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button 
              onClick={this.handleRetry}
              style={{
                padding: '10px 20px',
                backgroundColor: 'white',
                color: '#ff6b6b',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Try Again
            </button>
            
            <button 
              onClick={this.handleReload}
              style={{
                padding: '10px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid white',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Restart App
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px', fontSize: '12px' }}>
              <summary style={{ cursor: 'pointer' }}>Error Details (Development Only)</summary>
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                <p>{this.state.error && this.state.error.toString()}</p>
                <p>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
              </div>
            </details>
          )}
          
          <p style={{ fontSize: '12px', margin: '10px 0 0 0', opacity: 0.8 }}>
            If this problem persists, the error has been automatically reported for investigation.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component to wrap components with error boundary
export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary 
        name={Component.displayName || Component.name || 'WrappedComponent'}
        {...errorBoundaryProps}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for functional components to report errors manually
export function useErrorHandler() {
  return React.useCallback((error, errorInfo = {}) => {
    console.error('Manual error report:', error);
    reportError(error, {
      ...errorInfo,
      reported_manually: true,
    });
  }, []);
}

export default ErrorBoundary;