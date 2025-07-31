import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ModuleProvider, useModules } from '../../core/contexts/ModuleContext';
import { moduleRegistry } from '../../core/modules/registry';
import { MODULE_IDS } from '../../core/modules/types';

// Mock electron API
global.window.electronAPI = {
  store: {
    get: jest.fn(),
    set: jest.fn()
  }
};

// Test component to access module context
const TestComponent = () => {
  const {
    initialized,
    loading,
    enabledModules,
    getAllModules,
    isModuleEnabled,
    toggleModule,
    canEnableModule
  } = useModules();

  if (loading) return <div>Loading...</div>;
  if (!initialized) return <div>Not initialized</div>;

  return (
    <div>
      <div data-testid="enabled-count">{enabledModules.length}</div>
      <div data-testid="module-count">{getAllModules().length}</div>
      <div data-testid="mood-enabled">{isModuleEnabled(MODULE_IDS.MOOD).toString()}</div>
      <button 
        data-testid="toggle-history"
        onClick={() => toggleModule(MODULE_IDS.HISTORY)}
      >
        Toggle History
      </button>
      <div data-testid="can-enable-phase-detail">
        {JSON.stringify(canEnableModule(MODULE_IDS.PHASE_DETAIL))}
      </div>
    </div>
  );
};

describe('ModuleContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset registry between tests
    moduleRegistry.modules.clear();
    moduleRegistry.moduleStates.clear();
    moduleRegistry.initialized = false;
  });

  test('initializes with default modules', async () => {
    render(
      <ModuleProvider>
        <TestComponent />
      </ModuleProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('module-count')).toHaveTextContent('4');
      expect(screen.getByTestId('enabled-count')).toHaveTextContent('4');
      expect(screen.getByTestId('mood-enabled')).toHaveTextContent('true');
    });
  });

  test('toggles module state', async () => {
    render(
      <ModuleProvider>
        <TestComponent />
      </ModuleProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('enabled-count')).toHaveTextContent('4');
    });

    // Toggle history module off
    act(() => {
      screen.getByTestId('toggle-history').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('enabled-count')).toHaveTextContent('3');
    });

    // Toggle it back on
    act(() => {
      screen.getByTestId('toggle-history').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('enabled-count')).toHaveTextContent('4');
    });
  });

  test('enforces module dependencies', async () => {
    render(
      <ModuleProvider>
        <TestComponent />
      </ModuleProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('enabled-count')).toBeDefined();
    });

    // Phase detail depends on calendar, so should be able to enable
    const canEnableResult = screen.getByTestId('can-enable-phase-detail').textContent;
    const parsed = JSON.parse(canEnableResult);
    expect(parsed.canEnable).toBe(true);
    expect(parsed.missingDependencies).toEqual([]);
  });

  test('saves state to electron store', async () => {
    render(
      <ModuleProvider>
        <TestComponent />
      </ModuleProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('enabled-count')).toHaveTextContent('4');
    });

    // Toggle a module
    act(() => {
      screen.getByTestId('toggle-history').click();
    });

    // Wait for debounced save
    await waitFor(() => {
      expect(window.electronAPI.store.set).toHaveBeenCalledWith(
        'moduleState',
        expect.any(Object)
      );
    }, { timeout: 1000 });
  });

  test('restores state from electron store', async () => {
    const savedState = {
      [MODULE_IDS.MOOD]: { enabled: true, config: {} },
      [MODULE_IDS.CALENDAR]: { enabled: true, config: {} },
      [MODULE_IDS.HISTORY]: { enabled: false, config: {} }, // History disabled
      [MODULE_IDS.PHASE_DETAIL]: { enabled: true, config: {} }
    };

    window.electronAPI.store.get.mockResolvedValueOnce(savedState);

    render(
      <ModuleProvider>
        <TestComponent />
      </ModuleProvider>
    );

    await waitFor(() => {
      // Should have 3 enabled modules (history is disabled in saved state)
      expect(screen.getByTestId('enabled-count')).toHaveTextContent('3');
    });
  });
});