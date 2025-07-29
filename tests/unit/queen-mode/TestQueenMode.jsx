import React, { useState } from 'react';
import { QueenPhaseDisplay } from '../modes/queen/index.js';
import '../modes/queen/components/QueenMode.css';

const TestQueenMode = () => {
  // Test data for different phases
  const testPhases = [
    { phase: 'menstrual', day: 2, fertility: 5, name: 'Menstrual' },
    { phase: 'follicular', day: 10, fertility: 30, name: 'Follicular' },
    { phase: 'ovulation', day: 14, fertility: 90, name: 'Ovulation' },
    { phase: 'luteal', day: 20, fertility: 20, name: 'Luteal' },
    { phase: 'lateLuteal', day: 24, fertility: 10, name: 'Late Luteal' },
    { phase: 'premenstrual', day: 27, fertility: 5, name: 'Pre-Menstrual' }
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPhase = testPhases[currentIndex];
  
  return (
    <div style={{ 
      backgroundColor: '#1A1A1A', 
      color: '#FFFFFF',
      minHeight: '650px',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '380px', margin: '0 auto' }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#FF1744',
          marginBottom: '20px',
          fontSize: '2rem',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          Queen Mode Test
        </h1>
        
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev + 1) % testPhases.length)}
            style={{ 
              padding: '12px 24px', 
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: '#FF1744',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              textTransform: 'uppercase',
              transition: 'all 150ms ease-in-out'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#F50057'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#FF1744'}
          >
            Next Phase ({currentIndex + 1}/{testPhases.length})
          </button>
          
          <p style={{ 
            marginTop: '10px', 
            color: '#B0B0B0',
            fontSize: '14px'
          }}>
            Testing: {currentPhase.name} Phase
          </p>
        </div>
        
        <QueenPhaseDisplay
          currentPhase={currentPhase.phase}
          cycleDay={currentPhase.day}
          fertilityPercentage={currentPhase.fertility}
          onMoodChange={(mood) => console.log('Mood changed:', mood)}
        />
      </div>
    </div>
  );
};

export default TestQueenMode;