import React from 'react';
import { render, screen, within } from '@testing-library/react';
import SafetyScale from './SafetyScale';

describe('SafetyScale', () => {
  describe('Scale Rendering', () => {
    test('should render the safety scale gradient', () => {
      render(<SafetyScale currentDay={14} cycleLength={28} />);
      
      // Should have gradient background
      const scaleElement = screen.getByText(/Safety Level/i).closest('div');
      expect(scaleElement).toBeInTheDocument();
    });

    test('should display safety level title', () => {
      render(<SafetyScale currentDay={14} cycleLength={28} />);
      
      expect(screen.getByText(/Safety Level/i)).toBeInTheDocument();
    });

    test('should show scale labels', () => {
      render(<SafetyScale currentDay={14} cycleLength={28} />);
      
      // Should show danger and safe labels
      expect(screen.getByText(/Danger/i)).toBeInTheDocument();
      expect(screen.getByText(/Safe/i)).toBeInTheDocument();
    });
  });

  describe('Position Indicator', () => {
    test('should position indicator for menstrual phase (safe)', () => {
      render(<SafetyScale currentDay={3} cycleLength={28} />);
      
      // During period (days 1-5) should be on safe side
      const percentage = screen.getByText(/\d+%/);
      expect(percentage).toBeInTheDocument();
      
      // Safety percentage should be high during period
      const value = parseInt(percentage.textContent);
      expect(value).toBeGreaterThan(70);
    });

    test('should position indicator for ovulation (danger)', () => {
      render(<SafetyScale currentDay={14} cycleLength={28} />);
      
      // During ovulation should be on danger side
      const percentage = screen.getByText(/\d+%/);
      expect(percentage).toBeInTheDocument();
      
      // Safety percentage should be low during ovulation
      const value = parseInt(percentage.textContent);
      expect(value).toBeLessThan(30);
    });

    test('should position indicator for follicular phase (moderate)', () => {
      render(<SafetyScale currentDay={8} cycleLength={28} />);
      
      // During follicular phase should be moderate
      const percentage = screen.getByText(/\d+%/);
      expect(percentage).toBeInTheDocument();
      
      // Safety percentage should be moderate
      const value = parseInt(percentage.textContent);
      expect(value).toBeGreaterThan(30);
      expect(value).toBeLessThan(70);
    });

    test('should update position when props change', () => {
      const { rerender } = render(<SafetyScale currentDay={3} cycleLength={28} />);
      
      // Get initial percentage
      let percentage = screen.getByText(/\d+%/);
      const initialValue = parseInt(percentage.textContent);
      
      // Update to ovulation day
      rerender(<SafetyScale currentDay={14} cycleLength={28} />);
      
      // Get new percentage
      percentage = screen.getByText(/\d+%/);
      const newValue = parseInt(percentage.textContent);
      
      // Values should be different
      expect(newValue).not.toBe(initialValue);
      expect(newValue).toBeLessThan(initialValue); // Ovulation is less safe
    });
  });

  describe('Percentage Display', () => {
    test('should display safety percentage', () => {
      render(<SafetyScale currentDay={10} cycleLength={28} />);
      
      const percentage = screen.getByText(/\d+%/);
      expect(percentage).toBeInTheDocument();
      expect(percentage.textContent).toMatch(/^\d+%$/);
    });

    test('should calculate correct percentage for different cycle days', () => {
      const testCases = [
        { day: 1, minSafety: 80, maxSafety: 100 },  // Menstrual - very safe
        { day: 14, minSafety: 0, maxSafety: 20 },   // Ovulation - very dangerous
        { day: 28, minSafety: 60, maxSafety: 80 },  // Pre-menstrual - moderately safe
      ];

      testCases.forEach(({ day, minSafety, maxSafety }) => {
        const { unmount } = render(<SafetyScale currentDay={day} cycleLength={28} />);
        
        const percentage = screen.getByText(/\d+%/);
        const value = parseInt(percentage.textContent);
        
        expect(value).toBeGreaterThanOrEqual(minSafety);
        expect(value).toBeLessThanOrEqual(maxSafety);
        
        unmount();
      });
    });
  });

  describe('Different Cycle Lengths', () => {
    test('should adjust calculations for short cycles', () => {
      render(<SafetyScale currentDay={7} cycleLength={21} />);
      
      // Day 7 is ovulation in 21-day cycle (14 days before end)
      const percentage = screen.getByText(/\d+%/);
      const value = parseInt(percentage.textContent);
      
      // Should be low safety (ovulation)
      expect(value).toBeLessThan(30);
    });

    test('should adjust calculations for long cycles', () => {
      render(<SafetyScale currentDay={21} cycleLength={35} />);
      
      // Day 21 is ovulation in 35-day cycle (14 days before end)
      const percentage = screen.getByText(/\d+%/);
      const value = parseInt(percentage.textContent);
      
      // Should be low safety (ovulation)
      expect(value).toBeLessThan(30);
    });
  });

  describe('Visual Styling', () => {
    test('should have gradient background', () => {
      const { container } = render(<SafetyScale currentDay={14} cycleLength={28} />);
      
      // Should have gradient styling
      const gradientElement = container.querySelector('[class*="gradient"], [style*="gradient"]');
      expect(gradientElement || container.querySelector('.bg-gradient-to-r')).toBeInTheDocument();
    });

    test('should have proper indicator styling', () => {
      const { container } = render(<SafetyScale currentDay={14} cycleLength={28} />);
      
      // Should have position indicator
      const indicator = container.querySelector('[class*="absolute"], [class*="indicator"]');
      expect(indicator).toBeInTheDocument();
    });

    test('should have proper color scheme', () => {
      const { container } = render(<SafetyScale currentDay={14} cycleLength={28} />);
      
      // Should use error/success colors for danger/safe
      expect(screen.getByText(/Danger/i)).toBeInTheDocument();
      expect(screen.getByText(/Safe/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle day 0', () => {
      render(<SafetyScale currentDay={0} cycleLength={28} />);
      
      // Should not crash and show a percentage
      const percentage = screen.getByText(/\d+%/);
      expect(percentage).toBeInTheDocument();
    });

    test('should handle day beyond cycle length', () => {
      render(<SafetyScale currentDay={35} cycleLength={28} />);
      
      // Should wrap around (day 35 = day 7 of next cycle)
      const percentage = screen.getByText(/\d+%/);
      expect(percentage).toBeInTheDocument();
    });

    test('should handle missing props', () => {
      render(<SafetyScale />);
      
      // Should use defaults and not crash
      expect(screen.getByText(/Safety Level/i)).toBeInTheDocument();
      const percentage = screen.getByText(/\d+%/);
      expect(percentage).toBeInTheDocument();
    });

    test('should handle invalid cycle length', () => {
      render(<SafetyScale currentDay={14} cycleLength={0} />);
      
      // Should handle gracefully
      expect(screen.getByText(/Safety Level/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have accessible labels', () => {
      render(<SafetyScale currentDay={14} cycleLength={28} />);
      
      // Should have descriptive text
      expect(screen.getByText(/Safety Level/i)).toBeInTheDocument();
      expect(screen.getByText(/Danger/i)).toBeInTheDocument();
      expect(screen.getByText(/Safe/i)).toBeInTheDocument();
    });

    test('should provide percentage as text for screen readers', () => {
      render(<SafetyScale currentDay={14} cycleLength={28} />);
      
      // Percentage should be readable
      const percentage = screen.getByText(/\d+%/);
      expect(percentage).toBeInTheDocument();
      expect(percentage).toBeVisible();
    });

    test('should have proper heading hierarchy', () => {
      render(<SafetyScale currentDay={14} cycleLength={28} />);
      
      // Should have a heading for the component
      const heading = screen.getByText(/Safety Level/i);
      expect(heading.tagName).toMatch(/^H[1-6]$/);
    });

    test('should use semantic HTML', () => {
      const { container } = render(<SafetyScale currentDay={14} cycleLength={28} />);
      
      // Should use appropriate elements
      expect(container.querySelector('section, article, div[role]')).toBeInTheDocument();
    });
  });

  describe('Animation and Transitions', () => {
    test('should have transition classes for smooth updates', () => {
      const { container } = render(<SafetyScale currentDay={14} cycleLength={28} />);
      
      // Should have transition classes
      const transitionElement = container.querySelector('[class*="transition"]');
      expect(transitionElement).toBeInTheDocument();
    });

    test('should update smoothly when day changes', () => {
      const { container, rerender } = render(<SafetyScale currentDay={10} cycleLength={28} />);
      
      // Get initial indicator
      const getIndicator = () => container.querySelector('[class*="absolute"]');
      const initialIndicator = getIndicator();
      
      // Update day
      rerender(<SafetyScale currentDay={14} cycleLength={28} />);
      
      // Indicator should still exist (smooth transition, not recreated)
      const newIndicator = getIndicator();
      expect(newIndicator).toBeInTheDocument();
    });
  });
});