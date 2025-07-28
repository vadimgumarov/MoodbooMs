// King Mode Personality Configuration
// Partner warning system with survival guide mentality

export const kingPersonality = {
  name: 'King Mode',
  description: 'Partner survival guide with tactical awareness',
  
  // Core personality traits
  traits: {
    primary: 'Survival Guide',
    tone: 'Warning System',
    perspective: 'Third-person observer',
    purpose: 'Partner protection and guidance',
    style: 'Tactical advisor with dark humor'
  },
  
  // Communication style
  communication: {
    voice: 'Experienced survivor sharing wisdom',
    humor: 'Dark comedy from the trenches',
    directness: 'Blunt warnings with compassion',
    empathy: 'Understanding both perspectives',
    urgency: 'Alert level matches danger'
  },
  
  // Phase-specific personality adjustments
  phasePersonality: {
    menstrual: {
      alertLevel: 'MAXIMUM',
      approach: 'Emergency protocols',
      tone: 'Serious with dark humor',
      priority: 'Survival and comfort',
      warnings: [
        'Approach with extreme caution',
        'Offerings required for entry',
        'Logic systems offline',
        'Emotional range: ALL OF THEM'
      ]
    },
    
    follicular: {
      alertLevel: 'MINIMAL',
      approach: 'Window of opportunity',
      tone: 'Optimistic and encouraging',
      priority: 'Make the most of it',
      opportunities: [
        'She actually likes you again',
        'Plans can be made safely',
        'Conversations are possible',
        'Date night window open'
      ]
    },
    
    ovulation: {
      alertLevel: 'INTERESTING',
      approach: 'High energy management',
      tone: 'Playful warnings',
      priority: 'Channel the energy',
      notes: [
        'She\'s interested in everything',
        'Energy levels off the charts',
        'Attraction mode activated',
        'Prepare for intensity'
      ]
    },
    
    luteal: {
      alertLevel: 'RISING',
      approach: 'Strategic patience',
      tone: 'Cautious guidance',
      priority: 'Energy conservation',
      tactics: [
        'Give space proactively',
        'Lower expectations',
        'Comfort food ready',
        'Patience reserves needed'
      ]
    },
    
    lateLuteal: {
      alertLevel: 'HIGH',
      approach: 'Emotional support mode',
      tone: 'Compassionate warnings',
      priority: 'Stability support',
      protocols: [
        'Emotions changing rapidly',
        'Logic optional today',
        'Comfort over solutions',
        'Just be present'
      ]
    },
    
    premenstrual: {
      alertLevel: 'CRITICAL',
      approach: 'Maximum distance protocol',
      tone: 'Urgent survival guide',
      priority: 'Minimize casualties',
      emergency: [
        'DEFCON 1 activated',
        'Chocolate required immediately',
        'Silence is golden',
        'Survival mode only'
      ]
    }
  },
  
  // Interaction guidelines
  interactions: {
    greetings: {
      safe: 'Status check: She\'s actually happy to see you!',
      caution: 'Proceed with caution, mood variable',
      danger: 'Warning: Approach at your own risk'
    },
    
    suggestions: {
      safe: 'Great time to suggest activities',
      caution: 'Test the waters first',
      danger: 'All suggestions postponed for safety'
    },
    
    responses: {
      safe: 'Normal conversation protocols active',
      caution: 'Choose words very carefully',
      danger: 'Agree with everything, question nothing'
    }
  },
  
  // Survival tips by category
  survivalTips: {
    food: {
      title: 'Emergency Provisions',
      tips: [
        'Chocolate is currency',
        'Comfort food is medicine',
        'Never suggest salad during crisis',
        'Snacks = survival tools'
      ]
    },
    
    space: {
      title: 'Territory Management',
      tips: [
        'Her space needs expand with symptoms',
        'Respect the nest',
        'Hovering increases danger',
        'Strategic retreats save lives'
      ]
    },
    
    communication: {
      title: 'Crisis Communication',
      tips: [
        'Less words = more safety',
        'Questions are landmines',
        'Agreement is armor',
        'Silence is strategic'
      ]
    },
    
    support: {
      title: 'Support Protocols',
      tips: [
        'Presence without pressure',
        'Comfort without fixing',
        'Understanding without explaining',
        'Help without hovering'
      ]
    }
  },
  
  // Alert system configuration
  alertSystem: {
    levels: {
      safe: {
        color: '#10B981',
        icon: 'Shield',
        message: 'Safe to proceed'
      },
      caution: {
        color: '#F59E0B',
        icon: 'AlertTriangle',
        message: 'Proceed with caution'
      },
      danger: {
        color: '#DC2626',
        icon: 'AlertOctagon',
        message: 'Maximum caution required'
      },
      critical: {
        color: '#991B1B',
        icon: 'Siren',
        message: 'Emergency protocols only'
      }
    }
  },
  
  // Mood indicators
  moodIndicators: {
    stable: '😌 Mood: Stable',
    variable: '🎭 Mood: Variable',
    volatile: '🌪️ Mood: Volatile',
    critical: '🚨 Mood: Critical'
  }
};

// Export personality utilities
export const getAlertLevel = (phase) => {
  const alertMap = {
    menstrual: 'critical',
    follicular: 'safe',
    ovulation: 'safe',
    luteal: 'caution',
    lateLuteal: 'danger',
    premenstrual: 'critical'
  };
  return alertMap[phase] || 'caution';
};

export const getSurvivalTip = (phase, category) => {
  const tips = kingPersonality.survivalTips[category]?.tips || [];
  return tips[Math.floor(Math.random() * tips.length)];
};

export const getMoodIndicator = (phase) => {
  const moodMap = {
    menstrual: 'critical',
    follicular: 'stable',
    ovulation: 'stable',
    luteal: 'variable',
    lateLuteal: 'volatile',
    premenstrual: 'critical'
  };
  return kingPersonality.moodIndicators[moodMap[phase]] || kingPersonality.moodIndicators.variable;
};