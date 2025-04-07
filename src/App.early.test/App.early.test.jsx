import React from 'react'
import App from '../App';
import { act, fireEvent, render, screen } from '@testing-library/react';
import "@testing-library/jest-dom";

describe('App() App method', () => {
  // Mocking the audio elements
  beforeEach(() => {
    jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Happy Paths', () => {
    test('should render the initial state correctly', () => {
      // Render the App component
      render(<App />);
      
      // Check initial time display
      expect(screen.getByDisplayValue('01')).toBeInTheDocument();
      expect(screen.getByDisplayValue('00')).toBeInTheDocument();
      
      // Check initial session type
      expect(screen.getByText(':')).toBeInTheDocument();
    });

    test('should start and pause the timer', () => {
      // Render the App component
      render(<App />);
      
      // Start the timer
      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);
      
      // Wait for a second to pass
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Check if the timer has decreased
      expect(screen.getByDisplayValue('00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('59')).toBeInTheDocument();
      
      // Pause the timer
      fireEvent.click(playButton);
      
      // Wait for another second to ensure it doesn't decrease
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Check if the timer is paused
      expect(screen.getByDisplayValue('00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('59')).toBeInTheDocument();
    });

    test('should reset the timer', () => {
      // Render the App component
      render(<App />);
      
      // Start the timer
      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);
      
      // Wait for a second to pass
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Reset the timer
      const resetButton = screen.getByRole('button', { name: /rotate-right/i });
      fireEvent.click(resetButton);
      
      // Check if the timer is reset
      expect(screen.getByDisplayValue('01')).toBeInTheDocument();
      expect(screen.getByDisplayValue('00')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero time input gracefully', () => {
      // Render the App component
      render(<App />);
      
      // Set the time to zero
      const minuteInput = screen.getByDisplayValue('01');
      fireEvent.change(minuteInput, { target: { value: '00' } });
      
      const secondInput = screen.getByDisplayValue('00');
      fireEvent.change(secondInput, { target: { value: '00' } });
      
      // Start the timer
      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);
      
      // Check if the timer doesn't go negative
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(screen.getByDisplayValue('00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('00')).toBeInTheDocument();
    });

    test('should switch sessions correctly when time runs out', () => {
      // Render the App component
      render(<App />);
      
      // Start the timer
      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);
      
      // Fast forward to the end of the work session
      act(() => {
        jest.advanceTimersByTime(60 * 1000);
      });
      
      // Check if the session type switches to break
      expect(screen.getByDisplayValue('05')).toBeInTheDocument();
      expect(screen.getByDisplayValue('00')).toBeInTheDocument();
    });
  });
});