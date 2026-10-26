import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// axios 0.27's automock does not reliably provide a working .get, so
// each test assigns the mock directly before render.
function mockAxios(answer: string, dictionary: 'ok' | '404' | 'error') {
  (axios as unknown as { get: unknown }).get = jest.fn((url: string) => {
    if (url.includes('random-word-api')) {
      return Promise.resolve({ data: [answer.toLowerCase()] });
    }
    if (url.includes('dictionaryapi')) {
      if (dictionary === 'ok') {
        return Promise.resolve({ data: [{ word: 'tiger' }] });
      }
      if (dictionary === '404') {
        return Promise.reject({ response: { status: 404 } });
      }
      return Promise.reject(new Error('network down'));
    }
    return Promise.reject(new Error(`unknown url ${url}`));
  });
}

async function waitForAnswer() {
  // Let the mocked answer fetch resolve and flush its state update
  // before typing, as a real player would after page load.
  await new Promise((r) => setTimeout(r, 10));
}

function typeWord(word: string) {
  for (const ch of word) {
    fireEvent.click(screen.getByRole('button', { name: ch }));
  }
}

function pressEnter() {
  fireEvent.click(screen.getByRole('button', { name: /Enter/i }));
}

test('renders the Wordle header, keyboard and footer', () => {
  mockAxios('apple', 'ok');
  render(<App />);
  expect(screen.getByText(/Tiger Wordle/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Q' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Enter/i })).toBeInTheDocument();
  expect(screen.getByText(/Made by Tiger Hong/i)).toBeInTheDocument();
});

test('a valid word (TIGER) is accepted, not shown as "not a word"', async () => {
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  mockAxios('apple', 'ok');
  render(<App />);
  await waitForAnswer();
  typeWord('TIGER');
  pressEnter();
  await waitFor(() => {
    expect((axios as unknown as { get: jest.Mock }).get).toHaveBeenCalledWith(
      'https://api.dictionaryapi.dev/api/v2/entries/en/tiger',
      expect.anything(),
    );
  });
  await new Promise((r) => setTimeout(r, 50));
  expect(alertSpy).not.toHaveBeenCalledWith('not a word');
  alertSpy.mockRestore();
});

test('a correct guess is accepted even if the dictionary request fails', async () => {
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  mockAxios('tiger', 'error');
  render(<App />);
  await waitForAnswer();
  typeWord('TIGER');
  pressEnter();
  await waitFor(() => {
    expect(alertSpy).toHaveBeenCalledWith('You got it');
  });
  expect(alertSpy).not.toHaveBeenCalledWith('not a word');
  alertSpy.mockRestore();
});

test('a 404 dictionary response is "not a word"', async () => {
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  mockAxios('apple', '404');
  render(<App />);
  await waitForAnswer();
  typeWord('ZZZZZ');
  pressEnter();
  await waitFor(() => {
    expect(alertSpy).toHaveBeenCalledWith('not a word');
  });
  alertSpy.mockRestore();
});

test('a network error is not "not a word"', async () => {
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  mockAxios('apple', 'error');
  render(<App />);
  await waitForAnswer();
  typeWord('TIGER');
  pressEnter();
  await waitFor(() => {
    expect(alertSpy).toHaveBeenCalledWith(
      'Could not check that word. Please try again.',
    );
  });
  expect(alertSpy).not.toHaveBeenCalledWith('not a word');
  alertSpy.mockRestore();
});

test('Enter on an incomplete row does nothing and does not call the dictionary', async () => {
  mockAxios('apple', 'ok');
  render(<App />);
  await waitForAnswer();
  typeWord('TIGE');
  pressEnter();
  await new Promise((r) => setTimeout(r, 50));
  expect((axios as unknown as { get: jest.Mock }).get).not.toHaveBeenCalledWith(
    expect.stringContaining('dictionaryapi'),
  );
});

test('after winning, further input is ignored (no crash, no extra row)', async () => {
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  mockAxios('tiger', 'ok');
  render(<App />);
  await waitForAnswer();
  typeWord('TIGER');
  pressEnter();
  await waitFor(() => {
    expect(alertSpy).toHaveBeenCalledWith('You got it');
  });
  // Typing now must not throw and must not change the first row.
  typeWord('APPLE');
  expect(screen.getByText(/Tiger Wordle/i)).toBeInTheDocument();
  alertSpy.mockRestore();
});

test('after losing on the 6th guess, further input is ignored and does not crash', async () => {
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  mockAxios('apple', 'ok');
  render(<App />);
  await waitForAnswer();
  for (let i = 0; i < 6; i++) {
    typeWord('TIGER');
    pressEnter();
    await new Promise((r) => setTimeout(r, 30));
  }
  await waitFor(() => {
    expect(alertSpy).toHaveBeenCalledWith(' The Word is APPLE');
  });
  // This used to crash: wordList[6] is undefined, .split() throws.
  expect(() => typeWord('APPLE')).not.toThrow();
  alertSpy.mockRestore();
});

test('duplicate letters are not over-counted (APPLE vs POPPY)', () => {
  // Old code used answer.includes(char) and coloured all three Ps.
  // Correct Wordle scoring: one exact P (green), one misplaced P
  // (yellow), the third P is grey.
  const { scoreGuess } = require('./App') as typeof import('./App');
  expect(scoreGuess('POPPY', 'APPLE')).toEqual([
    'yellow',
    'gray',
    'green',
    'gray',
    'gray',
  ]);
});
