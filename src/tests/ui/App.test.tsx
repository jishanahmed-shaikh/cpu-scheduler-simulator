import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { App } from '../../ui/App';

describe('App smoke test', () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it('mounts without console errors and shows the core panels', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<App />);
    expect(screen.getByRole('heading', { name: /CPU Scheduler Game/i })).toBeInTheDocument();
    expect(screen.getByLabelText('CPU state')).toBeInTheDocument();
    expect(screen.getByLabelText('Ready queue')).toBeInTheDocument();
    expect(screen.getByLabelText('Gantt chart')).toBeInTheDocument();
    expect(screen.getByLabelText('Scheduling metrics')).toBeInTheDocument();
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('switches modes via the mode selector', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Challenge' }));
    expect(screen.getByLabelText('Challenge mode')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Challenge' })).toHaveAttribute('aria-pressed', 'true');
  });
});
