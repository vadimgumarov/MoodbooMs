import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { 
  LoadingSpinner, 
  ErrorMessage, 
  SuccessMessage, 
  Tooltip,
  SkeletonLoader 
} from '../components/feedback';
import { FeedbackProvider, useFeedback } from '../core/contexts/FeedbackContext';
import { AppProviders } from '../core/contexts';

// Mock electron API
global.window.electronAPI = {
  store: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined)
  },
  app: {
    log: jest.fn()
  }
};

describe('Feedback Components', () => {
  describe('LoadingSpinner', () => {
    test('renders with default props', () => {
      render(<LoadingSpinner />);
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    test('renders with message', () => {
      render(<LoadingSpinner message="Loading data..." />);
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    test('renders fullscreen variant', () => {
      render(<LoadingSpinner fullScreen />);
      const container = screen.getByLabelText('Loading').closest('.fixed');
      expect(container).toHaveClass('inset-0');
    });
  });

  describe('ErrorMessage', () => {
    test('renders error string', () => {
      render(
        <AppProviders>
          <ErrorMessage error="Something went wrong" />
        </AppProviders>
      );
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    test('renders error object', () => {
      const error = {
        message: 'Network error',
        details: 'Please check your connection'
      };
      render(
        <AppProviders>
          <ErrorMessage error={error} />
        </AppProviders>
      );
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Please check your connection')).toBeInTheDocument();
    });

    test('shows retry button when onRetry provided', () => {
      const onRetry = jest.fn();
      render(
        <AppProviders>
          <ErrorMessage error="Error" onRetry={onRetry} />
        </AppProviders>
      );
      
      const retryButton = screen.getByLabelText('Retry action');
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalled();
    });

    test('dismisses error when close clicked', () => {
      const onDismiss = jest.fn();
      render(
        <AppProviders>
          <ErrorMessage error="Error" onDismiss={onDismiss} />
        </AppProviders>
      );
      
      const dismissButton = screen.getByLabelText('Dismiss error');
      fireEvent.click(dismissButton);
      expect(onDismiss).toHaveBeenCalled();
    });
  });

  describe('SuccessMessage', () => {
    test('renders success message', () => {
      render(
        <AppProviders>
          <SuccessMessage message="Settings saved!" />
        </AppProviders>
      );
      expect(screen.getByText('Settings saved!')).toBeInTheDocument();
    });

    test('auto-hides after delay', async () => {
      const onDismiss = jest.fn();
      render(
        <AppProviders>
          <SuccessMessage 
            message="Success" 
            onDismiss={onDismiss}
            autoHide={true}
            autoHideDelay={100}
          />
        </AppProviders>
      );
      
      expect(screen.getByText('Success')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalled();
      }, { timeout: 200 });
    });
  });

  describe('Tooltip', () => {
    test('shows tooltip on hover', async () => {
      render(
        <Tooltip content="Helpful information">
          <button>Hover me</button>
        </Tooltip>
      );
      
      const button = screen.getByText('Hover me');
      
      // Tooltip should not be visible initially
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      
      // Hover over button
      fireEvent.mouseEnter(button);
      
      // Wait for tooltip to appear
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Helpful information')).toBeInTheDocument();
      }, { timeout: 600 });
    });

    test('hides tooltip on mouse leave', async () => {
      render(
        <Tooltip content="Helpful information" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );
      
      const button = screen.getByText('Hover me');
      
      // Show tooltip
      fireEvent.mouseEnter(button);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
      
      // Hide tooltip
      fireEvent.mouseLeave(button);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('SkeletonLoader', () => {
    test('renders text skeleton', () => {
      const { container } = render(<SkeletonLoader type="text" />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });

    test('renders multiple skeletons', () => {
      render(<SkeletonLoader type="text" count={3} />);
      const skeletons = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletons).toHaveLength(3);
    });
  });

  describe('FeedbackContext', () => {
    const TestComponent = () => {
      const { showSuccess, showError } = useFeedback();
      
      return (
        <div>
          <button onClick={() => showSuccess('Test success')}>
            Show Success
          </button>
          <button onClick={() => showError('Test error')}>
            Show Error
          </button>
        </div>
      );
    };

    test('shows success notification', async () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );
      
      fireEvent.click(screen.getByText('Show Success'));
      
      await waitFor(() => {
        expect(screen.getByText('Test success')).toBeInTheDocument();
      });
    });

    test('shows error notification', async () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );
      
      fireEvent.click(screen.getByText('Show Error'));
      
      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
    });
  });
});