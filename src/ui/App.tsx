import { useMemo } from 'react';
import { runSimulation } from '../core/engine/SimulationEngine';
import { FCFSScheduler } from '../core/schedulers/FCFSScheduler';
import { getScenario } from '../core/scenarios/PredefinedScenarios';

/**
 * Temporary shell. The full simulation UI (controls, Gantt chart, metrics,
 * game modes) is built in Phase 5; this proves the core engine renders.
 */
export function App() {
  const result = useMemo(() => {
    const scenario = getScenario('STAGGERED_ARRIVALS')!;
    return runSimulation({ processes: scenario.processes, scheduler: new FCFSScheduler() });
  }, []);

  return (
    <main className="app-shell">
      <h1>CPU Scheduler Game</h1>
      <p>Offline, deterministic CPU scheduling simulator. Full UI coming in Phase 5.</p>
      <h2>FCFS · Staggered Arrivals</h2>
      <ul>
        {result.ganttChart.map((seg, i) => (
          <li key={i}>
            P{seg.pid}: {seg.startTime} &rarr; {seg.endTime}
          </li>
        ))}
      </ul>
      <p>
        Average waiting time: {result.metrics?.averageWaitingTime.toFixed(2)} · Context switches:{' '}
        {result.metrics?.contextSwitches}
      </p>
    </main>
  );
}
