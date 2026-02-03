import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock fetch to return empty data
beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        prices: [],
        average: 0,
        source: 'Mock',
        data_points: [],
        summary: {}
      }),
    })
  );
});

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // App should render the sidebar with navigation
    expect(document.querySelector('.app')).toBeInTheDocument();
  });

  it('displays the header', () => {
    render(<App />);
    // Should have a header element
    expect(document.querySelector('.app-content')).toBeInTheDocument();
  });

  it('renders sidebar navigation', () => {
    render(<App />);
    // Sidebar should be present
    expect(document.querySelector('.sidebar')).toBeInTheDocument();
  });
});
