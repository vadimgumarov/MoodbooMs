/**
 * Mode Plugin Validator
 * 
 * Validates mode plugins against the required schema
 */

import { 
  ModePluginSchema, 
  ModeConfigSchema,
  ModeThemeSchema,
  ModePhrasesSchema,
  ValidationErrors,
  ModeDefaults 
} from './types';

/**
 * Validate a complete mode plugin
 * @param {Object} mode - Mode plugin to validate
 * @returns {Object} Validation result
 */
export async function validateMode(mode) {
  const errors = [];
  
  try {
    // Validate required metadata
    if (!mode.id || typeof mode.id !== 'string') {
      errors.push({
        field: 'id',
        error: ValidationErrors.MISSING_REQUIRED_FIELD,
        message: 'Mode ID is required and must be a string'
      });
    }
    
    if (!mode.name || typeof mode.name !== 'string') {
      errors.push({
        field: 'name',
        error: ValidationErrors.MISSING_REQUIRED_FIELD,
        message: 'Mode name is required and must be a string'
      });
    }
    
    if (!mode.version || !isValidVersion(mode.version)) {
      errors.push({
        field: 'version',
        error: ValidationErrors.INVALID_VERSION,
        message: 'Valid semantic version is required (e.g., 1.0.0)'
      });
    }
    
    // Validate config
    if (!mode.config) {
      errors.push({
        field: 'config',
        error: ValidationErrors.MISSING_REQUIRED_FIELD,
        message: 'Mode configuration is required'
      });
    } else {
      const configErrors = validateConfig(mode.config);
      errors.push(...configErrors);
    }
    
    // Validate theme
    if (!mode.theme) {
      errors.push({
        field: 'theme',
        error: ValidationErrors.MISSING_REQUIRED_FIELD,
        message: 'Mode theme is required'
      });
    } else {
      const themeErrors = validateTheme(mode.theme);
      errors.push(...themeErrors);
    }
    
    // Validate phrases
    if (!mode.phrases) {
      errors.push({
        field: 'phrases',
        error: ValidationErrors.MISSING_REQUIRED_FIELD,
        message: 'Mode phrases are required'
      });
    } else {
      const phrasesErrors = validatePhrases(mode.phrases);
      errors.push(...phrasesErrors);
    }
    
    // Validate optional dark theme if provided
    if (mode.darkTheme) {
      const darkThemeErrors = validateTheme(mode.darkTheme, 'darkTheme');
      errors.push(...darkThemeErrors);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      error: errors.length > 0 ? errors[0].error : null,
      details: errors.length > 0 ? errors.map(e => e.message).join(', ') : null
    };
  } catch (error) {
    return {
      valid: false,
      error: 'VALIDATION_ERROR',
      details: error.message
    };
  }
}

/**
 * Validate mode configuration
 * @param {Object} config - Mode configuration
 * @returns {Array} Array of errors
 */
function validateConfig(config) {
  const errors = [];
  
  // Validate phase names
  if (!config.phaseNames || typeof config.phaseNames !== 'object') {
    errors.push({
      field: 'config.phaseNames',
      error: ValidationErrors.MISSING_REQUIRED_FIELD,
      message: 'Phase names mapping is required'
    });
  } else {
    const requiredPhases = ['menstrual', 'follicular', 'ovulation', 'luteal', 'lateLuteal', 'premenstrual'];
    requiredPhases.forEach(phase => {
      if (!config.phaseNames[phase] || typeof config.phaseNames[phase] !== 'string') {
        errors.push({
          field: `config.phaseNames.${phase}`,
          error: ValidationErrors.MISSING_REQUIRED_FIELD,
          message: `Phase name for '${phase}' is required`
        });
      }
    });
  }
  
  // Validate UI text
  if (!config.uiText || typeof config.uiText !== 'object') {
    errors.push({
      field: 'config.uiText',
      error: ValidationErrors.MISSING_REQUIRED_FIELD,
      message: 'UI text configuration is required'
    });
  }
  
  return errors;
}

/**
 * Validate mode theme
 * @param {Object} theme - Mode theme
 * @param {string} fieldPrefix - Field prefix for errors
 * @returns {Array} Array of errors
 */
function validateTheme(theme, fieldPrefix = 'theme') {
  const errors = [];
  
  // Validate required theme properties
  if (!theme.colors || typeof theme.colors !== 'object') {
    errors.push({
      field: `${fieldPrefix}.colors`,
      error: ValidationErrors.MISSING_REQUIRED_FIELD,
      message: 'Theme colors are required'
    });
  } else {
    // Validate required colors
    const requiredColors = ['primary', 'secondary', 'background', 'surface', 'text'];
    requiredColors.forEach(color => {
      if (!theme.colors[color] || !isValidColor(theme.colors[color])) {
        errors.push({
          field: `${fieldPrefix}.colors.${color}`,
          error: ValidationErrors.INVALID_THEME_COLORS,
          message: `Valid ${color} color is required`
        });
      }
    });
    
    // Validate phase colors
    if (!theme.colors.phases || typeof theme.colors.phases !== 'object') {
      errors.push({
        field: `${fieldPrefix}.colors.phases`,
        error: ValidationErrors.MISSING_REQUIRED_FIELD,
        message: 'Phase colors are required'
      });
    }
  }
  
  // Validate typography
  if (!theme.typography || typeof theme.typography !== 'object') {
    errors.push({
      field: `${fieldPrefix}.typography`,
      error: ValidationErrors.MISSING_REQUIRED_FIELD,
      message: 'Theme typography is required'
    });
  }
  
  return errors;
}

/**
 * Validate mode phrases
 * @param {Object} phrases - Mode phrases
 * @returns {Array} Array of errors
 */
function validatePhrases(phrases) {
  const errors = [];
  
  if (!phrases.phrases || typeof phrases.phrases !== 'object') {
    errors.push({
      field: 'phrases.phrases',
      error: ValidationErrors.MISSING_REQUIRED_FIELD,
      message: 'Phrases collection is required'
    });
    return errors;
  }
  
  const requiredPhases = ['menstrual', 'follicular', 'ovulation', 'luteal', 'lateLuteal', 'premenstrual'];
  const minPhrases = phrases.minPhrasesPerPhase || ModeDefaults.minPhrasesPerPhase;
  
  requiredPhases.forEach(phase => {
    const phaseData = phrases.phrases[phase];
    
    if (!phaseData) {
      errors.push({
        field: `phrases.phrases.${phase}`,
        error: ValidationErrors.MISSING_REQUIRED_FIELD,
        message: `Phrases for '${phase}' phase are required`
      });
    } else {
      // Check mood phrases
      if (!phaseData.moods || !Array.isArray(phaseData.moods)) {
        errors.push({
          field: `phrases.phrases.${phase}.moods`,
          error: ValidationErrors.MISSING_REQUIRED_FIELD,
          message: `Mood phrases for '${phase}' phase are required`
        });
      } else if (phaseData.moods.length < minPhrases) {
        errors.push({
          field: `phrases.phrases.${phase}.moods`,
          error: ValidationErrors.INSUFFICIENT_PHRASES,
          message: `At least ${minPhrases} mood phrases required for '${phase}' phase`
        });
      }
      
      // Check craving phrases
      if (!phaseData.cravings || !Array.isArray(phaseData.cravings)) {
        errors.push({
          field: `phrases.phrases.${phase}.cravings`,
          error: ValidationErrors.MISSING_REQUIRED_FIELD,
          message: `Craving phrases for '${phase}' phase are required`
        });
      } else if (phaseData.cravings.length < minPhrases) {
        errors.push({
          field: `phrases.phrases.${phase}.cravings`,
          error: ValidationErrors.INSUFFICIENT_PHRASES,
          message: `At least ${minPhrases} craving phrases required for '${phase}' phase`
        });
      }
    }
  });
  
  return errors;
}

/**
 * Check if a string is a valid semantic version
 * @param {string} version - Version string
 * @returns {boolean} Valid status
 */
function isValidVersion(version) {
  const semverRegex = /^\d+\.\d+\.\d+(-[\w\.]+)?(\+[\w\.]+)?$/;
  return typeof version === 'string' && semverRegex.test(version);
}

/**
 * Check if a string is a valid color
 * @param {string} color - Color string
 * @returns {boolean} Valid status
 */
function isValidColor(color) {
  if (typeof color !== 'string') return false;
  
  // Check hex colors
  if (/^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/.test(color)) return true;
  
  // Check rgb/rgba
  if (/^rgba?\(/.test(color)) return true;
  
  // Check hsl/hsla
  if (/^hsla?\(/.test(color)) return true;
  
  // Check CSS color names (basic list)
  const cssColors = ['transparent', 'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta'];
  if (cssColors.includes(color.toLowerCase())) return true;
  
  // Allow CSS variables
  if (color.startsWith('var(--')) return true;
  
  return false;
}

/**
 * Validate mode requirements
 * @param {Object} requirements - Mode requirements
 * @param {string} currentVersion - Current app version
 * @returns {Object} Validation result
 */
export function validateRequirements(requirements, currentVersion) {
  if (!requirements) {
    return { valid: true };
  }
  
  const errors = [];
  
  // Check minimum app version
  if (requirements.minAppVersion) {
    if (!isVersionCompatible(currentVersion, requirements.minAppVersion)) {
      errors.push({
        error: ValidationErrors.INCOMPATIBLE_VERSION,
        message: `Requires app version ${requirements.minAppVersion} or higher`
      });
    }
  }
  
  // Check dependencies
  if (requirements.dependencies && Array.isArray(requirements.dependencies)) {
    // This would check if required mode dependencies are loaded
    // Implementation depends on how dependencies are managed
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if current version meets minimum requirement
 * @param {string} current - Current version
 * @param {string} minimum - Minimum required version
 * @returns {boolean} Compatible status
 */
function isVersionCompatible(current, minimum) {
  const parseVersion = (v) => v.split('.').map(n => parseInt(n, 10));
  const currentParts = parseVersion(current);
  const minimumParts = parseVersion(minimum);
  
  for (let i = 0; i < 3; i++) {
    if (currentParts[i] > minimumParts[i]) return true;
    if (currentParts[i] < minimumParts[i]) return false;
  }
  
  return true; // Equal versions are compatible
}