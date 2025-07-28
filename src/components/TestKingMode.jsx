import React, { useState } from 'react';
import KingModeWrapper from '../modes/king/components/KingModeWrapper';
import KingPhaseDisplay from '../modes/king/components/KingPhaseDisplay';
import { kingPhrases, getRandomKingPhrase } from '../modes/king/config/phrases';
import '../modes/king/components/KingMode.css';

const TestKingMode = () => {
  const phases = ['menstrual', 'follicular', 'ovulation', 'luteal', 'lateLuteal', 'premenstrual'];
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const currentPhase = phases[currentPhaseIndex];
  const phaseData = kingPhrases[currentPhase];
  
  const mood = getRandomKingPhrase(currentPhase, 'moods');
  const craving = getRandomKingPhrase(currentPhase, 'cravings');
  
  // Simulate fertility based on phase
  const fertilityMap = {
    menstrual: 5,
    follicular: 20,
    ovulation: 95,
    luteal: 30,
    lateLuteal: 15,
    premenstrual: 10
  };
  
  return (
    <KingModeWrapper>
      <div style={{ padding: '20px', minHeight: '100vh' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--king-primary)' }}>
          King Mode Test
        </h1>
        
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button 
            onClick={() => setCurrentPhaseIndex((prev) => (prev + 1) % phases.length)}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: 'var(--king-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Next Phase
          </button>
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--king-secondary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Random Mood/Craving
          </button>
        </div>
        
        <KingPhaseDisplay 
          key={refreshKey}
          phase={{
            phase: currentPhase,
            description: phaseData.description
          }}
          mood={mood}
          craving={craving}
          fertility={fertilityMap[currentPhase]}
        />
        
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          backgroundColor: 'var(--king-surface)',
          borderRadius: '8px',
          border: '1px solid var(--king-border)'
        }}>
          <h3 style={{ color: 'var(--king-accent)', marginBottom: '10px' }}>Phase Info:</h3>
          <p><strong>Phase Key:</strong> {currentPhase}</p>
          <p><strong>Phase Name:</strong> {phaseData.name}</p>
          <p><strong>Calendar Tooltip:</strong> {phaseData.calendarTooltip}</p>
          <p><strong>Total Moods:</strong> {phaseData.moods.length}</p>
          <p><strong>Total Cravings:</strong> {phaseData.cravings.length}</p>
        </div>
      </div>
    </KingModeWrapper>
  );
};

export default TestKingMode;