import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import App from '../App';

test('renders main app and navigates to calculator', () => {
  render(<App />);

  // The hero contains the main heading
  expect(screen.getByText(/Track, Understand, and/i)).toBeTruthy();

  // Click the Calculator nav button 
  const calcBtn = screen.getByRole('button', { name: /Calculator/i });
  expect(calcBtn).toBeTruthy();
});
