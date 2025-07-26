import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import Calendar from '../Calendar';

// Mock the cycle calculations
jest.mock('../../../utils/cycleCalculations', () => ({
  calculateCurrentDay: jest.fn((startDate, currentDate, cycleLength) => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysDiff = Math.floor((currentDate - startDate) / msPerDay);
    return (daysDiff % cycleLength) + 1;
  }),
  getFertilityLevel: jest.fn((day, cycleLength) => {
    if (day <= 5) return 'very-low';
    if (day <= 10) return 'low';
    if (day <= 13) return 'medium';
    if (day <= 16) return 'high';
    if (day <= 18) return 'very-high';
    return 'low';
  }),
  getCurrentPhase: jest.fn((day) => {
    if (day <= 5) return 'menstrual';
    if (day <= 13) return 'follicular';
    if (day <= 16) return 'ovulation';
    return 'luteal';
  })
}));

describe('Calendar Component', () => {
  const mockCycleStartDate = new Date('2025-07-01');
  const mockOnDateSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders calendar with current month', () => {
    render(<Calendar cycleStartDate={mockCycleStartDate} cycleLength={28} />);
    
    const currentMonth = format(new Date(), 'MMMM yyyy');
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });

  test('renders all day labels', () => {
    render(<Calendar cycleStartDate={mockCycleStartDate} cycleLength={28} />);
    
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayLabels.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  test('renders correct number of days for current month', () => {
    render(<Calendar cycleStartDate={mockCycleStartDate} cycleLength={28} />);
    
    const currentDate = new Date();
    const daysInMonth = endOfMonth(currentDate).getDate();
    
    // Check that we have at least the days in the current month
    for (let i = 1; i <= daysInMonth; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  test('navigates to previous month', () => {
    render(<Calendar cycleStartDate={mockCycleStartDate} cycleLength={28} />);
    
    const prevButton = screen.getByLabelText('Previous month');
    fireEvent.click(prevButton);
    
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const expectedMonth = format(previousMonth, 'MMMM yyyy');
    
    expect(screen.getByText(expectedMonth)).toBeInTheDocument();
  });

  test('navigates to next month', () => {
    render(<Calendar cycleStartDate={mockCycleStartDate} cycleLength={28} />);
    
    const nextButton = screen.getByLabelText('Next month');
    fireEvent.click(nextButton);
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const expectedMonth = format(nextMonth, 'MMMM yyyy');
    
    expect(screen.getByText(expectedMonth)).toBeInTheDocument();
  });

  test('highlights today with ring', () => {
    render(<Calendar cycleStartDate={mockCycleStartDate} cycleLength={28} />);
    
    const today = new Date().getDate();
    const todayButton = screen.getByText(today.toString()).closest('button');
    
    expect(todayButton).toHaveClass('ring-2', 'ring-blue-500');
  });

  test('shows cycle days when cycleStartDate is provided', () => {
    render(<Calendar cycleStartDate={mockCycleStartDate} cycleLength={28} />);
    
    // Should show cycle day indicators
    expect(screen.getByText(/D\d+/)).toBeInTheDocument();
  });

  test('applies correct fertility colors', () => {
    render(<Calendar cycleStartDate={mockCycleStartDate} cycleLength={28} />);
    
    // The calendar should have various colored cells
    const buttons = screen.getAllByRole('button');
    const coloredButtons = buttons.filter(button => 
      button.className.includes('bg-red') || 
      button.className.includes('bg-green') ||
      button.className.includes('bg-yellow') ||
      button.className.includes('bg-orange')
    );
    
    expect(coloredButtons.length).toBeGreaterThan(0);
  });

  test('calls onDateSelect when date is clicked', () => {
    render(
      <Calendar 
        cycleStartDate={mockCycleStartDate} 
        cycleLength={28} 
        onDateSelect={mockOnDateSelect}
      />
    );
    
    const dayButton = screen.getByText('15').closest('button');
    fireEvent.click(dayButton);
    
    expect(mockOnDateSelect).toHaveBeenCalledTimes(1);
    expect(mockOnDateSelect).toHaveBeenCalledWith(expect.any(Date));
  });

  test('disables dates from other months', () => {
    render(<Calendar cycleStartDate={mockCycleStartDate} cycleLength={28} />);
    
    // Find a button with opacity-40 class (other month indicator)
    const otherMonthButtons = screen.getAllByRole('button').filter(
      button => button.className.includes('opacity-40')
    );
    
    if (otherMonthButtons.length > 0) {
      expect(otherMonthButtons[0]).toBeDisabled();
    }
  });

  test('renders fertility legend', () => {
    render(<Calendar cycleStartDate={mockCycleStartDate} cycleLength={28} />);
    
    expect(screen.getByText('Fertility Legend')).toBeInTheDocument();
    expect(screen.getByText('Menstruation')).toBeInTheDocument();
    expect(screen.getByText('Low Fertility')).toBeInTheDocument();
    expect(screen.getByText('Medium Fertility')).toBeInTheDocument();
    expect(screen.getByText('High Fertility')).toBeInTheDocument();
    expect(screen.getByText('Very High (Ovulation)')).toBeInTheDocument();
  });

  test('handles missing cycleStartDate gracefully', () => {
    render(<Calendar cycleLength={28} />);
    
    // Should still render without errors
    expect(screen.getByText(format(new Date(), 'MMMM yyyy'))).toBeInTheDocument();
    
    // Should not show cycle days
    expect(screen.queryByText(/D\d+/)).not.toBeInTheDocument();
  });
});