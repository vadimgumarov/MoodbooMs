/**
 * Feedback Context
 * 
 * Provides global feedback notifications (toasts, errors, success messages)
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ErrorMessage, SuccessMessage } from '../../components/feedback';

const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [feedbacks, setFeedbacks] = useState([]);

  const showSuccess = useCallback((message, options = {}) => {
    const id = Date.now();
    const feedback = {
      id,
      type: 'success',
      message,
      autoHide: options.autoHide !== false,
      autoHideDelay: options.autoHideDelay || 3000,
      ...options
    };
    
    setFeedbacks(prev => [...prev, feedback]);
    
    // Auto remove after delay
    if (feedback.autoHide) {
      setTimeout(() => {
        removeFeedback(id);
      }, feedback.autoHideDelay);
    }
    
    return id;
  }, []);

  const showError = useCallback((error, options = {}) => {
    const id = Date.now();
    const feedback = {
      id,
      type: 'error',
      error,
      onRetry: options.onRetry,
      ...options
    };
    
    setFeedbacks(prev => [...prev, feedback]);
    return id;
  }, []);

  const removeFeedback = useCallback((id) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id));
  }, []);

  const value = {
    showSuccess,
    showError,
    removeFeedback
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      
      {/* Render feedback toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {feedbacks.map(feedback => (
          <div key={feedback.id} className="animate-slide-in-right">
            {feedback.type === 'success' ? (
              <SuccessMessage
                message={feedback.message}
                onDismiss={() => removeFeedback(feedback.id)}
                type="toast"
                autoHide={false} // We handle auto-hide in context
              />
            ) : (
              <ErrorMessage
                error={feedback.error}
                onDismiss={() => removeFeedback(feedback.id)}
                onRetry={feedback.onRetry}
                type="toast"
              />
            )}
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
}