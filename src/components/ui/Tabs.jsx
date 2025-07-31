import React from 'react';

// Tab navigation with smooth transitions and active indicators
const TabsList = ({ children, className = '' }) => {
  return (
    <div className={`flex bg-gray-100 rounded-lg p-1 ${className}`}>
      {children}
    </div>
  );
};

const TabsTrigger = ({ 
  active = false, 
  onClick, 
  children, 
  className = '',
  icon = null,
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex-1 py-2 px-3 rounded-md transition-all duration-200 text-small font-medium
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary 
        focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${active 
          ? 'bg-white text-primary shadow-sm' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
        }
        ${className}
      `}
      {...props}
    >
      {icon && (
        <span className="inline-flex items-center justify-center">
          {icon}
        </span>
      )}
      {children && (
        <span className={icon ? 'ml-2' : ''}>
          {children}
        </span>
      )}
      
      {/* Active indicator bar */}
      {active && (
        <span 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full"
          style={{ transition: 'width 200ms ease-out' }}
        />
      )}
    </button>
  );
};

const TabsContent = ({ active = false, children, className = '' }) => {
  if (!active) return null;
  
  return (
    <div 
      className={`animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ${className}`}
    >
      {children}
    </div>
  );
};

export { TabsList, TabsTrigger, TabsContent };