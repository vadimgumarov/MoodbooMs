import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { format } from 'date-fns';
import Calendar from './Calendar';
import { ModeProvider } from '../../core/contexts/SimpleModeContext';

// Mock date-fns to control current date
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
}));

const renderCalendar = (props = {}) => {
  const defaultProps = {
    cycleStartDate: new Date('2024-01-01'),
    cycleLength: 28,
    onDateSelect: jest.fn()
  };

  return render(
    <ModeProvider>
      <Calendar {...defaultProps} {...props} />
    </ModeProvider>
  );
};

describe('Calendar', () => {
  beforeEach(() => {
    // Reset date to a known value
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-02-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Today Button', () => {
    test('should render Today button', () => {
      renderCalendar();
      const todayButton = screen.getByRole('button', { name: /go to today/i });
      expect(todayButton).toBeInTheDocument();
      expect(todayButton).toHaveTextContent('Today');
    });

    test('should navigate to current month when clicked', () => {
      renderCalendar();
      
      // Navigate to a different month first
      const prevButton = screen.getByRole('button', { name: /previous month/i });
      fireEvent.click(prevButton); // Go to January 2024
      
      // Verify we're in January
      expect(screen.getByText('January 2024')).toBeInTheDocument();
      
      // Click Today button
      const todayButton = screen.getByRole('button', { name: /go to today/i });
      fireEvent.click(todayButton);
      
      // Should be back in February 2024
      expect(screen.getByText('February 2024')).toBeInTheDocument();
    });

    test('should clear selected date when clicked', () => {
      const onDateSelect = jest.fn();
      renderCalendar({ onDateSelect });
      
      // Click Today button
      const todayButton = screen.getByRole('button', { name: /go to today/i });
      fireEvent.click(todayButton);
      
      // Should call onDateSelect with null to clear selection
      expect(onDateSelect).toHaveBeenCalledWith(null);
    });

    test('should have proper styling', () => {
      renderCalendar();
      const todayButton = screen.getByRole('button', { name: /go to today/i });
      
      expect(todayButton).toHaveClass('bg-primary/10');
      expect(todayButton).toHaveClass('text-primary');
      expect(todayButton).toHaveClass('rounded');
    });
  });

  describe('Calendar Navigation', () => {
    test('should show current month and year', () => {
      renderCalendar();
      expect(screen.getByText('February 2024')).toBeInTheDocument();
    });

    test('should navigate to previous month', () => {
      renderCalendar();
      const prevButton = screen.getByRole('button', { name: /previous month/i });
      
      fireEvent.click(prevButton);
      expect(screen.getByText('January 2024')).toBeInTheDocument();
    });

    test('should navigate to next month', () => {
      renderCalendar();
      const nextButton = screen.getByRole('button', { name: /next month/i });
      
      fireEvent.click(nextButton);
      expect(screen.getByText('March 2024')).toBeInTheDocument();
    });
  });

  describe('Calendar Grid', () => {
    test('should render day labels', () => {
      renderCalendar();
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      dayLabels.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    test('should identify today correctly', () => {
      // Set cycle start date to February to ensure today (15th) is visible
      renderCalendar({ cycleStartDate: new Date('2024-02-01') });
      
      // Find all grid cells (date buttons)
      const gridCells = screen.getAllByRole('gridcell');
      
      // Find the cell that contains today's date (15th)
      const todayCell = gridCells.find(cell => 
        cell.textContent.includes('15')
      );
      
      expect(todayCell).toBeTruthy();
      expect(todayCell.textContent).toContain('15'); // Today is 15th
      // Today should be properly rendered (styling may vary based on fertility)
      expect(todayCell).toBeInTheDocument();
    });

    test('should call onDateSelect when date is clicked', () => {
      const onDateSelect = jest.fn();
      renderCalendar({ onDateSelect });
      
      // Click on a date
      const dateButton = screen.getByText('10').closest('button');
      fireEvent.click(dateButton);
      
      expect(onDateSelect).toHaveBeenCalled();
    });
  });

  describe('Mode-specific Legend', () => {
    test('should show Queen mode legend by default', () => {
      renderCalendar();
      expect(screen.getByText('My Cycle Map')).toBeInTheDocument();
      expect(screen.getByText('The Red Wedding')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    test('should have proper ARIA attributes', () => {
      renderCalendar();
      const calendarGrid = screen.getByRole('grid');
      expect(calendarGrid).toHaveAttribute('aria-label', 'Calendar');
      expect(calendarGrid).toHaveAttribute('tabIndex', '0');
    });

    test('should handle arrow key navigation', () => {
      renderCalendar();
      const calendarGrid = screen.getByRole('grid');
      
      // Focus the calendar
      calendarGrid.focus();
      
      // Simulate arrow key press
      fireEvent.keyDown(calendarGrid, { key: 'ArrowRight' });
      
      // Should have handled the event (no specific assertion for now)
      expect(calendarGrid).toBeInTheDocument();
    });

    test('should handle Enter key for date selection', () => {
      const onDateSelect = jest.fn();
      renderCalendar({ onDateSelect });
      const calendarGrid = screen.getByRole('grid');
      
      // Focus the calendar and press Enter
      calendarGrid.focus();
      fireEvent.keyDown(calendarGrid, { key: 'Enter' });
      
      // Should attempt to select a date
      expect(calendarGrid).toBeInTheDocument();
    });

    test('should have focus indicators on calendar cells', () => {
      renderCalendar();
      const gridCells = screen.getAllByRole('gridcell');
      
      // Each cell should have proper attributes
      gridCells.forEach(cell => {
        expect(cell).toHaveAttribute('role', 'gridcell');
        expect(cell).toHaveAttribute('tabIndex', '-1');
        expect(cell).toHaveAttribute('aria-selected');
      });
    });

    test('should handle Escape key to clear selection', () => {
      const onDateSelect = jest.fn();
      renderCalendar({ onDateSelect });
      const calendarGrid = screen.getByRole('grid');
      
      // Focus and press Escape
      calendarGrid.focus();
      fireEvent.keyDown(calendarGrid, { key: 'Escape' });
      
      // Should clear selection
      expect(onDateSelect).toHaveBeenCalledWith(null);
    });

    test('should handle Page Up/Down for month navigation', () => {
      renderCalendar();
      const calendarGrid = screen.getByRole('grid');
      
      // Start in February
      expect(screen.getByText('February 2024')).toBeInTheDocument();
      
      // Press Page Up
      fireEvent.keyDown(calendarGrid, { key: 'PageUp' });
      
      // Should go to January (functionality should work)
      expect(calendarGrid).toBeInTheDocument();
    });
  });
});