import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';
import { useMode } from '../../core/contexts/SimpleModeContext';

const ErrorMessage = ({ 
  error,
  onDismiss,
  onRetry,
  type = 'inline' // 'inline', 'toast', 'modal'
}) => {
  const { isKingMode } = useMode();
  
  // Error messages based on mode
  const getErrorMessage = (error) => {
    const defaultMessage = isKingMode 
      ? "Something went wrong. She's probably not happy about it."
      : "Ugh, something broke. Just my luck.";
    
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return defaultMessage;
  };

  const getRetryMessage = () => {
    return isKingMode 
      ? "Try Again (Carefully)" 
      : "Try Again (Why Not?)";
  };

  const content = (
    <div className={`
      flex items-start gap-3 p-4 rounded-lg
      ${type === 'inline' ? 'bg-error-light border border-error' : 'bg-surface shadow-lg'}
    `}>
      <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-small font-medium text-text-primary">
          {getErrorMessage(error)}
        </p>
        {error?.details && (
          <p className="text-tiny text-text-secondary mt-1">
            {error.details}
          </p>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1 text-small text-primary hover:text-primary-dark transition-colors"
            aria-label="Retry action"
          >
            <RefreshCw className="w-3 h-3" />
            {getRetryMessage()}
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-surface-light rounded transition-colors"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4 text-text-muted" />
        </button>
      )}
    </div>
  );

  if (type === 'toast') {
    return (
      <div className="fixed top-4 right-4 max-w-sm z-50 animate-slide-in-right">
        {content}
      </div>
    );
  }

  if (type === 'modal') {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default ErrorMessage;