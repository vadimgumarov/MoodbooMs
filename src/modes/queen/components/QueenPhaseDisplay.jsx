import React, { useState, useEffect } from 'react';
import { queenPhrases, getRandomQueenPhrase, queenPhaseNames } from '../config/phrases';
import { queenTheme, getPhaseColor, getFertilityColor } from '../config/theme';
import { queenPersonality, getQueenMoodLevel } from '../config/personality';

const QueenPhaseDisplay = ({ 
  currentPhase, 
  cycleDay, 
  fertilityPercentage,
  onMoodChange 
}) => {
  const [currentMood, setCurrentMood] = useState('');
  const [currentCraving, setCurrentCraving] = useState(null);
  const [moodLevel, setMoodLevel] = useState({});
  
  // Update mood and craving when phase changes
  useEffect(() => {
    if (currentPhase) {
      // Get random mood message
      const mood = getRandomQueenPhrase(currentPhase, 'moods');
      setCurrentMood(mood || "I'm experiencing technical difficulties");
      
      // Get random craving
      const craving = getRandomQueenPhrase(currentPhase, 'cravings');
      setCurrentCraving(craving);
      
      // Get mood levels for this phase
      const levels = getQueenMoodLevel(currentPhase);
      setMoodLevel(levels);
      
      // Notify parent component if callback provided
      if (onMoodChange && mood) {
        onMoodChange(mood);
      }
    }
  }, [currentPhase, cycleDay, onMoodChange]);
  
  if (!currentPhase) {
    return (
      <div className="queen-phase-display">
        <div className="phase-error">
          <h3 className="danger-text">SYSTEM ERROR</h3>
          <p>My body is being mysterious. Try again later.</p>
        </div>
      </div>
    );
  }
  
  const phaseData = queenPhrases[currentPhase];
  const phaseColor = getPhaseColor(currentPhase);
  const fertilityColor = getFertilityColor(fertilityPercentage);
  
  return (
    <div className="queen-phase-display" style={{ padding: queenTheme.spacing.lg }}>
      {/* Phase Header */}
      <div 
        className={`phase-header phase-${currentPhase}`}
        style={{ 
          backgroundColor: phaseColor,
          padding: queenTheme.spacing.lg,
          borderRadius: queenTheme.borderRadius.lg,
          marginBottom: queenTheme.spacing.lg,
          textAlign: 'center'
        }}
      >
        <h2 className="phase-name" style={{
          fontSize: queenTheme.typography.fontSize['3xl'],
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          {phaseData.name}
        </h2>
        <p className="phase-description" style={{
          fontSize: queenTheme.typography.fontSize.lg,
          margin: `${queenTheme.spacing.sm} 0 0`,
          fontStyle: 'italic'
        }}>
          {phaseData.description}
        </p>
      </div>
      
      {/* Cycle Info */}
      <div className="cycle-info" style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: queenTheme.spacing.xl,
        gap: queenTheme.spacing.lg
      }}>
        <div className="cycle-day" style={{ flex: 1, textAlign: 'center' }}>
          <span className="label" style={{
            display: 'block',
            fontSize: queenTheme.typography.fontSize.sm,
            color: queenTheme.colors.text.secondary,
            marginBottom: queenTheme.spacing.xs
          }}>Day</span>
          <span className="value" style={{
            fontSize: queenTheme.typography.fontSize['2xl'],
            fontWeight: queenTheme.typography.fontWeight.bold,
            color: queenTheme.colors.text.accent
          }}>{cycleDay}</span>
        </div>
        <div className="fertility-status">
          <span className="label">Baby Factory Status</span>
          <div 
            className="fertility-bar"
            style={{ backgroundColor: fertilityColor }}
          >
            <span className="fertility-percentage">
              {fertilityPercentage}% Operational
            </span>
          </div>
        </div>
      </div>
      
      {/* Current Mood */}
      <div className="mood-section">
        <h3>Current Mood</h3>
        <p className={`mood-text ${moodLevel.murderousIntent > 50 ? 'danger-text' : ''}`}>
          {currentMood}
        </p>
      </div>
      
      {/* Current Craving */}
      {currentCraving && (
        <div className="craving-section">
          <h3>Currently Craving</h3>
          <div className="craving-item">
            <span className="craving-icon">
              {/* Icon would be rendered here based on currentCraving.icon */}
              🍫
            </span>
            <span className="craving-text">
              {currentCraving.text}
            </span>
          </div>
        </div>
      )}
      
      {/* Mood Indicators */}
      <div className="mood-indicators">
        <div className="indicator">
          <span className="label">Patience Level</span>
          <div className="indicator-bar">
            <div 
              className="indicator-fill"
              style={{ 
                width: `${moodLevel.patience || 0}%`,
                backgroundColor: moodLevel.patience < 30 ? queenTheme.colors.error : queenTheme.colors.success
              }}
            />
          </div>
        </div>
        
        <div className="indicator">
          <span className="label">Sarcasm Level</span>
          <div className="indicator-bar">
            <div 
              className="indicator-fill"
              style={{ 
                width: `${moodLevel.sarcasm || 50}%`,
                backgroundColor: queenTheme.colors.secondary
              }}
            />
          </div>
        </div>
        
        {moodLevel.murderousIntent > 0 && (
          <div className="indicator danger">
            <span className="label danger-text">Murder Likelihood</span>
            <div className="indicator-bar">
              <div 
                className="indicator-fill pulse"
                style={{ 
                  width: `${moodLevel.murderousIntent}%`,
                  backgroundColor: queenTheme.colors.error
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Special Warnings */}
      {currentPhase === 'premenstrual' && (
        <div className="warning-box danger-text glow">
          ⚠️ MAXIMUM DANGER ZONE ⚠️
          <p>Approach only with chocolate offerings</p>
        </div>
      )}
      
      {currentPhase === 'menstrual' && (
        <div className="warning-box warning-text">
          🩸 Crime Scene in Progress 🩸
          <p>Send supplies, not sympathy</p>
        </div>
      )}
      
      {currentPhase === 'ovulation' && (
        <div className="warning-box" style={{ color: phaseColor }}>
          🔥 Baby Factory: OPEN FOR BUSINESS 🔥
          <p>Hide your men, hide your wine</p>
        </div>
      )}
      
    </div>
  );
};

export default QueenPhaseDisplay;