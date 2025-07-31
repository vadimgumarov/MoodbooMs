import React from 'react';

// Button component with variants
const Button = React.forwardRef(({ 
  className = '', 
  variant = 'primary', 
  size = 'md',
  children,
  ...props 
}, ref) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-primary text-white shadow hover:bg-primary/90 active:scale-95',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:scale-95',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 active:scale-95',
    ghost: 'hover:bg-gray-100 active:scale-95',
    destructive: 'bg-red-500 text-white shadow-sm hover:bg-red-600 active:scale-95',
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'h-8 px-3 text-small',
    md: 'h-9 px-4 py-2',
    lg: 'h-10 px-6',
    icon: 'h-9 w-9',
  };
  
  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };