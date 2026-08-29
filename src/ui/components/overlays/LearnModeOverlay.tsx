import { useCallback, useEffect, useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { createScheduler } from '../../context/schedulerChoice';
import type { LearnStep } from '../../../game/LearnModeController';

interface View {
  step: LearnStep | null;
  current: number;
  total: number;
  complete: boolean;
}

export function LearnModeOverlay() {
  const { learn, runner, processes, choice } = useSimulation();
  const [view, setView] = useState<View>({ step: null, current: 0, total: 0, complete: false });

  const snapshot = useCallback(
    (step: LearnStep | null): View => ({
      step,
      current: learn.currentStep,
      total: learn.totalSteps,
      complete: learn.isComplete,
    }),
    [learn],
  );

  useEffect(() => {
    learn.start({ processes, scheduler: createScheduler(choice) });
    runner.reset();
    setView(snapshot(null));
  }, [learn, runner, processes, choice, snapshot]);

  const next = () => {
    const result = learn.nextStep();
    runner.seekTo(result ? result.eventIndex + 1 : Number.MAX_SAFE_INTEGER);
    setView(snapshot(result ?? view.step));
  };

  const restart = () => {
    learn.restart();
    runner.reset();
    setView(snapshot(null));
  };

  return (
    <aside className="overlay overlay--learn" aria-label="Learn mode">
      <header className="overlay__head">
        <h2>Learn Mode</h2>
        <span>Step {view.current} / {view.total}</span>
      </header>

      {view.step ? (
        <p className="overlay__explanation">{view.step.explanation}</p>
      ) : (
        <p className="overlay__hint">Press “Next Step” to walk through each scheduling decision.</p>
      )}

      {view.complete && view.current > 0 && (
        <p className="overlay__summary" role="status">
          All decisions shown. The Gantt chart and metrics panels hold the full result.
        </p>
      )}

      <div className="overlay__actions">
        <button type="button" onClick={next} disabled={view.complete}>Next Step</button>
        <button type="button" onClick={restart}>Restart</button>
      </div>
    </aside>
  );
}
