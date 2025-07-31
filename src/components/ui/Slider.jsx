import React from 'react';

const Slider = React.forwardRef(({ 
  min = 0, 
  max = 100, 
  value = 0,
  onChange,
  disabled = false,
  className = '',
  showLabels = false,
  ...props 
}, ref) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className={`relative w-full ${className}`}>
      {showLabels && (
        <div className="flex justify-between mb-2">
          <span className="text-small text-gray-500">{min}</span>
          <span className="text-small text-gray-500">{max}</span>
        </div>
      )}
      <div className="relative">
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange?.(parseInt(e.target.value))}
          disabled={disabled}
          className={`
            relative w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
            
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:active:scale-95
            
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:transition-all
            [&::-moz-range-thumb]:duration-150
            [&::-moz-range-thumb]:hover:scale-110
            [&::-moz-range-thumb]:active:scale-95
          `}
          style={{
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, rgb(229 231 235) ${percentage}%, rgb(229 231 235) 100%)`
          }}
          {...props}
        />
      </div>
    </div>
  );
});

Slider.displayName = 'Slider';

export { Slider };