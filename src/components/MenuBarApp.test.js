import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuBarApp from './MenuBarApp';
import { ModeProvider } from '../core/contexts/SimpleModeContext';

// Mock electron API
global.window.electronAPI = {
  store: {
    get: jest.fn(),
    set: jest.fn()
  },
  tray: {
    updatePhase: jest.fn()
  },
  app: {
    log: jest.fn()
  }
};

// Mock child components to simplify testing
jest.mock('./StatusCard', () => {
  return function MockStatusCard({ currentDay, cycleStartDate, cycleLength }) {
    return (
      <div data-testid="status-card">
        Status Card - Day {currentDay} of {cycleLength}
      </div>
    );
  };
});

jest.mock('./Calendar/Calendar', () => {
  return function MockCalendar({ onDateSelect, cycleStartDate, cycleLength }) {
    return (
      <div data-testid="calendar">
        Calendar Component
        <button onClick={() => onDateSelect(new Date('2024-01-15'))}>
          Select Date
        </button>
      </div>
    );
  };
});

jest.mock('./SafetyScale', () => {
  return function MockSafetyScale({ currentDay, cycleLength }) {
    return (
      <div data-testid="safety-scale">
        Safety Scale - Day {currentDay}
      </div>
    );
  };
});

const mockStoreData = {
  cycleData: {
    startDate: '2024-01-01T00:00:00.000Z',
    cycleLength: 28
  },
  preferences: {
    mode: 'queen',
    testMode: false
  },
  appState: {},
  cycleHistory: []
};

const renderMenuBarApp = () => {
  return render(
    <ModeProvider>
      <MenuBarApp />
    </ModeProvider>
  );
};

describe('MenuBarApp', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up default mock implementations
    window.electronAPI.store.get.mockImplementation((key) => {
      if (key === 'all') return Promise.resolve(mockStoreData);
      if (key === 'cycleData') return Promise.resolve(mockStoreData.cycleData);
      if (key === 'preferences') return Promise.resolve(mockStoreData.preferences);
      if (key === 'cycleHistory') return Promise.resolve(mockStoreData.cycleHistory);
      return Promise.resolve(null);
    });
    
    window.electronAPI.store.set.mockResolvedValue(true);
    
    // Set current date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial Loading', () => {
    test('should show loading state initially', () => {
      renderMenuBarApp();
      expect(screen.getByText(/Loading your cycle data/i)).toBeInTheDocument();
    });

    test('should load saved data from electron store', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(window.electronAPI.store.get).toHaveBeenCalledWith('all');
      });
      
      // Should display content after loading
      await waitFor(() => {
        expect(screen.queryByText(/Loading your cycle data/i)).not.toBeInTheDocument();
      });
    });

    test('should handle missing cycle data gracefully', async () => {
      window.electronAPI.store.get.mockResolvedValue(null);
      
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.getByText(/Welcome to MoodbooM/i)).toBeInTheDocument();
      });
      
      // Should show initial setup
      expect(screen.getByText(/Set Your Cycle Start Date/i)).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('should display all tab buttons', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Status/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Calendar/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /History/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Settings/i })).toBeInTheDocument();
      });
    });

    test('should switch tabs when clicked', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.getByTestId('status-card')).toBeInTheDocument();
      });
      
      // Click Calendar tab
      fireEvent.click(screen.getByRole('tab', { name: /Calendar/i }));
      expect(screen.getByTestId('calendar')).toBeInTheDocument();
      
      // Click History tab
      fireEvent.click(screen.getByRole('tab', { name: /History/i }));
      expect(screen.getByText(/Cycle History/i)).toBeInTheDocument();
      
      // Click Settings tab
      fireEvent.click(screen.getByRole('tab', { name: /Settings/i }));
      expect(screen.getByText(/Mode Selection/i)).toBeInTheDocument();
    });

    test('should highlight active tab', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        const statusTab = screen.getByRole('tab', { name: /Status/i });
        expect(statusTab).toHaveClass('bg-primary', 'text-white');
      });
      
      // Switch to Calendar
      fireEvent.click(screen.getByRole('tab', { name: /Calendar/i }));
      const calendarTab = screen.getByRole('tab', { name: /Calendar/i });
      expect(calendarTab).toHaveClass('bg-primary', 'text-white');
    });
  });

  describe('Status Tab', () => {
    test('should display current cycle information', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.getByTestId('status-card')).toBeInTheDocument();
        expect(screen.getByTestId('safety-scale')).toBeInTheDocument();
      });
      
      // Should show current day (15 - 1 = 14 days since Jan 1)
      expect(screen.getByText(/Day 15 of 28/i)).toBeInTheDocument();
    });

    test('should update phase in electron tray', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(window.electronAPI.tray.updatePhase).toHaveBeenCalled();
      });
    });
  });

  describe('Calendar Tab', () => {
    test('should display calendar component', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByRole('tab', { name: /Calendar/i }));
      expect(screen.getByTestId('calendar')).toBeInTheDocument();
    });

    test('should handle date selection', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByRole('tab', { name: /Calendar/i }));
      
      // Select a date
      fireEvent.click(screen.getByText('Select Date'));
      
      // Should show phase detail for selected date
      await waitFor(() => {
        expect(screen.getByText(/Phase Detail/i)).toBeInTheDocument();
      });
    });
  });

  describe('History Tab', () => {
    test('should display cycle history', async () => {
      const historyData = [
        { id: '1', startDate: '2023-12-01T00:00:00.000Z', cycleLength: 28, actualLength: 28 },
        { id: '2', startDate: '2023-12-29T00:00:00.000Z', cycleLength: 28, actualLength: 27 }
      ];
      
      window.electronAPI.store.get.mockImplementation((key) => {
        if (key === 'cycleHistory') return Promise.resolve(historyData);
        if (key === 'all') return Promise.resolve({ ...mockStoreData, cycleHistory: historyData });
        return Promise.resolve(mockStoreData[key]);
      });
      
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByRole('tab', { name: /History/i }));
      
      expect(screen.getByText(/Cycle History/i)).toBeInTheDocument();
      expect(screen.getByText(/Average Cycle:/i)).toBeInTheDocument();
    });

    test('should handle empty history', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByRole('tab', { name: /History/i }));
      
      expect(screen.getByText(/No cycle history yet/i)).toBeInTheDocument();
    });
  });

  describe('Settings Tab', () => {
    test('should display settings options', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByRole('tab', { name: /Settings/i }));
      
      expect(screen.getByText(/Mode Selection/i)).toBeInTheDocument();
      expect(screen.getByText(/Cycle Settings/i)).toBeInTheDocument();
    });

    test('should allow mode switching', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByRole('tab', { name: /Settings/i }));
      
      const modeToggle = screen.getByRole('switch');
      fireEvent.click(modeToggle);
      
      await waitFor(() => {
        expect(window.electronAPI.store.set).toHaveBeenCalledWith(
          expect.objectContaining({
            key: 'preferences',
            value: expect.objectContaining({ mode: 'king' })
          })
        );
      });
    });

    test('should allow cycle length adjustment', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByRole('tab', { name: /Settings/i }));
      
      const cycleLengthInput = screen.getByLabelText(/Cycle Length/i);
      await userEvent.clear(cycleLengthInput);
      await userEvent.type(cycleLengthInput, '30');
      
      const saveButton = screen.getByRole('button', { name: /Save Settings/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(window.electronAPI.store.set).toHaveBeenCalledWith(
          expect.objectContaining({
            key: 'cycleData',
            value: expect.objectContaining({ cycleLength: 30 })
          })
        );
      });
    });

    test('should validate cycle length input', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByRole('tab', { name: /Settings/i }));
      
      const cycleLengthInput = screen.getByLabelText(/Cycle Length/i);
      
      // Test minimum value
      await userEvent.clear(cycleLengthInput);
      await userEvent.type(cycleLengthInput, '20');
      expect(screen.getByText(/must be between 21 and 35/i)).toBeInTheDocument();
      
      // Test maximum value
      await userEvent.clear(cycleLengthInput);
      await userEvent.type(cycleLengthInput, '36');
      expect(screen.getByText(/must be between 21 and 35/i)).toBeInTheDocument();
    });
  });

  describe('Data Persistence', () => {
    test('should save cycle data changes', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByRole('tab', { name: /Settings/i }));
      
      // Change cycle start date
      const dateInput = screen.getByLabelText(/Period Start Date/i);
      fireEvent.change(dateInput, { target: { value: '2024-01-10' } });
      
      const saveButton = screen.getByRole('button', { name: /Save Settings/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(window.electronAPI.store.set).toHaveBeenCalledWith(
          expect.objectContaining({
            key: 'cycleData',
            value: expect.objectContaining({
              startDate: expect.any(String)
            })
          })
        );
      });
    });

    test('should handle save errors gracefully', async () => {
      window.electronAPI.store.set.mockRejectedValue(new Error('Save failed'));
      
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByRole('tab', { name: /Settings/i }));
      
      const saveButton = screen.getByRole('button', { name: /Save Settings/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Error saving settings/i)).toBeInTheDocument();
      });
    });
  });

  describe('Test Mode', () => {
    test('should display test mode indicator when enabled', async () => {
      window.electronAPI.store.get.mockImplementation((key) => {
        if (key === 'preferences') return Promise.resolve({ ...mockStoreData.preferences, testMode: true });
        if (key === 'all') return Promise.resolve({ ...mockStoreData, preferences: { ...mockStoreData.preferences, testMode: true } });
        return Promise.resolve(mockStoreData[key]);
      });
      
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.getByText(/TEST MODE/i)).toBeInTheDocument();
      });
    });

    test('should toggle test mode from settings', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByRole('tab', { name: /Settings/i }));
      
      const testModeToggle = screen.getByLabelText(/Test Mode/i);
      fireEvent.click(testModeToggle);
      
      await waitFor(() => {
        expect(window.electronAPI.store.set).toHaveBeenCalledWith(
          expect.objectContaining({
            key: 'preferences',
            value: expect.objectContaining({ testMode: true })
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels for tabs', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        const tablist = screen.getByRole('tablist');
        expect(tablist).toBeInTheDocument();
        
        const tabs = screen.getAllByRole('tab');
        tabs.forEach(tab => {
          expect(tab).toHaveAttribute('aria-selected');
        });
      });
    });

    test('should support keyboard navigation between tabs', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      const statusTab = screen.getByRole('tab', { name: /Status/i });
      statusTab.focus();
      
      // Press right arrow to go to next tab
      fireEvent.keyDown(statusTab, { key: 'ArrowRight' });
      
      // Calendar tab should be focused
      expect(screen.getByRole('tab', { name: /Calendar/i })).toHaveFocus();
    });

    test('should have proper heading hierarchy', async () => {
      renderMenuBarApp();
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Check for main heading
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });
});