import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({ 
  children, 
  content,
  position = 'top', // 'top', 'bottom', 'left', 'right'
  delay = 500,
  disabled = false
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const showTooltip = () => {
    if (disabled || !content) return;
    
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const spacing = 8;
    
    let top = 0;
    let left = 0;
    
    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - spacing;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + spacing;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - spacing;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + spacing;
        break;
    }
    
    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left < 0) left = spacing;
    if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - spacing;
    }
    
    if (top < 0) top = spacing;
    if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height - spacing;
    }
    
    setCoords({ top, left });
  };

  useEffect(() => {
    if (visible) {
      updatePosition();
    }
  }, [visible]);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex"
      >
        {children}
      </span>
      {visible && content && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="fixed z-50 px-2 py-1 text-tiny bg-gray-900 text-white rounded shadow-lg animate-fade-in pointer-events-none"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
        >
          {content}
          <div 
            className={`absolute w-0 h-0 border-4 border-transparent ${
              position === 'top' 
                ? 'bottom-[-8px] left-1/2 -translate-x-1/2 border-t-gray-900'
                : position === 'bottom'
                ? 'top-[-8px] left-1/2 -translate-x-1/2 border-b-gray-900'
                : position === 'left'
                ? 'right-[-8px] top-1/2 -translate-y-1/2 border-l-gray-900'
                : 'left-[-8px] top-1/2 -translate-y-1/2 border-r-gray-900'
            }`}
          />
        </div>
      )}
    </>
  );
};

export default Tooltip;