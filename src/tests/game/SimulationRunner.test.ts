import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SimulationRunner } from '../../game/SimulationRunner';
import { FCFSScheduler } from '../../core/schedulers/FCFSScheduler';
import { getScenario } from '../../core/scenarios/PredefinedScenarios';

const config = () => ({
  processes: getScenario('STAGGERED_ARRIVALS')!.processes,
  scheduler: new FCFSScheduler(),
});

describe('SimulationRunner', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('loads in idle state at event index 0', () => {
    const runner = new SimulationRunner();
    runner.load(config());
    const state = runner.getState();
    expect(state.status).toBe('idle');
    expect(state.currentEventIndex).toBe(0);
    expect(state.events.length).toBeGreaterThan(0);
  });

  it('play -> paused -> play -> completed', () => {
    const runner = new SimulationRunner();
    runner.load(config());
    runner.play();
    expect(runner.getState().status).toBe('playing');
    runner.pause();
    expect(runner.getState().status).toBe('paused');
    runner.play();
    vi.advanceTimersByTime(60_000);
    expect(runner.getState().status).toBe('completed');
  });

  it('step advances exactly one event and pauses if playing', () => {
    const runner = new SimulationRunner();
    runner.load(config());
    runner.play();
    runner.step();
    expect(runner.getState().status).toBe('paused');
    expect(runner.getState().currentEventIndex).toBe(1);
    runner.step();
    expect(runner.getState().currentEventIndex).toBe(2);
  });

  it('reset returns to idle at index 0', () => {
    const runner = new SimulationRunner();
    runner.load(config());
    runner.step();
    runner.step();
    runner.reset();
    expect(runner.getState()).toMatchObject({ status: 'idle', currentEventIndex: 0 });
  });

  it('setSpeed changes the replay cadence', () => {
    const runner = new SimulationRunner();
    runner.load(config());
    runner.setSpeed(8);
    runner.play();
    vi.advanceTimersByTime(75);
    expect(runner.getState().currentEventIndex).toBe(1);
  });

  it('notifies stateChange subscribers', () => {
    const runner = new SimulationRunner();
    const handler = vi.fn();
    runner.on('stateChange', handler);
    runner.load(config());
    runner.step();
    expect(handler).toHaveBeenCalled();
    runner.off('stateChange', handler);
  });
});
