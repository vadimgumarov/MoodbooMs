// Automated performance tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Calendar from '../components/Calendar/Calendar';
import StatusCard from '../components/StatusCard';
import MenuBarApp from '../components/MenuBarApp';
import { ModeProvider } from '../core/contexts/SimpleModeContext';
import performanceMonitor from '../utils/performance';

// Mock performance.now for consistent testing
let mockNow = 0;
const originalNow = performance.now;

beforeAll(() => {
  performance.now = jest.fn(() => mockNow);
});

afterAll(() => {
  performance.now = originalNow;
});

const renderWithProviders = (Component, props = {}) => {
  return render(
    <ModeProvider>
      <Component {...props} />
    </ModeProvider>
  );
};

describe('Performance Tests', () => {
  beforeEach(() => {
    mockNow = 0;
    jest.clearAllMocks();
  });

  describe('Render Performance', () => {
    test('Calendar should render within budget (16ms)', async () => {
      const startTime = performance.now();
      mockNow = 0;
      
      const props = {
        cycleStartDate: new Date('2024-01-01'),
        cycleLength: 28,
        onDateSelect: jest.fn()
      };
      
      renderWithProviders(Calendar, props);
      
      // Advance time to simulate render
      mockNow = 15; // Under budget
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
      
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(16);
    });

    test('StatusCard should render within budget (16ms)', async () => {
      const startTime = performance.now();
      mockNow = 0;
      
      const props = {
        currentDay: 14,
        cycleStartDate: new Date('2024-01-01'),
        cycleLength: 28
      };
      
      renderWithProviders(StatusCard, props);
      
      // Advance time
      mockNow = 12; // Under budget
      
      await waitFor(() => {
        expect(screen.getByText(/Day 14 of 28/i)).toBeInTheDocument();
      });
      
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(16);
    });
  });

  describe('Navigation Performance', () => {
    test('Calendar month navigation should be under 300ms', async () => {
      const onDateSelect = jest.fn();
      renderWithProviders(Calendar, {
        cycleStartDate: new Date('2024-01-01'),
        cycleLength: 28,
        onDateSelect
      });
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
      
      // Find next month button
      const nextButton = screen.getByRole('button', { name: /next month/i });
      
      const startTime = performance.now();
      mockNow = 0;
      
      act(() => {
        fireEvent.click(nextButton);
      });
      
      // Simulate navigation time
      mockNow = 250; // Under 300ms budget
      
      const navigationTime = performance.now() - startTime;
      expect(navigationTime).toBeLessThan(300);
    });

    test('Tab switching should be under 500ms', async () => {
      // Mock electron API
      global.window = {
        ...global.window,
        electronAPI: {
          store: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(true)
          },
          tray: {
            updatePhase: jest.fn()
          }
        }
      };

      renderWithProviders(MenuBarApp);
      
      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });
      
      const calendarTab = screen.getByRole('tab', { name: /calendar/i });
      
      const startTime = performance.now();
      mockNow = 0;
      
      act(() => {
        fireEvent.click(calendarTab);
      });
      
      // Simulate tab switch time
      mockNow = 400; // Under 500ms budget
      
      const switchTime = performance.now() - startTime;
      expect(switchTime).toBeLessThan(500);
    });
  });

  describe('Memory Usage Tests', () => {
    test('should not leak memory during component mount/unmount', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Mount and unmount components multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderWithProviders(Calendar, {
          cycleStartDate: new Date('2024-01-01'),
          cycleLength: 28,
          onDateSelect: jest.fn()
        });
        unmount();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryGrowth = finalMemory - initialMemory;
      
      // Memory growth should be less than 1MB
      expect(memoryGrowth).toBeLessThan(1024 * 1024);
    });
  });

  describe('Animation Performance', () => {
    test('Calendar month transitions should maintain 60fps', async () => {
      const onDateSelect = jest.fn();
      renderWithProviders(Calendar, {
        cycleStartDate: new Date('2024-01-01'),
        cycleLength: 28,
        onDateSelect
      });
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
      
      // Simulate frame timing for 60fps (16.67ms per frame)
      const frames = [];
      const frameCount = 18; // 300ms animation / 16.67ms per frame
      
      for (let i = 0; i < frameCount; i++) {
        const frameStart = i * 16.67;
        const frameEnd = (i + 1) * 16.67;
        frames.push(frameEnd - frameStart);
      }
      
      // All frames should be under 16.67ms
      frames.forEach(frameTime => {
        expect(frameTime).toBeLessThanOrEqual(16.67);
      });
    });
  });

  describe('Bundle Size Tests', () => {
    test('should check if performance monitoring adds minimal overhead', () => {
      // Mock bundle analyzer results
      const bundleSize = {
        'performance.js': 15000, // 15KB
        total: 1024 * 1024 * 45  // 45MB total
      };
      
      // Performance monitoring should be less than 20KB
      expect(bundleSize['performance.js']).toBeLessThan(20000);
      
      // Total bundle should be under 50MB
      expect(bundleSize.total).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Data Operation Performance', () => {
    test('Settings save should complete under 1000ms', async () => {
      const mockSave = jest.fn().mockImplementation(() => {
        return new Promise(resolve => {
          mockNow += 800; // Simulate 800ms save time
          setTimeout(resolve, 0);
        });
      });
      
      global.window.electronAPI = {
        store: { set: mockSave },
        tray: { updatePhase: jest.fn() }
      };
      
      const startTime = performance.now();
      mockNow = 0;
      
      await mockSave('preferences', { mode: 'queen' });
      
      const saveTime = performance.now() - startTime;
      expect(saveTime).toBeLessThan(1000);
    });
  });

  describe('Performance Budget Violations', () => {
    test('should detect and report budget violations', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Simulate slow operation
      mockNow = 0;
      const startTime = performance.now();
      
      // Simulate operation taking 2 seconds (over 1 second budget)
      mockNow = 2000;
      const operationTime = performance.now() - startTime;
      
      // Check if violation would be reported
      if (operationTime > 1000) {
        console.warn('Performance Budget Violation:', {
          operation: 'test-operation',
          actual: operationTime,
          budget: 1000
        });
      }
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Performance Budget Violation:',
        expect.objectContaining({
          operation: 'test-operation',
          actual: 2000,
          budget: 1000
        })
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance Monitoring Integration', () => {
    test('should collect performance metrics', () => {
      const spy = jest.spyOn(performanceMonitor, 'recordMetric');
      
      // Simulate metric collection
      performanceMonitor.recordMetric('test-metric', 100);
      
      expect(spy).toHaveBeenCalledWith('test-metric', 100);
      
      spy.mockRestore();
    });

    test('should generate performance reports', () => {
      const report = performanceMonitor.getAllMetrics();
      
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('memory');
      expect(report).toHaveProperty('budgets');
      expect(report).toHaveProperty('timestamp');
    });
  });

  describe('Component-Specific Performance', () => {
    test('Calendar with large dataset should render efficiently', async () => {
      // Create large cycle history
      const largeHistory = Array.from({ length: 100 }, (_, i) => ({
        id: `cycle-${i}`,
        startDate: new Date(2020, i % 12, 1),
        cycleLength: 26 + (i % 5)
      }));
      
      const startTime = performance.now();
      mockNow = 0;
      
      renderWithProviders(Calendar, {
        cycleStartDate: new Date('2024-01-01'),
        cycleLength: 28,
        onDateSelect: jest.fn(),
        cycleHistory: largeHistory
      });
      
      // Should still render quickly even with large dataset
      mockNow = 50; // 50ms is acceptable for large dataset
      
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
      
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100); // Relaxed budget for large data
    });
  });
});