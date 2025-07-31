import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useMode } from '../../core/contexts/SimpleModeContext';

const SuccessMessage = ({ 
  message,
  onDismiss,
  autoHide = true,
  autoHideDelay = 3000,
  type = 'inline' // 'inline', 'toast'
}) => {
  const { isKingMode } = useMode();
  
  // Success messages based on mode
  const getSuccessMessage = () => {
    if (message) return message;
    
    return isKingMode 
      ? "Mission accomplished. You survived another day."
      : "Look at me being productive!";
  };

  useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoHideDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onDismiss]);

  const content = (
    <div className={`
      flex items-center gap-3 p-4 rounded-lg
      ${type === 'inline' ? 'bg-success-light border border-success' : 'bg-surface shadow-lg'}
      animate-fade-in
    `}>
      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
      <p className="flex-1 text-small font-medium text-text-primary">
        {getSuccessMessage()}
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-surface-light rounded transition-colors"
          aria-label="Dismiss success message"
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

  return content;
};

export default SuccessMessage;