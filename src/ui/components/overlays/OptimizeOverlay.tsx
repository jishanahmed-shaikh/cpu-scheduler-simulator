import { useEffect, useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { createScheduler, schedulerLabel } from '../../context/schedulerChoice';
import { getScenario } from '../../../core/scenarios/PredefinedScenarios';
import { initProcess } from '../../../core/models/Process';
import { SchedulerSelector } from '../SchedulerSelector';
import type { OptimizeResult } from '../../../game/OptimizeModeController';

const TARGET = 'averageWaitingTime' as const;
const WORKLOAD = getScenario('EXTREME_RANGE')!.processes.map((p) => initProcess(p));

export function OptimizeOverlay() {
  const { optimize, choice, setProcesses } = useSimulation();
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    optimize.load(WORKLOAD, TARGET);
    setProcesses(WORKLOAD.map((p) => initProcess(p)));
    setResult(null);
  }, [optimize, setProcesses]);

  const submit = () => {
    const scheduler = createScheduler(choice);
    if (!scheduler) {
      setMessage('Choose a scheduling algorithm before submitting.');
      return;
    }
    setMessage(null);
    setResult(optimize.submit(scheduler));
  };

  return (
    <aside className="overlay overlay--optimize" aria-label="Optimize mode">
      <header className="overlay__head">
        <h2>Optimize Mode</h2>
        <span>Target: minimise average waiting time</span>
      </header>

      <p className="overlay__hint">
        Fixed workload of {WORKLOAD.length} processes. Optimal average waiting time is{' '}
        <strong>{optimize.optimal.toFixed(2)}</strong>. Pick an algorithm and submit.
      </p>

      <SchedulerSelector />
      {message && <p role="alert" className="overlay__error">{message}</p>}

      <div className="overlay__actions">
        <button type="button" onClick={submit}>Submit {schedulerLabel(choice)}</button>
      </div>

      {result && (
        <div className="overlay__final" role="status">
          <p>
            Result: <strong>{result.resultMetric.toFixed(2)}</strong> · Optimal:{' '}
            {result.optimalMetric.toFixed(2)}
          </p>
          <p className="overlay__score">
            Score: <strong>{result.score}</strong>
            {result.isPerfect && <span className="overlay__perfect"> — Perfect Score!</span>}
          </p>
        </div>
      )}
    </aside>
  );
}
