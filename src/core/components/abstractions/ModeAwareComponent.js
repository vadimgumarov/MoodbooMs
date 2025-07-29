/**
 * Mode-Aware Component Base
 * 
 * Base component class and utilities for creating mode-aware components
 * that can adapt their behavior and content based on the current mode.
 */

import React from 'react';
import { useModeAwareProps } from './ComponentModeAdapter';

/**
 * Base functional component pattern for mode-aware components
 * 
 * Example usage:
 * ```jsx
 * const MyComponent = createModeAwareComponent(({ modeProps, ...props }) => {
 *   const { isQueenMode, getUIText } = modeProps;
 *   return <div>{getUIText('welcome')}</div>;
 * });
 * ```
 */
export const createModeAwareComponent = (Component) => {
  const ModeAwareComponent = (props) => {
    const modeProps = useModeAwareProps();
    return <Component {...props} modeProps={modeProps} />;
  };
  
  ModeAwareComponent.displayName = `ModeAware(${Component.displayName || Component.name})`;
  return ModeAwareComponent;
};

/**
 * Hook for transforming component props based on mode
 * 
 * @param {Object} props - Original component props
 * @param {Object} transformers - Mode-specific prop transformers
 * @returns {Object} Transformed props
 */
export const useModeTransformedProps = (props, transformers = {}) => {
  const { currentMode } = useModeAwareProps();
  
  const transformer = transformers[currentMode] || transformers.default || ((p) => p);
  return transformer(props);
};

/**
 * Component wrapper that provides mode-specific styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.queenClassName - Classes for Queen mode
 * @param {string} props.kingClassName - Classes for King mode
 * @param {string} props.baseClassName - Base classes applied always
 * @param {React.ReactNode} props.children - Child components
 */
export const ModeStyledWrapper = ({ 
  queenClassName = '', 
  kingClassName = '', 
  baseClassName = '', 
  children,
  ...rest 
}) => {
  const { getModeClass } = useModeAwareProps();
  const modeClass = getModeClass(queenClassName, kingClassName);
  const className = `${baseClassName} ${modeClass}`.trim();
  
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
};

/**
 * Factory for creating mode-specific component variants
 * 
 * @param {Object} variants - Object with queen/king component variants
 * @returns {React.Component} Component that renders the appropriate variant
 */
export const createModeVariantComponent = (variants) => {
  const ModeVariantComponent = (props) => {
    const { isQueenMode, isKingMode } = useModeAwareProps();
    
    if (isQueenMode && variants.queen) {
      const QueenComponent = variants.queen;
      return <QueenComponent {...props} />;
    }
    
    if (isKingMode && variants.king) {
      const KingComponent = variants.king;
      return <KingComponent {...props} />;
    }
    
    // Fallback to default or queen variant
    const DefaultComponent = variants.default || variants.queen;
    return DefaultComponent ? <DefaultComponent {...props} /> : null;
  };
  
  ModeVariantComponent.displayName = 'ModeVariantComponent';
  return ModeVariantComponent;
};

/**
 * Hook for managing mode-specific state
 * 
 * @param {*} queenInitial - Initial state for Queen mode
 * @param {*} kingInitial - Initial state for King mode
 * @returns {Array} State and setState tuple
 */
export const useModeState = (queenInitial, kingInitial) => {
  const { isQueenMode } = useModeAwareProps();
  const initial = isQueenMode ? queenInitial : kingInitial;
  return React.useState(initial);
};

/**
 * Hook for mode-specific effects
 * 
 * @param {Function} queenEffect - Effect to run in Queen mode
 * @param {Function} kingEffect - Effect to run in King mode
 * @param {Array} deps - Effect dependencies
 */
export const useModeEffect = (queenEffect, kingEffect, deps = []) => {
  const { isQueenMode, isKingMode } = useModeAwareProps();
  
  React.useEffect(() => {
    if (isQueenMode && queenEffect) {
      return queenEffect();
    }
    if (isKingMode && kingEffect) {
      return kingEffect();
    }
  }, [isQueenMode, isKingMode, ...deps]);
};

/**
 * Component that provides mode context to children
 * Useful for deeply nested components that need mode info
 */
export const ModeProvider = ({ children }) => {
  const modeProps = useModeAwareProps();
  
  return React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { modeProps });
    }
    return child;
  });
};