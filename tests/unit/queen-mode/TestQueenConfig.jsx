import React, { useState, useEffect } from 'react';
import { 
  queenPhrases, 
  getRandomQueenPhrase,
  queenTheme,
  getPhaseColor,
  getFertilityColor,
  getQueenMoodLevel
} from '../modes/queen/index-config.js';

const TestQueenConfig = () => {
  const phases = ['menstrual', 'follicular', 'ovulation', 'luteal', 'lateLuteal', 'premenstrual'];
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentMood, setCurrentMood] = useState('');
  const [currentCraving, setCurrentCraving] = useState(null);
  
  const currentPhase = phases[currentPhaseIndex];
  const phaseData = queenPhrases[currentPhase];
  const phaseColor = getPhaseColor(currentPhase);
  const moodLevel = getQueenMoodLevel(currentPhase);
  
  useEffect(() => {
    // Get random mood and craving for current phase
    const mood = getRandomQueenPhrase(currentPhase, 'moods');
    const craving = getRandomQueenPhrase(currentPhase, 'cravings');
    setCurrentMood(mood);
    setCurrentCraving(craving);
  }, [currentPhase]);
  
  const nextPhase = () => {
    setCurrentPhaseIndex((prev) => (prev + 1) % phases.length);
  };
  
  return (
    <div style={{ 
      backgroundColor: queenTheme.colors.background,
      color: queenTheme.colors.text.primary,
      minHeight: '650px',
      padding: '20px',
      fontFamily: queenTheme.typography.fontFamily.primary
    }}>
      <div style={{ maxWidth: '380px', margin: '0 auto' }}>
        <h1 style={{ 
          textAlign: 'center',
          color: queenTheme.colors.primary,
          fontSize: '2rem',
          fontWeight: '900',
          marginBottom: '20px'
        }}>
          👑 Queen Mode Config Test
        </h1>
        
        <div style={{ 
          backgroundColor: phaseColor,
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
            {phaseData.name}
          </h2>
          <p style={{ margin: '10px 0 0', fontStyle: 'italic' }}>
            {phaseData.description}
          </p>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: queenTheme.colors.text.accent }}>Current Mood:</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            {currentMood}
          </p>
        </div>
        
        {currentCraving && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: queenTheme.colors.text.accent }}>Craving:</h3>
            <p style={{ fontSize: '1.1rem' }}>
              {currentCraving.text}
            </p>
          </div>
        )}
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: queenTheme.colors.text.accent }}>Mood Levels:</h3>
          <div>
            <p>Patience: {moodLevel.patience}%</p>
            <p>Sarcasm: {moodLevel.sarcasm}%</p>
            {moodLevel.murderousIntent > 0 && (
              <p style={{ color: queenTheme.colors.error }}>
                Murder Likelihood: {moodLevel.murderousIntent}%
              </p>
            )}
          </div>
        </div>
        
        <button 
          onClick={nextPhase}
          style={{ 
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: queenTheme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}
        >
          Next Phase ({currentPhaseIndex + 1}/{phases.length})
        </button>
      </div>
    </div>
  );
};

export default TestQueenConfig;