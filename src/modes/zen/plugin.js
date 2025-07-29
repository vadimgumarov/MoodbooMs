/**
 * Zen Mode Plugin
 * 
 * A calm, mindful approach to cycle tracking with meditation-inspired language
 */

export const ZenModePlugin = {
  // Metadata
  id: 'zen',
  name: 'Zen Mode',
  description: 'Peaceful, mindful cycle tracking with gentle wisdom and calm insights',
  version: '1.0.0',
  author: 'MoodBooMs Team',
  
  // Configuration
  config: {
    phaseNames: {
      menstrual: 'Moon Time',
      follicular: 'Spring Awakening',
      ovulation: 'Full Bloom',
      luteal: 'Autumn Harvest',
      lateLuteal: 'Waning Light',
      premenstrual: 'Inner Storm'
    },
    
    uiText: {
      moodLabel: 'Inner State',
      cravingLabel: 'Body Wisdom',
      calendarTitle: 'Lunar Journey',
      calendarDescription: 'Follow your natural rhythm',
      historyTitle: 'Past Cycles',
      settingsTitle: 'Preferences'
    },
    
    features: {
      showMoodMessages: true,
      showCravings: true,
      showFertilityInfo: false, // More subtle approach
      enableAnimations: true,
      enableSounds: true // Gentle chimes
    }
  },
  
  // Theme
  theme: {
    name: 'Zen Mode Theme',
    mode: 'zen',
    
    colors: {
      // Calming, natural colors
      primary: '#4ECDC4',      // Serene teal
      secondary: '#95E1D3',    // Soft mint
      tertiary: '#C7CEEA',     // Lavender mist
      
      background: '#FAF9F7',
      surface: '#FFFFFF',
      surfaceAlt: '#F5F3F0',
      
      text: '#2C3E50',
      textSecondary: '#7F8C8D',
      textOnPrimary: '#FFFFFF',
      textOnSecondary: '#2C3E50',
      
      border: '#E8E6E3',
      borderLight: '#F0EFED',
      
      error: '#E74C3C',
      warning: '#F39C12',
      success: '#27AE60',
      info: '#3498DB',
      
      // Gentle phase colors
      phases: {
        menstrual: '#D4A5A5',    // Dusty rose
        follicular: '#A8D8EA',   // Sky blue
        ovulation: '#95E1D3',    // Mint green
        luteal: '#FFAAA5',       // Coral
        lateLuteal: '#C7CEEA',   // Lavender
        premenstrual: '#B8B5AD'  // Stone gray
      },
      
      hover: {
        primary: '#45B7AA',
        secondary: '#7FD1C3'
      },
      
      gradients: {
        primary: 'linear-gradient(135deg, #4ECDC4 0%, #95E1D3 100%)',
        secondary: 'linear-gradient(135deg, #C7CEEA 0%, #95E1D3 100%)',
        hero: 'linear-gradient(135deg, #4ECDC4 0%, #95E1D3 50%, #C7CEEA 100%)'
      }
    },
    
    typography: {
      fontFamily: '"Quicksand", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      headingFontFamily: '"Comfortaa", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '1.5rem',
        xxxl: '2rem'
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeights: {
        tight: 1.4,
        normal: 1.6,
        relaxed: 1.8
      }
    },
    
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem'
    },
    
    borderRadius: {
      sm: '0.375rem',
      md: '0.625rem',
      lg: '1rem',
      xl: '1.5rem',
      full: '9999px',
      button: '2rem',
      card: '1rem'
    },
    
    shadows: {
      sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
      md: '0 4px 8px rgba(0, 0, 0, 0.08)',
      lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
      glow: '0 0 20px rgba(78, 205, 196, 0.2)',
      button: '0 4px 8px rgba(78, 205, 196, 0.15)'
    },
    
    transitions: {
      fast: '200ms ease-out',
      normal: '400ms ease-out',
      slow: '600ms ease-out',
      bounce: '400ms cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    animations: {
      modeSwitch: 'zenFadeIn 800ms ease-out',
      fadeIn: 'fadeIn 400ms ease-out',
      slideIn: 'slideInBottom 600ms ease-out',
      pulse: 'gentlePulse 4s ease-in-out infinite',
      bounce: 'none'
    }
  },
  
  // Phrases
  phrases: {
    phrases: {
      menstrual: {
        moods: [
          "Honoring the sacred pause in your cycle",
          "Rest deeply, your body is renewing itself",
          "This is a time for gentle self-care",
          "Listen to your body's wisdom",
          "Release what no longer serves you",
          "Embrace the quietude within",
          "Your energy turns inward for healing",
          "Trust in your body's natural rhythm",
          "Allow yourself to simply be",
          "This too shall pass, like waves on the shore"
        ],
        cravings: [
          "Warm herbal tea and quiet moments",
          "Nourishing soups and gentle comfort",
          "Dark chocolate and self-compassion",
          "Cozy blankets and healing rest",
          "Iron-rich foods and deep breaths",
          "Warming spices and gentle movement",
          "Magnesium-rich treats and meditation",
          "Comfort foods without judgment",
          "Whatever brings you peace",
          "Trust what your body asks for"
        ]
      },
      follicular: {
        moods: [
          "New energy rises like the morning sun",
          "Fresh possibilities bloom within you",
          "Your spirit awakens with renewed clarity",
          "Creativity flows like a gentle stream",
          "Each day brings growing vitality",
          "Plant seeds of intention now",
          "Your inner light grows brighter",
          "Welcome this season of renewal",
          "Energy returns like spring after winter",
          "Feel the life force awakening within"
        ],
        cravings: [
          "Fresh fruits and morning sunshine",
          "Green smoothies and new beginnings",
          "Light salads and creative projects",
          "Citrus flavors and joyful movement",
          "Raw vegetables and clear intentions",
          "Spring water and fresh perspectives",
          "Whole grains and steady energy",
          "Berries and moments of gratitude",
          "Leafy greens and gentle growth",
          "Whatever makes you feel alive"
        ]
      },
      ovulation: {
        moods: [
          "You radiate like the full moon",
          "Your energy peaks in perfect harmony",
          "Connection flows effortlessly now",
          "You bloom in full magnificence",
          "Share your light with the world",
          "Your presence is a gift",
          "Abundance flows through you",
          "You are perfectly aligned",
          "Your inner goddess shines bright",
          "Celebrate this peak of vitality"
        ],
        cravings: [
          "Vibrant colors and joyful flavors",
          "Social gatherings and shared meals",
          "Fresh herbs and bright energy",
          "Tropical fruits and sunny days",
          "Whatever celebrates life",
          "Foods that make you smile",
          "Light and energizing meals",
          "Colorful produce and laughter",
          "Refreshing drinks and connection",
          "Nourishment that matches your glow"
        ]
      },
      luteal: {
        moods: [
          "Energy begins its gentle descent",
          "Time to harvest what you've sown",
          "Your intuition deepens like still water",
          "Honor the shift toward introspection",
          "Wisdom emerges from within",
          "You enter the temple of inner knowing",
          "Trust the slowing of your pace",
          "This is sacred preparation time",
          "Your body prepares for transformation",
          "Embrace this quieter rhythm"
        ],
        cravings: [
          "Grounding root vegetables",
          "Warming soups and self-reflection",
          "Complex carbs and cozy evenings",
          "Comfort foods and gentle boundaries",
          "Hearty stews and quiet time",
          "Sweet potatoes and self-care",
          "Whole grains and steady presence",
          "Nuts and seeds for stability",
          "Whatever grounds you",
          "Foods that feel like a warm hug"
        ]
      },
      lateLuteal: {
        moods: [
          "The veil between worlds grows thin",
          "Deep truths surface for healing",
          "Your sensitivity is a superpower",
          "Honor the messages from within",
          "You stand at the threshold of change",
          "Emotions are teachers in disguise",
          "Trust this sacred unraveling",
          "Your intuition speaks loudly now",
          "This intensity serves a purpose",
          "You are exactly where you need to be"
        ],
        cravings: [
          "Magnesium-rich dark chocolate",
          "Calming teas and quiet spaces",
          "Mineral-rich broths and solitude",
          "Whatever soothes your soul",
          "Gentle carbs and self-compassion",
          "Warm baths and nourishing foods",
          "Comfort without guilt",
          "B-vitamin rich foods and rest",
          "Whatever your body wisdom requests",
          "Trust your deepest cravings"
        ]
      },
      premenstrual: {
        moods: [
          "The storm before the calm approaches",
          "Your power gathers like thunder",
          "Truth cuts through illusion now",
          "Honor the fierce wisdom within",
          "You are the storm and the shelter",
          "This intensity is transformation",
          "Let emotions flow like rain",
          "Your authenticity cannot be contained",
          "Trust the process of release",
          "Soon, the cycle begins anew"
        ],
        cravings: [
          "Whatever brings comfort now",
          "Salt, sweet, and everything between",
          "Your cravings are valid messages",
          "Indulge with loving awareness",
          "Complex carbs and deep breathing",
          "Chocolate and self-acceptance",
          "Salty snacks and boundaries",
          "Comfort foods and compassion",
          "Trust your body completely",
          "You know what you need"
        ]
      }
    },
    minPhrasesPerPhase: 10
  },
  
  // Lifecycle hooks
  onActivate: async () => {
    console.log('[Zen Mode] Welcome to your peaceful journey 🤍');
  },
  
  onDeactivate: async () => {
    console.log('[Zen Mode] Until we meet again on the path');
  },
  
  // Custom settings
  settings: {
    meditationReminders: {
      type: 'toggle',
      label: 'Daily Meditation Reminders',
      default: true,
      description: 'Gentle reminders for mindful moments'
    },
    zenSounds: {
      type: 'toggle',
      label: 'Calming Sounds',
      default: true,
      description: 'Play gentle chimes and nature sounds'
    },
    affirmationStyle: {
      type: 'select',
      label: 'Affirmation Style',
      options: [
        { value: 'gentle', label: 'Gentle & Nurturing' },
        { value: 'empowering', label: 'Empowering & Strong' },
        { value: 'minimal', label: 'Simple & Minimal' }
      ],
      default: 'gentle',
      description: 'Choose your preferred message style'
    }
  },
  
  // Requirements
  requirements: {
    minAppVersion: '1.0.0',
    dependencies: []
  }
};