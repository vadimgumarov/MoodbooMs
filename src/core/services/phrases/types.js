/**
 * Phrase Configuration Types
 * 
 * Defines the schema for mode-specific phrase configurations
 */

/**
 * @typedef {Object} PhraseSet
 * @property {string[]} default - Default phrases for the phase
 * @property {string[]} [morning] - Morning-specific phrases (5am-12pm)
 * @property {string[]} [afternoon] - Afternoon-specific phrases (12pm-5pm)
 * @property {string[]} [evening] - Evening-specific phrases (5pm-10pm)
 * @property {string[]} [night] - Night-specific phrases (10pm-5am)
 * @property {string[]} [weekend] - Weekend-specific phrases
 * @property {Object.<string, string[]>} [moods] - Mood-specific phrases
 */

/**
 * @typedef {Object} CravingItem
 * @property {string} icon - Icon name for the craving
 * @property {string} text - Craving description
 */

/**
 * @typedef {Object} PhaseConfig
 * @property {string} name - Display name for the phase
 * @property {string} description - Phase description
 * @property {string} calendarTooltip - Calendar tooltip text
 * @property {PhraseSet} moods - Mood phrases for the phase
 * @property {CravingItem[]} cravings - Food cravings for the phase
 * @property {Object.<string, string[]>} [contextual] - Context-specific phrases
 */

/**
 * @typedef {Object} SpecialPhrases
 * @property {string[]} firstDay - First day of cycle phrases
 * @property {string[]} lastDay - Last day of cycle phrases
 * @property {string[]} ovulation - Peak ovulation day phrases
 * @property {string[]} [custom] - Custom special event phrases
 */

/**
 * @typedef {Object} ModeConfig
 * @property {Object.<string, PhaseConfig>} phases - Phase configurations
 * @property {SpecialPhrases} special - Special event phrases
 * @property {Object} ui - UI text configuration
 * @property {Object} metadata - Mode metadata
 */

/**
 * @typedef {Object} PhraseContext
 * @property {Date} currentTime - Current date/time
 * @property {number} cycleDay - Current cycle day
 * @property {string} phase - Current phase
 * @property {string} mood - Current mood (if specified)
 * @property {boolean} isWeekend - Whether it's weekend
 * @property {boolean} isFirstDay - Whether it's first day of cycle
 * @property {boolean} isLastDay - Whether it's last day of phase
 * @property {Object} [custom] - Custom context data
 */

export const TIME_PERIODS = {
  MORNING: 'morning',    // 5am-12pm
  AFTERNOON: 'afternoon', // 12pm-5pm
  EVENING: 'evening',    // 5pm-10pm
  NIGHT: 'night'         // 10pm-5am
};

export const SPECIAL_EVENTS = {
  FIRST_DAY: 'firstDay',
  LAST_DAY: 'lastDay',
  OVULATION: 'ovulation'
};