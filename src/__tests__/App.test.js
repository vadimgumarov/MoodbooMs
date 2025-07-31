import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders the app without crashing', () => {
  render(<App />);
  // The app should render without errors
  expect(document.body).toBeInTheDocument();
});
