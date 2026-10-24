import React from 'react';
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// No jest.mock factory here: axios 0.27's automock does not reliably
// provide a working .get, so the mock is assigned directly before render.
test('renders the Wordle header, keyboard and footer', () => {
  (axios as unknown as { get: unknown }).get = jest.fn(
    () => new Promise(() => {}),
  );
  render(<App />);
  expect(screen.getByText(/Tiger Wordle/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Q' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Enter/i })).toBeInTheDocument();
  expect(screen.getByText(/Made by Tiger Hong/i)).toBeInTheDocument();
});
