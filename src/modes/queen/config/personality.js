// Queen Mode Personality Configuration
// BadAss attitude with sarcastic black humor

export const queenPersonality = {
  // Core personality traits
  traits: {
    name: 'Queen',
    tagline: 'BadAss with a Crown',
    description: 'First-person female perspective with zero f*cks to give',
    attitude: 'sarcastic',
    humor: 'dark',
    confidence: 'supreme',
    patience: 'non-existent',
    filterLevel: 0  // No filter, full honesty
  },
  
  // Communication style
  communication: {
    perspective: 'first-person',
    tone: 'direct',
    style: 'brutally honest',
    profanityLevel: 'high',
    sarcasmLevel: 'maximum',
    
    // Common expressions
    expressions: {
      greeting: "What fresh hell is this?",
      goodbye: "I'm out, deal with it",
      thanks: "Yeah, whatever",
      sorry: "Sorry not sorry",
      yes: "F*ck yeah",
      no: "Absolutely f*cking not",
      maybe: "I'll think about it... nope"
    },
    
    // Reaction templates
    reactions: {
      pain: "Everything hurts and I'm dying",
      tired: "I'm too tired to be tired",
      angry: "I'm one comment away from violence",
      sad: "I'm not crying, you're crying",
      happy: "I don't hate everything today",
      confused: "What the actual f*ck?",
      frustrated: "I can't even..."
    }
  },
  
  // Behavioral patterns
  behaviors: {
    // How Queen mode handles different situations
    copingMechanisms: [
      'Sarcasm as a defense mechanism',
      'Dark humor to deal with pain',
      'Brutal honesty about feelings',
      'Zero tolerance for BS',
      'Chocolate as medicine'
    ],
    
    // Typical Queen mode actions
    typicalActions: [
      'Eye rolling at maximum capacity',
      'Resting bitch face perfected',
      'Eating feelings without apology',
      'Telling it like it is',
      'Not pretending to be okay'
    ],
    
    // Things Queen mode won't do
    boundaries: [
      'Pretend everything is fine',
      'Apologize for existing',
      'Sugarcoat the truth',
      'Hide the struggle',
      'Care about others\' comfort with reality'
    ]
  },
  
  // Interaction preferences
  interactions: {
    // How Queen mode wants to be treated
    preferences: {
      space: 'Give me all of it',
      communication: 'Text only, no calls',
      support: 'Chocolate and silence',
      validation: 'Just agree with me',
      comfort: 'Heating pad and Netflix'
    },
    
    // Warning signs for others
    warnings: {
      lowPatience: 'Shortened responses',
      preAnger: 'Excessive sarcasm',
      needSpace: 'One-word answers',
      overwhelmed: 'Dark humor overdrive',
      done: 'Complete silence'
    },
    
    // What helps Queen mode
    helpers: {
      physical: ['Heating pad', 'Chocolate', 'Wine', 'Naps', 'Comfy clothes'],
      emotional: ['Validation', 'Space', 'Understanding', 'No judgment', 'Dark humor'],
      practical: ['Delivered food', 'Cancelled plans', 'No questions', 'Remote control', 'Blanket fort']
    }
  },
  
  // Mode-specific features
  features: {
    // UI customizations
    ui: {
      animations: 'dramatic',
      colors: 'bold',
      fonts: 'strong',
      feedback: 'sarcastic',
      confirmations: 'attitude-filled'
    },
    
    // Notification style
    notifications: {
      style: 'blunt',
      frequency: 'minimal',
      content: 'straight to the point',
      timing: 'when absolutely necessary'
    },
    
    // Special Queen mode features
    special: [
      'Rage meter visualization',
      'Sarcasm level indicator',
      'F*cks given counter (always at 0)',
      'Chocolate emergency button',
      'Murder likelihood percentage'
    ]
  },
  
  // Phase-specific personality adjustments
  phaseAdjustments: {
    menstrual: {
      patience: -100,
      sarcasm: +50,
      murderousIntent: +80,
      chocolateNeed: +1000
    },
    follicular: {
      patience: +20,
      sarcasm: 0,
      productivity: +50,
      optimism: +30
    },
    ovulation: {
      patience: -20,
      flirtation: +100,
      energy: +50,
      impulsivity: +80
    },
    luteal: {
      patience: -50,
      irritability: +60,
      fatigue: +70,
      sarcasm: +30
    },
    lateLuteal: {
      patience: -80,
      moodSwings: +100,
      emotionality: +90,
      unpredictability: +100
    },
    premenstrual: {
      patience: -95,
      apocalypseMode: +100,
      survivalInstinct: +100,
      warningLevel: 'MAXIMUM'
    }
  },
  
  // Easter eggs and special responses
  easterEggs: {
    triggers: {
      'how are you': "How do you think I am? Look at the phase.",
      'calm down': "I AM CALM! *throws things*",
      'is it that time': "Did you seriously just ask that?",
      'you okay': "Define 'okay'",
      'smile': "This IS my happy face"
    },
    
    // Special day responses
    specialDays: {
      day1: "The blood moon rises",
      day14: "Peak performance mode activated",
      day28: "The end is near"
    }
  }
};

// Helper functions for personality
export const getQueenResponse = (trigger, phase) => {
  // Check for easter egg triggers
  const easterEgg = queenPersonality.easterEggs.triggers[trigger.toLowerCase()];
  if (easterEgg) return easterEgg;
  
  // Return phase-adjusted response
  const adjustment = queenPersonality.phaseAdjustments[phase];
  if (adjustment && adjustment.warningLevel === 'MAXIMUM') {
    return "Approach at your own risk";
  }
  
  return null;
};

export const getQueenMoodLevel = (phase) => {
  const adjustments = queenPersonality.phaseAdjustments[phase];
  return {
    patience: Math.max(0, 50 + (adjustments?.patience || 0)),
    sarcasm: Math.min(100, 50 + (adjustments?.sarcasm || 0)),
    energy: Math.max(0, 50 + (adjustments?.energy || 0)),
    murderousIntent: Math.min(100, adjustments?.murderousIntent || 0)
  };
};