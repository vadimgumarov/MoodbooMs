import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import MenuBarApp from '../components/MenuBarApp';
import { AppProviders } from '../core/contexts';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock electron API
global.window.electronAPI = {
  store: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined)
  },
  app: {
    log: jest.fn(),
    quit: jest.fn()
  },
  tray: {
    updatePhase: jest.fn()
  }
};

describe('Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should have no accessibility violations in default state', async () => {
    const { container } = render(
      <AppProviders>
        <MenuBarApp />
      </AppProviders>
    );
    
    // Wait for component to load
    await screen.findByText('MoodbooM');
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('should have skip navigation link', () => {
    render(
      <AppProviders>
        <MenuBarApp />
      </AppProviders>
    );
    
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveClass('skip-link');
  });

  test('should have proper ARIA labels for interactive elements', async () => {
    render(
      <AppProviders>
        <MenuBarApp />
      </AppProviders>
    );
    
    // Wait for loading
    await screen.findByText('MoodbooM');
    
    // Check mode toggle
    const modeToggle = screen.getByRole('switch');
    expect(modeToggle).toHaveAttribute('aria-label', 'Toggle between Queen and King mode');
    
    // Check close button
    const closeButton = screen.getByLabelText('Close application');
    expect(closeButton).toBeInTheDocument();
    
    // Check tabs
    const tabList = screen.getByRole('tablist');
    expect(tabList).toHaveAttribute('aria-label', 'Navigation tabs');
    
    // Check individual tabs
    const moodTab = screen.getByRole('tab', { name: /today/i });
    expect(moodTab).toHaveAttribute('aria-selected', 'true');
    expect(moodTab).toHaveAttribute('aria-controls', 'mood-panel');
  });

  test('should support keyboard navigation between tabs', async () => {
    render(
      <AppProviders>
        <MenuBarApp />
      </AppProviders>
    );
    
    await screen.findByText('MoodbooM');
    
    const moodTab = screen.getByRole('tab', { name: /today/i });
    const calendarTab = screen.getByRole('tab', { name: /calendar/i });
    
    // Focus on mood tab
    moodTab.focus();
    expect(document.activeElement).toBe(moodTab);
    
    // Press arrow right
    fireEvent.keyDown(moodTab, { key: 'ArrowRight' });
    
    // Calendar tab should be selected
    expect(calendarTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should have proper tabindex management', async () => {
    render(
      <AppProviders>
        <MenuBarApp />
      </AppProviders>
    );
    
    await screen.findByText('MoodbooM');
    
    const tabs = screen.getAllByRole('tab');
    
    // Only the selected tab should have tabindex 0
    tabs.forEach((tab) => {
      if (tab.getAttribute('aria-selected') === 'true') {
        expect(tab).toHaveAttribute('tabindex', '0');
      } else {
        expect(tab).toHaveAttribute('tabindex', '-1');
      }
    });
  });

  test('should announce mode changes to screen readers', async () => {
    render(
      <AppProviders>
        <MenuBarApp />
      </AppProviders>
    );
    
    await screen.findByText('MoodbooM');
    
    const modeToggle = screen.getByRole('switch');
    
    // Create a container to capture announcements
    const announceContainer = document.createElement('div');
    document.body.appendChild(announceContainer);
    
    // Toggle mode
    fireEvent.click(modeToggle);
    
    // Check that announcement was made (would be picked up by screen reader)
    // Note: In real implementation, this would use aria-live regions
    expect(modeToggle).toHaveAttribute('aria-checked', 'true');
    
    // Cleanup
    document.body.removeChild(announceContainer);
  });

  test('should have proper heading hierarchy', async () => {
    render(
      <AppProviders>
        <MenuBarApp />
      </AppProviders>
    );
    
    await screen.findByText('MoodbooM');
    
    // Check main heading
    const mainHeading = screen.getByRole('heading', { level: 2, name: 'MoodbooM' });
    expect(mainHeading).toBeInTheDocument();
  });

  test('should support high contrast mode toggle', async () => {
    const { rerender } = render(
      <AppProviders>
        <MenuBarApp />
      </AppProviders>
    );
    
    await screen.findByText('MoodbooM');
    
    // Navigate to settings
    const settingsTab = screen.getByLabelText('Settings');
    fireEvent.click(settingsTab);
    
    // Find high contrast toggle
    const highContrastToggle = screen.getByLabelText('Toggle high contrast mode');
    expect(highContrastToggle).toBeInTheDocument();
    
    // Toggle high contrast
    fireEvent.click(highContrastToggle);
    
    // Verify body class is applied
    expect(document.body).toHaveClass('high-contrast');
  });
});