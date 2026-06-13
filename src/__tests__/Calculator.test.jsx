import { render, screen, fireEvent } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import Calculator from '../components/Calculator';

test('calculator step flow and final calculation triggers onCalculate', () => {
  const onCalculate = vi.fn();
  render(<Calculator onCalculate={onCalculate} />);

  // Step 1 visible
  expect(screen.getByText(/STEP 1 OF 4/i)).toBeTruthy();

  // Move to step 2
  const nextBtn = screen.getByText(/Next Step/i);
  fireEvent.click(nextBtn);
  expect(screen.getByText(/Travel & Transportation/i)).toBeTruthy();

  // Select Private Vehicle option to enable vehicle inputs
  const privateBtn = screen.getByText(/Private Vehicle/i);
  fireEvent.click(privateBtn);

  // Advance to step 4 and calculate
  fireEvent.click(nextBtn); // to step 3
  fireEvent.click(nextBtn); // to step 4

  const calcBtn = screen.getByText(/Calculate Footprint/i);
  fireEvent.click(calcBtn);

  expect(onCalculate).toHaveBeenCalled();
});
