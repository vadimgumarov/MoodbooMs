/**
 * Accessibility Utilities
 * 
 * Helper functions and utilities for improving app accessibility
 * following WCAG 2.1 AA standards
 */

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Get WCAG compliant contrast ratio
 * @param {string} color1 - Hex color
 * @param {string} color2 - Hex color
 * @returns {number} Contrast ratio
 */
export function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standards
 * @param {number} ratio - Contrast ratio
 * @param {boolean} largeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns {boolean} Whether contrast meets AA standards
 */
export function meetsWCAGAA(ratio, largeText = false) {
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color string
 * @returns {Object} RGB values
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance
 * @param {Object} rgb - RGB color object
 * @returns {number} Luminance value
 */
function getLuminance(rgb) {
  const { r, g, b } = rgb;
  const sRGB = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Trap focus within an element
 * @param {HTMLElement} element - Container element
 * @returns {Function} Cleanup function
 */
export function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  function handleKeyDown(e) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }
  
  element.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Get appropriate ARIA label for cycle phase
 * @param {string} phase - Phase name
 * @param {number} day - Current day in cycle
 * @returns {string} ARIA label
 */
export function getPhaseAriaLabel(phase, day) {
  return `Currently in ${phase} phase, day ${day} of your cycle`;
}

/**
 * Get appropriate ARIA label for fertility level
 * @param {number} percentage - Fertility percentage
 * @returns {string} ARIA label
 */
export function getFertilityAriaLabel(percentage) {
  if (percentage >= 85) return 'Very high fertility';
  if (percentage >= 60) return 'High fertility';
  if (percentage >= 30) return 'Medium fertility';
  if (percentage >= 10) return 'Low fertility';
  return 'Very low fertility';
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean} Whether reduced motion is preferred
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get keyboard navigation instructions
 * @returns {string} Instructions for screen readers
 */
export function getKeyboardInstructions() {
  return 'Use Tab to navigate between elements, Enter or Space to activate buttons, and Arrow keys to navigate within components.';
}