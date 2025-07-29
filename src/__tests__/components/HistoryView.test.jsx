import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { format } from 'date-fns';
import HistoryView from '../HistoryView';

// Mock the cycle history utilities
jest.mock('../../../core/utils/cycleHistory', () => ({
  calculateCycleStatistics: jest.fn(),
  getRecentCycles: jest.fn(),
  predictNextCycleStart: jest.fn()
}));

import { 
  calculateCycleStatistics, 
  getRecentCycles,
  predictNextCycleStart 
} from '../../../core/utils/cycleHistory';

describe('HistoryView Component', () => {
  const mockOnPeriodStart = jest.fn();
  const mockCurrentCycleStart = new Date('2025-07-01');

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    calculateCycleStatistics.mockReturnValue({
      averageLength: 28,
      shortestCycle: 27,
      longestCycle: 29,
      totalCycles: 3,
      completedCycles: 2,
      cycleRegularity: 'regular',
      standardDeviation: 1.2
    });
    
    getRecentCycles.mockReturnValue([]);
    predictNextCycleStart.mockReturnValue(new Date('2025-07-29'));
  });

  test('renders cycle statistics', () => {
    render(
      <HistoryView 
        cycleHistory={[]} 
        currentCycleStart={mockCurrentCycleStart}
        onPeriodStart={mockOnPeriodStart}
      />
    );

    expect(screen.getByText('Cycle Statistics')).toBeInTheDocument();
    expect(screen.getByText('28 days')).toBeInTheDocument(); // Average length
    expect(screen.getByText('Regular')).toBeInTheDocument(); // Regularity
    expect(screen.getByText('27 days')).toBeInTheDocument(); // Shortest
    expect(screen.getByText('29 days')).toBeInTheDocument(); // Longest
  });

  test('shows insufficient data when no cycles completed', () => {
    calculateCycleStatistics.mockReturnValue({
      averageLength: null,
      shortestCycle: null,
      longestCycle: null,
      totalCycles: 0,
      completedCycles: 0,
      cycleRegularity: 'insufficient-data'
    });

    render(
      <HistoryView 
        cycleHistory={[]} 
        currentCycleStart={mockCurrentCycleStart}
        onPeriodStart={mockOnPeriodStart}
      />
    );

    expect(screen.getAllByText('-- days')).toHaveLength(3); // Average, shortest, longest
    expect(screen.getByText('Calculating...')).toBeInTheDocument();
  });

  test('displays next period prediction', () => {
    const nextDate = new Date('2025-07-29');
    predictNextCycleStart.mockReturnValue(nextDate);

    render(
      <HistoryView 
        cycleHistory={[{id: 'test'}]} 
        currentCycleStart={mockCurrentCycleStart}
        onPeriodStart={mockOnPeriodStart}
      />
    );

    expect(screen.getByText('Next Period Prediction')).toBeInTheDocument();
    expect(screen.getByText(format(nextDate, 'MMMM d, yyyy'))).toBeInTheDocument();
  });

  test('shows empty state when no cycle history', () => {
    getRecentCycles.mockReturnValue([]);

    render(
      <HistoryView 
        cycleHistory={[]} 
        currentCycleStart={mockCurrentCycleStart}
        onPeriodStart={mockOnPeriodStart}
      />
    );

    expect(screen.getByText('No cycle history yet')).toBeInTheDocument();
    expect(screen.getByText('Your cycles will appear here as you track them')).toBeInTheDocument();
  });

  test('displays recent cycles', () => {
    const mockCycles = [
      {
        id: 'cycle-1',
        startDate: '2025-07-01T00:00:00.000Z',
        cycleLength: 28,
        actualLength: null,
        notes: {},
        symptoms: {}
      },
      {
        id: 'cycle-2',
        startDate: '2025-06-01T00:00:00.000Z',
        cycleLength: 28,
        actualLength: 28,
        notes: { '2025-06-05': 'Note' },
        symptoms: { '2025-06-03': ['cramps'] }
      }
    ];

    getRecentCycles.mockReturnValue(mockCycles);

    render(
      <HistoryView 
        cycleHistory={mockCycles} 
        currentCycleStart={mockCurrentCycleStart}
        onPeriodStart={mockOnPeriodStart}
      />
    );

    // getRecentCycles returns the cycles, and the component formats the dates
    expect(screen.getByText(format(new Date('2025-07-01'), 'MMM d, yyyy'))).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText(format(new Date('2025-06-01'), 'MMM d, yyyy'))).toBeInTheDocument();
    // Check for the completed cycle length
    const dayElements = screen.getAllByText('28 days');
    expect(dayElements.length).toBeGreaterThan(0);
  });

  test('shows cycle length variance', () => {
    const mockCycles = [
      {
        id: 'cycle-1',
        startDate: '2025-06-01T00:00:00.000Z',
        cycleLength: 28,
        actualLength: 32,
        notes: {},
        symptoms: {}
      }
    ];

    getRecentCycles.mockReturnValue(mockCycles);

    render(
      <HistoryView 
        cycleHistory={mockCycles} 
        currentCycleStart={mockCurrentCycleStart}
        onPeriodStart={mockOnPeriodStart}
      />
    );

    expect(screen.getByText('Expected: 28 days')).toBeInTheDocument();
    expect(screen.getByText('+4 days')).toBeInTheDocument();
  });

  test('calls onPeriodStart when button clicked', () => {
    render(
      <HistoryView 
        cycleHistory={[{id: 'test'}]} 
        currentCycleStart={mockCurrentCycleStart}
        onPeriodStart={mockOnPeriodStart}
      />
    );

    const button = screen.getByText('Mark New Period Start');
    fireEvent.click(button);

    expect(mockOnPeriodStart).toHaveBeenCalledTimes(1);
  });

  test('applies correct regularity colors', () => {
    const regularityTests = [
      { regularity: 'very-regular', expectedClass: 'text-green-600' },
      { regularity: 'regular', expectedClass: 'text-green-500' },
      { regularity: 'somewhat-irregular', expectedClass: 'text-yellow-600' },
      { regularity: 'irregular', expectedClass: 'text-red-600' }
    ];

    regularityTests.forEach(({ regularity, expectedClass }) => {
      calculateCycleStatistics.mockReturnValue({
        averageLength: 28,
        cycleRegularity: regularity,
        completedCycles: 1
      });

      const { rerender } = render(
        <HistoryView 
          cycleHistory={[]} 
          currentCycleStart={mockCurrentCycleStart}
          onPeriodStart={mockOnPeriodStart}
        />
      );

      const regularityElement = screen.getByText(regularity.replace('-', ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '));
      
      expect(regularityElement).toHaveClass(expectedClass);
      
      rerender(<></>); // Clean up for next iteration
    });
  });

  test('shows notes and symptoms count', () => {
    const mockCycles = [
      {
        id: 'cycle-1',
        startDate: '2025-06-01T00:00:00.000Z',
        cycleLength: 28,
        actualLength: 28,
        notes: { 
          '2025-06-05': 'Note 1',
          '2025-06-10': 'Note 2'
        },
        symptoms: { 
          '2025-06-03': ['cramps'],
          '2025-06-07': ['headache', 'fatigue']
        }
      }
    ];

    getRecentCycles.mockReturnValue(mockCycles);

    render(
      <HistoryView 
        cycleHistory={mockCycles} 
        currentCycleStart={mockCurrentCycleStart}
        onPeriodStart={mockOnPeriodStart}
      />
    );

    expect(screen.getByText((content, element) => {
      return element && element.textContent === '2 notes, 2 symptom entries';
    })).toBeInTheDocument();
  });
});