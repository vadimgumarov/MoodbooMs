import React from 'react';

const Switch = React.forwardRef(({ 
  checked = false, 
  onChange, 
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
        border-2 border-transparent shadow-sm transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary 
        focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? 'bg-primary' : 'bg-gray-200'}
        ${className}
      `}
      {...props}
    >
      <span
        className={`
          pointer-events-none block h-5 w-5 rounded-full bg-white 
          shadow-lg ring-0 transition-transform duration-200
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
});

Switch.displayName = 'Switch';

export { Switch };