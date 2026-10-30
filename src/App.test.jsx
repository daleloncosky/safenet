import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import axios from 'axios';
import App from './App.jsx';
vi.mock('axios');
beforeEach(() => vi.resetAllMocks());

it('submits trimmed content, prevents duplicate requests, and displays analysis', async () => {
  let finish;
  axios.post.mockReturnValue(new Promise(resolve => { finish = resolve; }));
  render(<App />);
  fireEvent.change(screen.getByLabelText('Link, address, or message'), { target: { value: '  example.com  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
  expect(screen.getByRole('button', { name: 'Analyzing…' })).toBeDisabled();
  expect(axios.post).toHaveBeenCalledTimes(1);
  expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/detect_phishing', { text: 'example.com' }, { timeout: 25000 });
  finish({ data: { analysis: 'NO_KNOWN_THREATS: No listed threat was found.' } });
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('NO_KNOWN_THREATS'));
  expect(screen.getByRole('button', { name: 'Analyze' })).toBeEnabled();
});

it('rejects blank input without contacting the backend', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
  expect(axios.post).not.toHaveBeenCalled();
  expect(screen.getByRole('status')).toHaveTextContent('Please enter');
});

it('shows provider errors and allows retry', async () => {
  axios.post.mockRejectedValue({ response: { data: { error: 'Text analysis is not configured.' } } });
  render(<App />);
  fireEvent.change(screen.getByLabelText('Link, address, or message'), { target: { value: 'Review this message' } });
  fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('not configured'));
  expect(screen.getByRole('button', { name: 'Analyze' })).toBeEnabled();
});
