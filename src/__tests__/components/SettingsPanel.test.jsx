import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPanel from './SettingsPanel';

describe('SettingsPanel', () => {
  const mockCycleData = {
    startDate: new Date('2025-07-01'),
    cycleLength: 28
  };

  const mockPreferences = {
    notifications: true,
    theme: 'auto'
  };

  const mockHandlers = {
    onSave: jest.fn(),
    onCancel: jest.fn(),
    onExport: jest.fn(),
    onImport: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders settings panel with all sections', () => {
    render(
      <SettingsPanel
        cycleData={mockCycleData}
        preferences={mockPreferences}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Cycle Settings')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Data Management')).toBeInTheDocument();
  });

  test('shows current cycle length', () => {
    render(
      <SettingsPanel
        cycleData={mockCycleData}
        preferences={mockPreferences}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Cycle Length: 28 days')).toBeInTheDocument();
  });

  test('updates cycle length with slider', () => {
    render(
      <SettingsPanel
        cycleData={mockCycleData}
        preferences={mockPreferences}
        {...mockHandlers}
      />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '30' } });

    expect(screen.getByText('Cycle Length: 30 days')).toBeInTheDocument();
  });

  test('shows save button when changes are made', () => {
    render(
      <SettingsPanel
        cycleData={mockCycleData}
        preferences={mockPreferences}
        {...mockHandlers}
      />
    );

    // Initially, save button should be disabled
    const saveButton = screen.getByText('Save Changes').closest('button');
    expect(saveButton).toBeDisabled();

    // Make a change
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '30' } });

    // Save button should now be enabled
    expect(saveButton).not.toBeDisabled();
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
  });

  test('calls onSave with updated data', () => {
    render(
      <SettingsPanel
        cycleData={mockCycleData}
        preferences={mockPreferences}
        {...mockHandlers}
      />
    );

    // Change cycle length
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '30' } });

    // Click save
    const saveButton = screen.getByText('Save Changes').closest('button');
    fireEvent.click(saveButton);

    expect(mockHandlers.onSave).toHaveBeenCalledWith({
      cycleData: {
        ...mockCycleData,
        cycleLength: 30
      },
      preferences: mockPreferences
    });
  });

  test('resets changes when reset button is clicked', () => {
    render(
      <SettingsPanel
        cycleData={mockCycleData}
        preferences={mockPreferences}
        {...mockHandlers}
      />
    );

    // Change cycle length
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '30' } });
    expect(screen.getByText('Cycle Length: 30 days')).toBeInTheDocument();

    // Click reset
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    // Should revert to original value
    expect(screen.getByText('Cycle Length: 28 days')).toBeInTheDocument();
  });

  test('calls onCancel when close button is clicked', () => {
    render(
      <SettingsPanel
        cycleData={mockCycleData}
        preferences={mockPreferences}
        {...mockHandlers}
      />
    );

    const closeButton = screen.getByLabelText('Close settings');
    fireEvent.click(closeButton);

    expect(mockHandlers.onCancel).toHaveBeenCalled();
  });

  test('theme selection works correctly', () => {
    render(
      <SettingsPanel
        cycleData={mockCycleData}
        preferences={mockPreferences}
        {...mockHandlers}
      />
    );

    // Check initial state
    const systemRadio = screen.getByLabelText('System');
    expect(systemRadio).toBeChecked();

    // Select light theme
    const lightRadio = screen.getByLabelText('Light');
    fireEvent.click(lightRadio);
    expect(lightRadio).toBeChecked();
    expect(systemRadio).not.toBeChecked();
  });

  test('export button calls onExport', () => {
    render(
      <SettingsPanel
        cycleData={mockCycleData}
        preferences={mockPreferences}
        {...mockHandlers}
      />
    );

    const exportButton = screen.getByText('Export Data');
    fireEvent.click(exportButton);

    expect(mockHandlers.onExport).toHaveBeenCalled();
  });
});