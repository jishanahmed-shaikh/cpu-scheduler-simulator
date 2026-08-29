import { useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import type { SpeedMultiplier } from '../../game/SimulationRunner';

const SPEEDS: SpeedMultiplier[] = [0.25, 0.5, 1, 2, 4, 8];

function isTextTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/** Global playback shortcuts (Requirement 19), disabled while typing. */
export function useKeyboardShortcuts(): void {
  const { runner } = useSimulation();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTextTarget(event.target)) return;
      const state = runner.getState();
      if (event.key === ' ') {
        event.preventDefault();
        state.status === 'playing' ? runner.pause() : runner.play();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        runner.step();
      } else if (event.key === 'r' || event.key === 'R') {
        runner.reset();
      } else if (event.key >= '1' && event.key <= '6') {
        runner.setSpeed(SPEEDS[Number(event.key) - 1]!);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [runner]);
}
