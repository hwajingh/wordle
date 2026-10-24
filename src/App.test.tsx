import React from 'react';
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// Mock axios so the answer fetch on mount does not depend on the network.
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.get.mockReturnValue(new Promise(() => {}) as never);

test('renders the Wordle header, keyboard and footer', () => {
  render(<App />);
  expect(screen.getByText(/Tiger Wordle/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Q' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Enter/i })).toBeInTheDocument();
  expect(screen.getByText(/Made by Tiger Hong/i)).toBeInTheDocument();
});
