import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = null,
  fullScreen = false,
  inline = false 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const spinner = (
    <div className={`flex ${inline ? 'inline-flex' : 'flex-col'} items-center justify-center gap-2`}>
      <Loader2 
        className={`${sizeClasses[size]} animate-spin text-primary`}
        aria-label="Loading"
      />
      {message && (
        <span className="text-small text-text-secondary">
          {message}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-surface p-6 rounded-lg shadow-lg">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;