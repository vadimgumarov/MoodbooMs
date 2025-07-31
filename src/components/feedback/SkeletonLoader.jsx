import React from 'react';

const SkeletonLoader = ({ 
  type = 'text', // 'text', 'circle', 'card', 'custom'
  width = '100%',
  height = '1rem',
  className = '',
  count = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
  
  const getSkeletonElement = () => {
    switch (type) {
      case 'text':
        return (
          <div 
            className={`${baseClasses} ${className}`}
            style={{ width, height }}
          />
        );
        
      case 'circle':
        return (
          <div 
            className={`${baseClasses} rounded-full ${className}`}
            style={{ width, height: width }}
          />
        );
        
      case 'card':
        return (
          <div className={`${baseClasses} p-4 ${className}`}>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
              </div>
            </div>
          </div>
        );
        
      case 'custom':
        return (
          <div 
            className={`${baseClasses} ${className}`}
            style={{ width, height }}
          />
        );
        
      default:
        return null;
    }
  };
  
  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }, (_, i) => (
          <div key={i}>{getSkeletonElement()}</div>
        ))}
      </div>
    );
  }
  
  return getSkeletonElement();
};

// Specific skeleton presets
export const StatusCardSkeleton = () => (
  <div className="bg-surface rounded-lg shadow-sm border border-border p-4 space-y-3">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2">
        <SkeletonLoader type="circle" width="24px" />
        <SkeletonLoader type="text" width="150px" height="20px" />
      </div>
      <SkeletonLoader type="text" width="80px" height="16px" />
    </div>
    <SkeletonLoader type="text" width="200px" height="14px" />
    <div className="grid grid-cols-2 gap-3">
      <SkeletonLoader type="card" />
      <SkeletonLoader type="card" />
    </div>
  </div>
);

export const HistoryItemSkeleton = () => (
  <div className="bg-surface rounded-lg p-4 space-y-2">
    <div className="flex justify-between items-start">
      <SkeletonLoader type="text" width="120px" height="16px" />
      <SkeletonLoader type="text" width="80px" height="14px" />
    </div>
    <SkeletonLoader type="text" width="100%" height="12px" />
  </div>
);

export default SkeletonLoader;