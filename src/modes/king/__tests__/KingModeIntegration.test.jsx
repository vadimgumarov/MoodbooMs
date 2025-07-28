import React from 'react';
import { render, screen } from '@testing-library/react';
import KingModeWrapper from '../components/KingModeWrapper';
import KingPhaseDisplay from '../components/KingPhaseDisplay';
import { kingPhrases, kingPhaseNames } from '../config/phrases';

describe('King Mode Integration', () => {
  test('should render King mode wrapper', () => {
    const { container } = render(
      <KingModeWrapper>
        <div>Test Content</div>
      </KingModeWrapper>
    );
    
    expect(container.querySelector('.king-mode-wrapper')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  test('should render King phase display with menstrual phase', () => {
    const phase = {
      phase: 'menstrual', // Use phase key, not name
      description: kingPhrases.menstrual.description
    };
    
    const mood = kingPhrases.menstrual.moods[0];
    const craving = kingPhrases.menstrual.cravings[0];
    
    render(
      <KingPhaseDisplay 
        phase={phase}
        mood={mood}
        craving={craving}
        fertility={5}
      />
    );
    
    expect(screen.getByText('menstrual')).toBeInTheDocument(); // Phase name shown directly
    expect(screen.getByText(phase.description)).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    expect(screen.getByText('Current Situation')).toBeInTheDocument();
    expect(screen.getByText(mood)).toBeInTheDocument();
    expect(screen.getByText('Survival Tip')).toBeInTheDocument();
    expect(screen.getByText('Recommended Offerings')).toBeInTheDocument();
    expect(screen.getByText(craving.text)).toBeInTheDocument();
    expect(screen.getByText('EMERGENCY PROTOCOLS ACTIVE')).toBeInTheDocument();
  });
  
  test('should render King phase display with safe phase', () => {
    const phase = {
      phase: 'follicular', // Use phase key, not name
      description: kingPhrases.follicular.description
    };
    
    const mood = kingPhrases.follicular.moods[0];
    const craving = kingPhrases.follicular.cravings[0];
    
    render(
      <KingPhaseDisplay 
        phase={phase}
        mood={mood}
        craving={craving}
        fertility={10}
      />
    );
    
    expect(screen.getByText('follicular')).toBeInTheDocument(); // Phase name shown directly
    expect(screen.getByText('SAFE')).toBeInTheDocument();
    // Should not show emergency protocols for safe phase
    expect(screen.queryByText('EMERGENCY PROTOCOLS ACTIVE')).not.toBeInTheDocument();
  });
  
  test('should apply King mode theme styles', () => {
    const { container } = render(
      <KingModeWrapper>
        <KingPhaseDisplay 
          phase={{
            phase: 'menstrual', // Use phase key, not name
            description: kingPhrases.menstrual.description
          }}
          mood={kingPhrases.menstrual.moods[0]}
          craving={kingPhrases.menstrual.cravings[0]}
          fertility={5}
        />
      </KingModeWrapper>
    );
    
    const wrapper = container.querySelector('.king-mode-wrapper');
    expect(wrapper).toBeInTheDocument();
    
    const alertPattern = container.querySelector('.alert-pattern');
    expect(alertPattern).toBeInTheDocument();
    
    const phaseDisplay = container.querySelector('.king-phase-display');
    expect(phaseDisplay).toBeInTheDocument();
  });
});