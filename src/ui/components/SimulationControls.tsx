import { useSimulation } from '../context/SimulationContext';
import { useRunnerState } from '../hooks/useRunnerState';
import type { SpeedMultiplier } from '../../game/SimulationRunner';

const SPEEDS: SpeedMultiplier[] = [0.25, 0.5, 1, 2, 4, 8];

export function SimulationControls() {
  const { runner } = useSimulation();
  const state = useRunnerState();
  const done = state.status === 'completed';

  return (
    <div className="sim-controls" role="group" aria-label="Simulation playback">
      <button type="button" onClick={() => runner.play()} disabled={done || state.status === 'playing'}>
        ▶ Play
      </button>
      <button type="button" onClick={() => runner.pause()} disabled={state.status !== 'playing'}>
        ❚❚ Pause
      </button>
      <button type="button" onClick={() => runner.step()} disabled={done}>
        ▸ Step
      </button>
      <button type="button" onClick={() => runner.reset()}>↺ Reset</button>

      <label className="sim-controls__speed">
        Speed
        <input
          type="range"
          min={0}
          max={SPEEDS.length - 1}
          step={1}
          defaultValue={2}
          aria-label="Playback speed"
          aria-valuetext={`${SPEEDS[2]}x`}
          onChange={(e) => runner.setSpeed(SPEEDS[Number(e.target.value)]!)}
        />
      </label>

      {done && (
        <span className="sim-controls__done" role="status">
          ✓ Simulation complete
        </span>
      )}
    </div>
  );
}
