import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import Dashboard from '../components/Dashboard';

test('dashboard displays totals and reset works', () => {
  const mockReset = vi.fn();
  const result = {
    total: 2500,
    breakdown: { transport: 800, food: 600, energy: 500, waste: 200, other: 400 },
    inputs: {}
  };

  render(<Dashboard result={result} onReset={mockReset} />);

  // Total displayed and summary header present
  expect(screen.getByText(/Annual Footprint/i)).toBeTruthy();
  expect(screen.getByText(/Total:/i)).toBeTruthy();

  const resetBtn = screen.getByText(/Re-calculate/i);
  fireEvent.click(resetBtn);

  expect(mockReset).toHaveBeenCalled();
});
