import { useCallback, useSyncExternalStore } from 'react';
import type { SimulationRunner } from '../../game/SimulationRunner';
import type { RunnerState } from '../../game/runnerState';
import { useSimulation } from '../context/SimulationContext';

/**
 * Subscribes a component to the runner's stateChange stream. The runner
 * owns the state; React only re-renders when a new snapshot is emitted.
 */
export function useRunnerState(): RunnerState {
  const { runner } = useSimulation();
  return useRunnerStateFor(runner);
}

export function useRunnerStateFor(runner: SimulationRunner): RunnerState {
  const subscribe = useCallback(
    (onChange: () => void) => {
      runner.on('stateChange', onChange);
      return () => runner.off('stateChange', onChange);
    },
    [runner],
  );
  return useSyncExternalStore(subscribe, () => runner.getState());
}
