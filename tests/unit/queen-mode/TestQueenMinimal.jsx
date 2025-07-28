import React, { useEffect, useRef } from 'react';
import logger from '../utils/crashLogger';

// Import only the static data to test
import { queenPhrases } from '../modes/queen/config/phrases.js';
import { queenTheme } from '../modes/queen/config/theme.js';

let renderCount = 0;

const TestQueenMinimal = () => {
  const mountTimeRef = useRef(Date.now());
  
  renderCount++;
  logger.info(`TestQueenMinimal render #${renderCount}`, {
    timeSinceMount: Date.now() - mountTimeRef.current
  });
  
  if (renderCount > 50) {
    logger.error('EXCESSIVE RENDERS DETECTED', { renderCount });
    return <div>Error: Too many renders</div>;
  }
  
  useEffect(() => {
    logger.pushComponent('TestQueenMinimal');
    logger.info('TestQueenMinimal mounted', {
      hasQueenPhrases: !!queenPhrases,
      hasQueenTheme: !!queenTheme,
      renderCount
    });
    
    return () => {
      logger.popComponent('TestQueenMinimal');
    };
  }, []);
  // Hard-code a phase to test
  const testPhase = 'menstrual';
  const phaseData = queenPhrases[testPhase];
  
  if (!phaseData) {
    return <div>Error: Phase data not found</div>;
  }
  
  return (
    <div style={{ 
      backgroundColor: '#1A1A1A',
      color: '#FFFFFF',
      minHeight: '650px',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <h1 style={{ color: '#FF1744', textAlign: 'center' }}>
        Queen Mode - Minimal Test
      </h1>
      
      <div style={{ 
        backgroundColor: '#B71C1C',
        padding: '20px',
        borderRadius: '8px',
        margin: '20px 0',
        textAlign: 'center'
      }}>
        <h2>{phaseData.name}</h2>
        <p>{phaseData.description}</p>
      </div>
      
      <div>
        <h3>Sample Moods:</h3>
        <ul>
          {phaseData.moods.slice(0, 5).map((mood, i) => (
            <li key={i} style={{ marginBottom: '10px' }}>{mood}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3>Sample Cravings:</h3>
        <ul>
          {phaseData.cravings.slice(0, 3).map((craving, i) => (
            <li key={i} style={{ marginBottom: '10px' }}>
              {craving.text}
            </li>
          ))}
        </ul>
      </div>
      
      <p style={{ marginTop: '30px', color: '#B0B0B0', textAlign: 'center' }}>
        Theme primary color: {queenTheme?.colors?.primary || 'not loaded'}
      </p>
    </div>
  );
};

export default TestQueenMinimal;