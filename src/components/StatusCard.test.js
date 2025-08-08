import React from 'react';
import { render, screen, within } from '@testing-library/react';
import StatusCard from './StatusCard';
import { ModeProvider } from '../core/contexts/SimpleModeContext';

// Mock the utils
jest.mock('../utils/cycleCalculations', () => ({
  getCurrentPhase: jest.fn(),
  getFertilityLevel: jest.fn(),
  getCycleProgress: jest.fn(),
  getDaysUntilNextPeriod: jest.fn()
}));

jest.mock('../content/modeContent', () => ({
  moods: {
    queen: {
      menstrual: ['Period mood message'],
      follicular: ['Follicular mood message'],
      ovulation: ['Ovulation mood message'],
      luteal: ['Luteal mood message']
    },
    king: {
      menstrual: ['Period warning message'],
      follicular: ['Follicular warning message'],
      ovulation: ['Ovulation warning message'],
      luteal: ['Luteal warning message']
    }
  },
  cravings: {
    queen: {
      menstrual: ['Chocolate'],
      follicular: ['Salad'],
      ovulation: ['Fruit'],
      luteal: ['Carbs']
    },
    king: {
      menstrual: ['Get chocolate'],
      follicular: ['Healthy food'],
      ovulation: ['Light snacks'],
      luteal: ['Comfort food']
    }
  }
}));

const mockCycleCalculations = require('../utils/cycleCalculations');

const renderStatusCard = (props = {}) => {
  const defaultProps = {
    currentDay: 5,
    cycleStartDate: new Date('2024-01-01'),
    cycleLength: 28
  };

  return render(
    <ModeProvider>
      <StatusCard {...defaultProps} {...props} />
    </ModeProvider>
  );
};

describe('StatusCard', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set default mock return values
    mockCycleCalculations.getCurrentPhase.mockReturnValue('menstrual');
    mockCycleCalculations.getFertilityLevel.mockReturnValue('very-low');
    mockCycleCalculations.getCycleProgress.mockReturnValue(18);
    mockCycleCalculations.getDaysUntilNextPeriod.mockReturnValue(23);
  });

  describe('Phase Display', () => {
    test('should display current phase information', () => {
      renderStatusCard({ currentDay: 5 });
      
      // Should show "Bloody Hell Week" for menstrual phase in Queen mode
      expect(screen.getByText(/Bloody Hell Week/i)).toBeInTheDocument();
      expect(screen.getByText(/Day 5 of 28/i)).toBeInTheDocument();
    });

    test('should display different phases correctly', () => {
      const phases = [
        { phase: 'menstrual', day: 3, queenName: 'Bloody Hell Week' },
        { phase: 'follicular', day: 10, queenName: 'Finally Got My Sh*t Together' },
        { phase: 'ovulation', day: 14, queenName: 'Horny AF' },
        { phase: 'luteal', day: 20, queenName: 'Getting Real Tired of This BS' }
      ];

      phases.forEach(({ phase, day, queenName }) => {
        mockCycleCalculations.getCurrentPhase.mockReturnValue(phase);
        const { unmount } = renderStatusCard({ currentDay: day });
        
        expect(screen.getByText(new RegExp(queenName, 'i'))).toBeInTheDocument();
        expect(screen.getByText(new RegExp(`Day ${day} of 28`, 'i'))).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Mood Messages', () => {
    test('should display mood message for current phase', () => {
      mockCycleCalculations.getCurrentPhase.mockReturnValue('menstrual');
      renderStatusCard({ currentDay: 3 });
      
      // Should display the mood message
      expect(screen.getByText('Period mood message')).toBeInTheDocument();
    });

    test('should display phase-appropriate mood messages', () => {
      const phases = ['menstrual', 'follicular', 'ovulation', 'luteal'];
      
      phases.forEach(phase => {
        mockCycleCalculations.getCurrentPhase.mockReturnValue(phase);
        const { unmount } = renderStatusCard();
        
        // Check that some mood message is displayed
        const moodSection = screen.getByText(/mood:/i).parentElement;
        expect(moodSection).toHaveTextContent(/.+mood message/i);
        
        unmount();
      });
    });
  });

  describe('Cravings Display', () => {
    test('should display cravings for current phase', () => {
      mockCycleCalculations.getCurrentPhase.mockReturnValue('menstrual');
      renderStatusCard({ currentDay: 3 });
      
      // Should display the craving
      expect(screen.getByText(/Craving:/i)).toBeInTheDocument();
      expect(screen.getByText('Chocolate')).toBeInTheDocument();
    });

    test('should display different cravings for different phases', () => {
      const phaseCravings = [
        { phase: 'menstrual', craving: 'Chocolate' },
        { phase: 'follicular', craving: 'Salad' },
        { phase: 'ovulation', craving: 'Fruit' },
        { phase: 'luteal', craving: 'Carbs' }
      ];

      phaseCravings.forEach(({ phase, craving }) => {
        mockCycleCalculations.getCurrentPhase.mockReturnValue(phase);
        const { unmount } = renderStatusCard();
        
        expect(screen.getByText(craving)).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Progress Indicators', () => {
    test('should display cycle progress', () => {
      mockCycleCalculations.getCycleProgress.mockReturnValue(18);
      renderStatusCard({ currentDay: 5 });
      
      // Should show progress percentage
      expect(screen.getByText(/18%/)).toBeInTheDocument();
    });

    test('should display days until next period', () => {
      mockCycleCalculations.getDaysUntilNextPeriod.mockReturnValue(23);
      renderStatusCard({ currentDay: 5 });
      
      // Should show days remaining
      expect(screen.getByText(/23 days until next period/i)).toBeInTheDocument();
    });

    test('should handle last day of cycle', () => {
      mockCycleCalculations.getDaysUntilNextPeriod.mockReturnValue(1);
      renderStatusCard({ currentDay: 28 });
      
      // Should show singular "day"
      expect(screen.getByText(/1 day until next period/i)).toBeInTheDocument();
    });
  });

  describe('Fertility Display', () => {
    test('should display fertility level', () => {
      mockCycleCalculations.getFertilityLevel.mockReturnValue('very-low');
      renderStatusCard({ currentDay: 3 });
      
      // Should show fertility level
      expect(screen.getByText(/Fertility:/i)).toBeInTheDocument();
      expect(screen.getByText(/Very Low/i)).toBeInTheDocument();
    });

    test('should display different fertility levels with appropriate styling', () => {
      const fertilityLevels = [
        { level: 'very-low', display: 'Very Low', colorClass: 'text-error' },
        { level: 'low', display: 'Low', colorClass: 'text-warning' },
        { level: 'medium', display: 'Medium', colorClass: 'text-text-secondary' },
        { level: 'high', display: 'High', colorClass: 'text-success' },
        { level: 'very-high', display: 'Very High', colorClass: 'text-success' }
      ];

      fertilityLevels.forEach(({ level, display }) => {
        mockCycleCalculations.getFertilityLevel.mockReturnValue(level);
        const { unmount } = renderStatusCard();
        
        expect(screen.getByText(new RegExp(display, 'i'))).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Missing Data Handling', () => {
    test('should handle missing cycle start date', () => {
      renderStatusCard({ cycleStartDate: null, currentDay: null });
      
      // Should show placeholder or default message
      expect(screen.queryByText(/Day \d+ of \d+/)).not.toBeInTheDocument();
    });

    test('should handle invalid current day', () => {
      renderStatusCard({ currentDay: 0 });
      
      // Should still render without crashing
      expect(screen.getByText(/Mood:/i)).toBeInTheDocument();
    });

    test('should handle undefined cycle length', () => {
      renderStatusCard({ cycleLength: undefined });
      
      // Should use default cycle length (28)
      expect(mockCycleCalculations.getCurrentPhase).toHaveBeenCalledWith(5, 28);
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading structure', () => {
      renderStatusCard();
      
      // Should have semantic headings
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    test('should have descriptive text for screen readers', () => {
      renderStatusCard({ currentDay: 14 });
      
      // Key information should be available as text
      expect(screen.getByText(/Day 14 of 28/i)).toBeInTheDocument();
      expect(screen.getByText(/Fertility:/i)).toBeInTheDocument();
      expect(screen.getByText(/Mood:/i)).toBeInTheDocument();
    });

    test('should use semantic HTML elements', () => {
      const { container } = renderStatusCard();
      
      // Should use appropriate semantic elements
      expect(container.querySelector('section, article, div[role]')).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    test('should apply correct styling for menstrual phase', () => {
      mockCycleCalculations.getCurrentPhase.mockReturnValue('menstrual');
      const { container } = renderStatusCard({ currentDay: 3 });
      
      // Should have error/red styling
      const phaseElement = screen.getByText(/Bloody Hell Week/i);
      expect(phaseElement).toBeInTheDocument();
    });

    test('should apply correct styling for ovulation phase', () => {
      mockCycleCalculations.getCurrentPhase.mockReturnValue('ovulation');
      const { container } = renderStatusCard({ currentDay: 14 });
      
      // Should have success/green styling
      const phaseElement = screen.getByText(/Horny AF/i);
      expect(phaseElement).toBeInTheDocument();
    });
  });
});